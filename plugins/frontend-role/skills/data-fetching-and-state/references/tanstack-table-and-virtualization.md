# Advanced Data Tables (`TanStack Table`) & Virtualization (`TanStack Virtual`) Reference

## 1. Headless DataTables (`@tanstack/react-table` + `shadcn/ui`)
- **Strict Column Definitions**: Define columns outside the component (or memoized) using `ColumnDef<TData, TValue>[]` or `createColumnHelper<TData>()` to prevent re-creating table instances on every render.
- **Client vs. Server-Side Operations**:
  - **Client-side (< 1,000 rows)**: Use `getSortedRowModel()`, `getFilteredRowModel()`, and `getPaginationRowModel()`.
  - **Server-side (large datasets)**: Enable `manualPagination: true`, `manualSorting: true`, and `manualFiltering: true`, pass `rowCount` (or `pageCount`), and sync `pagination`, `sorting`, and `columnFilters` state directly with URL search params and TanStack Query (`placeholderData: keepPreviousData`).
- **Essential DataTable UX (`shadcn/ui` pattern)**:
  - **Row Selection**: Include an accessible checkbox column (`aria-label="Select all"` / `"Select row"`) and pass a stable `getRowId: (row) => row.id` so selection survives pagination and refetching.
  - **Column Visibility & Pinning**: Provide a toolbar dropdown (`getAllColumns().filter((col) => col.getCanHide())`) and use `columnPinning` for sticky identifier/action columns on wide tables.
  - **Empty, Loading & Error Rows**: Render dedicated `<TableRow><TableCell colSpan={columns.length}>...</TableCell></TableRow>` states inside `<TableBody>` so table headers remain stable.

## 2. Data Virtualization (`@tanstack/react-virtual`)
- **When to Virtualize**: Always virtualize lists, grids, or tables rendering **> 100 complex DOM rows** or **> 500 simple rows** to keep DOM node count low and maintain **INP < 200ms** and 60fps scrolling.
- **Fixed vs. Dynamic Row Heights**:
  - Configure `useVirtualizer` with a scrollable container ref (`getScrollElement: () => parentRef.current`) and an accurate `estimateSize: () => 48`, plus `overscan: 5` to prevent blank flashes during fast scrolling:
    ```tsx
    const rowVirtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: () => tableContainerRef.current,
      estimateSize: () => 52,
      overscan: 5,
    });
    ```
  - For variable-height rows, attach `ref={rowVirtualizer.measureElement}` and `data-index={virtualRow.index}` to each rendered row element.
- **Combining `TanStack Table` + `TanStack Virtual`**:
  - Give the scroll container a fixed/bounded height (`max-h-[600px] overflow-auto`), keep `<TableHeader className="sticky top-0 z-10 bg-background">` sticky, and render only `rowVirtualizer.getVirtualItems()` inside `<TableBody>` using either `transform: translateY(${virtualRow.start}px)` or top/bottom padding spacer rows.
