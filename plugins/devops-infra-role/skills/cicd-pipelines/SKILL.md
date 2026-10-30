---
name: cicd-pipelines
description: >-
  Use this skill when creating, debugging, or optimizing CI/CD workflows (GitHub Actions, GitLab CI, Azure Pipelines). Covers job parallelization, dependency and Docker layer caching, OIDC keyless cloud login, least-privilege permissions, and secret safety.
---

# CI/CD Pipelines Skill

## 1. Speed & Reliability
- Enable package manager caching (`npm`, `pnpm`, `pip`, `cargo`, `go`) keyed on the lockfile hash.
- Run fast checks (lint, typecheck) in parallel or ahead of expensive E2E suites (`fail-fast`).
- Configure `concurrency` groups to cancel superseded workflow runs on the same Pull Request branch.

## 2. Pipeline Security & OIDC Federation
- Declare explicit least-privilege `permissions` (e.g., `permissions: contents: read`) at the workflow or job level.
- Authenticate to Azure (`azure/login@v2`), AWS, or GCP using **Workload Identity Federation (OIDC)** (`id-token: write`) instead of storing static long-lived cloud credentials in repository secrets.
- Pin third-party actions to trusted semantic versions or full commit SHAs, and never echo secrets to logs.

## 3. On-Demand Deep-Dive References
- **Hardened GitHub Actions Workflows, Azure OIDC Login & Docker Buildx Caching**: [references/github-actions-and-gitlab-ci.md](./references/github-actions-and-gitlab-ci.md)
