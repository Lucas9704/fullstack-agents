---
name: web-accessibility-and-perf
description: >-
  Use this skill when auditing or optimizing web accessibility (WCAG 2.1 AA, ARIA patterns, keyboard navigation, focus management), Core Web Vitals performance (LCP, INP, CLS, list/table virtualization, bundle size), or running automated frontend stack and code audits.
---

# Web Accessibility (a11y) & Performance Skill

Follow these guidelines to ensure every UI meets **WCAG 2.1 Level AA** accessibility standards and **Core Web Vitals** targets:

## 1. Accessibility (WCAG 2.1 AA)
- **First Rule of ARIA**: Use native semantic HTML elements (`<button>`, `<a>`, `<input>`, `<dialog>`, `<details>`) whenever possible before reaching for custom ARIA attributes.
- **Keyboard Navigation & Focus**:
  - Every interactive element must be reachable and operable via keyboard alone (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, arrow keys for composite widgets).
  - Never remove focus outlines (`outline: none`) without providing a high-contrast `:focus-visible` indicator.
  - Trap focus inside active modals/drawers and restore focus to the trigger element when closed.
- **Color & Contrast**: Maintain at least `4.5:1` contrast ratio for normal text and `3:1` for large text and interactive UI boundaries; never convey status using color alone (pair with icons or text).

## 2. Core Web Vitals & Runtime Performance
- **LCP (Largest Contentful Paint < 2.5s)**:
  - Prioritize the hero image or primary heading with `fetchpriority="high"` and `loading="eager"` (never lazy-load the LCP image).
  - Avoid client-side waterfalled requests before rendering primary content.
- **CLS (Cumulative Layout Shift < 0.1)**:
  - Always declare explicit `width` and `height` (or `aspect-ratio`) on images, videos, embeds, and skeleton loaders.
  - Reserve space for dynamic banners, toasts, or async slots.
- **INP (Interaction to Next Paint < 200ms)**:
  - Keep event handlers fast; yield or defer non-urgent state updates (`startTransition`, `requestIdleCallback`, or web workers) and virtualize large lists/tables (`> 100` complex rows) using `@tanstack/react-virtual` (see [tanstack-table-and-virtualization.md](../data-fetching-and-state/references/tanstack-table-and-virtualization.md)).

## 3. Executable Helper Scripts (`scripts/`)
- **Detect Frontend Stack & Recommended Skills**:
  [scripts/detect-frontend-stack.mjs](./scripts/detect-frontend-stack.mjs)
  Run: `node <skill_dir>/scripts/detect-frontend-stack.mjs <project_root>`
- **Static Accessibility & Anti-Pattern Audit**:
  [scripts/audit-frontend-code.mjs](./scripts/audit-frontend-code.mjs)
  Run: `node <skill_dir>/scripts/audit-frontend-code.mjs <target_dir_or_file>`
