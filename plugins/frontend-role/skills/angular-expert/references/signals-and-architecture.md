# Modern Angular Signals & Architecture Reference

## 1. Signal-First Component API (Angular 17.1+ / 19+)
- **Inputs & Outputs**: Use `input()` / `input.required<T>()` and `output<T>()` instead of `@Input()` and `@Output()` decorators:
  ```ts
  readonly user = input.required<User>();
  readonly saved = output<User>();
  ```
- **Two-Way Binding (`model()`)**: Use `model<T>()` when a component exposes a two-way bindable signal (`[(checked)]`).
- **View Queries**: Prefer signal queries `viewChild()`, `viewChildren()`, `contentChild()`, and `contentChildren()` over `@ViewChild` decorators.

## 2. Derived State: `computed()` & `linkedSignal()`
- **`computed()`**: Derive synchronous read-only state from other signals. Keep `computed` callbacks pure and free of side effects.
- **`linkedSignal()` (Angular 19+)**: Use `linkedSignal` for writable local state that automatically resets whenever an upstream source signal changes (e.g., resetting selected pagination page or active draft option when `selectedCategory()` changes):
  ```ts
  readonly selectedOption = linkedSignal(() => this.options()[0] ?? null);
  ```
- **Avoid `effect()` for State Synchronization**: Use `effect()` strictly for logging, analytics, DOM APIs, or syncing to `localStorage`—never to copy one signal's value into another when `computed()` or `linkedSignal()` fits.

## 3. Async Data with `resource()` / `rxResource()` & RxJS Interop
- **`resource()` & `rxResource()`**: Bind reactive signal parameters to asynchronous data loaders cleanly, exposing `.value()`, `.isLoading()`, `.error()`, and `.reload()`.
- **RxJS Interop (`@angular/core/rxjs-interop`)**:
  - Convert Observables to Signals at the component boundary via `toSignal(obs$, { initialValue })`.
  - Convert Signals to Observables when complex RxJS operators (`switchMap`, `debounceTime`, `retry`) are needed via `toObservable(querySignal)`.
  - Always use `takeUntilDestroyed()` for manual subscriptions instead of manual `Subject` teardown in `ngOnDestroy`.
