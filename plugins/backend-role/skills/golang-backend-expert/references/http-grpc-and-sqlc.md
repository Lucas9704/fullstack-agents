# Go HTTP/gRPC Servers & `pgx` + `sqlc` Reference

## 1. Go 1.22+ `http.ServeMux` & Chi/Echo Routing
- **Method + Path Wildcards in Standard Library**: Go 1.22+ `http.NewServeMux()` supports method prefixes and path parameters natively (`mux.HandleFunc("GET /v1/orders/{id}", handler)` and `r.PathValue("id")`).
- **Hardened `http.Server` Timeouts**: Never start `http.ListenAndServe` with default zero timeouts. Always configure explicit limits:
  ```go
  srv := &http.Server{
      Addr:              cfg.HTTPAddr,
      Handler:           handler,
      ReadHeaderTimeout: 5 * time.Second,
      ReadTimeout:       10 * time.Second,
      WriteTimeout:      15 * time.Second,
      IdleTimeout:       60 * time.Second,
      MaxHeaderBytes:    1 << 20, // 1 MB
  }
  ```
- **Request Body Size Cap**: Wrap `r.Body = http.MaxBytesReader(w, r.Body, maxBytes)` before `json.NewDecoder(r.Body).Decode(&req)` to prevent memory exhaustion attacks.

## 2. Type-Safe Postgres with `pgx/v5` + `sqlc`
- Configure `sqlc.yaml` with `sql_package: "pgx/v5"` and `emit_pointers_for_null_types: true`.
- **Clean Transaction Helper (`WithTx`)**: Encapsulate `pgx.Tx` begin/commit/rollback so application services remain clean and rollback is guaranteed on error or panic:
  ```go
  func (s *Store) ExecTx(ctx context.Context, fn func(*db.Queries) error) error {
      tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
      if err != nil {
          return fmt.Errorf("begin tx: %w", err)
      }
      defer func() { _ = tx.Rollback(ctx) }()

      q := db.New(tx)
      if err := fn(q); err != nil {
          return err
      }
      if err := tx.Commit(ctx); err != nil {
          return fmt.Errorf("commit tx: %w", err)
      }
      return nil
  }
  ```

## 3. gRPC Interceptors & Deadlines
- Enforce unary/stream server interceptors for panic recovery (`grpc_recovery`), structured logging/tracing (`otelgrpc`), and per-method deadline enforcement.
- Map domain errors to canonical `google.golang.org/grpc/codes` (`codes.NotFound`, `codes.InvalidArgument`, `codes.PermissionDenied`, `codes.AlreadyExists`) rather than returning generic `codes.Unknown`.
