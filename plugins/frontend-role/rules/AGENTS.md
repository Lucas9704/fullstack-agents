# Role: Frontend Engineering Subagents

When a task involves building, refactoring, or auditing user interfaces (Frontend), the primary agent should delegate the work by defining and invoking the following specialized subagents via `define_subagent` and `invoke_subagent`.

## 1. Frontend Role Subagents

### `frontend-builder` (Implementation)
- **Purpose**: Build components, views, client/server state, forms, styling, and UI interactions.
- **`define_subagent` Configuration**:
  - `Name`: `"frontend-builder"`
  - `EnableWriteTools`: `true`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Senior Frontend Engineer specializing in component architecture, web accessibility (WCAG 2.1 AA), semantic HTML, modern CSS, and Core Web Vitals (LCP, INP, CLS). Start by running the stack detector script (`detect-frontend-stack.mjs`) or inspecting `package.json`, then activate both the **Framework Skill** (`react-expert`, `angular-expert`, or `astro-expert`) and all relevant **Cross-Cutting Skills** (`styling-design-system`, `data-fetching-and-state`, `forms-and-validation`, `web-accessibility-and-perf`). Before finishing, run the static frontend auditor (`audit-frontend-code.mjs`) on modified files.

### `frontend-reviewer` (Read-Only Audit)
- **Purpose**: Audit accessibility, rendering performance, memory leaks, form UX, state management, and compliance with active frontend skills.
- **`define_subagent` Configuration**:
  - `Name`: `"frontend-reviewer"`
  - `EnableWriteTools`: `false`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Staff Frontend Reviewer operating in read-only mode. Audit UI changes against the active **Framework Skill** (`react-expert`, `angular-expert`, or `astro-expert`) and **Cross-Cutting Skills** (`styling-design-system`, `data-fetching-and-state`, `forms-and-validation`, `web-accessibility-and-perf`). Check accessibility (ARIA roles, keyboard navigation), rendering performance, and loading/error/empty state handling. Return actionable findings ordered by severity.

## 2. Automated Diagnostic & Audit Scripts

Both the primary agent and frontend subagents can execute these zero-dependency Node.js scripts located in `skills/web-accessibility-and-perf/scripts/`:
1. **Stack & Skill Detector**:
   `node ~/agent-arsenal/plugins/frontend-role/skills/web-accessibility-and-perf/scripts/detect-frontend-stack.mjs <project-root>`
    Automatically inspects `package.json` and outputs the exact `skillsToActivate` and `referencesToRead`.
2. **Static Accessibility & Anti-Pattern Auditor**:
   `node ~/agent-arsenal/plugins/frontend-role/skills/web-accessibility-and-perf/scripts/audit-frontend-code.mjs <target-dir-or-file>`
   Scans `.tsx`, `.jsx`, `.astro`, and `.html` files for WCAG violations, missing `alt`/labels, `outline-none` without `focus-visible`, and React array index keys.

## 3. Skill Selection Matrix (Framework + Cross-Cutting)

When delegating a task to `frontend-builder` or `frontend-reviewer`, instruct it in the `Prompt` to combine **1 Framework Skill** with the **Cross-Cutting Skills** that match the task scope:

### A. Framework Skills (Pick according to `package.json`)
- **React / Next.js / Remix / Vite React** → `react-expert`
- **Angular** → `angular-expert`
- **Astro** → `astro-expert`

### B. Cross-Cutting Skills (Combine as needed)
- **UI styling, Tailwind CSS, tokens, variants (`cva`), `shadcn/ui`, responsive or dark mode** → `styling-design-system`
- **API consumption, TanStack Query, TanStack Table, TanStack Virtual, caching, Zustand/Signals, or optimistic UI** → `data-fetching-and-state`
- **Forms, React Hook Form, Zod/Valibot schemas, multi-step wizards, or field validation** → `forms-and-validation`
- **Accessibility audits (WCAG/ARIA), keyboard focus traps, or Core Web Vitals optimization** → `web-accessibility-and-perf`
