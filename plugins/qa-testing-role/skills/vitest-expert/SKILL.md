---
name: vitest-expert
description: >-
  Use this skill when configuring, writing, debugging, or optimizing tests with Vitest (unit, integration, component testing with Testing Library or Vitest Browser Mode, vi.* mocking, fake timers, type testing with expectTypeOf, and MSW v2).
---

# Vitest Expert Skill

Follow these guidelines when configuring or authoring tests with **Vitest**:

## 1. Mocking, Spying & Module Hoisting (`vi.*`)
- **Reset State Automatically**: Enable `clearMocks: true`, `restoreMocks: true`, and `unstubEnvs: true` (or `unstubGlobals: true`) in `vitest.config.ts` so mocks never leak state across tests.
- **`vi.mock()` & `vi.hoisted()`**: Remember that `vi.mock('module')` calls are hoisted to the top of the file before imports. When referencing variables inside a `vi.mock` factory, declare them inside `const mocks = vi.hoisted(() => ({ ... }))`.
- **Partial Module Mocks**: Use `const actual = await vi.importActual<typeof import('./mod')>('./mod')` when you only need to override a single exported function while keeping the rest of the module real.
- **Prefer `vi.spyOn` over Full Module Mocks**: Spy on specific methods (`vi.spyOn(service, 'sendEmail').mockResolvedValue(...)`) whenever possible to preserve type safety and real module loading.

## 2. Async Timers, Environment & Type Testing
- **Async Fake Timers**: Use `vi.useFakeTimers()` paired with `await vi.advanceTimersByTimeAsync(ms)` or `await vi.runAllTimersAsync()` so queued microtasks and promises resolve deterministically alongside timer ticks.
- **Environment & Globals**: Use `vi.stubEnv('API_URL', 'https://test.local')` instead of mutating `process.env` directly.
- **Compile-Time Type Assertions**: Use `expectTypeOf()` and `assertType()` in `*.test-d.ts` (or standard `.test.ts` files with `typecheck.enabled: true`) to test generic utility types, Zod schemas, and SDK return types.

## 3. Component Testing & Vitest Performance
- **User-Centric Interactions**: Pair `@testing-library/react` (or `@vitest/browser` with Playwright provider) with `userEvent.setup()` (`@testing-library/user-event`) rather than `fireEvent` so real pointer/keyboard event sequences run.
- **Execution Speed**: Prefer `pool: 'forks'` or `pool: 'threads'` with `projects` (Vitest Workspaces) to separate fast Node unit tests from DOM/Browser component tests, and avoid importing heavy barrel files in test setup files.

## 4. On-Demand Deep-Dive References
- **Vitest Workspaces, `vi.hoisted`, MSW v2 Setup & `@vitest/browser`**: [references/vitest-browser-mocking-and-msw.md](./references/vitest-browser-mocking-and-msw.md)

## 5. Verification
1. Run `npx vitest run <path-to-spec>` (always pass `run` in non-interactive CLI/agent execution so Vitest does not hang in watch mode!).
