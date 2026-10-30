---
name: unit-testing-expert
description: >-
  Use this skill when writing or refactoring unit and integration tests (Vitest, Jest, Pytest, Testing Library). Covers AAA pattern, mocking boundaries, edge-case coverage, and deterministic execution.
---

# Unit & Integration Testing Expert Skill

## 1. Structure & Clarity (AAA Pattern)
- Structure every test into three clear sections: **Arrange** (setup), **Act** (execution of the unit under test), and **Assert** (verification of the outcome).
- Name tests descriptively to state both the scenario and expected behavior (e.g., `should reject order when inventory is insufficient`).

## 2. Responsible Mocking
- Mock only external boundaries (third-party APIs, system clock, filesystem, email/queue providers); avoid mocking pure internal collaborators so tests remain resilient to refactoring.
- Always cover the happy path, boundary conditions, and error paths.
