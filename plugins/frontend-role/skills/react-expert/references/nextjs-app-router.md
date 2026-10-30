# Next.js App Router Reference

## 1. Server vs. Client Components Boundary
- **Server Components by Default**: Keep pages, layouts, and data-fetching containers as React Server Components (RSC) to ship zero bundle weight for static/data-driven trees.
- **Push `'use client'` Down the Tree**: Place `'use client'` only on leaf interactive components that require state (`useState`, `useReducer`), effects (`useEffect`), browser APIs, or event listeners.
- **Composition Pattern (Slot Passing)**: Never turn a large container into a Client Component just to wrap children in a client provider or animated wrapper. Pass Server Components as `children` (or named slots) into Client Components.
- **Serialization Boundary**: Props passed from Server Components to Client Components must be serializable (no functions, classes, or raw Dates unless serialized).

## 2. Data Fetching, Streaming & Caching
- **Parallel Data Fetching**: Initiate independent promises concurrently and await them via `Promise.all()` (or separate `<Suspense>` boundaries) to prevent request waterfalls.
- **Granular `<Suspense>` Boundaries**: Wrap slow data subtrees in `<Suspense fallback={<Skeleton />}>` or provide route-level `loading.tsx` so the shell renders immediately.
- **Explicit Caching (Next.js 15+)**: `fetch` requests and Route Handlers are uncached by default in Next.js 15+. Opt into caching deliberately using `use cache` / `unstable_cache`, `revalidateTag()`, or `revalidatePath()`.

## 3. Server Actions & Mutations
- **Validation & Authorization First**: Every `'use server'` function is a public HTTP endpoint. Always verify user session/permissions and validate `FormData` or arguments with `zod` before mutating data.
- **Structured Return Values**: Return typed result objects (`{ success: boolean, errors?: Record<string, string[]>, data?: T }`) for expected validation failures instead of throwing unhandled exceptions, reserving `error.tsx` boundaries for unexpected crashes.
- **Revalidation**: Call `revalidatePath()` or `revalidateTag()` after mutations to keep Server Components synchronized.
