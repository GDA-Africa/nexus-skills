---
skill: testing
version: 1.0.0
framework: python
category: testing
triggers:
  - "Python tests"
  - "pytest suite"
  - "pytest fixtures"
  - "Python integration testing"
author: "@nexus-framework/skills"
status: active
---

# Skill: Testing Strategies & Pytest Suite (Python)

## When to Read This
Read this skill when writing unit tests, integration tests, async fixtures, mock configurations, API endpoint verification, or establishing test data factories for Python applications.

## Context
A robust Python test suite must be fast, deterministic, and isolated. We use `pytest` alongside `pytest-asyncio`, `pytest-mock`, and `httpx` to validate both synchronous business logic and asynchronous API endpoints. Every test runs within an isolated scope where external network calls are disallowed, database mutations are contained in rollbacks or isolated schemas, and mocks strictly adhere to component interfaces through spec validation.

## Steps
1. **Configure Pytest Environment**: Maintain `pyproject.toml` with `pytest.ini_options` specifying test paths, strict markers, and `asyncio_mode = "auto"`.
2. **Structure Fixture Hierarchy**: Define shared resources in `conftest.py`. Scope expensive immutable setups (app instance, engine creation) to `session` or `module`, and mutable state (database transactions, client instances) to `function`.
3. **Isolate Database State**: Wrap each test in an explicit nested database transaction that automatically issues a rollback upon test exit, preventing cross-test data pollution.
4. **Mock External Boundaries Safely**: Use `unittest.mock.create_autospec` or `pytest-mock` (`mocker`) to mock external third-party APIs (Stripe, Twilio, S3) rather than internal domain functions.
5. **Implement Async API Testing**: Test FastAPI endpoints using `httpx.AsyncClient` with `ASGITransport(app=app)`, overriding dependencies via `app.dependency_overrides`.
6. **Apply Parametrization**: Use `@pytest.mark.parametrize` to cover boundary conditions, equivalence classes, and invalid input matrices systematically.
7. **Enforce Coverage and Determinism**: Measure branch coverage (`pytest-cov`) and verify tests pass in randomized order (`pytest-randomly`) to expose hidden order dependencies.

## Patterns We Use
- **Async Test Client Setup with ASGITransport**:
  ```python
  import pytest
  from httpx import ASGITransport, AsyncClient
  from src.main import app

  @pytest.fixture
  async def async_client():
      transport = ASGITransport(app=app)
      async with AsyncClient(transport=transport, base_url="http://testserver") as client:
          yield client
  ```
- **Transactional Database Rollback Fixture**:
  ```python
  @pytest.fixture
  async def db_session(test_engine):
      connection = await test_engine.connect()
      transaction = await connection.begin()
      session = AsyncSession(bind=connection, expire_on_commit=False)

      yield session

      await session.close()
      await transaction.rollback()
      await connection.close()
  ```
- **FastAPI Dependency Overrides**:
  ```python
  @pytest.fixture
  def mock_payment_gateway(app_instance):
      mock_gateway = AsyncMock(spec=PaymentGateway)
      mock_gateway.charge.return_value = PaymentResult(success=True, tx_id="tx_123")
      
      app_instance.dependency_overrides[get_payment_gateway] = lambda: mock_gateway
      yield mock_gateway
      app_instance.dependency_overrides.clear()
  ```
- **Autospec Mocking**:
  ```python
  def test_service_calls_client(mocker):
      # Ensures mock signature matches actual EmailService class
      mock_email = mocker.create_autospec(EmailService, instance=True)
      orchestrator = UserRegistration(email_service=mock_email)
      orchestrator.register("user@test.com")
      mock_email.send_welcome.assert_awaited_once_with("user@test.com")
  ```

## Anti-Patterns — Never Do This
- ❌ **Do not use real network calls in tests**: Tests must never call live third-party services; use `httpx_mock`, `vcrpy`, or spec-based mock objects.
- ❌ **Do not share mutable state across tests without cleanup**: Avoid global lists, modified module attributes, or unreverted `dependency_overrides` that poison subsequent tests.
- ❌ **Do not use `time.sleep` in async tests**: Always use `asyncio.sleep` with virtual clocks or event synchronization (`asyncio.Event`) to prevent blocking the event loop.
- ❌ **Do not write non-asserting tests**: Every test must verify assertions on return values, state changes, or emitted events.
- ❌ **Do not mock internal private implementation details**: Mock at architectural boundaries (I/O, database, external HTTP APIs). Testing internal private functions via heavy mocking creates brittle tests that break during refactoring.
- ❌ **Do not use loose un-specced mocks**: Bare `MagicMock()` permits calls to non-existent methods; always pass `spec=Class` or use `create_autospec`.

## Example

```python
# tests/test_users_api.py
import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock

from src.main import app
from src.api.v1.users import get_user_service, UserService, UserResponse
from uuid import uuid4

# --- Fixtures ---
@pytest.fixture
def mock_user_service():
    service = AsyncMock(spec=UserService)
    return service

@pytest.fixture
async def client(mock_user_service):
    app.dependency_overrides[get_user_service] = lambda: mock_user_service
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
    app.dependency_overrides.clear()

# --- Unit & Integration Tests ---
@pytest.mark.asyncio
async def test_create_user_success(client: AsyncClient, mock_user_service: AsyncMock):
    # Arrange
    user_id = uuid4()
    mock_user_service.create_user.return_value = UserResponse(
        id=user_id,
        email="test@example.com",
        full_name="Alex River",
        is_active=True,
    )

    payload = {
        "email": "test@example.com",
        "full_name": "Alex River",
        "password": "supersecurepassword123",
    }

    # Act
    response = await client.post("/api/v1/users", json=payload)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == str(user_id)
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Alex River"
    mock_user_service.create_user.assert_awaited_once()

@pytest.mark.parametrize(
    "invalid_payload, expected_loc",
    [
        (
            {"email": "not-an-email", "full_name": "Alex", "password": "pass123456789"},
            ["body", "email"],
        ),
        (
            {"email": "valid@example.com", "full_name": "A", "password": "pass123456789"},
            ["body", "full_name"],
        ),
        (
            {"email": "valid@example.com", "full_name": "Alex", "password": "short"},
            ["body", "password"],
        ),
    ],
)
@pytest.mark.asyncio
async def test_create_user_validation_failure(
    client: AsyncClient,
    invalid_payload: dict,
    expected_loc: list[str],
):
    response = await client.post("/api/v1/users", json=invalid_payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any(err["loc"] == expected_loc for err in errors)
```
