---
name: rust-backend-expert
description: >-
  Use this skill when building, refactoring, or reviewing Rust backend services (Axum, Actix-web, Tonic gRPC, Tokio, SQLx, SeaORM, Serde, Tracing). Covers zero-panic request handling, typed error mapping, async Tokio safety, and compile-time SQL verification.
---

# Rust Backend Expert Skill

Follow these guidelines when developing or auditing **Rust** backend services:

## 1. Zero-Panic Request Handling & Error Mapping
- **No `.unwrap()` or `.expect()` in Handlers**: Never use `.unwrap()`, `.expect()`, or indexing that can panic inside request handlers or domain logic. Propagate errors with `?`.
- **Typed Domain Errors (`thiserror`)**: Define structured domain/application error enums using `thiserror::Error` and implement `axum::response::IntoResponse` (or `actix_web::ResponseError`) to map each variant to a semantic HTTP status code and safe client-facing RFC 7807 JSON payload while logging internal details via `tracing::error!`.

## 2. Tokio Async Runtime & Concurrency
- **Never Block the Async Executor**: Do not run CPU-heavy work or synchronous blocking I/O (`std::fs`, `std::thread::sleep`, heavy hashing like Argon2/bcrypt) directly on Tokio worker threads; offload them via `tokio::task::spawn_blocking`.
- **Shared State**: Prefer passing `Arc<AppState>` (containing connection pools and pre-built clients) via Axum `State` extractor rather than wrapping entire services in a coarse `Arc<Mutex<...>>`. Never hold a `std::sync::MutexGuard` across an `.await` point.

## 3. Serialization, Validation & Database (`SQLx` / `Serde`)
- Validate incoming payloads using strongly typed `serde::Deserialize` structs (newtypes for domain primitives like `Email`, `UserId`, `NonEmptyString`, or `validator`/`garde` crates).
- Use `sqlx::query_as!` for compile-time checked SQL queries and always use bounded database connection pools (`PgPoolOptions::new().max_connections(...)`).

## 4. Verification
1. Run `cargo check` and `cargo clippy --all-targets -- -D warnings`.
2. Run `cargo test` to validate unit and integration test suites.
