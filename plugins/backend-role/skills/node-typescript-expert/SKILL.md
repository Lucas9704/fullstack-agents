---
name: node-typescript-expert
description: >-
  Use this skill when developing or reviewing Node.js / TypeScript backend services (NestJS, Fastify, Express, Hono). Covers strict typing, async error handling, validation with Zod/class-validator, and event-loop performance.
---

# Node.js & TypeScript Backend Expert Skill

## 1. Strict Typing & Boundary Validation
- Enforce `strict: true` in TypeScript; never trust `req.body`, `req.query`, or external API payloads without validating them at runtime using a schema library (`zod`, `valibot`, or `class-validator`).
- Never block the Event Loop with synchronous I/O (`fs.readFileSync`, synchronous `crypto`, or heavy CPU loops).

## 2. Error Handling & Async Safety
- Avoid floating promises (`no-floating-promises`); handle rejections explicitly and propagate typed domain errors to a centralized error-handling middleware/filter.
- Implement graceful shutdown on `SIGTERM` / `SIGINT` signals, cleanly closing active HTTP servers and database connection pools.

## 3. Verification
1. Run `tsc --noEmit` to verify types.
2. Execute the service's unit and integration test suite.
