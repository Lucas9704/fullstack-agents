# Vite.js & SPA Architecture Reference

## 1. Project Structure & Environment Variables
- **Type-Safe Environment Variables**: Define `ImportMetaEnv` inside `src/vite-env.d.ts` and validate `import.meta.env.VITE_*` variables at startup using a `zod` schema (`src/config/env.ts`) so missing variables fail fast during boot.
- **Secret Safety**: Never place private API keys in `VITE_*` variables—anything prefixed with `VITE_` is statically embedded into the public client bundle.
- **Path Aliases**: Configure `@/*` pointing to `./src/*` in both `tsconfig.json` (`paths`) and `vite.config.ts` (`resolve.alias` or `vite-tsconfig-paths`).

## 2. Routing & Code Splitting
- **Route-Level Lazy Loading**: Split route bundles using `React.lazy()` + `<Suspense>` or TanStack Router / React Router lazy route loaders so initial bundle size stays minimal.
- **Route Prefetching**: Prefetch route chunks and TanStack Query data on link hover/focus (`preload="intent"`) for instant navigation.

## 3. Build Optimization (`vite.config.ts`)
- **Manual Chunking Strategy**: Group heavy, stable vendor libraries (e.g., charting libraries, rich-text editors) via `build.rollupOptions.output.manualChunks` so feature deployments do not invalidate cached vendor bundles.
- **Barrel File Hygiene**: Avoid deep barrel files (`index.ts` re-exporting hundreds of modules) that defeat tree-shaking and slow down Vite HMR startup.
- **Dev Server Proxy**: Use `server.proxy` in `vite.config.ts` during local development to forward `/api` calls cleanly without CORS workarounds.
