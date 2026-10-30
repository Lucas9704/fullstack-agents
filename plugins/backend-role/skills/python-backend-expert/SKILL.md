---
name: python-backend-expert
description: >-
  Use this skill when developing or reviewing Python backend services (FastAPI, Django, Flask, Pydantic, SQLAlchemy 2.0, Alembic). Covers type hints, async/await concurrency, dependency injection, and packaging best practices.
---

# Python Backend Expert Skill

## 1. Modern Typing & Data Models
- Use modern Python 3.10+ type annotations (`list[str]`, `dict[str, Any]`, `X | None`) across all function signatures.
- Validate inputs and outputs using **Pydantic v2** (`model_validate`, `ConfigDict`), separating input schemas (`Create`/`Update`), output schemas (`Response`), and persistence models (ORM).

## 2. Concurrency & Resource Management
- In async frameworks (such as FastAPI), never call blocking I/O (`requests`, synchronous DB drivers, `time.sleep`) inside `async def` functions; use async clients (`httpx`, `asyncpg`) or offload to a thread pool.
- Manage database sessions and external connections via context managers (`with` / `async with`) or generator-based dependency injection (`yield`).

## 3. On-Demand Deep-Dive References
- **FastAPI Lifespan, Annotated Dependencies, SQLAlchemy 2.0 `AsyncSession` & Alembic**: [references/fastapi-and-sqlalchemy-async.md](./references/fastapi-and-sqlalchemy-async.md)

## 4. Verification
1. Run static analysis (`ruff`, `mypy`, or `pyright` when configured).
2. Run `pytest` on affected modules.
