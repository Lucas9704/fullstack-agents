---
name: adr-and-mermaid-diagrams
description: >-
  Use this skill when writing Architecture Decision Records (ADRs) or creating visual system architecture diagrams in Mermaid (C4 System Context/Container flowcharts, Sequence diagrams, ER diagrams, and State diagrams).
---

# Architecture Decision Records (ADRs) & Mermaid Diagrams Skill

Follow these guidelines when recording architectural trade-offs and visualizing system design:

## 1. Architecture Decision Records (ADRs) as UKG Nodes
- Store ADRs in `docs/decisions/adr-NNN-<slug>.md` with UKG frontmatter (`type: "ADR"`, `status: "proposed" | "accepted" | "superseded"`).
- **Immutability Rule**: Once an ADR is `accepted`, never rewrite history to erase past decisions. If requirements change, create a new ADR (`adr-005-...`) and update the old ADR's frontmatter to `status: "superseded"` with a `superseded_by: "[[adr-005-...]]"` link.
- Structure every ADR with four mandatory sections:
  1. **Context & Problem Statement**: Forces at play, constraints, and why a decision is needed now.
  2. **Considered Options**: At least 2–3 realistic alternatives with pros and cons.
  3. **Decision Outcome**: The chosen option and justification.
  4. **Consequences (Positive & Negative)**: Operational impact, trade-offs accepted, and affected UKG service/schema nodes (`[[orders-service]]`).

## 2. Mermaid Diagram Standards & Syntax Safety
Use only supported, deterministic Mermaid diagram types inside ```mermaid fenced blocks:
- **System Context & Container Topology (C4 style)**: `flowchart TD` or `flowchart LR` with `subgraph` boundaries.
- **Request / Async Event Flows**: `sequenceDiagram` with `autonumber` and explicit `alt` / `par` blocks for failure and retry paths.
- **Database & Domain Models**: `erDiagram` showing PK/FK relationships and cardinality (`||--o{`).
- **Lifecycle & State Machines**: `stateDiagram-v2`.

### Strict Mermaid Syntax Rules (Prevent Render Errors)
- **Always Quote Labels with Special Characters**: Whenever a node label contains parentheses `()`, brackets `[]`, slashes `/`, or colons `:`, wrap the label in double quotes:
  - Good: `api["Orders API (FastAPI)"]`
  - Bad: `api[Orders API (FastAPI)]` (breaks parser!)
- **No HTML Tags in Labels**: Use plain text inside labels instead of `<br/>` or `<b>`.

## 3. On-Demand Deep-Dive References
- **Complete ADR Template & C4/Sequence/ER Mermaid Recipes**: [references/adr-and-c4-mermaid-recipes.md](./references/adr-and-c4-mermaid-recipes.md)
