# Axum, Tower Middleware & SQLx Patterns Reference

## 1. Axum Extractors & RFC 7807 `IntoResponse` Error Pattern
- Order Axum handler parameters with non-body extractors (`State`, `Path`, `Query`, `TypedHeader`) **before** body-consuming extractors (`Json<T>`), as only the final extractor may consume the request body.
- Map typed `thiserror` domain errors cleanly into HTTP responses without leaking internal SQL/IO error strings to clients:
  ```rust
  use axum::{http::StatusCode, response::{IntoResponse, Response}, Json};
  use serde_json::json;

  #[derive(Debug, thiserror::Error)]
  pub enum AppError {
      #[error("Resource not found: {0}")]
      NotFound(String),
      #[error("Validation error: {0}")]
      InvalidInput(String),
      #[error(transparent)]
      Database(#[from] sqlx::Error),
  }

  impl IntoResponse for AppError {
      fn into_response(self) -> Response {
          let (status, title, detail) = match &self {
              AppError::NotFound(msg) => (StatusCode::NOT_FOUND, "Not Found", msg.clone()),
              AppError::InvalidInput(msg) => (StatusCode::BAD_REQUEST, "Bad Request", msg.clone()),
              AppError::Database(err) => {
                  tracing::error!(error = %err, "database failure");
                  (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred".to_string())
              }
          };
          let body = Json(json!({ "title": title, "status": status.as_u16(), "detail": detail }));
          (status, body).into_response()
      }
  }
  ```

## 2. Tower HTTP Middleware Stack (`ServiceBuilder`)
- Compose middleware layers using `tower::ServiceBuilder::new()` including `TraceLayer::new_for_http()`, `TimeoutLayer::new(Duration::from_secs(15))`, `RequestBodyLimitLayer::new(1024 * 1024)`, and `CorsLayer`.

## 3. SQLx Transactions & Compile-Time Checked Queries
- Acquire transactions explicitly (`let mut tx = state.db.begin().await?;`), pass `&mut *tx` into `sqlx::query_as!(...)` calls, and call `tx.commit().await?;`—if the handler returns early via `?`, `tx` automatically rolls back on drop.
