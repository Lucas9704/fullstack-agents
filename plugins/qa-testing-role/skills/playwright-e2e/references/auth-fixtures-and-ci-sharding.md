# Playwright Auth `storageState`, Custom Fixtures & CI Sharding Reference

## 1. Fast Authentication with Setup Projects & `storageState`
Never log in through the UI before every single E2E test. Authenticate once in an `auth.setup.ts` project, persist cookies/storage to `playwright/.auth/user.json`, and reuse it across dependent browser projects:

```ts
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate standard user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.context().storageState({ path: authFile });
});
```

## 2. Composable Fixtures (`test.extend`) Over Global BeforeEach
Encapsulate Page Objects and API data seeding inside typed Playwright fixtures with automatic teardown:

```ts
import { test as base, expect } from '@playwright/test';
import { OrdersPage } from './pages/orders-page';

type Fixtures = {
  ordersPage: OrdersPage;
  seededOrderId: string;
};

export const test = base.extend<Fixtures>({
  seededOrderId: async ({ request }, use) => {
    const res = await request.post('/api/test/orders', { data: { totalCents: 4500 } });
    const { id } = await res.json();
    await use(id);
    await request.delete(`/api/test/orders/${id}`);
  },
  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },
});
export { expect };
```

## 3. Trace Viewer, Retries & CI Sharding
- Configure `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, and `retries: process.env.CI ? 2 : 0` in `playwright.config.ts`.
- Parallelize large suites across CI runners using `--shard=1/4` and merge HTML/blob reports with `npx playwright merge-reports`.
