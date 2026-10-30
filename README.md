# Agent Arsenal — Antigravity Role Plugins & Skills

Centralized repository of **Role-based Plugins** and **Technology Skills** for [Google Antigravity](https://antigravity.google/docs).

## Architecture: Roles (Subagents) + Skills (Technologies)

Each plugin under `plugins/` represents a **Software Engineering Role** and consists of:
1. **`plugin.json`**: Plugin manifest.
2. **`rules/AGENTS.md`**: Defines the role's subagent catalog (`builder`/`engineer` with write access and `reviewer` in read-only mode), their framework-agnostic base `SystemPrompt`, automated diagnostic/audit scripts, and the skill selection matrix.
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
    ├── qa-testing-role/             # Role: QA, Test Automation & Quality (7 skills, 5 references, 2 scripts)
    │   ├── plugin.json
    │   ├── rules/AGENTS.md
    │   └── skills/
    │       ├── vitest-expert/
    │       ├── playwright-e2e/
    │       ├── unit-testing-expert/
    │       ├── api-and-integration-testing/
    │       ├── performance-and-load-testing/
    │       ├── security-and-fuzz-testing/
    │       └── test-strategy-and-bug-triage/
    └── devops-infra-role/           # Role: DevOps, Cloud & Platform Engineering (6 skills, 6 references, 2 scripts)
        ├── plugin.json
        ├── rules/AGENTS.md
        └── skills/
            ├── docker-containers/
            ├── supabase-self-hosted/
            ├── cicd-pipelines/
            ├── iac-terraform-and-cloud/
            ├── azure-cli-and-cloud/
            └── reverse-proxy-and-linux-servers/
```

## Global Installation / Linking

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

## Project-Specific Usage (Team / VCS)

To enable only specific roles in a single repository, create `.agents/plugins.json` in that project:

```json
{
  "entries": [
    {
      "path": "~/agent-arsenal/plugins",
      "include_only": ["frontend-role", "qa-testing-role"]
    }
  ]
}
```
