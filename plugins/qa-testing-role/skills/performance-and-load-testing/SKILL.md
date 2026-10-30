---
name: performance-and-load-testing
description: >-
  Use this skill when designing, writing, or analyzing load, stress, spike, and soak tests (k6, Artillery, Locust), defining SLO latency thresholds (p95, p99), or running frontend Lighthouse CI performance budgets.
---

# Performance & Load Testing Skill

Follow these guidelines when verifying system throughput, tail latency, and scalability under load:

## 1. Load Testing Profiles (`k6`)
Design explicit workload profiles according to the failure mode you want to uncover:
- **Smoke Test**: `1–5 VUs` for `30s–1m` to verify the script and baseline health with zero errors.
- **Average Load Test**: Ramp up to expected peak production concurrency and hold for `5–15m` to validate SLOs.
- **Stress & Spike Tests**: Push beyond nominal capacity (or sudden 10x traffic bursts) to verify autoscaling, queue backpressure, rate limiters, and graceful recovery once load subsides.
- **Soak Test**: Sustained load over hours to detect memory leaks, connection pool exhaustion, or disk growth.

## 2. Mandatory SLO Thresholds as Code
- Every load test script must declare pass/fail **thresholds** so CI fails automatically on performance regressions:
  - Error rate: `http_req_failed: ['rate<0.01']` (< 1% errors).
  - Tail Latency: `http_req_duration: ['p(95)<300', 'p(99)<800']` (never evaluate performance using averages/means!).
- Tag requests by endpoint/operation (`tags: { name: 'POST /orders' }`) so high-cardinality URLs with dynamic IDs do not fragment metrics.

## 3. Realistic Test Data & Think Time
- Parameterize virtual users with realistic dataset slices (`SharedArray` in k6) so every request does not hit the exact same cached database row or Redis key.
- Include realistic pacing / `sleep()` think times for user journeys, or use `constant-arrival-rate` executors when testing fixed RPS targets independent of backend response slowdown.

## 4. On-Demand Deep-Dive References
- **Complete `k6` Load, Ramping-VU & Constant-Arrival-Rate Recipes**: [references/k6-load-testing-recipes.md](./references/k6-load-testing-recipes.md)
