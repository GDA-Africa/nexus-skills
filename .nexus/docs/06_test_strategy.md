---
nexus_doc: true
id: "06_test_strategy"
title: "Test Strategy"
status: template
confidence: low
last_updated: "2026-08-10"
---

# Test Strategy

**Project:** NEXUS CLI
**Framework:** vitest

---

## 🧪 Testing Philosophy
<!-- Coverage target, what gets tested, what doesn't -->

**Coverage Target:** 80%+

## 📋 Test Types

| Type | Tool | Coverage |
|------|------|----------|
| Unit | vitest | Core logic, utilities, validators |
| Integration | vitest | API routes, data flows |
| E2E | Playwright | Critical user journeys |

## 🏃 Running Tests

```bash
yarn test              # Run all tests
yarn test -- --watch   # Watch mode
```
