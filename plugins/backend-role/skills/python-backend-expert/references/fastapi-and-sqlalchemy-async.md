# FastAPI & SQLAlchemy 2.0 Async Patterns Reference

## 1. FastAPI Lifespan & Typed Dependencies
- **Lifespan Context Manager**: Initialize shared connection pools (Postgres engine, Redis client, `httpx.AsyncClient`) inside `@asynccontextmanager async def lifespan(app: FastAPI):` instead of deprecated `@app.on_event("startup")` hooks.
- **Reusable `Annotated` Dependencies**: Define clean dependency aliases for database sessions and authenticated principals:
  ```python
  from typing import Annotated
  from fastapi import Depends
  from sqlalchemy.ext.asyncio import AsyncSession

  DbSession = Annotated[AsyncSession, Depends(get_db_session)]
  CurrentUser = Annotated[UserPrincipal, Depends(get_current_user)]
  ```

## 2. SQLAlchemy 2.0 Async (`AsyncSession`)
- **2.0 Style Queries Only**: Use `select(User).where(User.email == email)` with `await session.execute(stmt)` and `.scalars().first()`—never use legacy 1.x `session.query(User)`.
- **`expire_on_commit=False`**: Configure `async_sessionmaker(engine, expire_on_commit=False)` so accessing model attributes after `await session.commit()` does not trigger implicit synchronous lazy-load I/O (`MissingGreenlet` error).
- **Explicit Eager Loading**: Prevent N+1 queries and `MissingGreenlet` crashes on relationships by setting `lazy="raise"` on models and loading associations explicitly per query with `selectinload()` (for collections) or `joinedload()` (for many-to-one).

## 3. Alembic Migrations
- Generate migrations (`alembic revision --autogenerate -m "..."`), always inspect the generated `upgrade()` and `downgrade()` functions before committing, and ensure indexes/constraints have deterministic naming conventions configured on `Base.metadata.naming_convention`.
