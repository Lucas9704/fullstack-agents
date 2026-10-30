---
name: cicd-pipelines
description: >-
  Use this skill when creating or optimizing CI/CD workflows (GitHub Actions, GitLab CI). Covers job parallelization, dependency caching, least-privilege permissions, and secret safety.
---

# CI/CD Pipelines Skill

## 1. Speed & Reliability
- Enable package manager caching (`npm`, `pnpm`, `pip`, `cargo`) keyed on the lockfile hash.
- Run fast checks (lint, typecheck) in parallel or ahead of expensive E2E suites (`fail-fast`).
- Configure `concurrency` groups to cancel superseded workflow runs on the same Pull Request branch.

## 2. Pipeline Security
- Declare explicit least-privilege `permissions` (e.g., `permissions: contents: read`) at the workflow or job level.
- Pin third-party actions to trusted semantic versions or full commit SHAs, and never echo secrets to logs.
