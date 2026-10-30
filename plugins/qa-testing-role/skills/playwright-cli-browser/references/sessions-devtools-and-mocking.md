# `playwright-cli` Sessions, DevTools, Auth State & Network Mocking Reference

## 1. Headed Mode, Browser Engines & Mobile Emulation
Launch `playwright-cli open` with visual and device flags when validating UI across engines and viewports:

```bash
# Launch visible Chromium/Chrome window (recommended for Frontend live verification)
playwright-cli open http://localhost:3000 --headed

# Test specific browser engines in headed mode
playwright-cli open http://localhost:3000 --headed --browser=chrome
playwright-cli open http://localhost:3000 --headed --browser=firefox
playwright-cli open http://localhost:3000 --headed --browser=webkit

# Emulate mobile devices in a visible window
playwright-cli open http://localhost:3000 --headed --mobile
playwright-cli open http://localhost:3000 --headed --device="iPhone 15"
```

## 2. Multi-Session Isolation (`-s` / `PLAYWRIGHT_CLI_SESSION`)
Run concurrent, completely isolated browser sessions (separate cookies, `localStorage`, and tabs) to test multi-role interactions (e.g., `admin` vs `buyer`, or real-time chat/Supabase Realtime):

```bash
# Session 1: Admin user
PLAYWRIGHT_CLI_SESSION=admin playwright-cli open http://localhost:3000/admin --headed

# Session 2: Standard user
PLAYWRIGHT_CLI_SESSION=buyer playwright-cli open http://localhost:3000/shop --headed
```

## 3. Auth State Persistence (`state-save` / `state-load` / `--persistent`)
Avoid repeating login flows across sessions:

```bash
# Save cookies and localStorage after logging in
playwright-cli state-save .playwright-cli/auth-admin.json

# Restore authenticated state into a new session
playwright-cli state-load .playwright-cli/auth-admin.json
playwright-cli goto http://localhost:3000/dashboard

# Or launch with a persistent disk profile
playwright-cli open http://localhost:3000 --headed --persistent
```

## 4. Network Interception, Tracing & Video Recording
- **Network Mocking (`route` / `route-list` / `unroute`)**:
  Intercept API calls on the fly to test loading, error, or empty UI states without modifying backend code:
  ```bash
  playwright-cli route "**/api/orders" --status=500 --body='{"error":"Service Unavailable"}'
  playwright-cli route-list
  playwright-cli unroute "**/api/orders"
  ```
- **Execution Tracing (`tracing-start` / `tracing-stop`)**:
  Record full Playwright traces (DOM snapshots, network waterfall, console logs) around a bug reproduction:
  ```bash
  playwright-cli tracing-start
  playwright-cli click e10
  playwright-cli tracing-stop
  ```
- **Video Capture (`video-start` / `video-stop`)** & **Tabs (`tab-list`, `tab-new`, `tab-select`, `tab-close`)**:
  Record browser interaction videos or switch between popup/OAuth tabs deterministically.
