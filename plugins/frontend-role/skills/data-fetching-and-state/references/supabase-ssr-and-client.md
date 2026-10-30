# Supabase SSR (`@supabase/ssr`) & Typed Client Integration Reference

## 1. Strict `@supabase/ssr` Rules (Official Supabase AI Guidelines)
- **Always use `@supabase/ssr` and `@supabase/supabase-js`**: Never install or import deprecated `@supabase/auth-helpers-*` packages.
- **Only Use `getAll` and `setAll` for Cookies**: When initializing `createServerClient`, **never** implement individual `get`, `set`, or `remove` methods—always use `cookies: { getAll(), setAll(cookiesToSet) }`.
- **Use Publishable Keys**: Pass the publishable key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or legacy `ANON_KEY`) to browser and SSR clients so Row Level Security (RLS) remains active.

## 2. Server-Side Auth Verification (`getClaims()` / `getUser()`)
- **Never trust `supabase.auth.getSession()` in Server Components, Server Actions, or Middleware** to protect routes—`getSession()` does not re-verify the token authenticity.
- Always call **`await supabase.auth.getClaims()`** (fast JWKS verification) or **`await supabase.auth.getUser()`** on the server to validate the user session and refresh tokens via middleware/proxy.

### Next.js App Router Server Client Pattern
```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from a Server Component; middleware refreshes sessions.
          }
        },
      },
    }
  );
}
```

## 3. End-to-End Type Safety & TanStack Query Integration
- Always pass the generated `Database` type (`supabase gen types typescript`) to `createBrowserClient<Database>` and `createServerClient<Database>`.
- Extract table and helper types using `Tables<'todos'>`, `TablesInsert<'todos'>`, and `TablesUpdate<'todos'>`.
- When wrapping Supabase calls inside TanStack Query `queryFn`, always throw `error` (`const { data, error } = await supabase.from('todos').select('*'); if (error) throw error; return data;`) because `supabase-js` returns `{ data, error }` instead of rejecting the Promise by default!
