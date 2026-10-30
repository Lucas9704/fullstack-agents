# React 19 Patterns & Compiler Reference

## 1. Actions & Async Transitions
- **`useActionState`**: Manage form/mutation pending states, returned results, and error states cleanly without manual `isLoading` boilerplate:
  ```tsx
  const [state, formAction, isPending] = useActionState(submitAction, initialState);
  ```
- **`useFormStatus`**: Read the parent `<form>` pending state inside design-system submit buttons (`const { pending } = useFormStatus()`) without prop drilling.
- **`useOptimistic`**: Immediately reflect expected UI updates while an async action is in flight, automatically reverting if the action fails:
  ```tsx
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, newItem: Item) => [...state, { ...newItem, pending: true }]
  );
  ```

## 2. The `use()` API
- **Unwrapping Promises**: Pass a Promise created in a Server Component (or cached client query layer) to a Client Component and read it during render with `const data = use(dataPromise)` wrapped in `<Suspense>` and an `<ErrorBoundary>`.
- **Conditional Context Reading**: Unlike `useContext`, `use(ThemeContext)` can be called conditionally after early returns or inside loops.

## 3. Simplified `ref` & Context
- **`ref` as a Standard Prop**: Function components now accept `ref` directly in their props signature (`function Input({ ref, ...props }: ComponentProps<'input'>)`)—`forwardRef` is no longer needed in React 19.
- **Ref Cleanup Functions**: Callback refs can return a cleanup function (`ref={(node) => { ...; return () => cleanup(); }}`).
- **`<Context>` as Provider**: Render `<ThemeContext value={theme}>` directly instead of `<ThemeContext.Provider value={theme}>`.

## 4. React Compiler Compatibility
- Keep render functions pure and idempotent: never mutate props, state, or hook arguments in place.
- When React Compiler (`babel-plugin-react-compiler`) is active, avoid adding manual `useMemo`/`useCallback` unless profiling proves a specific external reference identity is required.
