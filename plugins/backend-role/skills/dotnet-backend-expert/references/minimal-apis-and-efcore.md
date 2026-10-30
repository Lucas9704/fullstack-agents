# ASP.NET Core Minimal APIs & EF Core Optimization Reference

## 1. Minimal APIs, Endpoint Groups & Validation Filters
- Organize endpoints using `MapGroup("/api/v1/orders")` with shared authorization (`.RequireAuthorization()`), rate limiting (`.RequireRateLimiting("fixed")`), and OpenAPI tags.
- Attach a generic `IEndpointFilter` that runs **FluentValidation** (`IValidator<TRequest>`) automatically before executing the endpoint handler and returns `TypedResults.ValidationProblem(validationResult.ToDictionary())`.

## 2. EF Core 8/9+ Advanced Patterns
- **Bulk Operations (`ExecuteUpdateAsync` / `ExecuteDeleteAsync`)**: Perform set-based updates and deletes directly in SQL without loading entities into memory:
  ```csharp
  await db.Notifications
      .Where(n => n.UserId == userId && !n.IsRead)
      .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);
  ```
- **`SaveChangesInterceptor` for Auditing & Outbox**: Use `SaveChangesInterceptor` (registered via `AddInterceptors`) to stamp `CreatedAt`/`UpdatedAt` timestamps and persist domain events to an `OutboxMessages` table within the same transaction.
- **`DbContext` Pooling & Concurrency**: Never share a single `DbContext` instance across parallel `Task.WhenAll` calls (`DbContext` is not thread-safe); inject `IDbContextFactory<AppDbContext>` when parallel background tasks need independent contexts.
