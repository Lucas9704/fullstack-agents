# React Hook Form + Zod Recipes Reference

## 1. Standard Form Setup with `shadcn/ui` & `<Controller />`
- Bind `useForm` to a `zod` schema via `zodResolver(formSchema)` and infer the form values type with `type FormValues = z.infer<typeof formSchema>`.
- Use `register()` for native HTML `<input>` / `<textarea>` elements, and `<Controller />` (or `FormField` wrapper in `shadcn/ui`) for controlled custom primitives (`Select`, `Checkbox`, `Switch`, `DatePicker`):
  ```tsx
  <Controller
    control={form.control}
    name="role"
    render={({ field, fieldState }) => (
      <Select value={field.value} onValueChange={field.onChange}>
        <SelectTrigger aria-invalid={fieldState.invalid} />
        <SelectContent>...</SelectContent>
      </Select>
    )}
  />
  ```

## 2. Dynamic Field Arrays (`useFieldArray`)
- Use `const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'items' })`.
- **Critical Rule**: Always use `key={field.id}` on the rendered row element—never use the loop `index` as the React `key`, which corrupts input state on row deletion or reordering.
- Validate minimum/maximum array length at the Zod array schema level (`z.array(itemSchema).min(1, 'Add at least one item')`).

## 3. Multi-Step Wizards
- Maintain a single shared `useForm` instance (wrapped in `<FormProvider {...methods}>`) across wizard steps, or persist validated step slices into a scoped store.
- Validate only the active step's fields before advancing using `const isStepValid = await form.trigger(['fieldA', 'fieldB'])`, moving focus to the first invalid field when `isStepValid` is `false`.

## 4. File Uploads & Refinements
- Validate file presence, MIME type (`file.type`), and size (`file.size <= MAX_BYTES`) using `z.instanceof(File)` or `z.custom<FileList>()` with `.refine()`.
- Use `superRefine()` for cross-field validation (such as password confirmation or start/end date ranges) and attach the error path explicitly (`path: ['confirmPassword']`).
