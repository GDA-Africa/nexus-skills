---
skill: api-design
version: 1.0.0
framework: go
category: api
triggers:
  - "Go API"
  - "Go REST handler"
  - "Go backend"
  - "net http routing"
author: "@nexus-framework/skills"
status: active
---

# Skill: API Design & HTTP Services (Go)

## When to Read This
Read this skill when designing HTTP services in Go, writing route handlers with standard library `net/http` or lightweight routers (e.g. `chi`), chaining middleware, managing request contexts, decoding JSON safely, or handling graceful server shutdown.

## Context
Production Go backend services prioritize performance, simplicity, and explicit control over concurrency and memory allocations. We favor standard library primitives (`net/http`, `context`, `log/slog`) and composable interfaces over heavy monolithic frameworks. Every HTTP service must cleanly propagate contexts, limit request payloads to prevent memory exhaustion, log structured attributes with correlation IDs, and terminate cleanly on OS signals.

## Steps
1. **Choose Routing & Mux Architecture**: Use Go 1.22+ enhanced `http.ServeMux` method and path parameter matching (`"GET /v1/users/{id}"`) or `chi.Mux` for sub-routing and middleware grouping.
2. **Implement Composable Middleware**: Construct standard `func(http.Handler) http.Handler` wrappers for panic recovery, request correlation ID generation, structured access logging (`log/slog`), and CORS.
3. **Handle Request Context & Deadlines**: Always propagate `r.Context()`. Respect client cancellations and pass deadlines to database queries and downstream HTTP calls.
4. **Safely Decode JSON Payloads**: Protect against denial-of-service by wrapping request bodies with `http.MaxBytesReader`, using `dec.DisallowUnknownFields()`, and rejecting trailing data.
5. **Standardize Error Responses**: Write consistent JSON error payloads conforming to RFC 9457 (Problem Details), mapping internal errors to appropriate HTTP status codes without leaking stack traces.
6. **Decouple Storage via Interfaces**: Define minimal consumer-driven interfaces in the handler package (`type UserStore interface`) rather than importing concrete database structs.
7. **Configure Production HTTP Server**: Set explicit `ReadHeaderTimeout`, `ReadTimeout`, `WriteTimeout`, and `IdleTimeout` on `http.Server`. Implement graceful shutdown using `signal.NotifyContext`.

## Patterns We Use
- **Middleware Signature**:
  ```go
  func RequestIDMiddleware(next http.Handler) http.Handler {
      return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
          reqID := r.Header.Get("X-Request-ID")
          if reqID == "" {
              reqID = uuid.NewString()
          }
          w.Header().Set("X-Request-ID", reqID)
          ctx := context.WithValue(r.Context(), requestIDKey, reqID)
          next.ServeHTTP(w, r.WithContext(ctx))
      })
  }
  ```
- **Safe JSON Decoding with Size Limits**:
  ```go
  func decodeJSON[T any](w http.ResponseWriter, r *http.Request) (T, error) {
      var target T
      // Limit incoming payload size (e.g. 1MB)
      r.Body = http.MaxBytesReader(w, r.Body, 1048576)
      
      dec := json.NewDecoder(r.Body)
      dec.DisallowUnknownFields()
      
      if err := dec.Decode(&target); err != nil {
          return target, err
      }
      
      // Ensure only a single JSON value exists
      if dec.More() {
          return target, errors.New("request body must contain only a single JSON object")
      }
      return target, nil
  }
  ```
- **Structured Error Response**:
  ```go
  type ProblemDetails struct {
      Type     string `json:"type"`
      Title    string `json:"title"`
      Status   int    `json:"status"`
      Detail   string `json:"detail"`
      Instance string `json:"instance,omitempty"`
  }

  func writeProblem(w http.ResponseWriter, status int, title, detail, instance string) {
      w.Header().Set("Content-Type", "application/problem+json")
      w.WriteHeader(status)
      _ = json.NewEncoder(w).Encode(ProblemDetails{
          Type:     "about:blank",
          Title:    title,
          Status:   status,
          Detail:   detail,
          Instance: instance,
      })
  }
  ```
