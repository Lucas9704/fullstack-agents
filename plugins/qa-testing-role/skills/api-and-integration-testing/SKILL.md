---
name: api-and-integration-testing
description: >-
  Use this skill when writing or reviewing API and database integration tests (Supertest, Httpx, Testcontainers with real Postgres/Redis, Mock Service Worker / MSW v2, OpenAPI contract validation, and Supabase pgTAP RLS tests).
---

# API & Integration Testing Skill

Follow these guidelines when testing API endpoints, database repositories, and service integrations:

## 1. Real Infrastructure Over Fragile DB Mocks (`Testcontainers`)
- **Never Mock SQL/ORM Internals**: Do not mock Prisma, Drizzle, SQLAlchemy, `pgx`, or `sqlx` query builders in integration tests—mocking the ORM hides SQL syntax errors, constraint violations, and migration bugs.
- **Isolated Database per Suite/Test**: Run integration tests against a real local database or ephemeral **Testcontainers** (`PostgreSQLContainer`, `RedisContainer`), isolating each test via transaction rollbacks (`BEGIN` / `ROLLBACK`), schema cloning, or fast table truncation (`TRUNCATE ... RESTART IDENTITY CASCADE`).

## 2. HTTP Endpoint & Contract Testing
- Test the full HTTP transport pipeline (routing, authentication guards, input validation schemas, serialization, status codes, and RFC 7807 error bodies) using in-process test clients (`supertest`, Fastify `app.inject()`, FastAPI `AsyncClient` + `ASGITransport`, Go `httptest.NewServer`, Axum `tower::ServiceExt::oneshot`).
- Verify four mandatory scenario groups for every endpoint:
  1. **2xx Happy Path** (valid payload + valid auth → expected response & DB state change).
  2. **400/422 Validation Failures** (malformed types, missing required fields, boundary limits).
  3. **401/403 Auth & BOLA/IDOR** (unauthenticated call + authenticated user attempting to access another user/tenant's resource).
  4. **404/409 Domain Conflicts** (non-existent IDs, duplicate idempotency/unique keys).

## 3. External Third-Party API Mocking (`MSW v2`)
- Intercept outbound HTTP calls to third-party APIs (Stripe, Auth0, Resend, OpenAI) at the network boundary using **Mock Service Worker (`msw/node`)** (`setupServer`, `http.get`, `HttpResponse.json`) with `onUnhandledRequest: 'error'` so accidental live external requests fail immediately.

## 4. On-Demand Deep-Dive References
- **Testcontainers PostgreSQL Setup & Supabase `pgTAP` RLS Policy Tests (`supabase test db`)**: [references/testcontainers-and-supabase-pgtap.md](./references/testcontainers-and-supabase-pgtap.md)
