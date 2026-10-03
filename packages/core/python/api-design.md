---
skill: api-design
version: 1.0.0
framework: python
category: api
triggers:
  - "Python API"
  - "FastAPI endpoints"
  - "Python backend"
  - "REST API Python"
author: "@nexus-framework/skills"
status: active
---

# Skill: API Design & Architecture (Python)

## When to Read This
Read this skill when architecting or implementing Python REST APIs, FastAPI route handlers, Pydantic schemas, dependency injection providers, async middleware, or global exception translation.

## Context
Production Python backend services require high concurrency, strict type safety, predictable schema serialization, and explicit resource lifetimes. We build backend APIs on FastAPI and Pydantic v2, utilizing asynchronous I/O (`asyncio`), lifespan management, dependency injection (`Depends`), and RFC 7807/9457 compliant problem details for errors. Our architecture cleanly separates routing, request validation, business services, and database persistence to prevent leaking database models or coupling network protocols to domain logic.

## Steps
1. **Define Domain Schemas & DTOs**: Create Pydantic v2 models for request bodies, query filters, and response payloads using explicit field validation (`Field`, `field_validator`, `model_validator`) and `ConfigDict(frozen=True, extra='forbid')`.
2. **Configure Application Lifespan**: Initialize database connection pools, HTTP clients, and background workers using `@asynccontextmanager` in the FastAPI `lifespan` handler instead of deprecated startup/shutdown events.
3. **Establish Dependency Injection Pipelines**: Structure reusable dependencies (`Depends`) for authentication extraction, scoped database sessions (`yield` context), rate limiters, and service factory instances.
4. **Implement Layered Route Handlers**: Write concise `APIRouter` route functions that perform authorization checks, delegate logic to domain services, and return typed schemas with standard HTTP status codes.
5. **Implement Global Exception Handling**: Map domain exceptions to standard HTTP error responses formatted according to RFC 9457 (Problem Details for HTTP APIs).
6. **Apply Cross-Cutting Middleware**: Attach correlation ID tracking (`X-Request-ID`), structured access logging with contextual metrics, security headers, and CORS policies.
7. **Document OpenAPI & Versioning**: Group routes with version prefixes (`/api/v1`), explicit `tags`, summary descriptions, and response status declarations (`responses={...}`).

## Patterns We Use
- **Pydantic v2 Schema Modeling**:
  ```python
  from pydantic import BaseModel, ConfigDict, Field, EmailStr

  class UserCreateRequest(BaseModel):
      model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

      email: EmailStr
      full_name: str = Field(min_length=1, max_length=100)
      tier: str = Field(default="standard", pattern=r"^(standard|pro|enterprise)$")
  ```
- **Lifespan Context Management**: Use `@asynccontextmanager` on the FastAPI instance to manage long-lived resources (connection pools, Redis clients) cleanly without leaking memory across reloads:
  ```python
  from contextlib import asynccontextmanager
  from fastapi import FastAPI

  @asynccontextmanager
  async def lifespan(app: FastAPI):
      # Startup: acquire pool
      app.state.pool = await create_db_pool()
      yield
      # Teardown: close pool
      await app.state.pool.close()

  app = FastAPI(lifespan=lifespan)
  ```
- **Async Yield Dependencies for Scoped Resources**: Yield database sessions from a dependency to guarantee commit/rollback and cleanup even when unexpected exceptions occur:
  ```python
  from collections.abc import AsyncGenerator
  from fastapi import Depends
  from sqlalchemy.ext.asyncio import AsyncSession

  async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
      async with async_session_factory() as session:
          try:
              yield session
              await session.commit()
          except Exception:
              await session.rollback()
              raise
  ```
- **Domain-to-HTTP Exception Mapping**: Define an explicit application error hierarchy and register handlers converting exceptions into RFC 9457 Problem Details:
  ```python
  class EntityNotFoundError(Exception):
      def __init__(self, entity: str, entity_id: str):
          self.entity = entity
          self.entity_id = entity_id
          super().__init__(f"{entity} with ID {entity_id} was not found.")
  ```
- **Correlation ID Middleware**: Generate or propagate `X-Request-ID` across every incoming request and attach it to Python's `contextvars` for structured logging.

## Anti-Patterns — Never Do This
- ❌ **Do not expose ORM models directly in endpoints**: Never return SQLAlchemy/Tortoise models directly from route handlers; always map through validated Pydantic DTOs to avoid leaking sensitive columns (e.g., password hashes, internal flags).
- ❌ **Do not execute synchronous blocking I/O in async def**: Never call blocking libraries (`requests.get`, `time.sleep`, standard `open()`, synchronous database drivers) directly in `async def` routes. Use non-blocking alternatives (`httpx`, `asyncio.sleep`, `aiofiles`, `asyncpg`) or offload with `asyncio.to_thread`.
- ❌ **Do not use mutable default arguments in schemas or dependencies**: Never use `def handler(tags: list = [])` or `field: List[str] = []`; use `Field(default_factory=list)`.
- ❌ **Do not use deprecated `@app.on_event("startup")`**: Use FastAPI's modern `lifespan` context manager.
- ❌ **Do not catch generic `Exception` and return silent 200s**: Return accurate semantic HTTP status codes (`201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`).
- ❌ **Do not put business rules and raw SQL directly in router files**: Keep controllers thin; route handlers only parse inputs, call services, and serialize outputs.

## Example

```python
# src/api/v1/users.py
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# --- Domain & Schemas ---
class UserBase(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=12, max_length=128)

class UserResponse(UserBase):
    id: UUID
    is_active: bool

class ProblemDetail(BaseModel):
    type: str = "about:blank"
    title: str
    status: int
    detail: str
    instance: str

# --- Domain Exceptions ---
class DomainConflictError(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

# --- Service Layer ---
class UserService:
    def __init__(self, session_context: dict):
        self.session = session_context

    async def create_user(self, payload: UserCreate) -> UserResponse:
        # Check uniqueness constraint
        if payload.email == "existing@example.com":
            raise DomainConflictError(f"Email '{payload.email}' is already registered.")
        
        return UserResponse(
            id=uuid4(),
            email=payload.email,
            full_name=payload.full_name,
            is_active=True,
        )

# --- Dependencies ---
async def get_db() -> AsyncGenerator[dict, None]:
    # Mocking scoped async database session
    db_session = {"connection": "active"}
    try:
        yield db_session
    finally:
        pass # Cleanup session

async def get_user_service(db: Annotated[dict, Depends(get_db)]) -> UserService:
    return UserService(session_context=db)

# --- Router ---
router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ProblemDetail},
        409: {"model": ProblemDetail},
    },
)
async def register_user(
    payload: UserCreate,
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserResponse:
    return await service.create_user(payload)

# --- Application Assembly & Error Handling ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup global connection pools or client sessions
    yield
    # Teardown logic

app = FastAPI(title="Nexus Core API", version="1.0.0", lifespan=lifespan)
app.include_router(router)

@app.exception_handler(DomainConflictError)
async def domain_conflict_handler(request: Request, exc: DomainConflictError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content=ProblemDetail(
            title="Resource Conflict",
            status=status.HTTP_409_CONFLICT,
            detail=exc.message,
            instance=request.url.path,
        ).model_dump(),
    )
```
