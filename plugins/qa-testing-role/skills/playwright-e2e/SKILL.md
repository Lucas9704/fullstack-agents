---
name: playwright-e2e
description: >-
  Use this skill when writing, debugging, or maintaining End-to-End (E2E) tests with Playwright. Covers resilient locators, web-first assertions, page object patterns, and eliminating flaky tests.
---

# Playwright E2E Testing Skill

## 1. Resilient User-Facing Locators
- Prioritize semantic and accessibility-driven locators: `page.getByRole()`, `page.getByLabel()`, `page.getByText()`, or `page.getByTestId()` as an explicit fallback.
- Avoid brittle selectors tied to styling CSS classes or deep DOM hierarchies.

## 2. Zero Flakiness & Web-First Assertions
- **Never use `page.waitForTimeout()`**: Use auto-retrying web-first assertions (`await expect(locator).toBeVisible()`, `toHaveURL()`) or explicit network/event waits.
- Isolate state between tests using a fresh `BrowserContext` per test and seed state via API/fixtures rather than repeating slow UI flows.

## 3. Verification
1. Run the newly created or modified spec with `npx playwright test <file>` and confirm consistent passes.
