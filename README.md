# Agent Arsenal — Antigravity Role Plugins & Skills

Centralized repository of **Role-based Plugins** and **Technology Skills** for [Google Antigravity](https://antigravity.google/docs).

## Architecture: Roles (Subagents) + Skills (Technologies)

Each plugin under `plugins/` represents a **Software Engineering Role** and consists of:
1. **`plugin.json`**: Plugin manifest.
2. **`rules/AGENTS.md`**: Defines the role's subagent catalog (`builder`/`engineer`/`architect` with write access and `reviewer` in read-only mode), their framework-agnostic base `SystemPrompt`, automated diagnostic/audit scripts, and the skill selection matrix.
3. **`skills/<tech>/SKILL.md`**: Modular technical knowledge (loaded on-demand via progressive disclosure) divided into **Framework/Language/Runner Skills** and **Cross-Cutting Domain Skills**, with deep-dive `references/` and executable `scripts/`.

```text
agent-arsenal/
├── plugins.json                     # Shareable manifest
└── plugins/
    ├── frontend-role/               # Role: Frontend Engineering & UI/UX (7 skills, 10 references, 2 scripts)
    │   ├── plugin.json
    │   ├── rules/AGENTS.md
    │   └── skills/
    │       ├── react-expert/
    │       ├── angular-expert/
    │       ├── astro-expert/
    │       ├── styling-design-system/
    │       ├── data-fetching-and-state/
    │       ├── forms-and-validation/
    │       └── web-accessibility-and-perf/
    ├── backend-role/                # Role: Backend, APIs & Distributed Systems (12 skills, 11 references, 2 scripts)
    │   ├── plugin.json
    │   ├── rules/AGENTS.md
    │   └── skills/
    │       ├── node-typescript-expert/
    │       ├── python-backend-expert/
    │       ├── golang-backend-expert/
    │       ├── java-spring-expert/
    │       ├── dotnet-backend-expert/
    │       ├── rust-backend-expert/
    │       ├── sql-api-architect/
    │       ├── supabase-platform/
    │       ├── auth-and-api-security/
    │       ├── caching-queues-and-events/
    │       ├── observability-and-resilience/
    │       └── architecture-and-domain-design/
    ├── qa-testing-role/             # Role: QA, Test Automation & Quality (8 skills, 6 references, 2 scripts)
    │   ├── plugin.json
    │   ├── rules/AGENTS.md
    │   └── skills/
    │       ├── vitest-expert/
    │       ├── playwright-e2e/
    │       ├── playwright-cli-browser/
    │       ├── unit-testing-expert/
    │       ├── api-and-integration-testing/
    │       ├── performance-and-load-testing/
    │       ├── security-and-fuzz-testing/
    │       └── test-strategy-and-bug-triage/
    ├── devops-infra-role/           # Role: DevOps, Cloud & Platform Engineering (6 skills, 6 references, 2 scripts)
    │   ├── plugin.json
    │   ├── rules/AGENTS.md
    │   └── skills/
    │       ├── docker-containers/
    │       ├── supabase-self-hosted/
    │       ├── cicd-pipelines/
    │       ├── iac-terraform-and-cloud/
    │       ├── azure-cli-and-cloud/
    │       └── reverse-proxy-and-linux-servers/
    └── docs-architecture-role/      # Role: UKG Documentation & Software Architecture (2 skills, 2 references, 2 scripts)
        ├── plugin.json
        ├── rules/AGENTS.md
        └── skills/
            ├── ukg-knowledge-graph/
            └── adr-and-mermaid-diagrams/
```

## Global Installation / Linking

Clone the repository to `~/agent-arsenal`:

```bash
git clone git@github.com:Lucas9704/fullstack-agents.git ~/agent-arsenal
```

To enable this arsenal across all projects on your machine, register the `plugins` directory in `~/.gemini/config/plugins.json`:

```json
{
  "entries": [
    {
      "path": "~/agent-arsenal/plugins"
    }
  ]
}
```

## Claude Code

The whole repository is a single Claude Code plugin, `fullstack-agents`, that bundles every role: 10 subagents and 35 skills. It reuses the same `skills/` folders as Antigravity, and its manifest (`.claude-plugin/plugin.json`) points at each role's `skills/` and `agents/*.md`, so nothing is duplicated. Install it straight from GitHub, no clone needed:

```text
/plugin install fullstack-agents --marketplace Lucas9704/fullstack-agents
```

Or in two steps:

```text
/plugin marketplace add Lucas9704/fullstack-agents
/plugin install fullstack-agents@agent-arsenal
```

Skills and subagents are namespaced as `fullstack-agents:<name>` (for example `fullstack-agents:react-expert`):

| Role | Subagents |
|---|---|
| Frontend | `frontend-builder`, `frontend-reviewer` (read-only) |
| QA & Testing | `qa-engineer`, `qa-reviewer` (read-only) |
| Backend | `backend-builder`, `backend-reviewer` (read-only) |
| DevOps & Infra | `devops-engineer`, `devops-reviewer` (read-only) |
| Docs & Architecture | `docs-architect`, `docs-reviewer` (read-only) |

The marketplace is named `agent-arsenal` (from `marketplace.json`), so the plugin is installed as `fullstack-agents@agent-arsenal`. Pull new versions with `/plugin marketplace update agent-arsenal`; bump `version` in both `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` when releasing changes, because installed plugins are cached per version.

To share it with a team, install it with `--scope project` from the project root and commit the resulting `.claude/settings.json`:

```bash
claude plugin install fullstack-agents --marketplace Lucas9704/fullstack-agents --scope project
```

To try a local clone for one session without installing it (useful while editing skills or agents):

```bash
claude --plugin-dir ~/agent-arsenal
```

Validate the plugin and marketplace with `claude plugin validate .`.

## Project-Specific Usage (Team / VCS)

To enable only specific roles in a single repository, create `.agents/plugins.json` in that project:

```json
{
  "entries": [
    {
      "path": "~/agent-arsenal/plugins",
      "include_only": ["frontend-role", "qa-testing-role", "docs-architecture-role"]
    }
  ]
}
```

## License

[MIT](./LICENSE) © 2026 Lucas Canteros
