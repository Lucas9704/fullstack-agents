---
name: azure-cli-and-cloud
description: >-
  Use this skill when automating, provisioning, debugging, or managing Microsoft Azure resources using Azure CLI (az), Bicep, Azure Container Apps, App Service, AKS, Key Vault, ACR, or Managed Identities.
---

# Azure CLI (`az`) & Azure Cloud Engineering Skill

Follow these guidelines when writing Azure CLI automation scripts, provisioning Azure resources, or troubleshooting cloud workloads:

## 1. Idempotent & Non-Interactive `az` CLI Scripting
- **Fail Fast in Bash**: Start automation scripts with `set -euo pipefail`.
- **Deterministic Filtering with JMESPath (`--query`)**: Always combine `--query "..."` with `-o tsv` (for single scalar values assigned to shell variables) or `-o json` (for structured parsing). Never parse human-oriented `-o table` output in scripts:
  ```bash
  ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RG" --query "loginServer" -o tsv)
  ```
- **Avoid Interactive Prompts**: Pass `--only-show-errors` and `--yes` (where appropriate in non-destructive automation) so scripts never hang waiting for terminal confirmation.
- **Existence Checks & Idempotency**: Many `az <service> create` commands are idempotent (upsert), but verify resource existence (`az group exists --name "$RG"`) or use **Bicep (`az deployment group create --what-if`)** for declarative repeatability.

## 2. Authentication, Managed Identities & Key Vault
- **Workload Identity Federation (OIDC)**: In GitHub Actions / GitLab CI / Azure DevOps, authenticate via OIDC Federated Credentials (`azure/login@v2` with `client-id`, `tenant-id`, `subscription-id`)—never store long-lived Service Principal client secrets.
- **System/User-Assigned Managed Identities**: Grant Azure workloads (Container Apps, App Service, Functions, VMs) access to **Azure Key Vault**, **Azure SQL / Postgres Flexible Server**, and **Azure Container Registry (`AcrPull`)** using Managed Identities and RBAC role assignments (`az role assignment create`) instead of connection string passwords.
- **Secret Hygiene**: Never pass raw secrets directly in CLI flags where they appear in process tables or CI logs; reference Key Vault secrets (`keyVaultUrl` + `identity`) or read from `@file` / environment variables with `::add-mask::`.

## 3. Modern Compute: Azure Container Apps, ACR & Bicep
- Build container images remotely without a local Docker daemon when needed using `az acr build --registry "$ACR_NAME" --image "app:$GIT_SHA" .`.
- Deploy zero-downtime updates to **Azure Container Apps** using explicit image tags (never `:latest`), health probes, and revision traffic splitting (`az containerapp update` / `az containerapp ingress traffic set`).

## 4. On-Demand Deep-Dive References
- **Azure CLI JMESPath Queries, Container Apps, Key Vault RBAC & Bicep Workflows**: [references/az-cli-jmespath-and-container-apps.md](./references/az-cli-jmespath-and-container-apps.md)
