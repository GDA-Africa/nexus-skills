---
skill: testing
version: 1.0.0
framework: go
category: testing
triggers:
  - "Go tests"
  - "Go testing patterns"
  - "table driven tests"
  - "Go test race"
author: "@nexus-framework/skills"
status: active
---

# Skill: Testing Strategies & Table-Driven Tests (Go)

## When to Read This
Read this skill when writing unit tests, integration tests, HTTP handler verification, table-driven suites, mock stores, or concurrency race checks for Go applications.

## Context
Go testing is built around standard library primitives (`testing`, `net/http/httptest`). Idiomatic Go tests favor table-driven tests, explicit subtests (`t.Run`), deterministic cleanup (`t.Cleanup`), and interface-based fakes over complex reflection-heavy mock generation frameworks. Every test suite must pass with `go test -race ./...` and ensure zero goroutine leaks.

## Steps
1. **Adopt Table-Driven Structures**: Group test cases into a slice of structs declaring inputs, expected outputs, and error expectations.
2. **Execute Subtests with `t.Run`**: Iterate through cases and invoke `t.Run(tc.name, func(t *testing.T) { ... })` for granular test reporting and isolated failure messages.
3. **Annotate Helpers with `t.Helper()`**: Place `t.Helper()` as the first line of any test assertion or setup utility so compiler stack traces report the actual test callsite.
4. **Schedule Teardown with `t.Cleanup`**: Register teardown routines (closing database connections, removing temporary test files) with `t.Cleanup(func() { ... })` rather than manual `defer` statements.
5. **Verify Handlers with `net/http/httptest`**: Test HTTP handlers directly by synthesizing requests with `httptest.NewRequest` and inspecting outcomes using `httptest.NewRecorder`.
6. **Implement Lightweight In-Memory Fakes**: Satisfy domain interfaces with explicit in-memory structs containing mutex-guarded maps or closures instead of opaque generated mock frameworks.
7. **Run Concurrency Race Detection**: Always validate test suites with `go test -race -count=1 ./...` to guarantee thread safety across concurrent goroutines.

## Patterns We Use
- **Idiomatic Table-Driven Test**:
  ```go
  func TestValidateEmail(t *testing.T) {
      tests := []struct {
          name    string
          email   string
          wantErr bool
      }{
          {name: "valid email", email: "user@example.com", wantErr: false},
          {name: "empty email", email: "", wantErr: true},
          {name: "missing at sign", email: "invalid.domain", wantErr: true},
      }

      for _, tc := range tests {
          t.Run(tc.name, func(t *testing.T) {
              err := ValidateEmail(tc.email)
              if (err != nil) != tc.wantErr {
                  t.Fatalf("ValidateEmail(%q) error = %v, wantErr = %v", tc.email, err, tc.wantErr)
              }
          })
      }
  }
  ```
- **Test Helper with `t.Helper()` and `t.Cleanup`**:
  ```go
  func setupTestDB(t *testing.T) *sql.DB {
      t.Helper()
      db, err := sql.Open("sqlite", ":memory:")
      if err != nil {
          t.Fatalf("failed to open in-memory db: %v", err)
      }
      
      t.Cleanup(func() {
          _ = db.Close()
      })
      return db
  }
  ```
- **HTTP Handler Verification with `httptest`**:
  ```go
  func TestUserHandler_Create(t *testing.T) {
      fakeStore := &FakeUserStore{
          CreateFunc: func(ctx context.Context, email, name string) (*User, error) {
              return &User{ID: "usr_123", Email: email, Name: name}, nil
          },
      }
      handler := NewUserHandler(fakeStore, slog.Default())

      body := `{"email":"test@example.com","name":"Alice"}`
      req := httptest.NewRequest(http.MethodPost, "/v1/users", strings.NewReader(body))
      req.Header.Set("Content-Type", "application/json")
      rec := httptest.NewRecorder()

      handler.handleCreateUser(rec, req)

      res := rec.Result()
      defer res.Body.Close()

      if res.StatusCode != http.StatusCreated {
          t.Fatalf("expected status 201 Created, got %d", res.StatusCode)
      }
  }
  ```
- **Parallel Testing Discipline**:
  ```go
  func TestProcessItem(t *testing.T) {
      t.Parallel()
      // Safe to run concurrently with other t.Parallel() tests
  }
  ```

