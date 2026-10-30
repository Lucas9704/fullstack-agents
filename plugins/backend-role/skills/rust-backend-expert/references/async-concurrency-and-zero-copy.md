# Rust Async Concurrency, Tokio & Zero-Copy Performance Reference

## 1. Structured Concurrency (`JoinSet`, `select!`, `CancellationToken`)
- **`tokio::task::JoinSet`**: Manage dynamic sets of concurrent tasks with bounded concurrency instead of detached `tokio::spawn` calls that silently drop panics or results.
- **Cancel-Safety in `tokio::select!`**: Be aware of cancel-safety when racing futures inside `tokio::select!`. Prefer `mpsc::Receiver::recv` (which is cancel-safe) over multi-step async reads inside `select!` branches.
- **Graceful Shutdown (`CancellationToken`)**: Use `tokio_util::sync::CancellationToken` alongside `axum::serve(listener, app).with_graceful_shutdown(shutdown_signal())` to drain in-flight HTTP requests and stop background workers cleanly.

## 2. Lock Contention & Shared State Patterns
- **Never Hold `std::sync::MutexGuard` Across `.await`**: Standard library mutex guards block the OS thread; if a lock must be held across an `.await` point, use `tokio::sync::Mutex` or refactor so the critical section completes synchronously before awaiting.
- **Sharded Maps & Actor Pattern**: For high-throughput in-memory state, prefer `DashMap` or a dedicated actor task communicating via bounded `tokio::sync::mpsc::channel(capacity)` (enforcing backpressure) rather than a single global `RwLock<HashMap<...>>`.

## 3. Zero-Copy & Allocation Hygiene
- **Use `bytes::Bytes` for Buffers**: Pass `Bytes` (reference-counted byte slices) across network/queue boundaries instead of cloning `Vec<u8>`.
- **Preallocate Collections**: Use `Vec::with_capacity(n)` and `String::with_capacity(n)` when transforming known-length query result sets, and accept `&str` / `&[T]` in function parameters instead of owned `String` / `Vec<T>` when ownership is not needed.
