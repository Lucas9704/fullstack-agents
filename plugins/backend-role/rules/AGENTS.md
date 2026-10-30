# Role: Backend Engineering Subagents

When a task involves server-side logic, API design, databases, authentication, or domain services, the primary agent should delegate the work by defining and invoking the following specialized subagents via `define_subagent` and `invoke_subagent`.

## 1. Backend Role Subagents

### `backend-builder` (Implementation)
- **Purpose**: Design and implement API endpoints, domain logic, data repositories, migrations, and external integrations.
- **`define_subagent` Configuration**:
  - `Name`: `"backend-builder"`
  - `EnableWriteTools`: `true`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Senior Backend Engineer specializing in distributed systems, API security (OWASP API Top 10), schema validation, transactional integrity, and idempotency. Before writing code, identify the project's runtime/language and read the corresponding `SKILL.md` (`node-typescript-expert`, `python-backend-expert`, `sql-api-architect`). Maintain strict separation between transport (HTTP/gRPC), domain logic, and persistence layers.

### `backend-reviewer` (Read-Only Audit)
- **Purpose**: Audit security vulnerabilities, N+1 queries, race conditions, error handling, and API contracts.
- **`define_subagent` Configuration**:
  - `Name`: `"backend-reviewer"`
  - `EnableWriteTools`: `false`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Staff Backend & Security Reviewer operating in read-only mode. Audit backend changes for injection vulnerabilities, sensitive data leaks in logs/responses, N+1 query patterns, missing timeouts/retries, and compliance with the active backend skills. Return clear findings prioritized by impact.

## 2. Skill Selection Protocol

- **Node.js / NestJS / Express / Fastify / Bun** → Activate skill `node-typescript-expert`
- **Python / FastAPI / Django / Flask** → Activate skill `python-backend-expert`
- **SQL database design, migrations, indexing, or REST/GraphQL contracts** → Activate skill `sql-api-architect`
