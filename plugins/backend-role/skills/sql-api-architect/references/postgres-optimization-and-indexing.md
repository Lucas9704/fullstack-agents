# PostgreSQL Optimization, Indexing & Concurrency Reference

## 1. Indexing Strategy (`B-Tree`, `GIN`, `Partial`, `Covering`)
- **Composite B-Tree Column Order**: Place equality predicates (`WHERE tenant_id = $1 AND status = $2`) first, followed by range or sort columns (`AND created_at >= $3 ORDER BY created_at DESC`).
- **Partial Indexes**: Index only the subset of rows frequently queried (e.g., `CREATE INDEX orders_pending_idx ON public.orders (created_at) WHERE status = 'pending';`) to shrink index size and speed up writes.
- **GIN Indexes**: Use `GIN` indexes (`jsonb_path_ops`) for `@>` containment queries on `jsonb` columns, array columns, or full-text `tsvector` search.
- **Covering Indexes (`INCLUDE`)**: Add non-filtered payload columns via `INCLUDE (total_cents, currency)` on hot read queries to achieve **Index-Only Scans**.

## 2. Keyset (Cursor) Pagination over `OFFSET`
- Avoid `OFFSET N` on large tables (`> 10,000` rows), as Postgres must still scan and discard all `N` skipped rows.
- Use deterministic **Keyset Pagination** with a tie-breaker primary key:
  ```sql
  select id, title, created_at
  from public.posts
  where (created_at, id) < ($1::timestamptz, $2::bigint)
  order by created_at desc, id desc
  limit 25;
  ```

## 3. Concurrency, Locking & `EXPLAIN (ANALYZE, BUFFERS)`
- **Queue / Worker Row Claiming**: Use `FOR UPDATE SKIP LOCKED` when workers claim pending jobs from a table so concurrent workers never block each other.
- **Prevent Deadlocks**: When updating multiple rows in a transaction, always acquire locks in a deterministic sorted order (e.g., `ORDER BY id ASC`).
- **Query Verification**: Validate complex queries with `EXPLAIN (ANALYZE, BUFFERS)`, watching for unexpected `Seq Scan` on large tables, high `Rows Removed by Filter`, or external disk sorts.
