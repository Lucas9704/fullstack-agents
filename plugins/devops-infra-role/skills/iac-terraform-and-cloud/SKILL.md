---
name: iac-terraform-and-cloud
description: >-
  Use this skill when designing, writing, or auditing Infrastructure as Code (Terraform, OpenTofu, Bicep) across Azure, AWS, GCP, or Cloudflare. Covers remote state locking, modular composition, least-privilege IAM/Managed Identities, and drift prevention.
---

# Infrastructure as Code (Terraform / OpenTofu) & Cloud Skill

Follow these guidelines when authoring or reviewing Infrastructure as Code:

## 1. State Management & Provider Pinning
- **Remote State with Locking**: Always store state in an encrypted remote backend (`azurerm` Blob Storage with state locking, AWS S3 + lockfile/DynamoDB, or GCS) and never commit `terraform.tfstate` or `*.tfvars` containing secrets to Git.
- **Pin Provider & Terraform Versions**: Declare explicit `required_version` and `required_providers` constraints (`~> 4.0` for `azurerm`, `~> 5.0` for `aws`) and commit `.terraform.lock.hcl`.

## 2. Modular Structure & Naming
- Standardize every Terraform module around four clear files:
  - `main.tf` (resources and data sources)
  - `variables.tf` (typed inputs with `description`, explicit `type`, and `validation {}` blocks)
  - `outputs.tf` (explicitly mark sensitive outputs with `sensitive = true`)
  - `versions.tf` (provider and backend declarations)
- Apply consistent `tags` / `labels` (`environment`, `project`, `managed_by = "terraform"`, `owner`) at the provider default level or via a shared locals map.

## 3. Cloud Security & Least Privilege
- **Identity over Static Keys**: Use Managed Identities (Azure), IAM Roles for Service Accounts (AWS/GCP), and Workload Identity Federation (OIDC) for CI/CD instead of creating long-lived service principal secrets or IAM access keys.
- **Network Segmentation**: Never expose databases, Redis caches, or internal workloads to `0.0.0.0/0`; restrict ingress to private subnets/VNets, security groups, or private endpoints.
- **Prevent Accidental Destruction**: Set `lifecycle { prevent_destroy = true }` on stateful production resources (databases, storage buckets, KMS/Key Vault keys).

## 4. On-Demand Deep-Dive References
- **Module Architecture, Remote Backends (`azurerm`/`s3`) & Static Analysis (`tflint`/`trivy`)**: [references/terraform-modules-and-state.md](./references/terraform-modules-and-state.md)

## 5. Verification
1. Run `terraform fmt -check` and `terraform validate` (or `tofu validate`).
2. Inspect `terraform plan` carefully before applying any infrastructure changes.
