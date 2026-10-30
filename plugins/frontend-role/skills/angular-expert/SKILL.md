---
name: angular-expert
description: >-
  Use this skill when building, refactoring, or reviewing Modern Angular (v16–v19+) applications. Covers Standalone Components, Signals, linkedSignal, resource API, RxJS interoperability, Dependency Injection, and ChangeDetectionStrategy.OnPush.
---

# Angular Expert Skill

Follow these guidelines when developing or auditing **Modern Angular** applications:

## 1. Architecture & Components
- **Standalone by default**: Create components, directives, and pipes as `standalone: true` (or implicit standalone in Angular 19+), avoiding `NgModule` unless required for legacy compatibility.
- **Change detection**: Always use `ChangeDetectionStrategy.OnPush` across components.
- **Dependency injection**: Prefer the `inject()` function over constructor parameter injection.

## 2. Reactivity: Signals + RxJS
- Use **Signals** (`signal()`, `computed()`, `linkedSignal()`, `input()`, `output()`, `model()`) for synchronous UI state and component data flow.
- Use **RxJS** for complex asynchronous event streams, composed HTTP requests, and timing operators (`debounceTime`, `switchMap`), bridging to Signals at the view boundary via `toSignal()`.
- Use modern built-in template control flow (`@if`, `@for` with mandatory `track`, `@switch`, `@defer`).

## 3. On-Demand Deep-Dive References
- **Advanced Signals (`input`/`output`, `linkedSignal`, `resource`/`rxResource`, RxJS Interop)**: [references/signals-and-architecture.md](./references/signals-and-architecture.md)

## 4. Verification
1. Run `ng build` or `npx tsc --noEmit` to validate strict templates and types.
2. Execute unit tests for modified components and services.
