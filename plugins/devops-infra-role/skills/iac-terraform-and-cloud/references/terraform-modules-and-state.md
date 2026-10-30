# Terraform / OpenTofu Modules, State Backends & Validation Reference

## 1. Azure (`azurerm`) & AWS (`s3`) Remote State Backends
Configure encrypted remote state with OIDC / Azure AD authentication (`use_azuread_auth = true` and `use_oidc = true`):

```hcl
terraform {
  required_version = ">= 1.8.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "sttfstateprod001"
    container_name       = "tfstate"
    key                  = "prod/app.tfstate"
    use_azuread_auth     = true
    use_oidc             = true
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
  }
  use_oidc = true
}
```

## 2. Input Validation & Sensitive Outputs (`variables.tf` / `outputs.tf`)
Validate environment names, SKUs, and CIDR blocks at plan time before cloud APIs are called:

```hcl
variable "environment" {
  description = "Deployment environment identifier."
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}
```

## 3. Automated IaC Static Analysis & Security Scanning
Run these checks in CI on every Pull Request before `terraform plan`:
1. `terraform fmt -check -recursive`
2. `terraform init -backend=false && terraform validate`
3. `tflint --recursive` (catches invalid cloud instance types and deprecated arguments)
4. `trivy config .` or `checkov -d .` (catches unencrypted storage, public buckets, and overly permissive firewall rules).
