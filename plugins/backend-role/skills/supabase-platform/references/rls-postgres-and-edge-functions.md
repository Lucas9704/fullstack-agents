# Supabase RLS, Postgres Functions, Declarative Schemas & Edge Functions Reference

## 1. High-Performance RLS Policy Templates
Always separate `select`, `insert`, `update`, and `delete` policies, specify `to authenticated` / `to anon`, wrap `auth.uid()` in `(select auth.uid())`, and index policy columns:

```sql
create table public.documents (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.organizations (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create index documents_owner_id_idx on public.documents using btree (owner_id);
create index documents_organization_id_idx on public.documents using btree (organization_id);

alter table public.documents enable row level security;

create policy "Users can view their own documents"
on public.documents
for select
to authenticated
using ( (select auth.uid()) = owner_id );

create policy "Users can create their own documents"
on public.documents
for insert
to authenticated
with check ( (select auth.uid()) = owner_id );

create policy "Users can update their own documents"
on public.documents
for update
to authenticated
using ( (select auth.uid()) = owner_id )
with check ( (select auth.uid()) = owner_id );

create policy "Users can delete their own documents"
on public.documents
for delete
to authenticated
using ( (select auth.uid()) = owner_id );
```

## 2. Secure Postgres Functions (`set search_path = ''`)
Always lock `search_path = ''` and fully qualify all objects. Prefer `security invoker` unless a controlled RLS helper requires `security definer`:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;
```

## 3. Declarative Schemas Workflow (`supabase/schemas/`)
1. Declare SQL entities inside `supabase/schemas/*.sql` in dependency order (configured in `supabase/config.toml` under `[db.migrations] schema_paths`).
2. Stop local database (`supabase stop`), diff declarative schemas to generate a migration (`supabase db diff -f add_documents_table`), and review the generated SQL file under `supabase/migrations/` before applying (`supabase start` / `supabase migration up`).
3. Regenerate TypeScript types after every schema change:
   `npx supabase gen types typescript --local > src/types/database.types.ts`

## 4. Modern Supabase Edge Functions (`Deno.serve`)
- Use `Deno.serve` natively, `npm:` / `jsr:` specifiers, and forward the caller's `Authorization` header so RLS is enforced on behalf of the user:

```ts
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return Response.json({ error: 'Missing Authorization header' }, { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  return Response.json({ userId: claimsData.claims.sub }, { headers: corsHeaders });
});
```
