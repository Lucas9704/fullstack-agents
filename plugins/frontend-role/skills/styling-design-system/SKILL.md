---
name: styling-design-system
description: >-
  Use this skill when styling UI components, building design systems, configuring Tailwind CSS (v3/v4), working with shadcn/ui or CSS variables/tokens, creating component variants with CVA, or implementing responsive layouts and dark mode.
---

# Styling & Design System Skill

Follow these guidelines when authoring styles, UI primitives, and design system components:

## 1. Design Tokens & Semantic Variables
- **Semantic tokens over hardcoded values**: Define and consume CSS custom properties (`--background`, `--foreground`, `--primary`, `--muted`, `--destructive`, `--radius`) mapped to your Tailwind theme rather than scattering raw hex/RGB values across components.
- **Dark Mode**: Support theme switching seamlessly via semantic CSS variables (`.dark` class or `data-theme`) instead of duplicating `dark:` utility chains on every element when tokens can handle it automatically.

## 2. Component Variants & Class Composition
- **Class Variance Authority (`cva`)**: Use `cva` to define structured, type-safe component variants (`variant`, `size`, `state`) with clear `defaultVariants`.
- **Safe Class Merging (`cn` helper)**: Always merge incoming `className` props using `twMerge(clsx(...))` so consumers can override utility classes without specificity conflicts.
- **Headless Primitives (`shadcn/ui` / Radix / CDK)**: Build complex interactive primitives (Dialogs, Popovers, Select, Tabs) on top of accessible headless primitives rather than reinventing keyboard and focus logic from scratch.

## 3. Responsive Design, Layout & Motion
- **Mobile-first**: Write base styles for small viewports and layer breakpoint modifiers (`sm:`, `md:`, `lg:`, `xl:`) progressively; use CSS Grid and Flexbox (`gap`) over margin hacks.
- **Container Queries**: Use `@container` queries for reusable components whose layout depends on their parent container width rather than the global viewport.
- **Accessible Motion**: Respect `prefers-reduced-motion` (`motion-safe:` / `motion-reduce:`) and animate only compositor-friendly properties (`transform`, `opacity`).

## 4. On-Demand Deep-Dive References
- **Tailwind CSS v4 (`@theme`), Compound CVA Variants & Polymorphic `asChild` (`Slot`)**: [references/tailwind-v4-and-cva.md](./references/tailwind-v4-and-cva.md)
