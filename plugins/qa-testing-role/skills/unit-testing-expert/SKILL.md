---
name: unit-testing-expert
description: >-
  Use this skill when writing or refactoring unit and component tests across languages (Vitest, Jest, Testing Library, Pytest, Go table-driven tests, Rust cargo test). Covers AAA pattern, mocking boundaries, edge-case coverage, and deterministic execution.
---

# Unit & Integration Testing Expert Skill

## 1. Structure & Clarity (AAA Pattern)
- Structure every test into three clear sections: **Arrange** (setup), **Act** (execution of the unit under test), and **Assert** (verification of the outcome).
- Name tests descriptively to state both the scenario and expected behavior (e.g., `should reject order when inventory is insufficient`).

## 2. Responsible Mocking
- Mock only external boundaries (third-party APIs, system clock, filesystem, email/queue providers); avoid mocking pure internal collaborators so tests remain resilient to refactoring.
- Always cover the happy path, boundary conditions, and error paths.

## 3. On-Demand Deep-Dive References
- **Testing Library Query Priority (`getByRole`), Pytest Parametrization, Go Table Subtests & Rust Tests**: [references/vitest-rtl-and-msw-v2.md](./references/vitest-rtl-and-msw-v2.md)
