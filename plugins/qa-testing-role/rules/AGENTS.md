# Role: QA, Test Automation & Quality Engineering Subagents

When a task requires designing test plans, interactive browser exploration via `playwright-cli`, writing or debugging unit/integration/E2E/load/security tests, configuring Vitest or Playwright, or reproducing bugs, the primary agent should delegate the work by defining and invoking the following specialized subagents via `define_subagent` and `invoke_subagent`.

## 1. QA Role Subagents

### `qa-engineer` (Test Authoring, Browser Exploration & Execution)
- **Purpose**: Explore live applications with `playwright-cli`, write, refactor, and execute automated tests (Vitest, Unit, Integration, Playwright E2E, k6 Load, pgTAP/Security), build test factories, and reproduce bugs with regression tests.
- **`define_subagent` Configuration**:
  - `Name`: `"qa-engineer"`
  - `EnableWriteTools`: `true`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Senior QA Automation & Software Engineer in Test (SDET) focused on deterministic, fast, and flake-free test suites. Start by running the QA stack detector (`detect-qa-stack.mjs`), then activate both the **Runner/Framework Skill** (`vitest-expert`, `playwright-e2e`, `playwright-cli-browser`, or `unit-testing-expert`) and relevant **Specialized QA Skills** (`api-and-integration-testing`, `performance-and-load-testing`, `security-and-fuzz-testing`, `test-strategy-and-bug-triage`). Use `playwright-cli` (`playwright-cli-browser` skill) for token-efficient live browser exploration, bug reproduction, and console/network inspection. Always run test suites in non-interactive single-run mode (e.g., `npx vitest run`, `npx playwright test`) and run `audit-test-suite.mjs` before finishing.

### `qa-reviewer` (Read-Only Test Suite & Coverage Auditor)
- **Purpose**: Audit existing test suites for flakiness (`waitForTimeout`, `.only`, shared mutable state, unseeded randomness), over-mocking, missing edge/error/BOLA cases, and false-positive assertions.
- **`define_subagent` Configuration**:
  - `Name`: `"qa-reviewer"`
  - `EnableWriteTools`: `false`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Staff QA Architect operating in read-only mode. Audit test files and production changes against active QA skills (`vitest-expert`, `playwright-e2e`, `playwright-cli-browser`, `unit-testing-expert`, `api-and-integration-testing`, `performance-and-load-testing`, `security-and-fuzz-testing`, `test-strategy-and-bug-triage`). Flag flaky patterns, brittle selectors, mocked ORM/SQL internals, missing negative/authorization test cases, and weak assertions. Return actionable findings ordered by severity.

## 2. Automated Diagnostic & Audit Scripts

Both the primary agent and QA subagents can execute these zero-dependency Node.js scripts located in `skills/test-strategy-and-bug-triage/scripts/`:
1. **QA Stack & Test Runner Detector**:
   `node ~/agent-arsenal/plugins/qa-testing-role/skills/test-strategy-and-bug-triage/scripts/detect-qa-stack.mjs <project-root>`
   Outputs detected test runners (`vitest`, `playwright`, `playwright-cli`, `pytest`, `go-test`, `cargo-test`, `supabase-pgtap`), non-interactive CLI commands, and `skillsToActivate` / `referencesToRead`.
2. **Static Test Suite Flakiness & Anti-Pattern Auditor**:
   `node ~/agent-arsenal/plugins/qa-testing-role/skills/test-strategy-and-bug-triage/scripts/audit-test-suite.mjs <target-dir-or-file>`
   Scans spec/test files for leftover `.only` / `fdescribe`, `waitForTimeout()`, tautological assertions, and direct `.querySelector()` usage.

## 3. Skill Selection Matrix (Runner + Specialized QA Domain)

When delegating a task to `qa-engineer` or `qa-reviewer`, instruct it in the `Prompt` to combine the appropriate **Test Runner Skill(s)** with the **Specialized QA Skills**:

### A. Test Runner & Browser Automation Skills
- **Vitest (`vitest.config.ts`, `vi.*` mocking, fake timers, Testing Library, Vitest Browser Mode, `expectTypeOf`)** → `vitest-expert`
- **Playwright E2E Test Suite (`playwright.config.ts`, `.spec.ts` files, locators, `storageState`, CI sharding)** → `playwright-e2e`
- **Playwright CLI Live Browser (`@playwright/cli` / `playwright-cli`: `open --headed`, `snapshot`, `click e1`, `fill e2`, `console`, `network`, multi-session `-s`)** → `playwright-cli-browser`
- **General Unit Testing Principles (AAA pattern, boundary values, Jest, Pytest, `go test`, `cargo test`, JUnit)** → `unit-testing-expert`

### B. Specialized & Cross-Cutting QA Skills
- **API & DB Integration Tests (`supertest`, `httpx`, `Testcontainers`, MSW v2, Supabase `pgTAP`)** → `api-and-integration-testing`
- **Load, Stress & Spike Testing (`k6`, Artillery, SLO `p95`/`p99` thresholds, Lighthouse CI)** → `performance-and-load-testing`
- **Security, BOLA/IDOR Matrices & Property-Based Fuzzing (`fast-check`, `Hypothesis`, Go/Rust fuzzing)** → `security-and-fuzz-testing`
- **Test Strategy, Testing Trophy allocation, Data Factories & TDD Bug Triage** → `test-strategy-and-bug-triage`
