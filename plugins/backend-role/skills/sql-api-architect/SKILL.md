---
name: sql-api-architect
description: >-
  Use this skill when designing SQL schemas, migrations, complex queries, indexing strategies, or REST/GraphQL API contracts.
---

# SQL & API Architect Skill

## 1. Database Design & SQL Queries
- **Referential integrity**: Enforce foreign keys, `NOT NULL`, `UNIQUE`, and `CHECK` constraints at the database level.
- **Deliberate indexing**: Design composite indexes aligned with actual `WHERE`, `JOIN`, and `ORDER BY` predicates; prevent `N+1` query issues via `JOIN`s or batch loaders (`dataloader`).
- **Zero-downtime migrations**: Avoid renaming or dropping columns in a single production deployment; apply the *Expand and Contract* pattern.

## 2. API Contract Design
- Keep contracts consistent: use semantic HTTP status codes, uniform error payloads (RFC 7807 Problem Details), and explicit cursor or limit/offset pagination.
- Ensure idempotency on critical state-mutating operations (`POST`/`PATCH`) where applicable.
