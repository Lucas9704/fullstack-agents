---
name: dotnet-backend-expert
description: >-
  Use this skill when building, refactoring, or reviewing C# / .NET (8/9+) backend services (ASP.NET Core Minimal APIs, Controllers, Entity Framework Core, MediatR, FluentValidation). Covers async/await CancellationToken propagation, EF Core performance, and DI lifetimes.
---

# C# & .NET Backend Expert Skill

Follow these guidelines when developing or auditing **ASP.NET Core (.NET 8/9+)** services:

## 1. Async/Await & Dependency Injection
- **Propagate `CancellationToken`**: Accept `CancellationToken ct` in every endpoint handler, service method, and EF Core/HttpClient call (`ToListAsync(ct)`, `SaveChangesAsync(ct)`).
- **Async All the Way**: Never block async code with `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()`, which causes thread-pool starvation.
- **Strict DI Lifetimes**: Never inject a `Scoped` or `Transient` service into a `Singleton` (captive dependency). Use `IHttpClientFactory` / typed `HttpClient` with `Microsoft.Extensions.Http.Resilience` instead of instantiating `new HttpClient()`.

## 2. Entity Framework Core Performance
- **`AsNoTracking()` for Reads**: Always apply `.AsNoTracking()` on read-only queries to eliminate change-tracker overhead.
- **Project Early with `.Select()`**: Project directly into C# `record` DTOs in LINQ queries before calling `.ToListAsync(ct)` so SQL only fetches required columns.
- **Avoid Cartesian Explosion**: Use `.AsSplitQuery()` when eagerly loading multiple one-to-many `.Include()` collections.

## 3. API Design & Error Handling
- Use `TypedResults` in Minimal APIs (or `[ApiController]` with explicit `[ProducesResponseType]`) for accurate OpenAPI generation.
- Configure global `IExceptionHandler` + `AddProblemDetails()` to return standardized RFC 7807 responses, and validate inputs with **FluentValidation** or DataAnnotations at the pipeline boundary.

## 4. Verification
1. Run `dotnet build --no-restore` and `dotnet test` to verify compilation, nullable reference checks, and tests.
