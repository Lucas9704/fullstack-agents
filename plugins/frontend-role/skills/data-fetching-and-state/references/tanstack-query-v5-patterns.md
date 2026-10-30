# TanStack Query v5 Patterns Reference

## 1. Type-Safe `queryOptions` & Key Factories
- Colocate query keys and fetcher functions inside reusable `queryOptions` factories so `useQuery`, `useSuspenseQuery`, `queryClient.prefetchQuery`, and `queryClient.setQueryData` all share full TypeScript inference:
  ```ts
  export const projectQueries = {
    all: () => ['projects'] as const,
    lists: () => [...projectQueries.all(), 'list'] as const,
    list: (filters: ProjectFilters) =>
      queryOptions({
        queryKey: [...projectQueries.lists(), filters] as const,
        queryFn: ({ signal }) => fetchProjects(filters, { signal }),
      }),
    detail: (id: string) =>
      queryOptions({
        queryKey: [...projectQueries.all(), 'detail', id] as const,
        queryFn: ({ signal }) => fetchProjectById(id, { signal }),
      }),
  };
  ```

## 2. Optimistic Updates with Rollback
- Implement optimistic UI updates inside `useMutation` for instant perceived responsiveness:
  ```ts
  useMutation({
    mutationFn: updateProjectTitle,
    onMutate: async (newTitle) => {
      await queryClient.cancelQueries(projectQueries.detail(id));
      const previous = queryClient.getQueryData(projectQueries.detail(id).queryKey);
      queryClient.setQueryData(projectQueries.detail(id).queryKey, (old) =>
        old ? { ...old, title: newTitle } : old
      );
      return { previous };
    },
    onError: (_err, _newTitle, context) => {
      if (context?.previous) {
        queryClient.setQueryData(projectQueries.detail(id).queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectQueries.detail(id).queryKey });
    },
  });
  ```

## 3. Infinite Queries & Pagination
- For cursor-based feeds, use `useInfiniteQuery` with explicit `initialPageParam` and `getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined`.
- For standard paginated tables, keep the previous page visible while fetching the next page using `placeholderData: keepPreviousData` imported from `@tanstack/react-query`.
