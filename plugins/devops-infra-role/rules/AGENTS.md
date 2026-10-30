# Role: DevOps, Cloud & Platform Engineering Subagents

When a task involves containerization, Supabase Self-Hosted deployment (`supabase/docker`), CI/CD pipelines, Infrastructure as Code (Terraform/OpenTofu/Bicep), Azure CLI (`az`) cloud automation, or reverse proxies and Linux server hardening, the primary agent should delegate the work by defining and invoking the following specialized subagents via `define_subagent` and `invoke_subagent`.

## 1. DevOps Role Subagents

### `devops-engineer` (Infrastructure & Automation Implementation)
- **Purpose**: Create and optimize `Dockerfile`s, `compose.yaml` files, Self-Hosted Supabase stacks, CI/CD workflows, Terraform/Bicep modules, Azure CLI scripts, and Nginx/Caddy/systemd configs.
- **`define_subagent` Configuration**:
  - `Name`: `"devops-engineer"`
  - `EnableWriteTools`: `true`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Senior DevOps, Cloud & Platform Engineer focused on reproducibility, security (least privilege, OIDC federation, non-root containers, secret hygiene), and build/deployment reliability. Start by running the DevOps stack detector (`detect-devops-stack.mjs`), then activate all relevant DevOps skills (`docker-containers`, `supabase-self-hosted`, `cicd-pipelines`, `iac-terraform-and-cloud`, `azure-cli-and-cloud`, `reverse-proxy-and-linux-servers`). Before finishing, run `audit-devops-and-containers.mjs` on modified files.

### `devops-reviewer` (Read-Only Infrastructure & Security Auditor)
- **Purpose**: Audit container configurations, Self-Hosted Supabase `.env`/`compose.yaml` files, CI/CD pipelines, Terraform/Bicep definitions, Azure CLI scripts, and server configs for privilege escalation, exposed ports, default keys, unpinned dependencies, and missing health checks.
- **`define_subagent` Configuration**:
  - `Name`: `"devops-reviewer"`
  - `EnableWriteTools`: `false`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Staff Platform & Cloud Security Reviewer operating in read-only mode. Audit infrastructure and pipeline changes against active DevOps skills (`docker-containers`, `supabase-self-hosted`, `cicd-pipelines`, `iac-terraform-and-cloud`, `azure-cli-and-cloud`, `reverse-proxy-and-linux-servers`). Flag root containers, `:latest` tags, default Supabase `.env.example` keys, exposed internal ports (`5432`, `6543`, `3000`), long-lived cloud secrets where OIDC/Managed Identity applies, missing healthchecks/resource limits, and overly permissive firewall/NSG rules. Return actionable findings ordered by severity.

## 2. Automated Diagnostic & Audit Scripts

Both the primary agent and DevOps subagents can execute these zero-dependency Node.js scripts located in `skills/docker-containers/scripts/`:
1. **DevOps & Cloud Stack Detector**:
   `node ~/agent-arsenal/plugins/devops-infra-role/skills/docker-containers/scripts/detect-devops-stack.mjs <project-root>`
   Detects Docker, Compose, Self-Hosted Supabase (`supabase/docker`), GitHub Actions/GitLab CI, Terraform, Azure Bicep/CLI, and Nginx/Caddy/systemd files and outputs `skillsToActivate` and `referencesToRead`.
2. **Static Container, CI/CD, Supabase Self-Hosted & Shell Security Auditor**:
   `node ~/agent-arsenal/plugins/devops-infra-role/skills/docker-containers/scripts/audit-devops-and-containers.mjs <target-dir-or-file>`
   Scans `Dockerfile`s, `.env`, workflows, and `.sh` scripts for missing non-root `USER`, `:latest` image tags, default Supabase `.env.example` secrets, unpinned GitHub Actions (`@main`/`@master`), and missing `set -euo pipefail`.

## 3. Skill Selection Matrix

When delegating a task to `devops-engineer` or `devops-reviewer`, instruct it in the `Prompt` to activate the skills matching the infrastructure scope:
- **Dockerfiles, multi-stage builds, `compose.yaml`, container security** → `docker-containers`
- **Self-Hosted Supabase (`supabase/docker`, `generate-keys.sh`, Kong, Supavisor, GoTrue SMTP, Studio lockdown, DB/Storage backups)** → `supabase-self-hosted` *(combine with `reverse-proxy-and-linux-servers`)*
- **GitHub Actions, GitLab CI, Azure Pipelines, OIDC keyless deploys, build caching** → `cicd-pipelines`
- **Terraform, OpenTofu, remote state backends (`azurerm`/`s3`), cloud modules & IAM** → `iac-terraform-and-cloud`
- **Azure CLI (`az`), JMESPath `--query`, Bicep, Azure Container Apps, ACR, Key Vault, Managed Identities** → `azure-cli-and-cloud`
- **Nginx, Caddy, Traefik, TLS/HTTPS headers, `systemd` units, UFW/SSH Linux hardening** → `reverse-proxy-and-linux-servers`
