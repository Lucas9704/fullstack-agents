---
name: data-fetching-and-state
description: >-
  Use this skill when implementing client-side data fetching, server-state caching (TanStack Query), advanced data tables (TanStack Table / shadcn DataTable), data virtualization (TanStack Virtual), global/local state management (Zustand, Signals), or optimistic updates.
---

# Data Fetching, Tables & State Management Skill

Follow these guidelines to separate and manage state, async data, and large datasets predictably across frontend applications:

## 1. State Taxonomy (Never Mix State Categories)
- **Server State** (TanStack Query / SWR / Apollo): Remote asynchronous data that requires caching, deduplication, background refetching, and cache invalidation. Never copy server state into global client stores (`Zustand` / `Redux`).
- **URL State** (Search Params / Router): Filters, pagination, sorting, and active tabs that should be shareable and survive page reloads.
- **Local UI State** (`useState` / `signal`): Ephemeral state scoped to a single component or subtree (e.g., dropdown open state).
- **Global Client State** (`Zustand` / `Signals` / Context): Cross-cutting client-only state (user preferences, multi-step wizard drafts, workspace selection). Always subscribe with granular selectors to avoid unnecessary re-renders.

## 2. TanStack Query & Async Best Practices
- **Structured Query Keys**: Organize query keys hierarchically via key factories (e.g., `['projects', { status, page }]`, `['projects', projectId, 'tasks']`) for predictable invalidation.
- **Mutations & Optimistic UI**: Invalidate affected query keys in `onSuccess` / `onSettled`. For instant feedback on frequent actions, implement optimistic updates in `onMutate` with automatic rollback in `onError`.
- **Request Cancellation**: Forward the `signal` provided by QueryFunctionContext to `fetch` or `axios` so stale in-flight requests abort automatically.

## 3. Complete UI States
- Every data-driven view must explicitly handle all four states:
  1. **Loading**: Skeleton placeholders matching the final layout geometry (avoid layout shifts).
  2. **Error**: Contextual error message with a clear retry action (`refetch()`).
  3. **Empty**: Helpful empty state explaining why there is no data and offering a primary call-to-action.
  4. **Success**: Render validated data cleanly.

## 4. On-Demand Deep-Dive References
- **TanStack Query v5 (`queryOptions`, Key Factories, Optimistic Rollbacks, Infinite Queries)**: [references/tanstack-query-v5-patterns.md](./references/tanstack-query-v5-patterns.md)
- **Advanced Data Tables (`TanStack Table` + `shadcn/ui` DataTable) & Data Virtualization (`TanStack Virtual`)**: [references/tanstack-table-and-virtualization.md](./references/tanstack-table-and-virtualization.md)
