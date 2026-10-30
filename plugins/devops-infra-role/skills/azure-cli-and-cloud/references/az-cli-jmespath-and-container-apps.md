# Azure CLI (`az`), JMESPath Queries, Container Apps & Key Vault Reference

## 1. Essential JMESPath (`--query`) Patterns
Avoid `grep`/`awk`/`jq` fragile pipes when Azure CLI's built-in JMESPath engine can filter and project server/client-side directly:

```bash
# 1. Get a single scalar value (-o tsv strips quotes and formatting)
SUBSCRIPTION_ID=$(az account show --query "id" -o tsv)

# 2. Filter resources by tag and project multiple fields as JSON
az resource list \
  --tag environment=prod \
  --query "[].{Name:name, Type:type, Location:location}" \
  -o json

# 3. List running Container App revisions and their traffic weights
az containerapp revision list \
  --name "$APP_NAME" \
  --resource-group "$RG" \
  --query "[?properties.active].{Revision:name, Traffic:properties.trafficWeight, Created:properties.createdTime}" \
  -o table
```

## 2. Zero-Downtime Azure Container Apps & ACR Workflow with Managed Identity
Grant an Azure Container App pull access (`AcrPull`) to Azure Container Registry and secret access (`Key Vault Secrets User`) using a User-Assigned Managed Identity (zero passwords!):

```bash
#!/usr/bin/env bash
set -euo pipefail

RG="rg-myapp-prod"
LOCATION="eastus2"
ACR_NAME="acrmyappprod01"
KV_NAME="kv-myapp-prod-01"
IDENTITY_NAME="id-myapp-prod"
APP_NAME="ca-myapp-api"

# 1. Create User-Assigned Managed Identity & capture IDs
az identity create --name "$IDENTITY_NAME" --resource-group "$RG" --location "$LOCATION" --only-show-errors
IDENTITY_ID=$(az identity show --name "$IDENTITY_NAME" --resource-group "$RG" --query "id" -o tsv)
PRINCIPAL_ID=$(az identity show --name "$IDENTITY_NAME" --resource-group "$RG" --query "principalId" -o tsv)

# 2. Grant AcrPull on ACR and Key Vault Secrets User on Key Vault
ACR_ID=$(az acr show --name "$ACR_NAME" --resource-group "$RG" --query "id" -o tsv)
KV_ID=$(az keyvault show --name "$KV_NAME" --resource-group "$RG" --query "id" -o tsv)

az role assignment create --assignee-object-id "$PRINCIPAL_ID" --assignee-principal-type ServicePrincipal --role "AcrPull" --scope "$ACR_ID" --only-show-errors
az role assignment create --assignee-object-id "$PRINCIPAL_ID" --assignee-principal-type ServicePrincipal --role "Key Vault Secrets User" --scope "$KV_ID" --only-show-errors

# 3. Reference Key Vault secret in Container App and bind to env var
SECRET_URI=$(az keyvault secret show --vault-name "$KV_NAME" --name "database-url" --query "id" -o tsv)
az containerapp secret set --name "$APP_NAME" --resource-group "$RG" \
  --secrets "db-url=keyvaultref:${SECRET_URI},identityref:${IDENTITY_ID}" --only-show-errors

az containerapp update --name "$APP_NAME" --resource-group "$RG" \
  --set-env-vars "DATABASE_URL=secretref:db-url" --only-show-errors
```

## 3. Declarative Bicep Validation & What-If Preview
Before applying Bicep templates (`main.bicep`), always validate and preview resource changes:
```bash
az bicep build --file infra/main.bicep
az deployment group what-if \
  --resource-group "$RG" \
  --template-file infra/main.bicep \
  --parameters infra/main.prod.bicepparam
```
