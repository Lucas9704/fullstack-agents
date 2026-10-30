---
name: docker-containers
description: >-
  Use this skill when creating, optimizing, or auditing Dockerfiles and Docker Compose configurations. Covers multi-stage builds, layer caching, non-root users, and minimal base images.
---

# Docker & Containers Skill

## 1. Minimal & Secure Images
- **Multi-stage builds**: Separate the build stage (`builder`) from the final runtime stage (`runner`) to exclude build toolchains and devDependencies.
- **Non-root execution**: Configure and run the container process under an unprivileged user (`USER node` / `USER appuser`).
- **Pinned versions**: Avoid `:latest` tags; pin explicit versions and prefer compatible `slim` or `alpine` variants.

## 2. Layer Caching & `.dockerignore`
- Copy dependency manifests (`package.json`, lockfiles, `requirements.txt`) and install dependencies before copying application source code to maximize layer caching.
- Ensure a `.dockerignore` file exists and excludes `.git`, `node_modules`, `.env*`, and local build artifacts.
