---
name: forms-and-validation
description: >-
  Use this skill when building forms, multi-step wizards, or input validation flows using React Hook Form, Zod/Valibot schema resolvers, Angular Reactive/Signal Forms, or native form actions.
---

# Forms & Validation Skill

Follow these guidelines when building resilient, accessible, and user-friendly forms:

## 1. React Hook Form + Schema Validation (`Zod` / `Valibot`)
- **Uncontrolled performance with type-safe schemas**: In React projects, use **React Hook Form** (`useForm`) paired with `@hookform/resolvers/zod` (or `valibot`) as the single source of truth for both runtime validation and TypeScript types (`z.infer<typeof formSchema>`).
- **Default values**: Always pass complete explicit `defaultValues` to `useForm` to prevent uncontrolled-to-controlled input warnings and enable reliable `reset()` behavior.
- **Validation mode**: Prefer `mode: 'onTouched'` or `'onBlur'` with re-validation `'onChange'` after the first error so users are not punished with red errors while typing their first characters.
- **Dynamic fields & controlled primitives**: Use `useFieldArray` for dynamic repeatable lists (always using `field.id` as the `key`), and wrap third-party headless UI primitives (Select, DatePicker, Switch) with `<Controller />` or `useController`.

## 2. Submission Lifecycle & Server Errors
- **Submission state**: Disable or show a spinner on the submit button using `formState.isSubmitting` to prevent duplicate submissions while preserving keyboard focus.
- **Server-side validation mapping**: Map field-level errors returned by the API back into the form via `setError('fieldName', { type: 'server', message })` and display non-field errors in a top-level alert (`root.serverError`).
- **Dirty state protection**: Warn users before navigating away when `formState.isDirty` is true on long or critical forms.

## 3. Form Accessibility (WCAG Compliance)
- Every input must have a programmatic `<label htmlFor={id}>` (never rely on `placeholder` alone as a label).
- Wire validation errors to inputs using `aria-invalid={!!error}` and `aria-describedby={`${id}-error`}`, and render error messages with `role="alert"` or `aria-live="polite"`.
- On failed submission, automatically move focus to the first invalid field (`shouldFocusError: true` in React Hook Form).
