#!/usr/bin/env node
/**
 * Zero-dependency Static Backend Security, Concurrency & Supabase/SQL Auditor.
 * Usage: node audit-backend-security-and-sql.mjs [target-dir-or-file]
 *
 * Scans backend source files (.ts, .js, .py, .go, .rs, .java, .cs) and SQL migrations (.sql)
 * for common OWASP API vulnerabilities, Supabase RLS pitfalls, and concurrency anti-patterns.
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
