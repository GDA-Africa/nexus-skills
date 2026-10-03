---
skill: api-design
version: 1.0.0
framework: rust
category: api
triggers:
  - "Rust API"
  - "axum web service"
  - "Rust REST backend"
  - "tokio async HTTP"
author: "@nexus-framework/skills"
status: active
---

# Skill: API Design & Asynchronous Services (Rust / Axum)

## When to Read This
Read this skill when building web services in Rust using `axum` and `tokio`, configuring shared state extractors, implementing type-safe middleware layers, crafting custom extractors, mapping error enums to HTTP responses (`IntoResponse`), or structuring production REST APIs.

## Context
Rust web APIs built on `axum`, `tower`, and `tokio` offer memory safety, high throughput, and zero-cost abstractions. We design services around explicit state sharing (`Arc<AppState>`), strongly typed request extractors, zero-allocation serialization with `serde`, and centralized error conversion using custom enums implementing `IntoResponse`. Every service must implement structured telemetry (`tracing`), timeouts, panic catching, and graceful termination.

## Steps
1. **Model Shared State Thread-Safely**: Encapsulate database pools, caches, and HTTP clients in an immutable `AppState` wrapped in `std::sync::Arc`, exposed to handlers via `axum::extract::State`.
2. **Structure Clean Layered Routing**: Group domain routes into modular sub-routers (`axum::Router`) merged into a root application with version prefixes (`/api/v1`).
3. **Define Type-Safe Request DTOs**: Derive `serde::Deserialize` on strict structs with validation rules, using custom or community extractors (e.g. `axum_valid` or validator integration).
4. **Implement Centralized Error Conversion**: Define an application error enum (`AppError`) that encapsulates domain, validation, and database errors, implementing `IntoResponse` to return RFC 9457 Problem Details while logging diagnostics via `tracing`.
5. **Attach Tower Middleware Stack**: Configure standard layers for request tracing (`tower_http::trace::TraceLayer`), panic recovery (`tower_http::catch_panic::CatchPanicLayer`), timeout enforcement, and CORS.
6. **Instrument Route Handlers**: Annotate critical handlers and internal async functions with `#[tracing::instrument(skip(state))]` to track latency spans and request correlation IDs.
7. **Configure Graceful Shutdown**: Bind server execution to `tokio::signal::ctrl_c()` and platform-specific termination signals to allow active requests to finish draining.

## Patterns We Use
- **AppState and Router Setup**:
  ```rust
  use axum::{Router, routing::{get, post}};
  use std::sync::Arc;

  #[derive(Clone)]
  pub struct AppState {
      pub db_pool: sqlx::PgPool,
      pub config: AppConfig,
  }

  pub fn build_app(state: Arc<AppState>) -> Router {
      Router::new()
          .route("/v1/users", post(create_user))
          .route("/v1/users/:id", get(get_user))
          .with_state(state)
  }
  ```
- **Error Enum with `IntoResponse`**:
  ```rust
  use axum::{
      http::StatusCode,
      response::{IntoResponse, Response},
      Json,
  };
  use serde_json::json;

  #[derive(Debug, thiserror::Error)]
  pub enum AppError {
      #[error("Entity not found: {0}")]
      NotFound(String),
      #[error("Conflict: {0}")]
      Conflict(String),
      #[error("Validation failed: {0}")]
      Validation(String),
      #[error("Internal database error")]
      Database(#[from] sqlx::Error),
  }

  impl IntoResponse for AppError {
      fn into_response(self) -> Response {
          let (status, title, detail) = match self {
              AppError::NotFound(msg) => (StatusCode::NOT_FOUND, "Not Found", msg),
              AppError::Conflict(msg) => (StatusCode::CONFLICT, "Conflict", msg),
              AppError::Validation(msg) => (StatusCode::UNPROCESSABLE_ENTITY, "Validation Error", msg),
              AppError::Database(err) => {
                  tracing::error!(error = ?err, "database query failed");
                  (
                      StatusCode::INTERNAL_SERVER_ERROR,
                      "Internal Server Error",
                      "An unexpected database error occurred.".to_string(),
                  )
              }
          };

          let body = Json(json!({
              "type": "about:blank",
              "title": title,
              "status": status.as_u16(),
              "detail": detail,
          }));

          (status, body).into_response()
      }
  }
  ```
