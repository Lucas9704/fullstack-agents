#!/usr/bin/env node
/**
 * Zero-dependency Static DevOps, Dockerfile, CI/CD, Supabase Self-Hosted & Cloud Auditor.
 * Usage: node audit-devops-and-containers.mjs [target-dir-or-file]
 *
 * Scans Dockerfiles, Compose files, .env files, GitHub Actions (.yml), Terraform (.tf),
 * and shell scripts (.sh) for security, default keys, and reliability anti-patterns.
 */

import fs from 'node:fs';
import path from 'node:path';

const targetPath = path.resolve(process.argv[2] || process.cwd());
const IGNORED_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'target', '.terraform', '.venv']);

function isTargetFile(filePath) {
  const base = path.basename(filePath);
  const ext = path.extname(filePath);
  return (
    base === 'Dockerfile' ||
    base.startsWith('Dockerfile.') ||
    base === 'docker-compose.yml' ||
    base === 'docker-compose.yaml' ||
    base === 'compose.yml' ||
    base === 'compose.yaml' ||
    base === '.env' ||
    base === '.env.production' ||
    ext === '.tf' ||
    ext === '.bicep' ||
    ext === '.sh' ||
    ((ext === '.yml' || ext === '.yaml') && filePath.includes('.github/workflows'))
  );
}

function collectFiles(entryPath, results = []) {
  if (!fs.existsSync(entryPath)) return results;
  const stat = fs.statSync(entryPath);
  if (stat.isFile()) {
    if (isTargetFile(entryPath)) results.push(entryPath);
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
  const base = path.basename(file);
  const ext = path.extname(file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const relFile = path.relative(process.cwd(), file) || file;

  // Whole-file checks for Dockerfiles
  if (base === 'Dockerfile' || base.startsWith('Dockerfile.')) {
    if (!/^\s*USER\s+(?!root\b)\S+/m.test(content)) {
      findings.push({
        file: relFile,
        line: 1,
        ruleId: 'DOCKER_MISSING_NON_ROOT_USER',
        severity: 'HIGH',
        description: 'Dockerfile does not switch to a non-root USER in its final stage.',
        snippet: 'Missing USER <non-root>',
      });
    }
  }

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    if (base === 'Dockerfile' || base.startsWith('Dockerfile.')) {
      if (/^\s*FROM\s+\S+:latest\b/i.test(line)) {
        findings.push({
          file: relFile,
          line: lineNum,
          ruleId: 'DOCKER_UNPINNED_LATEST_TAG',
          severity: 'MEDIUM',
          description: 'Avoid :latest base image tags in Dockerfiles; pin explicit image versions.',
          snippet: line.trim(),
        });
      }
      if (/^\s*ADD\s+(?!https?:\/\/)\S+\s+/i.test(line) && !/\.tar(\.gz|\.bz2|\.xz)?\b/i.test(line)) {
        findings.push({
          file: relFile,
          line: lineNum,
          ruleId: 'DOCKER_ADD_OVER_COPY',
          severity: 'MEDIUM',
          description: 'Prefer COPY over ADD unless extracting a local tar archive.',
          snippet: line.trim(),
        });
      }
    }

    if (base === '.env' || base === '.env.production') {
      if (
        /super-secret-jwt-token-with-at-least-32-characters-long|your-super-secret-and-long-postgres-password|this_password_is_insecure_and_should_be_updated/.test(
          line
        )
      ) {
        findings.push({
          file: relFile,
          line: lineNum,
          ruleId: 'SUPABASE_SELF_HOSTED_DEFAULT_SECRET',
          severity: 'HIGH',
          description:
            'Default public Supabase .env.example secret detected! Run sh ./utils/generate-keys.sh --update-env immediately.',
          snippet: line.split('=')[0] + '=<default-example-secret>',
        });
      }
    }

    if (file.includes('.github/workflows') && (ext === '.yml' || ext === '.yaml')) {
      if (/^\s*-?\s*uses:\s*[^@\s]+@(main|master|HEAD)\b/.test(line)) {
        findings.push({
          file: relFile,
          line: lineNum,
          ruleId: 'CICD_UNPINNED_GITHUB_ACTION',
          severity: 'HIGH',
          description:
            'GitHub Action pinned to mutable branch (@main/@master). Pin to a semantic tag (@v4) or full commit SHA.',
          snippet: line.trim(),
        });
      }
    }

    if (ext === '.sh' && lineNum <= 5 && index === 0 && /^#!/.test(line)) {
      if (!/set\s+-[a-z]*e[a-z]*u|set\s+-o\s+pipefail/.test(content)) {
        findings.push({
          file: relFile,
          line: 1,
          ruleId: 'SHELL_MISSING_STRICT_MODE',
          severity: 'MEDIUM',
          description: 'Shell script does not enable strict mode (set -euo pipefail).',
          snippet: line.trim(),
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
