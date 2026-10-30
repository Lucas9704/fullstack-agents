---
name: auth-and-api-security
description: >-
  Use this skill when implementing or auditing authentication (JWT, OAuth2/OIDC, Sessions, Passkeys), authorization (RBAC, ABAC, BOLA/IDOR prevention), rate limiting, CORS, password hashing, OWASP API Security Top 10 protections, or running automated backend stack and security audits.
---

# Authentication, Authorization & API Security Skill

Follow these guidelines when designing or auditing backend security controls:

## 1. Authentication & Token Hygiene
- **Password Storage**: Hash passwords exclusively with memory-hard algorithms (**Argon2id** preferred, or `bcrypt` with cost >= 12 / `scrypt`). Never use raw SHA-256/MD5.
- **Session & JWT Lifecycle**:
  - Keep access tokens short-lived (`5–15 min`) and validate `iss`, `aud`, `exp`, and explicit allowed signing algorithms (never accept `alg: "none"`).
  - Store browser tokens in `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict`) cookies rather than `localStorage` to mitigate XSS token theft, and implement refresh token rotation with reuse detection.
- **Constant-Time Comparisons**: Always compare API keys, webhook signatures, and reset tokens using constant-time functions (`crypto.timingSafeEqual` / `hmac.compare_digest` / `subtle.ConstantTimeCompare`).

## 2. Authorization & OWASP API Top 10
- **Prevent BOLA / IDOR (API1)**: Never trust resource IDs from URL params or bodies alone. Scope every database read/update/delete query to the authenticated principal (`WHERE id = $1 AND tenant_id = $2`).
- **Prevent Mass Assignment / BOPLA (API3)**: Never bind request bodies directly to database models or ORM entities. Explicitly whitelist allowed fields in dedicated input DTOs (`CreateUserInput` vs `AdminUpdateUserInput`).
- **Rate Limiting & Resource Quotas (API4)**: Enforce per-IP and per-user/API-key rate limits (token bucket / sliding window via Redis) on login, password reset, and expensive endpoints, and cap maximum request body sizes and pagination `limit` parameters (e.g., `max 100`).
- **SSRF Protection (API7)**: When fetching user-supplied URLs or webhooks, validate schemes (`https` only), disallow internal/private CIDR ranges (`127.0.0.0/8`, `10.0.0.0/8`, `169.254.169.254`), and disable automatic redirects.

## 3. Executable Helper Scripts (`scripts/`)
- **Detect Multi-Language Backend Stack & Recommended Skills**:
  [scripts/detect-backend-stack.mjs](./scripts/detect-backend-stack.mjs)
  Run: `node <skill_dir>/scripts/detect-backend-stack.mjs <project_root>`
- **Static Security, Concurrency & Supabase/SQL RLS Auditor**:
  [scripts/audit-backend-security-and-sql.mjs](./scripts/audit-backend-security-and-sql.mjs)
  Run: `node <skill_dir>/scripts/audit-backend-security-and-sql.mjs <target_dir_or_file>`