- **Graceful Shutdown Signal Listener**:
  ```rust
  async fn shutdown_signal() {
      tokio::signal::ctrl_c()
          .await
          .expect("failed to install CTRL+C signal handler");
      tracing::info!("shutdown signal received, draining active connections");
  }
  ```

## Anti-Patterns — Never Do This
- ❌ **Do not use `unwrap()` or `expect()` in HTTP handlers**: Any panic terminates the active thread/task and crashes unhandled connections; always return `Result<T, AppError>`.
- ❌ **Do not leak internal database errors or SQL queries to HTTP clients**: Never serialize raw `sqlx::Error` or internal connection errors into response bodies; log them with `tracing::error!` and return a sanitized RFC 9457 response.
- ❌ **Do not block Tokio async threads with synchronous compute or std I/O**: Never call `std::thread::sleep` or blocking `std::fs` operations inside async handler functions; use `tokio::time::sleep`, `tokio::fs`, or `tokio::task::spawn_blocking`.
- ❌ **Do not share mutable state with raw `Mutex` across await points without care**: Using `std::sync::Mutex` across `.await` points violates Tokio scheduling and can cause deadlocks; use `tokio::sync::Mutex` only when necessary, or favor channels and immutable state.
- ❌ **Do not accept unbounded request bodies**: Guard against memory exhaustion by configuring `axum::extract::DefaultBodyLimit` or using streaming request bodies with byte limits.
- ❌ **Do not clone large data structures unnecessarily**: Leverage Rust references and zero-copy deserialization where possible instead of cloning models.

## Example

```rust
// src/main.rs
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{net::SocketAddr, sync::Arc};
use tower_http::trace::TraceLayer;
use uuid::Uuid;

// --- State ---
#[derive(Clone)]
pub struct AppState {
    // In production, include database pool or connection client
    pub app_name: String,
}

// --- DTOs ---
#[derive(Debug, Deserialize)]
pub struct CreateUserPayload {
    pub email: String,
    pub name: String,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub name: String,
}

// --- Custom Error ---
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("Validation failed: {0}")]
    InvalidInput(String),
    #[error("User not found")]
    NotFound,
    #[error("Internal error")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, title, detail) = match self {
            ApiError::InvalidInput(msg) => (StatusCode::UNPROCESSABLE_ENTITY, "Validation Failed", msg),
            ApiError::NotFound => (StatusCode::NOT_FOUND, "Not Found", "Resource was not found".into()),
            ApiError::Internal(err) => {
                tracing::error!(error = ?err, "internal server failure");
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error", "An error occurred".into())
            }
        };

        (
            status,
            Json(json!({
                "type": "about:blank",
                "title": title,
                "status": status.as_u16(),
                "detail": detail
            })),
        ).into_response()
    }
}

// --- Handlers ---
#[tracing::instrument(skip(_state))]
pub async fn create_user(
    State(_state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserPayload>,
) -> Result<(StatusCode, Json<UserResponse>), ApiError> {
    if payload.email.is_empty() || !payload.email.contains('@') {
        return Err(ApiError::InvalidInput("Email is invalid or empty".into()));
    }

    let user = UserResponse {
        id: Uuid::new_v4(),
        email: payload.email,
        name: payload.name,
    };

    Ok((StatusCode::CREATED, Json(user)))
}

pub async fn get_user(
    State(_state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<UserResponse>, ApiError> {
    // Simulated lookup
    if id == Uuid::nil() {
        return Err(ApiError::NotFound);
    }

    Ok(Json(UserResponse {
        id,
        email: "user@example.com".into(),
        name: "Rust Developer".into(),
    }))
}

// --- Application Builder ---
pub fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/v1/users", post(create_user))
        .route("/v1/users/:id", get(get_user))
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let state = Arc::new(AppState {
        app_name: "Nexus API".to_string(),
    });

    let app = app(state);
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    tracing::info!("listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
```
