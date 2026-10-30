#!/usr/bin/env node
/**
 * Zero-dependency Static Test Suite Auditor for Antigravity QA Subagents.
 * Usage: node audit-test-suite.mjs [target-dir-or-file]
 *
 * Scans test/spec files for focused tests (.only), hard sleeps (waitForTimeout),
 * brittle DOM querySelector calls, and placeholder assertions.
 */

import fs from 'node:fs';
import path from 'node:path';

const targetPath = path.resolve(process.argv[2] || process.cwd());
const IGNORED_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'target', 'coverage', '.venv']);
const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx|js|jsx|mjs)$|_test\.go$|^test_.*\.py$|.*_test\.py$/;

const RULES = [
  {
    id: 'QA_FOCUSED_TEST_ONLY',
    severity: 'HIGH',
    description:
      'Focused test (.only / fdescribe / fit) left in spec file, which silently skips other tests in CI.',
    test: (line) => /\b(test|it|describe)\.only\s*\(|\b(fdescribe|fit)\s*\(/.test(line),
  },
  {
    id: 'QA_PLAYWRIGHT_HARD_WAIT_TIMEOUT',
    severity: 'HIGH',
    description:
      'Hardcoded waitForTimeout() detected. Use web-first auto-retrying assertions (expect(locator).toBeVisible()) instead.',
    test: (line) => /\.waitForTimeout\s*\(\s*\d+/.test(line),
  },
  {
    id: 'QA_TAUTOLOGICAL_ASSERTION',
    severity: 'MEDIUM',
    description: 'Tautological assertion expect(true).toBe(true) provides false confidence.',
    test: (line) => /expect\(\s*true\s*\)\.toBe\(\s*true\s*\)/.test(line),
  },
  {
    id: 'QA_DOM_QUERY_SELECTOR_IN_TEST',
    severity: 'MEDIUM',
    description:
      'Direct .querySelector() in test file. Prefer user-facing locators (getByRole, getByLabelText).',
    test: (line) => /\b(container|document)\.querySelector(All)?\s*\(/.test(line),
  },
];

function collectTestFiles(entryPath, results = []) {
  if (!fs.existsSync(entryPath)) return results;
  const stat = fs.statSync(entryPath);
  if (stat.isFile()) {
    if (TEST_FILE_PATTERN.test(path.basename(entryPath))) {
      results.push(entryPath);
    }
    return results;
  }
  if (stat.isDirectory()) {
    for (const item of fs.readdirSync(entryPath)) {
      if (IGNORED_DIRS.has(item)) continue;
      collectTestFiles(path.join(entryPath, item), results);
    }
  }
  return results;
}

const files = collectTestFiles(targetPath);
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
  scannedTestFiles: files.length,
  totalFindings: findings.length,
  bySeverity: {
    HIGH: findings.filter((f) => f.severity === 'HIGH').length,
    MEDIUM: findings.filter((f) => f.severity === 'MEDIUM').length,
  },
  findings,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(findings.some((f) => f.severity === 'HIGH') ? 1 : 0);
