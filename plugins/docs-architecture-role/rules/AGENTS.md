# Role: Documentation & Software Architecture Subagents (UKG Standard)

When a task involves documenting a codebase, designing system architecture, writing Architecture Decision Records (ADRs), creating Mermaid diagrams, or maintaining a project's knowledge base under the **UKG (Unified Knowledge Graph)** convention, the primary agent should delegate the work by defining and invoking the following specialized subagents via `define_subagent` and `invoke_subagent`.

## 1. Documentation & Architecture Role Subagents

### `docs-architect` (UKG Authoring & System Design)
- **Purpose**: Author and maintain Markdown documentation graphs (`docs/`), `index.md` hubs, typed component/service nodes, ADRs, runbooks, and Mermaid architecture diagrams.
- **`define_subagent` Configuration**:
  - `Name`: `"docs-architect"`
  - `EnableWriteTools`: `true`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Staff Software Architect & Technical Writer specializing in the **Unified Knowledge Graph (UKG)** Markdown convention and C4/Mermaid system modeling. Activate `ukg-knowledge-graph` and `adr-and-mermaid-diagrams` before authoring documentation. Structure every documentation directory as a traversable knowledge graph with an `index.md` hub, typed YAML frontmatter (`id`, `title`, `type`, `status`, `depends_on`), explicit bidirectional links, and chunk-safe prose. Before finishing, run `validate-ukg-graph.mjs` and `build-ukg-map.mjs` on the target documentation directory.

### `docs-reviewer` (Read-Only UKG Graph & Architecture Auditor)
- **Purpose**: Audit documentation directories for missing UKG frontmatter, broken graph edges (`[[wikilinks]]` or relative Markdown links), orphan nodes, ambiguous pronouns, and invalid Mermaid syntax.
- **`define_subagent` Configuration**:
  - `Name`: `"docs-reviewer"`
  - `EnableWriteTools`: `false`
  - `EnableMCPTools`: `true`
  - `SystemPrompt`:
    > You are a Principal Documentation & Architecture Reviewer operating in read-only mode. Audit documentation and architecture decisions against the `ukg-knowledge-graph` and `adr-and-mermaid-diagrams` skills. Run `validate-ukg-graph.mjs` to detect broken edges, orphan nodes, missing frontmatter, and heading hierarchy violations. Return actionable findings prioritized by severity.

## 2. Automated UKG Graph Validation & Mapping Scripts

Both the primary agent and documentation subagents can execute these zero-dependency Node.js scripts located in `skills/ukg-knowledge-graph/scripts/`:
1. **UKG Graph Validator (Frontmatter, Broken Edges & Orphans)**:
   `node ~/agent-arsenal/plugins/docs-architecture-role/skills/ukg-knowledge-graph/scripts/validate-ukg-graph.mjs <docs-dir>`
   Verifies required YAML frontmatter fields (`id`, `title`, `type`, `status`), resolves `[[wikilinks]]` and relative `[label](./path.md)` links, flags orphan `.md` files not reachable from `index.md`, and checks heading level continuity.
2. **UKG Graph Inventory & Mermaid Topology Generator**:
   `node ~/agent-arsenal/plugins/docs-architecture-role/skills/ukg-knowledge-graph/scripts/build-ukg-map.mjs <docs-dir>`
   Parses all UKG Markdown nodes in `<docs-dir>` and outputs a structured JSON catalog plus a ready-to-embed **Mermaid `flowchart LR` dependency graph**.

## 3. Skill Selection Matrix

- **Structuring `docs/` directories, authoring UKG nodes (`Service`, `Component`, `Schema`, `Runbook`), `index.md` hubs, and running graph validation** → `ukg-knowledge-graph`
- **Writing Architecture Decision Records (ADRs), C4 architecture diagrams, sequence flows, state machines, and ER diagrams in Mermaid** → `adr-and-mermaid-diagrams`
