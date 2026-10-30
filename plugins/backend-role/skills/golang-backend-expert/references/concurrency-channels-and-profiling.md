# Go Concurrency, Channels, Memory & Profiling Reference

## 1. Bounded Fan-Out with `errgroup.WithContext`
- Always bound concurrent goroutines and propagate context cancellation so the first failing task cancels sibling work immediately:
  ```go
  g, ctx := errgroup.WithContext(parentCtx)
  g.SetLimit(10) // Max 10 concurrent workers

  for _, id := range itemIDs {
      id := id
      g.Go(func() error {
          return processItem(ctx, id)
      })
  }
  if err := g.Wait(); err != nil {
      return fmt.Errorf("batch processing failed: %w", err)
  }
  ```

## 2. Channel Ownership & Leak Prevention
- **The Sender Closes the Channel**: Only the producer goroutine should close a channel (`close(ch)`), never a consumer.
- **Select on `ctx.Done()`**: Whenever sending to or receiving from a channel that may block, include `case <-ctx.Done(): return ctx.Err()` inside a `select` block so goroutines never hang indefinitely if downstream stops reading.

## 3. Memory Allocations & `pprof` Diagnostics
- **Preallocate Slices & Maps**: When the upper bound is known, initialize with capacity (`make([]Order, 0, len(rows))`) to avoid repeated backing-array reallocations.
- **Struct Field Alignment & Pointers**: Pass small structs by value to keep them on the stack (avoiding heap escape and GC pressure); pass large structs or mutated receivers by pointer.
- **Profiling & Race Detection**:
  - Run tests with `go test -race ./...` in CI.
  - Benchmark hot paths with `go test -bench=. -benchmem` and inspect allocations via `go tool pprof`.
