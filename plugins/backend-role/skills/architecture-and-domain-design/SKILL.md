---
name: architecture-and-domain-design
description: >-
  Use this skill when designing backend module boundaries, Clean/Hexagonal Architecture (Ports & Adapters), Domain-Driven Design (DDD) tactical patterns, DTO vs Entity separation, dependency injection, or domain error hierarchies.
---

# Backend Architecture & Domain Design Skill

Follow these principles to keep backend codebases modular, testable, and decoupled from infrastructure churn:

## 1. Layered & Hexagonal Boundaries (Ports & Adapters)
- **Direction of Dependencies**: Dependencies must point inward toward the domain/application core:
  - **Transport Layer (Controllers / Handlers / Resolvers / CLI)**: Parses and validates input DTOs, invokes an application use-case/service, and maps domain results/errors to HTTP/gRPC status codes. Contains zero business rules.
  - **Application / Use-Case Layer**: Orchestrates domain entities, transaction boundaries, and outbound port interfaces (repositories, payment gateways, event publishers).
  - **Domain Layer**: Pure business rules, invariants, value objects, and domain errors—free of ORM decorators, HTTP frameworks, or transport types.
  - **Infrastructure Layer (Adapters)**: Concrete implementations of repositories (SQL/ORM), cache clients, message brokers, and third-party SDKs.

## 2. Strict Model Separation
- Maintain clear boundaries between:
  1. **Transport DTOs** (`CreateOrderRequest`, `OrderResponse`) — optimized for API contracts and validation.
  2. **Domain Entities / Value Objects** (`Order`, `Money`, `EmailAddress`) — enforce business invariants on construction and state transitions.
  3. **Persistence Models** (ORM rows/tables) — optimized for storage and relational mapping.
  *(In simpler CRUD modules, Domain and Persistence models may be combined pragmatically, but Transport DTOs must always remain separate from Database models).*

## 3. Typed Domain Error Hierarchy
- Define transport-agnostic domain error codes (`NotFound`, `Conflict`, `ValidationFailed`, `Forbidden`, `PreconditionFailed`, `RateLimited`) in the core layer, and translate them once in a centralized transport exception filter/middleware into **RFC 7807 Problem Details**.
