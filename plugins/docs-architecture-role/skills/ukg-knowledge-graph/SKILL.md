---
name: ukg-knowledge-graph
description: >-
  Use this skill when creating, structuring, or auditing technical documentation using the Unified Knowledge Graph (UKG) Markdown convention. Covers typed YAML frontmatter, index.md progressive disclosure hubs, explicit graph edges (wikilinks and relative links), chunk-safe writing for AI/RAG, and automated graph validation.
---

# Unified Knowledge Graph (UKG) Documentation Skill

Follow the **UKG (Unified Knowledge Graph)** convention to turn any `docs/` folder into a Git-native, human-readable, and AI-traversable knowledge graph:

## 1. Atomic Typed Nodes & YAML Frontmatter Schema
Every Markdown file (except top-level `README.md`) is a **typed node** in the knowledge graph and must begin with a YAML frontmatter block:

```yaml
---
id: orders-service
title: "Orders Domain Service"
type: "Service"          # Hub | Concept | Service | Component | Schema | ADR | Runbook
status: "active"         # draft | proposed | active | deprecated | superseded
owner: "@backend-team"
depends_on:
  - "[[auth-service]]"
  - "[[postgres-orders-schema]]"
tags: [orders, checkout, backend]
last_updated: 2026-10-31
---
```

### Standard Node Types (`type`)
- **`Hub`**: Directory entry point (`index.md`) that summarizes and links to child nodes in its domain.
- **`Concept`**: Domain model, ubiquitous language definition, or business rule invariant.
- **`Service` / `Component`**: Backend microservice, API module, worker, or frontend feature module.
- **`Schema`**: Database table contract, event payload, or external API specification.
- **`ADR`**: Architecture Decision Record capturing a design trade-off and its consequences.
- **`Runbook`**: Operational step-by-step guide for deployment, incident recovery, or maintenance.

## 2. Progressive Disclosure via `index.md` Hubs
- Place an `index.md` (`type: "Hub"`) at the root of `docs/` and inside major domain subdirectories (`docs/architecture/index.md`, `docs/domains/index.md`, `docs/decisions/index.md`).
- An AI agent or new engineer reads `docs/index.md` first to understand the global topology, then traverses only into the specific child nodes needed for the current task—saving massive context window budget.

## 3. Explicit Graph Edges (Zero Orphan Nodes)
- Connect related nodes explicitly using either `[[node-id]]` wikilinks or standard relative Markdown links (`[auth-service](./auth-service.md)`), and declare upstream dependencies in frontmatter `depends_on: [...]`.
- Include a dedicated `## Relationships & Contracts` section in every `Service`, `Component`, and `Schema` node listing:
  - **Depends on / Consumes**: Upstream nodes or schemas.
  - **Used by / Publishes to**: Downstream consumers.
  - **Governed by**: Relevant `ADR` or security/compliance nodes.
- **No Orphan Nodes**: Every node must be reachable from `docs/index.md` or at least one parent/peer node.

## 4. Chunk-Safe Writing for LLMs & RAG
- **Strict Heading Hierarchy**: Never skip heading levels (`#` → `##` → `###`).
- **Self-Contained Sections (No Ambiguous Pronouns)**: Avoid opening a section with *"It validates the payload and sends it to the queue."* Write explicitly: *"The `orders-service` validates the checkout payload and publishes an `OrderCreated` event to `bullmq-orders-queue`."* This ensures individual sections remain unambiguous when retrieved in isolation by RAG or agent line-range reads.

## 5. On-Demand Deep-Dive References & Scripts
- **Complete UKG Node Templates (`Hub`, `Service`, `Schema`, `Runbook`)**: [references/node-templates-and-schema.md](./references/node-templates-and-schema.md)
- **Validate UKG Frontmatter, Broken Links & Orphan Nodes**:
  [scripts/validate-ukg-graph.mjs](./scripts/validate-ukg-graph.mjs)
  Run: `node <skill_dir>/scripts/validate-ukg-graph.mjs <docs_dir>`
- **Generate UKG Graph Inventory & Mermaid Topology Map**:
  [scripts/build-ukg-map.mjs](./scripts/build-ukg-map.mjs)
  Run: `node <skill_dir>/scripts/build-ukg-map.mjs <docs_dir>`
