# Tailwind CSS v4, Design Tokens & CVA Reference

## 1. CSS-First Theme Configuration (Tailwind v4)
- Define design tokens in CSS variables and expose them via `@theme` (or `@theme inline` when mapping runtime CSS custom properties for light/dark themes):
  ```css
  @import "tailwindcss";

  :root {
    --background: oklch(0.99 0 0);
    --foreground: oklch(0.15 0.01 260);
    --primary: oklch(0.55 0.22 260);
    --primary-foreground: oklch(0.99 0 0);
  }

  .dark {
    --background: oklch(0.14 0.01 260);
    --foreground: oklch(0.96 0 0);
    --primary: oklch(0.68 0.19 260);
    --primary-foreground: oklch(0.14 0.01 260);
  }

  @theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
  }
  ```

## 2. Type-Safe Component Variants with `cva`
- Structure reusable UI primitives with `cva` and export `VariantProps<typeof buttonVariants>` alongside the component:
  ```tsx
  const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2",
    {
      variants: {
        variant: {
          default: "border-transparent bg-primary text-primary-foreground",
          secondary: "border-transparent bg-secondary text-secondary-foreground",
          destructive: "border-transparent bg-destructive text-destructive-foreground",
          outline: "text-foreground",
        },
        size: {
          sm: "px-2 py-0.25 text-[11px]",
          md: "px-2.5 py-0.5 text-xs",
        },
      },
      compoundVariants: [
        {
          variant: "outline",
          size: "sm",
          className: "border-dashed",
        },
      ],
      defaultVariants: {
        variant: "default",
        size: "md",
      },
    }
  );
  ```

## 3. Polymorphic Composition (`asChild` / Radix `Slot`)
- Support the `asChild` pattern (via `@radix-ui/react-slot`) on interactive primitives (`Button`, `Badge`, `Trigger`) so consumers can compose a router `<Link>` inside a `<Button asChild>` without rendering invalid nested `<button><a>` HTML.
