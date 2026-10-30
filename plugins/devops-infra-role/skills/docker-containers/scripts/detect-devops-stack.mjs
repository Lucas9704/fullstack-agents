#!/usr/bin/env node
/**
 * Zero-dependency DevOps & Infrastructure Stack Detector for Antigravity Subagents.
 * Usage: node detect-devops-stack.mjs [project-root-path]
 *
 * Scans the repository for Dockerfiles, Compose files, Supabase self-hosted stacks,
 * CI/CD pipelines, Terraform/OpenTofu, Azure Bicep/CLI scripts, and reverse proxy configs.
 */

import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve(process.argv[2] || process.cwd());
const fileExists = (relPath) => fs.existsSync(path.join(targetDir, relPath));
const readText = (relPath) =>
  fileExists(relPath) ? fs.readFileSync(path.join(targetDir, relPath), 'utf8') : '';

const topLevelFiles = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];

const detectedTools = [];
const recommendedSkills = [];
const recommendedReferences = [];

// 1. Docker & Containers
if (
  fileExists('Dockerfile') ||
  fileExists('docker-compose.yml') ||
  fileExists('docker-compose.yaml') ||
  fileExists('compose.yml') ||
  fileExists('compose.yaml')
) {
  detectedTools.push('docker');
  recommendedSkills.push('docker-containers');
  recommendedReferences.push('docker-containers/references/multi-stage-and-compose-recipes.md');
}

// 2. Supabase Self-Hosted Docker Stack
const composeText = `${readText('docker-compose.yml')}\n${readText('compose.yaml')}`;
if (
  fileExists('volumes/api/kong.yml') ||
  fileExists('utils/generate-keys.sh') ||
  /supabase\/postgres|supabase\/gotrue|supabase\/supavisor/i.test(composeText)
) {
  detectedTools.push('supabase-self-hosted');
  recommendedSkills.push('supabase-self-hosted', 'reverse-proxy-and-linux-servers');
  recommendedReferences.push(
    'supabase-self-hosted/references/docker-compose-hardening-and-ops.md',
    'reverse-proxy-and-linux-servers/references/nginx-caddy-and-systemd-recipes.md'
  );
}

// 3. CI/CD Pipelines
if (
  fileExists('.github/workflows') ||
  fileExists('.gitlab-ci.yml') ||
  fileExists('azure-pipelines.yml')
) {
  detectedTools.push('cicd');
  recommendedSkills.push('cicd-pipelines');
  recommendedReferences.push('cicd-pipelines/references/github-actions-and-gitlab-ci.md');
}

// 4. Terraform / OpenTofu
if (
  topLevelFiles.some((f) => f.endsWith('.tf')) ||
  fileExists('infra') ||
  fileExists('terraform')
) {
  detectedTools.push('terraform-iac');
  recommendedSkills.push('iac-terraform-and-cloud');
  recommendedReferences.push('iac-terraform-and-cloud/references/terraform-modules-and-state.md');
}

// 5. Azure Bicep / Azure CLI
if (
  topLevelFiles.some((f) => f.endsWith('.bicep') || f.endsWith('.bicepparam')) ||
  fileExists('azure.yaml') ||
  fileExists('infra/main.bicep')
) {
  detectedTools.push('azure-bicep-cli');
  recommendedSkills.push('azure-cli-and-cloud');
  recommendedReferences.push('azure-cli-and-cloud/references/az-cli-jmespath-and-container-apps.md');
}

// 6. Reverse Proxy / Linux Server
if (
  fileExists('Caddyfile') ||
  fileExists('nginx.conf') ||
  fileExists('traefik.yml') ||
  topLevelFiles.some((f) => f.endsWith('.service'))
) {
  detectedTools.push('reverse-proxy-linux');
  recommendedSkills.push('reverse-proxy-and-linux-servers');
  recommendedReferences.push('reverse-proxy-and-linux-servers/references/nginx-caddy-and-systemd-recipes.md');
}

if (recommendedSkills.length === 0) {
  recommendedSkills.push('docker-containers', 'cicd-pipelines');
}

const report = {
  projectRoot: targetDir,
  detectedTools: [...new Set(detectedTools)],
  antigravityRecommendations: {
    skillsToActivate: [...new Set(recommendedSkills)],
    referencesToRead: [...new Set(recommendedReferences)],
  },
};

console.log(JSON.stringify(report, null, 2));
