# Agent Arsenal — Antigravity Role Plugins & Skills

Centralized repository of **Role-based Plugins** and **Technology Skills** for [Google Antigravity](https://antigravity.google/docs).

## Architecture: Roles (Subagents) + Skills (Technologies)

Each plugin under `plugins/` represents a **Software Engineering Role** and consists of:
1. **`plugin.json`**: Plugin manifest.
2. **`rules/AGENTS.md`**: Defines the role's subagent catalog (`builder` with write access and `reviewer` in read-only mode), their framework-agnostic base `SystemPrompt`, and the skill delegation protocol.
3. **`skills/<tech>/SKILL.md`**: Modular technical knowledge (loaded on-demand via progressive disclosure) for specific frameworks and tools within that role.

```text
agent-arsenal/
├── plugins.json                     # Shareable manifest
└── plugins/
    ├── frontend-role/               # Role: Frontend Engineering & UI/UX
    │   ├── plugin.json
    │   ├── rules/AGENTS.md
    │   └── skills/
    │       ├── react-expert/SKILL.md
    │       ├── angular-expert/SKILL.md
    │       └── astro-expert/SKILL.md
    ├── backend-role/                # Role: Backend & Data Engineering
    │   ├── plugin.json
    │   ├── rules/AGENTS.md
    │   └── skills/
    │       ├── node-typescript-expert/SKILL.md
    │       ├── python-backend-expert/SKILL.md
    │       └── sql-api-architect/SKILL.md
    ├── qa-testing-role/             # Role: QA, Test Automation & Quality
    │   ├── plugin.json
    │   ├── rules/AGENTS.md
    │   └── skills/
    │       ├── playwright-e2e/SKILL.md
    │       └── unit-testing-expert/SKILL.md
    └── devops-infra-role/           # Role: DevOps, Containers & CI/CD
        ├── plugin.json
        ├── rules/AGENTS.md
        └── skills/
            ├── docker-containers/SKILL.md
            └── cicd-pipelines/SKILL.md
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
