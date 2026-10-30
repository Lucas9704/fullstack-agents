# Testcontainers & Supabase `pgTAP` RLS Testing Reference

## 1. Ephemeral Database Testing with `Testcontainers`
Spin up a real PostgreSQL container once per test suite (`beforeAll`), apply migrations, and isolate individual tests with transactions or fast table truncation:

```ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16-alpine').start();
  process.env.DATABASE_URL = container.getConnectionUri();
  await runMigrations(process.env.DATABASE_URL);
}, 60_000);

afterAll(async () => {
  await container?.stop();
});
```

## 2. Testing Supabase RLS Policies with `pgTAP` (`supabase test db`)
Supabase CLI natively runs `pgTAP` SQL tests located in `supabase/tests/database/*.test.sql` via `supabase test db`. Every test file runs inside a `begin;` ... `rollback;` transaction:

```sql
begin;
select plan(3);

-- 1. Verify RLS is enabled on public.documents
select tests.rls_enabled('public', 'documents');

-- 2. Seed two users (User A and User B) and a document owned by User A
select tests.create_supabase_user('user_a', 'a@example.com');
select tests.create_supabase_user('user_b', 'b@example.com');

select tests.authenticate_as('user_a');
insert into public.documents (owner_id, title)
values (tests.get_supabase_uid('user_a'), 'Private Spec');

-- 3. Authenticate as User B and assert User B cannot read or delete User A's document
select tests.authenticate_as('user_b');
select is_empty(
  $$ select * from public.documents where title = 'Private Spec' $$,
  'User B cannot read User A private document'
);

select * from finish();
rollback;
```
