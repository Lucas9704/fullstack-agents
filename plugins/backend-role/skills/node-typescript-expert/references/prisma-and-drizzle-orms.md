# Prisma & Drizzle ORM Production Patterns Reference

## 1. Drizzle ORM Best Practices
- **Schema & Relational Queries**: Define explicit foreign keys and database indexes inside `pgTable` definitions (`index('orders_customer_id_idx').on(table.customerId)`).
- **Avoid N+1 with Relational Queries**: Use `db.query.orders.findMany({ with: { items: true } })` (which compiles to a single lateral join query) or explicit `.leftJoin()` instead of querying inside loops.
- **Transactions**: Wrap multi-step writes in `await db.transaction(async (tx) => { ... })` and call `tx.rollback()` or throw a typed domain error to abort atomically.

## 2. Prisma ORM Best Practices
- **Singleton `PrismaClient`**: Instantiate a single `PrismaClient` instance per process (attached to `globalThis` in development to survive hot reloads without exhausting Postgres connections).
- **Select Only Needed Columns**: Use `select` (or `omit`) on large tables to avoid pulling heavy JSONB/text blobs on list endpoints, and use `include` deliberately to prevent N+1 queries.
- **Interactive Transactions with Timeout**: Keep interactive transactions (`prisma.$transaction(async (tx) => { ... }, { maxWait: 2000, timeout: 5000 })`) pure DB work—never call slow external HTTP APIs or send emails inside an open transaction block.

## 3. Connection Pooling (Serverless & Containers)
- When deploying to serverless/edge or high-replica Kubernetes pods, route connections through **PgBouncer / Supavisor** (`?pgbouncer=true&connection_limit=5`) for queries while keeping a `DIRECT_URL` (`:5432`) strictly for CLI migrations.
