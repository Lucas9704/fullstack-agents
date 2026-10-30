---
name: supabase-platform
description: >-
  Use this skill when building, configuring, or auditing Supabase projects (Postgres schemas, Row Level Security / RLS policies, Supabase Auth, Declarative Schemas, CLI migrations, Storage buckets, Realtime Authorization, and Deno Edge Functions). Based on official Supabase AI Prompts & Agent Skills.
---

# Supabase Platform & Postgres Best Practices Skill

Follow these official Supabase guidelines to avoid deprecated patterns and security vulnerabilities:

## 1. API Keys & Server Auth Verification
- **Publishable vs. Secret Keys**:
  - Use **Publishable Keys (`sb_publishable_...`)** (or legacy `anon` key) in browsers, mobile apps, and user-scoped SSR clients—they are safe to expose only when **Row Level Security (RLS)** is enabled on every exposed table.
  - Use **Secret Keys (`sb_secret_...`)** (or legacy `service_role` key) strictly in trusted backend servers or Edge Functions when bypassing RLS is intentionally required. Never expose secret keys to client bundles (`NEXT_PUBLIC_*` / `VITE_*`).
- **Server-Side Identity Verification**:
  - **Never trust `supabase.auth.getSession()` on the server** to authenticate a user (it reads unverified cookies).
  - Always call **`await supabase.auth.getClaims()`** (fast asymmetric JWKS verification) or **`await supabase.auth.getUser()`** on the server/middleware before authorizing protected actions.

## 2. Official Postgres SQL Style & Schema Conventions
- Write SQL keywords in **lowercase** (`create table`, `select`, `where`), qualify schemas explicitly (`public.projects`), use **plural `snake_case`** for table names, **singular `snake_case`** for columns, and `<singular_table>_id` for foreign keys.
- Prefer `id bigint generated always as identity primary key` (or `uuid default gen_random_uuid() primary key`) and include `created_at timestamptz not null default now()`.
- **Database Functions (`plpgsql` / `sql`)**: Default to **`security invoker`**, explicitly set **`set search_path = ''`** in every function header, and fully qualify all table/function names (`public.profiles`) to prevent `search_path` injection—use `security definer` only when controlled privilege escalation is required.

## 3. Row Level Security (RLS) Golden Rules
- Enable RLS on every table in `public` (`alter table public.<table_name> enable row level security;`).
- **Never use `for all`**: Always define separate policies for `select`, `insert`, `update`, and `delete`, and always specify the target role (`to authenticated` or `to anon`):
  - `select` policies → use **`using (...)`** only.
  - `insert` policies → use **`with check (...)`** only.
  - `update` policies → use both **`using (...)`** and **`with check (...)`**.
  - `delete` policies → use **`using (...)`** only.
- **RLS Performance (`initPlan` Caching & Indexing)**:
  - Always wrap `auth.uid()` and `auth.jwt()` in a scalar `select`: write **`(select auth.uid()) = user_id`** instead of bare `auth.uid() = user_id` so Postgres evaluates the function once per query rather than once per row.
  - Always create B-tree indexes on columns referenced inside RLS policies (`create index on public.posts using btree (user_id);`).

## 4. Declarative Schemas, CLI Migrations & Edge Functions
- **Migrations & Declarative Schemas**: Manage desired schema state in `supabase/schemas/*.sql`, generate timestamped migrations via `supabase db diff -f <name>`, and generate TypeScript types via `supabase gen types typescript --local > src/types/database.types.ts`.
- **Edge Functions (Deno)**:
  - Always use built-in **`Deno.serve(async (req) => ...)`** (never import `serve` from `deno.land/std`).
  - Import dependencies exclusively using **`npm:`** or **`jsr:`** specifiers with explicit versions (`import { createClient } from 'npm:@supabase/supabase-js@2'`).

## 5. On-Demand Deep-Dive References & Cross-Role Links
- **RLS Patterns, `security invoker` Functions, Declarative Schemas & Edge Functions Recipes**: [references/rls-postgres-and-edge-functions.md](./references/rls-postgres-and-edge-functions.md)
- **Self-Hosted Supabase Deployment (`supabase/docker`, Kong, Supavisor, `.env` Key Generation & Reverse Proxy)**: Activate the `supabase-self-hosted` skill in `devops-infra-role` ([`../../devops-infra-role/skills/supabase-self-hosted/SKILL.md`](../../../devops-infra-role/skills/supabase-self-hosted/SKILL.md)).