- **Server Graceful Shutdown**:
  ```go
  ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
  defer stop()

  srv := &http.Server{
      Addr:              ":8080",
      Handler:           router,
      ReadHeaderTimeout: 5 * time.Second,
      ReadTimeout:       15 * time.Second,
      WriteTimeout:      30 * time.Second,
      IdleTimeout:       60 * time.Second,
  }

  go func() {
      if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
          slog.Error("server failed", "error", err)
      }
  }()

  <-ctx.Done()
  shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
  defer cancel()
  if err := srv.Shutdown(shutdownCtx); err != nil {
      slog.Error("forced shutdown", "error", err)
  }
  ```

## Anti-Patterns — Never Do This
- ❌ **Do not use default `http.DefaultServeMux` or `http.ListenAndServe` in production**: `http.DefaultServeMux` is a global shared mutable variable vulnerable to side-effect package collisions. Always construct an explicit `http.NewServeMux()` and a configured `&http.Server{}` with timeouts.
- ❌ **Do not read unbounded request bodies**: Never call `io.ReadAll(r.Body)` without wrapping with `http.MaxBytesReader`; an attacker can stream gigabytes of memory to crash the node with OOM.
- ❌ **Do not ignore `context.Context`**: Never discard `r.Context()` when querying databases or external APIs; canceling a client request must abort downstream work immediately.
- ❌ **Do not log unhandled panics or let them terminate the process**: Always place a recovery middleware at the outer boundary of your HTTP handler stack.
- ❌ **Do not return raw internal database errors to clients**: Never send `pq: syntax error` or internal connection strings to callers. Log details internally with `slog` and return generic client errors.
- ❌ **Do not mutate shared state without synchronization**: Go HTTP handlers execute concurrently in separate goroutines; never write to shared maps or slice buffers without mutexes or atomic primitives.

## Example

```go
// cmd/api/main.go
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// --- Domain Models & Store Interface ---
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateUserRequest struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

type UserStore interface {
	Create(ctx context.Context, email, name string) (*User, error)
	GetByID(ctx context.Context, id string) (*User, error)
}

// --- Handler ---
type UserHandler struct {
	store  UserStore
	logger *slog.Logger
}

func NewUserHandler(store UserStore, logger *slog.Logger) *UserHandler {
	return &UserHandler{store: store, logger: logger}
}

func (h *UserHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /v1/users", h.handleCreateUser)
	mux.HandleFunc("GET /v1/users/{id}", h.handleGetUser)
}

func (h *UserHandler) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	// Guard request body size
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB limit

	var req CreateUserRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid Request Body", err.Error(), r.URL.Path)
		return
	}

	if req.Email == "" || req.Name == "" {
		h.writeError(w, http.StatusUnprocessableEntity, "Validation Error", "email and name are required", r.URL.Path)
		return
	}

	user, err := h.store.Create(r.Context(), req.Email, req.Name)
	if err != nil {
		h.logger.ErrorContext(r.Context(), "failed to create user", "error", err)
		h.writeError(w, http.StatusInternalServerError, "Internal Server Error", "Could not create user", r.URL.Path)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) handleGetUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		h.writeError(w, http.StatusBadRequest, "Invalid Parameter", "user id is required", r.URL.Path)
		return
	}

	user, err := h.store.GetByID(r.Context(), id)
	if err != nil {
		h.writeError(w, http.StatusNotFound, "User Not Found", fmt.Sprintf("User %s does not exist", id), r.URL.Path)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) writeError(w http.ResponseWriter, code int, title, detail, path string) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"type":     "about:blank",
		"title":    title,
		"status":   code,
		"detail":   detail,
		"instance": path,
	})
}
```