## Anti-Patterns — Never Do This
- ❌ **Do not use global mutable state across tests**: Never modify package-level variables or singletons without resetting them in `t.Cleanup()`.
- ❌ **Do not forget `t.Helper()` in custom assert functions**: Without `t.Helper()`, failure messages point to the utility function instead of the offending test line, complicating debugging.
- ❌ **Do not ignore errors in tests with `_ = ...`**: If an operation (e.g. JSON unmarshaling, file reading, DB write) can fail, assert on `err == nil` or fail with `t.Fatalf`.
- ❌ **Do not use `time.Sleep` to wait for goroutines**: Never synchronize async operations using arbitrary sleeps; use channels, `sync.WaitGroup`, or `context.Done()`.
- ❌ **Do not commit flaky race conditions**: Tests that fail intermittently under `-race` represent real production concurrency bugs.
- ❌ **Do not generate hundreds of lines of brittle reflection mocks for tiny interfaces**: Define focused 1-2 method interfaces and stub them with simple test fakes.

## Example

```go
// internal/handler/user_test.go
package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nexus/api/internal/handler"
	"github.com/nexus/api/internal/model"
)

// --- In-Memory Test Fake ---
type FakeUserStore struct {
	CreateFn  func(ctx context.Context, email, name string) (*model.User, error)
	GetByIDFn func(ctx context.Context, id string) (*model.User, error)
}

func (f *FakeUserStore) Create(ctx context.Context, email, name string) (*model.User, error) {
	if f.CreateFn != nil {
		return f.CreateFn(ctx, email, name)
	}
	return nil, errors.New("not implemented")
}

func (f *FakeUserStore) GetByID(ctx context.Context, id string) (*model.User, error) {
	if f.GetByIDFn != nil {
		return f.GetByIDFn(ctx, id)
	}
	return nil, errors.New("not implemented")
}

// --- Test Suite ---
func TestUserHandler_CreateUser(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    string
		mockCreate     func(ctx context.Context, email, name string) (*model.User, error)
		expectedStatus int
		expectInBody   string
	}{
		{
			name:        "successful creation",
			requestBody: `{"email":"alex@example.com","name":"Alex River"}`,
			mockCreate: func(ctx context.Context, email, name string) (*model.User, error) {
				return &model.User{ID: "usr_999", Email: email, Name: name}, nil
			},
			expectedStatus: http.StatusCreated,
			expectInBody:   `"id":"usr_999"`,
		},
		{
			name:           "missing required email",
			requestBody:    `{"name":"Alex River"}`,
			mockCreate:     nil,
			expectedStatus: http.StatusUnprocessableEntity,
			expectInBody:   "validation error",
		},
		{
			name:           "malformed json payload",
			requestBody:    `{"email": unclosed`,
			mockCreate:     nil,
			expectedStatus: http.StatusBadRequest,
			expectInBody:   "Invalid Request Body",
		},
		{
			name:        "database store failure",
			requestBody: `{"email":"fail@example.com","name":"Fail"}`,
			mockCreate: func(ctx context.Context, email, name string) (*model.User, error) {
				return nil, errors.New("database connection timeout")
			},
			expectedStatus: http.StatusInternalServerError,
			expectInBody:   "Internal Server Error",
		},
	}

	discardLogger := slog.New(slog.NewTextHandler(io.Discard, nil))

	for _, tc := range tests {
		tc := tc // Capture loop var
		t.Run(tc.name, func(t *testing.T) {
			store := &FakeUserStore{CreateFn: tc.mockCreate}
			h := handler.NewUserHandler(store, discardLogger)

			req := httptest.NewRequest(http.MethodPost, "/v1/users", bytes.NewBufferString(tc.requestBody))
			rec := httptest.NewRecorder()

			mux := http.NewServeMux()
			h.RegisterRoutes(mux)
			mux.ServeHTTP(rec, req)

			res := rec.Result()
			defer res.Body.Close()

			if res.StatusCode != tc.expectedStatus {
				t.Fatalf("expected status %d, got %d", tc.expectedStatus, res.StatusCode)
			}

			bodyBytes, err := io.ReadAll(res.Body)
			if err != nil {
				t.Fatalf("failed to read response body: %v", err)
			}

			if !bytes.Contains(bytes.ToLower(bodyBytes), bytes.ToLower([]byte(tc.expectInBody))) {
				t.Errorf("expected body to contain %q, got: %s", tc.expectInBody, string(bodyBytes))
			}
		})
	}
}
```
