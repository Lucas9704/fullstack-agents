#!/usr/bin/env node
/**
 * Zero-dependency Frontend Stack Detector for Antigravity Subagents.
 * Usage: node detect-frontend-stack.mjs [project-root-path]
 *
 * Inspects package.json and config files in the target directory and outputs
 * the detected framework, libraries, scripts, and the exact Antigravity skills
 * and reference files the subagent should activate.
 */

import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve(process.argv[2] || process.cwd());
const pkgPath = path.join(targetDir, 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.error(`No package.json found at: ${pkgPath}`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const allDeps = {
  ...(pkg.dependencies || {}),
  ...(pkg.devDependencies || {}),
  ...(pkg.peerDependencies || {}),
};

const has = (name) => Boolean(allDeps[name]);
const versionOf = (name) => allDeps[name] || null;
const fileExists = (relPath) => fs.existsSync(path.join(targetDir, relPath));

const framework = {
  react: versionOf('react'),
  nextjs: versionOf('next'),
  vite: versionOf('vite'),
  remix: versionOf('@remix-run/react') || versionOf('react-router'),
  angular: versionOf('@angular/core'),
  astro: versionOf('astro'),
};

const ecosystem = {
  styling: {
    tailwindcss: versionOf('tailwindcss'),
    cva: versionOf('class-variance-authority'),
    tailwindMerge: versionOf('tailwind-merge'),
    clsx: versionOf('clsx'),
    radixUi: Object.keys(allDeps).some((k) => k.startsWith('@radix-ui/')),
    shadcnConfig: fileExists('components.json'),
  },
  stateAndData: {
    tanstackQuery: versionOf('@tanstack/react-query') || versionOf('@tanstack/angular-query-experimental'),
    tanstackTable: versionOf('@tanstack/react-table') || versionOf('@tanstack/angular-table'),
    tanstackVirtual: versionOf('@tanstack/react-virtual') || versionOf('@tanstack/angular-virtual'),
    supabaseJs: versionOf('@supabase/supabase-js'),
    supabaseSsr: versionOf('@supabase/ssr'),
    zustand: versionOf('zustand'),
    nanostores: versionOf('nanostores'),
    rxjs: versionOf('rxjs'),
  },
  formsAndValidation: {
    reactHookForm: versionOf('react-hook-form'),
    hookformResolvers: versionOf('@hookform/resolvers'),
    zod: versionOf('zod'),
    valibot: versionOf('valibot'),
    angularForms: versionOf('@angular/forms'),
  },
};

const recommendedSkills = [];
const recommendedReferences = [];

if (has('react') || has('next')) {
  recommendedSkills.push('react-expert');
  if (has('next')) {
    recommendedReferences.push('react-expert/references/nextjs-app-router.md');
  }
  if (framework.react && /(^|\D)19(\.|$)/.test(framework.react)) {
    recommendedReferences.push('react-expert/references/react-19-patterns.md');
  }
  if (has('vite')) {
    recommendedReferences.push('react-expert/references/vite-spa-architecture.md');
  }
}

if (has('@angular/core')) {
  recommendedSkills.push('angular-expert');
  recommendedReferences.push('angular-expert/references/signals-and-architecture.md');
}

if (has('astro')) {
  recommendedSkills.push('astro-expert');
  recommendedReferences.push('astro-expert/references/islands-and-server-actions.md');
}

if (
  has('tailwindcss') ||
  has('class-variance-authority') ||
  ecosystem.styling.radixUi ||
  ecosystem.styling.shadcnConfig
) {
  recommendedSkills.push('styling-design-system');
  recommendedReferences.push('styling-design-system/references/tailwind-v4-and-cva.md');
}

if (
  ecosystem.stateAndData.tanstackQuery ||
  ecosystem.stateAndData.tanstackTable ||
  ecosystem.stateAndData.tanstackVirtual ||
  ecosystem.stateAndData.supabaseJs ||
  ecosystem.stateAndData.supabaseSsr ||
  has('zustand')
) {
  recommendedSkills.push('data-fetching-and-state');
  if (ecosystem.stateAndData.tanstackQuery) {
    recommendedReferences.push('data-fetching-and-state/references/tanstack-query-v5-patterns.md');
  }
  if (ecosystem.stateAndData.tanstackTable || ecosystem.stateAndData.tanstackVirtual) {
    recommendedReferences.push('data-fetching-and-state/references/tanstack-table-and-virtualization.md');
  }
  if (ecosystem.stateAndData.supabaseJs || ecosystem.stateAndData.supabaseSsr || fileExists('supabase/config.toml')) {
    recommendedSkills.push('supabase-platform');
    recommendedReferences.push('data-fetching-and-state/references/supabase-ssr-and-client.md');
  }
}

if (has('react-hook-form') || has('zod') || has('valibot') || has('@angular/forms')) {
  recommendedSkills.push('forms-and-validation');
  if (has('react-hook-form')) {
    recommendedReferences.push('forms-and-validation/references/rhf-zod-recipes.md');
  }
}

recommendedSkills.push('web-accessibility-and-perf');

const report = {
  projectRoot: targetDir,
  packageName: pkg.name || path.basename(targetDir),
  framework,
  ecosystem,
  npmScripts: pkg.scripts || {},
  antigravityRecommendations: {
    skillsToActivate: [...new Set(recommendedSkills)],
    referencesToRead: [...new Set(recommendedReferences)],
  },
};

console.log(JSON.stringify(report, null, 2));
