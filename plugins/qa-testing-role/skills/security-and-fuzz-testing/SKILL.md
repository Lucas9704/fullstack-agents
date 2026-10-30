---
name: security-and-fuzz-testing
description: >-
  Use this skill when writing automated security tests (OWASP API Top 10, BOLA/IDOR, auth bypass, SQLi/XSS payloads), Supabase RLS pgTAP policy tests, or property-based and fuzz tests (fast-check, Hypothesis, Go fuzzing, cargo-fuzz).
---

# Security, RLS & Property-Based Fuzz Testing Skill

Follow these guidelines to uncover edge-case crashes, invariant violations, and authorization flaws:

## 1. Authorization Matrix & BOLA/IDOR Testing
- For every protected endpoint or Supabase table, write an explicit **Cross-Tenant / Cross-User Access Test**:
  1. Seed resource `R` owned by `User A` (or `Tenant A`).
  2. Authenticate as `User B` (or `Tenant B`) and attempt `GET`, `PATCH/PUT`, and `DELETE` on `R`.
  3. Assert that the API returns `403 Forbidden` or `404 Not Found` (or `0 rows` under Supabase RLS) and that `R` remains unmodified in the database.
- Test privilege escalation by sending admin-only fields (`role: 'admin'`, `is_verified: true`, `balance: 99999`) in standard user update payloads (Mass Assignment check).

## 2. Property-Based & Fuzz Testing (`fast-check` / `Hypothesis` / `go test -fuzz`)
- Use property-based testing (`fc.assert(fc.property(...))` in TypeScript/Vitest, `Hypothesis` in Python, `f.Fuzz(...)` in Go) for parsers, serializers, financial/math calculations, state machines, and validation schemas:
  - **Round-trip invariant**: `decode(encode(x)) === x`.
  - **Idempotency invariant**: `normalize(normalize(x)) === normalize(x)`.
  - **Crash-freedom**: Arbitrary untrusted strings, Unicode, negative numbers, `NaN`, and boundary integers (`MAX_SAFE_INTEGER`) never trigger unhandled exceptions or infinite loops.

## 3. Input Sanitization & Boundary Payloads
- Include adversarial input vectors in validation tests: empty strings, whitespace-only strings, oversized payloads (`> 1MB`), SQL meta-characters (`' OR 1=1--`), HTML/SVG script payloads (`<img src=x onerror=alert(1)>`), and path traversal sequences (`../../etc/passwd`).
