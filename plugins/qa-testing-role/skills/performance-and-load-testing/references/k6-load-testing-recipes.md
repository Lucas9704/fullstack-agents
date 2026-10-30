# k6 Load, Stress & Spike Testing Recipes Reference

## 1. Production-Grade `k6` Script with SLO Thresholds
Run with `k6 run load-test.js`:

```js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', () => [
  { tenantId: 't_1', token: __ENV.TEST_TOKEN_1 || 'dev-token' },
]);

export const options = {
  scenarios: {
    average_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },  // Ramp-up
        { duration: '3m', target: 50 },  // Sustained load
        { duration: '30s', target: 0 },  // Ramp-down
      ],
      gracefulRampDown: '15s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],                       // < 1% error rate
    http_req_duration: ['p(95)<300', 'p(99)<750'],        // Tail latency SLOs
    'http_req_duration{endpoint:list_orders}': ['p(95)<200'],
  },
};

export default function () {
  const user = users[__VU % users.length];
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

  const res = http.get(`${baseUrl}/api/v1/orders?limit=20`, {
    headers: { Authorization: `Bearer ${user.token}` },
    tags: { endpoint: 'list_orders' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'returns items array': (r) => Array.isArray(r.json('items')),
  });

  sleep(1);
}
```

## 2. Constant Arrival Rate (Open Workload Model)
When testing strict throughput targets (e.g., `200 RPS`) regardless of backend slowdown, use `executor: 'constant-arrival-rate'` with `rate: 200`, `timeUnit: '1s'`, `preAllocatedVUs: 50`, and `maxVUs: 200`.
