# GitHub Actions & GitLab CI Production Pipelines Reference

## 1. Hardened GitHub Actions Workflow (Concurrency, Caching & OIDC)
Always declare least-privilege `permissions`, `concurrency` cancellation, and OIDC keyless authentication (`id-token: write`) when deploying to Azure/AWS/GCP:

```yaml
name: CI & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run typecheck
      - run: pnpm test -- --run

  deploy-azure:
    needs: verify
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Azure Login via OIDC (No Client Secret)
        uses: azure/login@v2
        with:
          client-id: ${{ vars.AZURE_CLIENT_ID }}
          tenant-id: ${{ vars.AZURE_TENANT_ID }}
          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}
      - name: Deploy Container App Revision
        run: |
          az containerapp update \
            --name "${{ vars.CONTAINER_APP_NAME }}" \
            --resource-group "${{ vars.AZURE_RESOURCE_GROUP }}" \
            --image "${{ vars.ACR_LOGIN_SERVER }}/app:${{ github.sha }}"
```

## 2. Docker Buildx Layer Caching in GitHub Actions
Use `docker/build-push-action@v6` with GitHub Actions cache (`cache-from: type=gha`, `cache-to: type=gha,mode=max`) so multi-stage Docker builds reuse unchanged layers across CI runs.
