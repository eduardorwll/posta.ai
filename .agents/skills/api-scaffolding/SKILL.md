---
name: api-scaffolding
description: REST and GraphQL API scaffolding, framework selection, backend architecture, and production-ready API generation with FastAPI, async patterns, and Pydantic V2.
---

# API Scaffolding & Backend Architecture

Comprehensive framework and patterns for building scalable, resilient, maintainable backend APIs and services using modern asynchronous Python (FastAPI), clean architecture, and robust domain design.

## Core Pillars

1. **Clean Separation of Concerns**:
   - `api/`: Route endpoints, parameter extraction, HTTP status codes, router composition.
   - `schemas/`: Pydantic V2 data validation, request/response models, serialization, sanitization.
   - `services/`: Business logic, domain rules, external AI orchestrations.
   - `repositories/`: Data access, SQL execution, transactional consistency.
   - `core/`: Configurations, security, connection pools, lifespan events.

2. **Async-First & Connection Pooling**:
   - Non-blocking I/O with `async`/`await`.
   - Native connection pooling (e.g. `psycopg_pool.AsyncConnectionPool` or `asyncpg`).
   - Transactional safety: explicit commit on mutations (`INSERT`, `UPDATE`, `DELETE`) with automatic rollback on error.

3. **Pydantic V2 Best Practices**:
   - `ConfigDict(from_attributes=True)` for seamless ORM/Dict mapping.
   - Explicit field validation with `@field_validator`.
   - Graceful backward-compatible enums via `_missing_` fallback hooks.
   - Strict typing without silent type coercion bugs.

4. **Resilience & Production Readiness**:
   - Healthcheck endpoints (`GET /health`) with live DB probe.
   - Structured error handling with proper HTTP status codes (400, 404, 422, 500).
   - Safe file storage handling with atomic writes and cleanup on failure.
   - Security: Explicit CORS configuration, input sanitization, max upload quotas.

5. **Testing Architecture**:
   - Async testing with `pytest-asyncio` and `httpx.AsyncClient(transport=ASGITransport(app=app))`.
   - Isolated integration tests covering success, edge cases, and failure scenarios.

## Sub-modules & References

- `skills/fastapi-templates/`: Full FastAPI starter templates, dependency injection patterns, and database sessions.
- `agents/backend-architect.md`: System boundary design, domain-driven microservices, distributed resilience.
- `agents/fastapi-pro.md`: High-performance async FastAPI engineering, Pydantic V2, query optimization.
- `agents/graphql-architect.md`: GraphQL schema design and DataLoader patterns.
