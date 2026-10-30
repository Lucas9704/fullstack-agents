# Vitest Workspaces, Advanced Mocking, Browser Mode & MSW v2 Reference

## 1. Vitest Configuration & Multi-Project Workspaces (`vitest.config.ts`)
Separate fast Node.js unit tests from DOM/Browser component tests using `projects` so pure unit tests don't pay DOM initialization overhead:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.unit.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'ui',
          include: ['src/**/*.ui.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/test/setup-ui.ts'],
        },
      },
    ],
  },
});
```

## 2. Hoisted Mocks (`vi.hoisted`) & Partial Module Mocking
Because `vi.mock()` is hoisted above `import` statements, always use `vi.hoisted()` when sharing mock references:

```ts
import { describe, expect, it, vi } from 'vitest';
import { notifyUser } from './notifications';

const { sendEmailMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn().mockResolvedValue({ messageId: 'msg_123' }),
}));

vi.mock('./mailer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./mailer')>();
  return {
    ...actual,
    sendEmail: sendEmailMock,
  };
});

describe('notifyUser', () => {
  it('sends a formatted email', async () => {
    await notifyUser('user@example.com');
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com' })
    );
  });
});
```

## 3. MSW v2 (`msw/node`) Integration in Vitest Setup
Configure Mock Service Worker v2 in `src/test/setup-ui.ts` with `onUnhandledRequest: 'error'` so unmocked network calls fail deterministically:

```ts
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.get('https://api.example.com/user', () => {
    return HttpResponse.json({ id: 'usr_1', name: 'Ada' });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 4. Vitest Browser Mode (`@vitest/browser`) & Type Testing (`expectTypeOf`)
- When testing real CSS layout, focus traps, or browser-native APIs (`IntersectionObserver`, `ResizeObserver`, Canvas), prefer `@vitest/browser` with the `playwright` provider in headless mode over `jsdom`.
- Use `expectTypeOf(result).toEqualTypeOf<ExpectedType>()` to assert compile-time TypeScript types directly inside Vitest suites.
