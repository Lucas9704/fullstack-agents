# Multi-Language Unit & Component Testing Patterns Reference

## 1. Testing Library (`@testing-library/react` / `angular`) Query Priority
Query elements the way an assistive technology or human user finds them:
1. **`getByRole`** (`getByRole('button', { name: /save changes/i })`) — always top priority.
2. **`getByLabelText`** — form fields.
3. **`getByPlaceholderText`** / **`getByText`** — non-interactive text content.
4. **`getByTestId`** — explicit escape hatch only when role/text semantics are ambiguous.
- Use `await screen.findByRole(...)` when waiting for asynchronous UI appearance, and `expect(screen.queryByRole(...)).not.toBeInTheDocument()` only when asserting absence.

## 2. Python (`pytest`) Fixtures & Parametrization
- Use `@pytest.mark.parametrize("input_val,expected", [...])` to test boundary tables concisely without duplicating test bodies.
- Keep fixtures explicit and modular in `conftest.py` (using `yield` for deterministic teardown) rather than deeply nested class inheritance hierarchies.

## 3. Go Table-Driven Subtests (`t.Run`)
- Structure Go unit tests using table slices and `t.Run(tc.name, func(t *testing.T) { t.Parallel() ... })`, comparing deep structures with `google/go-cmp/cmp` (`cmp.Diff(want, got)`) or `testify/require`.

## 4. Rust Unit & Integration Tests
- Place white-box unit tests inside `#[cfg(test)] mod tests` at the bottom of the module, and black-box public API integration tests inside the top-level `tests/` directory.
- Use `#[tokio::test]` for async tests and `proptest` for property-based invariants.
