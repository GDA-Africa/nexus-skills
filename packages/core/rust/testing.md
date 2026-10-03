---
skill: testing
version: 1.0.0
framework: rust
category: testing
triggers:
  - "Rust tests"
  - "Rust unit testing"
  - "axum integration tests"
  - "tokio test harness"
author: "@nexus-framework/skills"
status: active
---

# Skill: Testing Strategies & Async Harnesses (Rust)

## When to Read This
Read this skill when writing unit tests, module-level tests (`#[cfg(test)]`), async test suites (`#[tokio::test]`), Axum HTTP endpoint integration tests, mock trait implementations, or RAII cleanup fixtures in Rust.

## Context
Rust provides built-in testing facilities via `cargo test`. In high-performance backend systems, we combine Rust's compile-time guarantees with fast, socket-free HTTP testing (`tower::ServiceExt::oneshot`) for API routes, and isolated integration tests in `tests/`. We manage external dependencies through trait-based abstractions or lightweight test doubles, ensuring deterministic test runs without flaky network calls or race conditions.

## Steps
1. **Organize Test Scope**: Place private/unit tests in `src/` inside `#[cfg(test)] mod tests`, and black-box public API integration tests in the top-level `tests/` directory.
2. **Execute Async Tests with Tokio**: Decorate asynchronous tests with `#[tokio::test]` to run within a localized multi-threaded Tokio runtime.
3. **Test Axum Handlers Without Sockets**: Use `tower::ServiceExt::oneshot` to pass `http::Request` objects directly into the `axum::Router`. This executes the entire middleware and extractor pipeline in-memory without binding TCP ports.
4. **Leverage RAII Drop Guards for Cleanup**: Wrap test databases or temporary directories in a dedicated struct implementing the `Drop` trait to guarantee automatic resource cleanup upon test exit.
5. **Decouple via Traits for Mocking**: Extract external side-effects (payment processors, notification dispatchers) into traits, injecting fake implementations or `mockall`-generated doubles during test runs.
6. **Assert on Structured Error Enums**: Avoid string matching on errors; match against typed enum variants (`assert!(matches!(res.err(), Some(AppError::NotFound(_))))`).
7. **Ensure Deterministic Concurrency**: Avoid shared static state (`static mut` or unsynchronized `lazy_static`); ensure each test generates isolated UUID-prefixed resources.

## Patterns We Use
- **Socket-Free Axum Testing with `tower::ServiceExt::oneshot`**:
  ```rust
  use axum::{
      body::Body,
      http::{Request, StatusCode},
  };
  use http_body_util::BodyExt;
  use tower::ServiceExt;

  #[tokio::test]
  async fn test_create_user_endpoint() {
      let state = Arc::new(AppState { app_name: "TestApp".into() });
      let app = build_app(state);

      let payload = r#"{"email":"alex@example.com","name":"Alex River"}"#;
      let req = Request::builder()
          .method("POST")
          .uri("/v1/users")
          .header("Content-Type", "application/json")
          .body(Body::from(payload))
          .unwrap();

      let response = app.oneshot(req).await.unwrap();
      assert_eq!(response.status(), StatusCode::CREATED);

      let body = response.into_body().collect().await.unwrap().to_bytes();
      let res_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
      assert_eq!(res_json["email"], "alex@example.com");
  }
  ```
- **RAII Test Environment Guard**:
  ```rust
  pub struct TestContext {
      pub pool: sqlx::PgPool,
      schema_name: String,
  }

  impl TestContext {
      pub async fn new() -> Self {
          let schema_name = format!("test_{}", uuid::Uuid::new_v4().simple());
          let pool = setup_test_schema(&schema_name).await;
          Self { pool, schema_name }
      }
  }

  impl Drop for TestContext {
      fn drop(&mut self) {
          // Teardown isolated schema or trigger async drop runner
      }
  }
  ```
- **Trait-Based Dependency Substitution**:
  ```rust
  #[async_trait::async_trait]
  pub trait EmailSender: Send + Sync {
      async fn send_email(&self, to: &str, body: &str) -> Result<(), EmailError>;
  }

  pub struct MockEmailSender {
      pub sent: std::sync::Mutex<Vec<(String, String)>>,
  }

  #[async_trait::async_trait]
  impl EmailSender for MockEmailSender {
      async fn send_email(&self, to: &str, body: &str) -> Result<(), EmailError> {
          self.sent.lock().unwrap().push((to.to_string(), body.to_string()));
          Ok(())
      }
  }
  ```

## Anti-Patterns — Never Do This
- ❌ **Do not bind hardcoded TCP ports in integration tests**: Never listen on fixed ports like `127.0.0.1:8080`; parallel test runners will fail with `Address already in use`. Use port `0` (`TcpListener::bind("127.0.0.1:0")`) or socket-free `oneshot`.
- ❌ **Do not use `std::thread::sleep` in async tests**: Always use `tokio::time::sleep` to avoid freezing the Tokio worker thread pool.
- ❌ **Do not rely on test execution order**: Cargo runs tests concurrently across multiple threads by default. Each test must be completely independent and self-contained.
- ❌ **Do not silence compiler warnings in test modules with `#[allow(unused)]` everywhere**: Clean, warning-free test code prevents masking actual unused assertions or dead branches.
- ❌ **Do not assert errors by comparing debug strings**: String-based error checks (`format!("{:?}", err).contains("not found")`) are fragile and break upon text reformatting; match directly on enum variants or status codes.

## Example

```rust
// tests/api_users_test.rs
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use http_body_util::BodyExt;
use serde_json::{json, Value};
use std::sync::Arc;
use tower::ServiceExt;

// Import application builder from your crate
use nexus_api::{app, AppState};

#[tokio::test]
async fn test_create_user_success_and_validation() {
    let state = Arc::new(AppState {
        app_name: "Nexus-Test".to_string(),
    });

    let router = app(state);

    // --- Subtest 1: Successful Creation ---
    let valid_payload = json!({
        "email": "test.user@nexus.dev",
        "name": "Nexus Tester"
    });

    let req = Request::builder()
        .method("POST")
        .uri("/v1/users")
        .header("content-type", "application/json")
        .body(Body::from(valid_payload.to_string()))
        .expect("failed to build request");

    let response = router.clone().oneshot(req).await.expect("service call failed");
    assert_eq!(response.status(), StatusCode::CREATED);

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body_json: Value = serde_json::from_slice(&body_bytes).expect("invalid JSON");
    assert_eq!(body_json["email"], "test.user@nexus.dev");
    assert_eq!(body_json["name"], "Nexus Tester");
    assert!(body_json["id"].is_string());

    // --- Subtest 2: Validation Failure on Invalid Email ---
    let invalid_payload = json!({
        "email": "invalid-no-at-sign",
        "name": "Nexus Tester"
    });

    let req_invalid = Request::builder()
        .method("POST")
        .uri("/v1/users")
        .header("content-type", "application/json")
        .body(Body::from(invalid_payload.to_string()))
        .expect("failed to build request");

    let response_invalid = router.oneshot(req_invalid).await.expect("service call failed");
    assert_eq!(response_invalid.status(), StatusCode::UNPROCESSABLE_ENTITY);

    let err_bytes = response_invalid.into_body().collect().await.unwrap().to_bytes();
    let err_json: Value = serde_json::from_slice(&err_bytes).expect("invalid error JSON");
    assert_eq!(err_json["title"], "Validation Failed");
}
```
