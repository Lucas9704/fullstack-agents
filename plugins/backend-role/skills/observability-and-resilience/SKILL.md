---
name: observability-and-resilience
description: >-
  Use this skill when implementing structured logging, OpenTelemetry distributed tracing and metrics, health check endpoints (liveness/readiness), timeouts, retries with exponential backoff, circuit breakers, or graceful degradation.
---

# Observability & Resilience Skill

Follow these guidelines to make backend services observable in production and resilient to partial failures:

## 1. Structured Logging & Distributed Tracing (`OpenTelemetry`)
- **Structured JSON Logs Only**: Emit structured logs (`pino`, `structlog`, `slog`, `tracing`, `Serilog`) containing `timestamp`, `level`, `service`, `trace_id`, `span_id`, and `request_id`.
- **PII & Secret Redaction**: Never log passwords, Authorization headers, session cookies, raw JWTs, credit card numbers, or full PII payloads.
- **Propagate Trace Context**: Forward W3C `traceparent` / correlation IDs across outgoing HTTP requests, gRPC metadata, and background queue headers.

## 2. Network Resilience & Fault Tolerance
- **Timeouts on Every External Call**: Never execute an outbound HTTP request, database query, or RPC call without an explicit connection and read/request timeout.
- **Retries with Exponential Backoff & Jitter**: Retry only transient errors (`429`, `502`, `503`, `504`, network timeouts) and only on idempotent operations (or requests carrying an `Idempotency-Key`), applying full jitter to prevent retry storms.
- **Circuit Breakers & Bulkheads**: Wrap fragile downstream dependencies in circuit breakers and isolate thread/connection pools so a slow third-party API cannot exhaust the entire service.

## 3. Health Checks & Graceful Shutdown
- **Separate Liveness vs. Readiness**:
  - `GET /health/live` (Liveness): Fast, lightweight check confirming the process event loop/runtime is responsive (never check external DBs here, or transient DB blips will trigger container restart loops).
  - `GET /health/ready` (Readiness): Verifies critical dependencies (database pool, migrations, cache) are ready to accept traffic.
