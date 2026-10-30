#!/usr/bin/env node
/**
 * Zero-dependency Static Frontend Auditor for Antigravity Subagents.
 * Usage: node audit-frontend-code.mjs [target-dir-or-file]
 *
 * Scans .tsx, .jsx, .ts, .astro, and .html files for common accessibility (WCAG),
 * React/Angular/Astro anti-patterns, and Core Web Vitals (CLS/INP) pitfalls.
 */

import fs from 'node:fs';
import path from 'node:path';

const targetPath = path.resolve(process.argv[2] || process.cwd());
const IGNORED_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.astro', '.angular', 'coverage']);
const TARGET_EXTENSIONS = new Set(['.tsx', '.jsx', '.astro', '.html']);

const RULES = [
  {
    id: 'A11Y_CLICKABLE_NON_INTERACTIVE',
    severity: 'HIGH',
    description: 'Non-interactive <div> or <span> with onClick handler missing role/tabIndex or semantic <button>.',
    test: (line) =>
      /<(div|span)\b[^>]*\bonClick=\{/.test(line) &&
      !/\brole=/.test(line) &&
      !/\btabIndex=/.test(line),
  },
  {
    id: 'A11Y_IMG_MISSING_ALT',
    severity: 'HIGH',
    description: '<img> element appears to be missing an explicit alt attribute.',
    test: (line) => /<img\b[^>]*>/.test(line) && !/\balt=/.test(line) && !/\{\.\.\./.test(line),
  },
  {
    id: 'A11Y_OUTLINE_NONE_WITHOUT_FOCUS_VISIBLE',
    severity: 'MEDIUM',
    description: 'Focus outline removed (outline-none) without a focus-visible replacement.',
    test: (line) =>
      /\boutline-none\b/.test(line) &&
      !/\bfocus-visible:(ring|outline|border)/.test(line) &&
      !/\bfocus:(ring|outline)/.test(line),
  },
  {
    id: 'REACT_ARRAY_INDEX_KEY',
    severity: 'HIGH',
    description: 'Array index used as React key (key={index} or key={i}), which corrupts dynamic list/useFieldArray state.',
    test: (line) => /\bkey=\{\s*(index|idx|i)\s*\}/.test(line),
  },
  {
    id: 'PERF_EAGER_LAZY_CONFLICT',
    severity: 'MEDIUM',
    description: 'Conflicting loading="lazy" and fetchpriority="high" on the same element (LCP anti-pattern).',
    test: (line) => /\bloading=["']lazy["']/.test(line) && /\bfetchpriority=["']high["']/i.test(line),
  },
  {
    id: 'FORM_INPUT_PLACEHOLDER_AS_LABEL',
    severity: 'MEDIUM',
    description: '<input> with placeholder but no id, aria-label, or aria-labelledby on the same tag.',
    test: (line) =>
      /<input\b[^>]*\bplaceholder=/.test(line) &&
      !/\b(id|aria-label|aria-labelledby)=/.test(line) &&
      !/\{\.\.\./.test(line),
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
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const rule of RULES) {
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
