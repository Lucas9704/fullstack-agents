#!/usr/bin/env node
/**
 * Zero-dependency Static Backend Security, Concurrency & Supabase/SQL Auditor.
 * Usage: node audit-backend-security-and-sql.mjs [target-dir-or-file]
 *
 * Scans backend source files (.ts, .js, .py, .go, .rs, .java, .cs) and SQL migrations (.sql)
 * for common OWASP API vulnerabilities, Supabase RLS pitfalls, and concurrency anti-patterns,
 * including SQL built by string interpolation/concatenation and credentials written to logs.
 */

import fs from 'node:fs';
import path from 'node:path';

const targetPath = path.resolve(process.argv[2] || process.cwd());
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'target',
  'bin',
  'obj',
  '.venv',
  'venv',
  '__pycache__',
  'coverage',
]);
const TARGET_EXTENSIONS = new Set(['.ts', '.js', '.py', '.go', '.rs', '.java', '.cs', '.sql']);

const LINE_RULES = [
  {
    id: 'SUPABASE_RLS_FOR_ALL',
    exts: new Set(['.sql']),
    severity: 'HIGH',
    description:
      'Supabase RLS policy uses FOR ALL. Official Supabase rules require separate policies for select, insert, update, and delete.',
    test: (line) => /\bcreate\s+policy\b/i.test(line) && /\bfor\s+all\b/i.test(line),
  },
  {
    id: 'SUPABASE_RLS_UNWRAPPED_AUTH_UID',
    exts: new Set(['.sql']),
    severity: 'MEDIUM',
    description:
      'Bare auth.uid() inside RLS policy expression. Wrap in (select auth.uid()) so Postgres caches the initPlan per query.',
    test: (line) =>
      /\b(using|with\s+check)\b/i.test(line) &&
      /\bauth\.uid\(\)/i.test(line) &&
      !/\(\s*select\s+auth\.uid\(\)\s*\)/i.test(line),
  },
  {
    id: 'SUPABASE_SERVER_GET_SESSION_UNVERIFIED',
    exts: new Set(['.ts', '.js']),
    severity: 'HIGH',
    description:
      'auth.getSession() does not verify JWT authenticity on the server. Use supabase.auth.getClaims() or supabase.auth.getUser() instead.',
    test: (line) => /\.auth\.getSession\s*\(/.test(line),
  },
  {
    id: 'SUPABASE_SECRET_KEY_IN_PUBLIC_ENV',
    exts: new Set(['.ts', '.js']),
    severity: 'HIGH',
    description:
      'Secret/Service-role Supabase key referenced with a public client prefix (NEXT_PUBLIC_ or VITE_).',
    test: (line) => /\b(NEXT_PUBLIC_|VITE_|PUBLIC_)[A-Z0-9_]*(SERVICE_ROLE|SECRET_KEY)\b/.test(line),
  },
  {
    id: 'RUST_UNWRAP_IN_BACKEND',
    exts: new Set(['.rs']),
    severity: 'MEDIUM',
    description:
      'Avoid .unwrap() in Rust backend code; propagate errors with ? and map domain errors via IntoResponse.',
    test: (line) => /\.unwrap\(\)/.test(line) && !/^\s*\/\//.test(line),
  },
  {
    id: 'DOTNET_SYNC_OVER_ASYNC',
    exts: new Set(['.cs']),
    severity: 'HIGH',
    description:
      'Blocking async Task with .Result or .GetAwaiter().GetResult() risks thread-pool starvation. Use await with CancellationToken.',
    test: (line) => /\.GetAwaiter\(\)\.GetResult\(\)/.test(line),
  },
  {
    id: 'JAVA_FIELD_INJECTION_AUTOWIRED',
    exts: new Set(['.java']),
    severity: 'MEDIUM',
    description:
      '@Autowired field injection detected. Prefer constructor injection with private final fields.',
    test: (line) => /^\s*@Autowired\b/.test(line),
  },
  {
    id: 'NODE_SYNC_FS_IN_RUNTIME',
    exts: new Set(['.ts', '.js']),
    severity: 'MEDIUM',
    description:
      'Synchronous fs.*Sync call blocks the Node.js event loop. Prefer fs/promises in request handlers.',
    test: (line) => /\bfs\.(readFileSync|writeFileSync|appendFileSync)\s*\(/.test(line),
  },
];

// A string that looks like a real SQL statement, not UI copy such as "Select a {kind} from the menu".
// SELECT ... FROM only counts when SELECT is uppercase, the column list has *, a comma or a call,
// or the FROM clause is followed by WHERE/JOIN/ORDER BY/GROUP BY/LIMIT.
const SQL_STATEMENT_RES = [
  /\bSELECT\b[\s\S]{0,400}?\bFROM\b/,
  /\bselect\b[^;]{0,400}?[*,(][^;]{0,400}?\bfrom\b/i,
  /\bselect\b[\s\S]{0,400}?\bfrom\s+[\w."`\[\]]+[\s\S]{0,200}?\b(where|join|order\s+by|group\s+by|limit)\b/i,
  /\b(insert\s+into|delete\s+from|merge\s+into)\b/i,
  /\bupdate\s+[\w."`\[\]]+\s+set\b/i,
];
const looksLikeSql = (text) => SQL_STATEMENT_RES.some((re) => re.test(text));

// APIs that turn an interpolated string into bind parameters, so interpolation there is safe.
const SAFE_INTERPOLATION_CALL_RE =
  /\b(FromSql|FromSqlInterpolated|ExecuteSql|ExecuteSqlInterpolated|ExecuteSqlInterpolatedAsync|ExecuteSqlAsync|SqlQuery(?:<[^>]*>)?)\s*\(\s*$/;

// Per language: string literals whose value is built from runtime data (interpolation,
// concatenation or formatting). Each regex must expose the literal text as group "sql".
const SQL_BUILDERS = {
  '.ts': [
    // Untagged template literal with ${...}. Tagged templates (sql`...`, Prisma.sql`...`) are
    // parameterized by the driver, so an identifier right before the backtick is excluded.
    { re: /(?<![\w$.)\]])`(?<sql>(?:\\[\s\S]|[^`\\])*\$\{(?:\\[\s\S]|[^`\\])*)`/g, how: 'template literal interpolation' },
    { re: /(["'])(?<sql>(?:\\.|(?!\1)[^\\\n])*)\1\s*\+\s*[\w$(]/g, how: 'string concatenation' },
  ],
  '.py': [
    { re: /\b[fF][rR]?(["'])(?<sql>(?:\\.|(?!\1)[^\\\n])*\{[^}]+\}(?:\\.|(?!\1)[^\\\n])*)\1/g, how: 'f-string interpolation' },
    { re: /(["'])(?<sql>(?:\\.|(?!\1)[^\\\n])*)\1\s*(?:%\s*[\w(]|\.format\s*\(|\+\s*\w)/g, how: '% / .format() / + formatting' },
  ],
  '.go': [
    { re: /\bfmt\.Sprintf\(\s*(["`])(?<sql>(?:\\.|(?!\1)[^\\])*)\1/g, how: 'fmt.Sprintf formatting' },
    { re: /(["`])(?<sql>(?:\\.|(?!\1)[^\\])*)\1\s*\+\s*\w/g, how: 'string concatenation' },
  ],
  '.rs': [{ re: /\bformat!\(\s*"(?<sql>(?:\\.|[^"\\])*\{[^}]*\}(?:\\.|[^"\\])*)"/g, how: 'format! interpolation' }],
  '.java': [{ re: /"(?<sql>(?:\\.|[^"\\\n])*)"\s*\+\s*\w/g, how: 'string concatenation' }],
  '.cs': [
    { re: /\$@?"(?<sql>(?:\\.|[^"\\])*\{[^}]+\}(?:\\.|[^"\\])*)"/g, how: 'interpolated string' },
    { re: /"(?<sql>(?:\\.|[^"\\\n])*)"\s*\+\s*\w/g, how: 'string concatenation' },
  ],
};
SQL_BUILDERS['.js'] = SQL_BUILDERS['.ts'];

const lineOf = (content, index) => content.slice(0, index).split('\n').length;

function findSqlInjection(content, ext) {
  const results = [];
  for (const { re, how } of SQL_BUILDERS[ext] || []) {
    for (const m of content.matchAll(re)) {
      if (!looksLikeSql(m.groups.sql)) continue;
      if (SAFE_INTERPOLATION_CALL_RE.test(content.slice(Math.max(0, m.index - 80), m.index))) continue;
      results.push({
        line: lineOf(content, m.index),
        ruleId: 'SQL_INJECTION_STRING_BUILDING',
        severity: 'HIGH',
        description: `SQL statement built with ${how}. Pass values as bind parameters ($1, ?, :name, @p) or use a tagged/parameterized query API instead.`,
      });
    }
  }
  return results;
}

// Logging calls across the supported languages.
const LOG_CALL_RE =
  /(\bconsole\.(log|info|warn|error|debug|trace)|\b(logger|log|logging|slog|_logger|Log)\.\w+|\bprint(ln)?|\bfmt\.Print\w*|\b(println|eprintln|info|warn|error|debug|trace)!|\bSystem\.(out|err)\.print\w*|\bConsole\.Write\w*)\s*\(/;
// Names that carry credentials or session material. `headers` is included because logging a
// whole headers object leaks the Authorization and Cookie headers.
const SENSITIVE_NAME_RE =
  /\b(authorization|auth_?token|access_?token|refresh_?token|id_?token|token|password|passwd|pwd|secret|client_?secret|api_?key|apikey|cookies?|set-cookie|bearer|headers|credentials?|private_?key|ssn|credit_?card|card_?number|cvv)\b/i;

// Replace every string literal with only the expressions interpolated into it, so that a message
// like "invalid token" is ignored while `${req.headers.authorization}` or {password} is kept.
function codeOutsideStrings(line) {
  return line.replace(/(`|"|')((?:\\.|(?!\1)[^\\])*)\1/g, (_, _q, body) =>
    [...body.matchAll(/\$?\{([^}]*)\}/g)].map((x) => ` ${x[1]} `).join('')
  );
}

function findSensitiveLogging(lines) {
  const results = [];
  lines.forEach((line, index) => {
    if (!LOG_CALL_RE.test(line)) return;
    const code = codeOutsideStrings(line.slice(line.search(LOG_CALL_RE)));
    const hit = code.match(SENSITIVE_NAME_RE);
    if (!hit) return;
    results.push({
      line: index + 1,
      ruleId: 'SENSITIVE_DATA_IN_LOGS',
      severity: 'HIGH',
      description: `Logging call includes "${hit[0]}". Credentials, tokens, headers and personal data must never reach logs; log a redacted value or an identifier instead.`,
    });
  });
  return results;
}

function collectFiles(entryPath, results = []) {
  if (!fs.existsSync(entryPath)) return results;
  const stat = fs.statSync(entryPath);
  if (stat.isFile()) {
    if (TARGET_EXTENSIONS.has(path.extname(entryPath))) {
      results.push(entryPath);
    }
    return results;
  }
  if (stat.isDirectory()) {
    for (const item of fs.readdirSync(entryPath)) {
      if (IGNORED_DIRS.has(item)) continue;
      collectFiles(path.join(entryPath, item), results);
    }
  }
  return results;
}

const files = collectFiles(targetPath);
const findings = [];

for (const file of files) {
  const ext = path.extname(file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const rule of LINE_RULES) {
      if (!rule.exts.has(ext)) continue;
      if (rule.test(line)) {
        findings.push({
          file: path.relative(process.cwd(), file) || file,
          line: index + 1,
          ruleId: rule.id,
          severity: rule.severity,
          description: rule.description,
          snippet: line.trim().slice(0, 140),
        });
      }
    }
  });

  if (ext !== '.sql') {
    for (const finding of [...findSqlInjection(content, ext), ...findSensitiveLogging(lines)]) {
      findings.push({
        file: path.relative(process.cwd(), file) || file,
        ...finding,
        snippet: (lines[finding.line - 1] || '').trim().slice(0, 140),
      });
    }
  }
}

const summary = {
  scannedFiles: files.length,
  totalFindings: findings.length,
  bySeverity: {
    HIGH: findings.filter((f) => f.severity === 'HIGH').length,
    MEDIUM: findings.filter((f) => f.severity === 'MEDIUM').length,
  },
  findings,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(findings.some((f) => f.severity === 'HIGH') ? 1 : 0);
