---
name: playwright-cli-browser
description: >-
  Use this skill when driving a live browser from the terminal using @playwright/cli (playwright-cli) to verify UI components visually (--headed), inspect accessibility snapshots, reproduce bugs, check browser console/network logs, or explore user flows before writing E2E tests.
---

# Playwright CLI (`@playwright/cli`) Browser Automation Skill

`playwright-cli` (`@playwright/cli`) is Microsoft's token-efficient browser automation CLI for coding agents. Instead of streaming massive accessibility trees into context like MCP, it writes YAML snapshots and screenshots to `.playwright-cli/` on disk and exposes short element references (`e1`, `e2`, `e15`).

## 1. Core Agent Loop: `open` → `snapshot` → `act` (`ref`)
1. **Launch Browser**:
   - **Frontend Visual Mode (`--headed`)**: When verifying or debugging UI changes in **Frontend** workflows, launch a visible browser window with `--headed` so the user can see the live interactions:
     ```bash
     playwright-cli open http://localhost:3000 --headed
     ```
   - **Headless Mode (Default for background QA checks)**:
     ```bash
     playwright-cli open http://localhost:3000
     ```
2. **Capture Snapshot & Element References**:
   ```bash
   playwright-cli snapshot
   ```
   Inspect the generated `.playwright-cli/page-*.yml` snapshot (or use `playwright-cli find "<text>"`) to locate target element references (`e1`, `e5`, `e12`).
3. **Interact Using Element Refs**:
   - `playwright-cli click e12` — Click element `e12`.
   - `playwright-cli fill e5 "user@example.com" --submit` — Clear, fill input `e5`, and press Enter.
   - `playwright-cli select e8 "admin"` — Select dropdown option.
   - `playwright-cli check e9` / `playwright-cli uncheck e9` — Toggle checkbox.
   - `playwright-cli press Escape` / `playwright-cli hover e14` — Keyboard & pointer actions.
4. **Re-Snapshot After Navigation or DOM Changes**:
   Always run `playwright-cli snapshot` after page navigation or modal openings to obtain fresh element refs.

## 2. Frontend Visual Verification & Runtime Diagnostics
When used by `frontend-builder` or `frontend-reviewer` to validate a UI feature:
1. Open the local dev server in **headed mode**:
   `playwright-cli open http://localhost:5173 --headed` (or `--headed --device="iPhone 15"` to test mobile responsiveness).
2. Check for runtime JavaScript/React/Angular errors in the browser console:
   `playwright-cli console error` (or `playwright-cli console warning`).
3. Check for failed API/asset requests (`4xx` / `5xx` / CORS):
   `playwright-cli network`
4. Capture a visual screenshot when needed:
   `playwright-cli screenshot`
5. Close the browser session cleanly when finished (unless the user asked to keep the window open):
   `playwright-cli close`

## 3. On-Demand Deep-Dive References
- **Multi-User Sessions (`-s`), Auth `state-save`/`state-load`, Network Mocking (`route`), Tracing & Video Capture**: [references/sessions-devtools-and-mocking.md](./references/sessions-devtools-and-mocking.md)
