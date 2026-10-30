#!/usr/bin/env node
/**
 * Zero-dependency QA & Test Stack Detector for Antigravity Subagents.
 * Usage: node detect-qa-stack.mjs [project-root-path]
 *
 * Inspects project manifests and test config files to output detected test runners,
 * safe non-interactive execution commands, and recommended QA skills & references.
 */

import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve(process.argv[2] || process.cwd());
const fileExists = (relPath) => fs.existsSync(path.join(targetDir, relPath));
const readText = (relPath) =>
  fileExists(relPath) ? fs.readFileSync(path.join(targetDir, relPath), 'utf8') : '';

const runners = [];
const libraries = [];
const nonInteractiveCommands = [];
const recommendedSkills = ['test-strategy-and-bug-triage'];
const recommendedReferences = [];

if (fileExists('package.json')) {
  try {
    const pkg = JSON.parse(readText('package.json'));
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const has = (name) => Boolean(deps[name]);

    if (has('vitest') || fileExists('vitest.config.ts') || fileExists('vitest.config.js')) {
      runners.push('vitest');
      nonInteractiveCommands.push('npx vitest run');
      recommendedSkills.push('vitest-expert', 'unit-testing-expert');
      recommendedReferences.push(
        'vitest-expert/references/vitest-browser-mocking-and-msw.md',
        'unit-testing-expert/references/vitest-rtl-and-msw-v2.md'
      );
    }
    if (has('@playwright/test') || fileExists('playwright.config.ts')) {
      runners.push('playwright');
      nonInteractiveCommands.push('npx playwright test');
      recommendedSkills.push('playwright-e2e');
      recommendedReferences.push('playwright-e2e/references/auth-fixtures-and-ci-sharding.md');
    }
    if (has('jest')) {
      runners.push('jest');
      nonInteractiveCommands.push('npx jest --ci');
      recommendedSkills.push('unit-testing-expert');
    }
    if (has('msw')) {
      libraries.push('msw');
      recommendedSkills.push('api-and-integration-testing');
    }
    if (has('supertest') || Object.keys(deps).some((k) => k.startsWith('@testcontainers/'))) {
      libraries.push('supertest/testcontainers');
      recommendedSkills.push('api-and-integration-testing');
      recommendedReferences.push('api-and-integration-testing/references/testcontainers-and-supabase-pgtap.md');
    }
    if (has('fast-check')) {
      libraries.push('fast-check');
      recommendedSkills.push('security-and-fuzz-testing');
    }
  } catch {
    // Ignore malformed package.json
  }
}

const pyText = `${readText('pyproject.toml')}\n${readText('requirements.txt')}`;
if (/pytest/i.test(pyText)) {
  runners.push('pytest');
  nonInteractiveCommands.push('pytest');
  recommendedSkills.push('unit-testing-expert');
  recommendedReferences.push('unit-testing-expert/references/vitest-rtl-and-msw-v2.md');
}

if (fileExists('go.mod')) {
  runners.push('go-test');
  nonInteractiveCommands.push('go test -race ./...');
  recommendedSkills.push('unit-testing-expert');
  recommendedReferences.push('unit-testing-expert/references/vitest-rtl-and-msw-v2.md');
}

if (fileExists('Cargo.toml')) {
  runners.push('cargo-test');
  nonInteractiveCommands.push('cargo test');
  recommendedSkills.push('unit-testing-expert');
  recommendedReferences.push('unit-testing-expert/references/vitest-rtl-and-msw-v2.md');
}

if (fileExists('supabase/config.toml') || fileExists('supabase/tests')) {
  runners.push('supabase-pgtap');
  nonInteractiveCommands.push('npx supabase test db');
  recommendedSkills.push('api-and-integration-testing', 'security-and-fuzz-testing');
  recommendedReferences.push('api-and-integration-testing/references/testcontainers-and-supabase-pgtap.md');
}

const report = {
  projectRoot: targetDir,
  detectedRunners: [...new Set(runners)],
  detectedLibraries: [...new Set(libraries)],
  nonInteractiveCommands: [...new Set(nonInteractiveCommands)],
  antigravityRecommendations: {
    skillsToActivate: [...new Set(recommendedSkills)],
    referencesToRead: [...new Set(recommendedReferences)],
  },
};

console.log(JSON.stringify(report, null, 2));
