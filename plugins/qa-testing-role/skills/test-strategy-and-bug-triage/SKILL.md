---
name: test-strategy-and-bug-triage
description: >-
  Use this skill when designing a test plan, balancing the Testing Trophy (static, unit, integration, E2E), creating deterministic test data factories/builders, triaging and reproducing bugs via TDD regression tests, or running automated QA stack and test-suite audits.
---

# Test Strategy, Data Factories & Bug Triage Skill

Follow these guidelines when planning test coverage or investigating defects:

## 1. The Testing Trophy & ROI Allocation
Allocate testing effort where confidence per maintenance cost is highest:
1. **Static Analysis (100% of code)**: Strict TypeScript/`mypy`/`clippy`/`go vet` + linting catches type and contract mismatches instantly.
2. **Unit Tests (Pure Domain & Complex Algorithms)**: Fast, isolated tests (`Vitest`, `Pytest`, `cargo test`, `go test`) for business rules, calculators, validators, and state reducers with high cyclomatic complexity.
3. **Integration / Component Tests (The Bulk of Confidence)**: Multi-component UI interactions (Testing Library + MSW) and API + real DB integration tests (`Testcontainers`).
4. **End-to-End Tests (`Playwright`)**: Focused exclusively on critical user journeys (Auth, Checkout/Billing, Core CRUD workflows)—never duplicate every form validation permutation in slow E2E browser tests.

## 2. Deterministic Test Data Factories
- Build composable factory functions (`createMockUser(overrides?: Partial<User>)` or `@faker-js/faker` with a fixed `faker.seed(12345)`) providing sensible defaults so each test only specifies the exact properties relevant to its assertion.
- Avoid shared mutable test fixtures that cause order-dependent test failures when run with `--sequence.shuffle`.

## 3. TDD Bug Triage & Regression Protocol
When fixing any reported bug:
1. **Reproduce First**: Write an automated test that reproduces the exact failure and verify that it fails for the expected reason.
2. **Minimal Fix**: Apply the root-cause fix in production code.
3. **Verify Green & No Regressions**: Confirm the new regression test passes alongside the full module test suite.

## 4. Executable Helper Scripts (`scripts/`)
- **Detect QA Stack, Non-Interactive Test Commands & Recommended Skills**:
  [scripts/detect-qa-stack.mjs](./scripts/detect-qa-stack.mjs)
  Run: `node <skill_dir>/scripts/detect-qa-stack.mjs <project_root>`
- **Static Test Suite Anti-Pattern & Flakiness Auditor**:
  [scripts/audit-test-suite.mjs](./scripts/audit-test-suite.mjs)
  Run: `node <skill_dir>/scripts/audit-test-suite.mjs <target_dir_or_file>`
