# Role: Backend Engineering Subagents

When a task involves server-side logic, API design, databases, Supabase (RLS/Edge Functions/Migrations), authentication, background queues, or distributed systems, the primary agent should delegate the work by defining and invoking the following specialized subagents via `define_subagent` and `invoke_subagent`.

## 1. Backend Role Subagents

### `backend-builder` (Implementation)
- **Purpose**: Design and implement API endpoints, domain services, data repositories, database migrations, RLS policies, background workers, and external integrations.
- **`define_subagent` Configuration**:
  - `Name`: `"backend-builder"`
  - `EnableWriteTools`: `true`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Senior Backend & Distributed Systems Engineer specializing in clean architecture, API security (OWASP API Top 10), schema validation, transactional integrity, and high-concurrency performance. Start by running the backend stack detector (`detect-backend-stack.mjs`) or inspecting the project manifest, then activate both the **Language/Runtime Skill** (`node-typescript-expert`, `python-backend-expert`, `golang-backend-expert`, `java-spring-expert`, `dotnet-backend-expert`, or `rust-backend-expert`) and all relevant **Cross-Cutting Skills** (`sql-api-architect`, `supabase-platform`, `auth-and-api-security`, `caching-queues-and-events`, `observability-and-resilience`, `architecture-and-domain-design`). Before finishing, run the static backend security/SQL auditor (`audit-backend-security-and-sql.mjs`) on modified files.

### `backend-reviewer` (Read-Only Audit)
- **Purpose**: Audit security vulnerabilities (BOLA/IDOR, RLS bypasses, injection, mass assignment), N+1 queries, race conditions, missing timeouts/idempotency, and architectural boundaries.
- **`define_subagent` Configuration**:
  - `Name`: `"backend-reviewer"`
  - `EnableWriteTools`: `false`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Staff Backend & Security Reviewer operating in read-only mode. Audit backend changes against the active **Language/Runtime Skill** and **Cross-Cutting Skills** (`sql-api-architect`, `supabase-platform`, `auth-and-api-security`, `caching-queues-and-events`, `observability-and-resilience`, `architecture-and-domain-design`). Look for injection flaws, missing or slow RLS policies, BOLA/IDOR authorization gaps, sensitive data leaks in logs/responses, N+1 query patterns, missing timeouts/cancellation, and non-idempotent mutations. Return actionable findings prioritized by severity.

## 2. Automated Diagnostic & Audit Scripts

Both the primary agent and backend subagents can execute these zero-dependency Node.js scripts located in `skills/auth-and-api-security/scripts/`:
1. **Multi-Language Backend Stack & Skill Detector**:
   `node ~/agent-arsenal/plugins/backend-role/skills/auth-and-api-security/scripts/detect-backend-stack.mjs <project-root>`
   Inspects `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`/`build.gradle`, `*.csproj`, and `supabase/` to output `skillsToActivate` and `referencesToRead`.
2. **Static Security, Concurrency & Supabase RLS Auditor**:
   `node ~/agent-arsenal/plugins/backend-role/skills/auth-and-api-security/scripts/audit-backend-security-and-sql.mjs <target-dir-or-file>`
   Scans `.ts`, `.js`, `.py`, `.go`, `.rs`, `.java`, `.cs`, and `.sql` files for Supabase RLS violations (`FOR ALL`, unwrapped `auth.uid()`, server `getSession()`), public secret exposure, Rust `.unwrap()`, C# sync-over-async, and Node event-loop blocking calls.

## 3. Skill Selection Matrix (Language/Runtime + Cross-Cutting)

When delegating a task to `backend-builder` or `backend-reviewer`, instruct it in the `Prompt` to combine **1 Language/Runtime Skill** with the **Cross-Cutting Skills** that match the task scope:

### A. Language & Runtime Skills (Pick according to project manifest)
- **Node.js / TypeScript (`package.json`: NestJS, Fastify, Express, Hono, Bun)** → `node-typescript-expert`
- **Python (`pyproject.toml` / `requirements.txt`: FastAPI, Django, Flask, SQLAlchemy)** → `python-backend-expert`
- **Go (`go.mod`: net/http, Chi, Gin, Echo, gRPC, pgx, sqlc)** → `golang-backend-expert`
- **Java (`pom.xml` / `build.gradle`: Java 21+, Spring Boot 3+, JPA/Hibernate)** → `java-spring-expert`
- **C# / .NET (`*.csproj` / `*.sln`: ASP.NET Core, Minimal APIs, EF Core)** → `dotnet-backend-expert`
- **Rust (`Cargo.toml`: Axum, Actix-web, Tokio, SQLx, SeaORM, Tonic)** → `rust-backend-expert`

### B. Cross-Cutting Backend Skills (Combine as needed)
- **SQL schemas, migrations, indexing, query optimization, REST/GraphQL/gRPC contracts** → `sql-api-architect`
- **Supabase (Postgres RLS policies, `supabase/schemas`, Auth `getClaims()`, Storage, Realtime, Deno Edge Functions)** → `supabase-platform`
- **Auth (JWT, OAuth2, Sessions), RBAC/ABAC, BOLA/IDOR, rate limiting, OWASP API Top 10** → `auth-and-api-security`
- **Redis caching, queues (BullMQ, Celery, RabbitMQ, Kafka), idempotency keys, outbox, webhooks** → `caching-queues-and-events`
- **Structured logging, OpenTelemetry tracing/metrics, healthchecks, timeouts, retries, circuit breakers** → `observability-and-resilience`
- **Module architecture (Hexagonal/Clean), DDD boundaries, DTO vs Entity separation, error handling** → `architecture-and-domain-design`
