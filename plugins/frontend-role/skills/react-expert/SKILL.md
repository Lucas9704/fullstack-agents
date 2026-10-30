---
name: react-expert
description: >-
  Use this skill when building, refactoring, or reviewing React applications (including Next.js, Remix, or Vite + React). Covers component design, hooks, state management, TypeScript patterns, and rendering performance.
---

# React Expert Skill

Follow these guidelines when developing or auditing **React** applications:

## 1. Component Design & State Management
- **Small, single-responsibility components**: Extract subcomponents or custom hooks when a component grows too complex.
- **Derived state over synced state**: Avoid using `useEffect` to synchronize state that can be computed directly during render.
- **State colocation**: Keep state as close as possible to where it is used; lift state only when needed, or use scoped context/selectors to prevent unnecessary re-renders.

## 2. Hooks & Effects Hygiene
- Use `useEffect` strictly for synchronizing with external systems (manual DOM APIs, subscriptions, timers).
- Always clean up subscriptions, event listeners, and `AbortController` instances in the effect cleanup function.
- Avoid premature `useMemo` / `useCallback` on trivial primitives, but use them intentionally when stabilizing references passed to contexts or expensive child trees.

## 3. TypeScript & Accessibility
- Define explicit `props` types/interfaces; avoid `any` and prefer discriminated unions for complex state (`idle | loading | success | error`).
- Always use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<dialog>`) instead of interactive `<div>` or `<span>` elements.

## 4. Verification
1. Run the project's type checker (`tsc --noEmit` or equivalent).
2. Run the linter (`npm run lint`) and relevant component/unit tests.
