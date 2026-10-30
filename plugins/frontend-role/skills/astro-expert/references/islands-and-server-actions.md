# Astro Islands, Server Islands & Actions Reference

## 1. Client Islands vs. Server Islands (`server:defer`)
- **Client Islands (`client:*`)**: Hydrate interactive UI components on the browser (`client:load`, `client:idle`, `client:visible`, `client:only`).
- **Server Islands (`server:defer`)**: Render personalized or dynamic server-rendered HTML fragments asynchronously without blocking the cached static page shell:
  ```astro
  <UserProfileBadge server:defer>
    <div slot="fallback" class="h-8 w-24 animate-pulse rounded bg-muted" />
  </UserProfileBadge>
  ```
- **Sharing State Across Islands**: Since islands are isolated component trees, share client state across React/Vue/Svelte islands using lightweight stores (such as `nanostores` or custom DOM/URL events) rather than framework-specific Context Providers.

## 2. Astro Actions (`astro:actions`)
- Define type-safe backend actions in `src/actions/index.ts` using `defineAction({ accept: 'form' | 'json', input: z.object(...), handler: async (input, context) => ... })`.
- Call actions directly from client components or HTML forms with end-to-end TypeScript inference and structured error checking (`isInputError(error)`).

## 3. Content Layer API (Astro 5+) & View Transitions
- **Content Layer Loaders**: Define collections in `src/content.config.ts` using `glob()` or custom async loaders (`loader: async () => ...`) with `zod` schemas for fast, cached build-time data ingestion.
- **View Transitions (`<ClientRouter />`)**: When enabling `<ClientRouter />` from `astro:transitions`, ensure scripts and event listeners re-attach on `astro:page-load` and use `transition:persist` only on stateful elements (like audio/video players) that must survive navigation.
