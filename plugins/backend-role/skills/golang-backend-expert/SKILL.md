---
name: golang-backend-expert
description: >-
  Use this skill when building, refactoring, or reviewing Go (Golang) backend services and APIs (standard library net/http, Chi, Gin, Echo, Fiber, gRPC, pgx, sqlc). Covers context propagation, idiomatic error handling, concurrency with errgroup, and zero-allocation performance.
---

# Go (Golang) Backend Expert Skill

Follow these guidelines when developing or auditing **Go** backend services:

## 1. Context Propagation & Idiomatic Error Handling
- **`context.Context` First**: Pass `ctx context.Context` as the first parameter of every function that performs I/O, database queries, or external RPC/HTTP calls. Always respect `ctx.Err()` and timeouts.
- **Explicit Error Wrapping**: Wrap errors with context using `fmt.Errorf("fetching user %s: %w", id, err)` and inspect domain/sentinel errors via `errors.Is()` and `errors.As()`. Never ignore returned errors (`_`) on I/O or transaction operations.
- **No `panic` in Request Flow**: Reserve `panic` strictly for unrecoverable startup invariants; recover at the HTTP/gRPC middleware boundary and return structured error responses.

## 2. Concurrency & Resource Safety
- **Bounded Concurrency (`errgroup`)**: Use `golang.org/x/sync/errgroup` (`errgroup.WithContext(ctx)`) with `SetLimit(n)` instead of spawning unbounded fire-and-forget goroutines.
- **Prevent Goroutine Leaks**: Every spawned goroutine must have a deterministic exit condition tied to `ctx.Done()` or a closed channel.
- **Always Close Resources**: `defer rows.Close()`, `defer resp.Body.Close()`, and `defer tx.Rollback(ctx)` immediately after verifying no error occurred on acquisition.

## 3. Database, Interfaces & Project Structure
- **Accept Interfaces, Return Structs**: Define small consumer-driven interfaces where they are used (e.g., inside the service/use-case package) rather than monolithic interfaces in the provider package.
- **Type-Safe SQL**: Prefer `pgx` + `sqlc` (or explicit parameterized queries) with strict connection pool tuning (`MaxConns`, `MinConns`, `MaxConnLifetime`).
- **Graceful Shutdown**: Use `signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)` and `srv.Shutdown(shutdownCtx)` to drain in-flight requests cleanly.

## 4. Verification
1. Run `go vet ./...` and `golangci-lint run` (if configured).
2. Run `go test -race ./...` to verify unit/integration tests and detect data races.
