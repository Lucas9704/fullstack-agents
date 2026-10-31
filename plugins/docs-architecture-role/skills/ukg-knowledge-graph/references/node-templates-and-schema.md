# UKG Node Templates & Frontmatter Schema Reference

## 1. Root Hub Template (`docs/index.md`)
```markdown
---
id: docs-root-hub
title: "System Knowledge Graph Hub"
type: "Hub"
status: "active"
owner: "@engineering"
tags: [index, architecture, ukg]
last_updated: 2026-10-31
---

# System Knowledge Graph (`docs/index.md`)

Welcome to the project's Unified Knowledge Graph. Start here to navigate domains, services, architectural decisions, and operational runbooks.

## 1. Architecture & Core Domains
- [System Architecture Overview](./architecture/overview.md) (` [[system-architecture-overview]] `)
- [Authentication & Identity Service](./domains/auth-service.md) (` [[auth-service]] `)
- [Orders & Checkout Service](./domains/orders-service.md) (` [[orders-service]] `)

## 2. Data Schemas & Contracts
- [Orders Database Schema](./schemas/postgres-orders-schema.md) (` [[postgres-orders-schema]] `)

## 3. Architecture Decision Records (ADRs)
- [ADR-001: Row Level Security in Supabase](./decisions/adr-001-supabase-rls.md) (` [[adr-001-supabase-rls]] `)

## 4. Operational Runbooks
- [Production Deployment & Rollback Runbook](./runbooks/deploy-production.md) (` [[runbook-deploy-production]] `)
```

---

## 2. Service / Technical Component Node Template (`docs/domains/orders-service.md`)
```markdown
---
id: orders-service
title: "Orders & Checkout Service"
type: "Service"
status: "active"
owner: "@backend-team"
depends_on:
  - "[[auth-service]]"
  - "[[postgres-orders-schema]]"
tags: [orders, checkout, api]
last_updated: 2026-10-31
---

# Orders & Checkout Service

## 1. Responsibility & Scope
The `orders-service` manages shopping cart checkout, inventory reservation, and order lifecycle transitions (`pending` -> `paid` -> `fulfilled` | `cancelled`).

## 2. Relationships & Contracts
- **Authenticates via**: [[auth-service]] (`supabase.auth.getClaims()`)
- **Persists data in**: [[postgres-orders-schema]] (`public.orders`, `public.order_items`)
- **Governed by**: [[adr-001-supabase-rls]]

## 3. Key Invariants & Failure Modes
- Every `POST /api/v1/orders` request requires an `Idempotency-Key` header to prevent duplicate charges on network retries.
- Order totals are always calculated server-side in integer cents (`total_cents`)—client-supplied prices are rejected.
```

---

## 3. Operational Runbook Node Template (`docs/runbooks/deploy-production.md`)
```markdown
---
id: runbook-deploy-production
title: "Production Deployment & Rollback Runbook"
type: "Runbook"
status: "active"
owner: "@devops-team"
depends_on:
  - "[[orders-service]]"
tags: [runbook, deployment, rollback]
last_updated: 2026-10-31
---

# Production Deployment & Rollback Runbook

## 1. Preconditions
1. Confirm CI pipeline on `main` is green (`lint`, `typecheck`, `vitest`, `playwright`).
2. Verify pending SQL migrations in `supabase/migrations/` follow the Expand-and-Contract zero-downtime pattern.

## 2. Execution Steps
1. Apply database migrations: `npx supabase db push`.
2. Deploy container revision and verify `/health/ready` returns `200 OK`.

## 3. Rollback Procedure
1. Shift 100% of ingress traffic back to the previous stable revision via `az containerapp ingress traffic set`.
```
