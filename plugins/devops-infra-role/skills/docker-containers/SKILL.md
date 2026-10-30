---
name: docker-containers
description: >-
  Use this skill when creating, optimizing, or auditing Dockerfiles and Docker Compose configurations, or running automated DevOps stack and container security audits. Covers multi-stage builds, layer caching, non-root users, and minimal base images.
---

# Docker & Containers Skill

## 1. Minimal & Secure Images
- **Multi-stage builds**: Separate the build stage (`builder`) from the final runtime stage (`runner`) to exclude build toolchains and devDependencies.
- **Non-root execution**: Configure and run the container process under an unprivileged user (`USER node` / `USER appuser` / `USER nonroot`).
- **Pinned versions**: Avoid `:latest` tags; pin explicit versions and prefer compatible `slim`, `alpine`, or `distroless` variants.

## 2. Layer Caching & `.dockerignore`
- Copy dependency manifests (`package.json`, lockfiles, `requirements.txt`, `go.mod`, `Cargo.toml`) and install dependencies before copying application source code to maximize layer caching.
- Ensure a `.dockerignore` file exists and excludes `.git`, `node_modules`, `.env*`, and local build artifacts.

## 3. On-Demand Deep-Dive References
- **Multi-Stage Node/Go/Rust Dockerfiles, `distroless` & Production `compose.yaml` Healthchecks**: [references/multi-stage-and-compose-recipes.md](./references/multi-stage-and-compose-recipes.md)

## 4. Executable Helper Scripts (`scripts/`)
- **Detect DevOps Stack & Recommended Skills**:
  [scripts/detect-devops-stack.mjs](./scripts/detect-devops-stack.mjs)
  Run: `node <skill_dir>/scripts/detect-devops-stack.mjs <project_root>`
- **Static Dockerfile, CI/CD & Shell Security Auditor**:
  [scripts/audit-devops-and-containers.mjs](./scripts/audit-devops-and-containers.mjs)
  Run: `node <skill_dir>/scripts/audit-devops-and-containers.mjs <target_dir_or_file>`
