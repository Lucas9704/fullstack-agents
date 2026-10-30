---
name: astro-expert
description: >-
  Use this skill when building, refactoring, or reviewing Astro projects. Covers Islands Architecture, Content Collections, zero-JS by default, SSR/SSG hybrids, and client hydration directives.
---

# Astro Expert Skill

Follow these guidelines when developing or auditing **Astro** websites and applications:

## 1. Islands Architecture (Zero-JS by Default)
- **Prioritize `.astro` components**: Handle static markup, layouts, and server-side data fetching (in frontmatter `---`) using native `.astro` components without shipping client-side JavaScript.
- **Selective hydration (Islands)**: When embedding interactive UI framework components (React, Vue, Svelte, Solid), choose the lightest hydration directive possible:
  - `client:visible` for below-the-fold interactive components.
  - `client:idle` for non-critical interactivity.
  - `client:load` strictly for critical above-the-fold interactive elements.

## 2. Content Collections & Performance
- Manage structured content (Markdown, MDX, JSON/YAML) via **Content Collections** (`src/content/config.ts`) validated with `zod` schemas.
- Use the `<Image />` component from `astro:assets` for automatic image optimization and CLS prevention.

## 3. Verification
1. Run `npx astro check` to validate `.astro` and TypeScript types.
2. Run `npm run build` to verify static/SSR output generation without hydration errors.
