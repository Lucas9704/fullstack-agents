# NestJS, Fastify & Hono Backend Patterns Reference

## 1. NestJS Modular Architecture
- **Strict Module Encapsulation**: Group features by domain (`OrdersModule`, `BillingModule`), exporting only public application services or interfaces—never export internal ORM repositories across module boundaries without a clear contract.
- **Request Pipeline Order**: Use the NestJS execution pipeline according to single responsibility:
  1. **Guards (`CanActivate`)**: Authentication & RBAC/ABAC authorization (`@UseGuards(JwtAuthGuard, RolesGuard)`).
  2. **Pipes (`PipeTransform`)**: Payload validation and transformation (`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` or `ZodValidationPipe`).
  3. **Interceptors (`NestInterceptor`)**: Cross-cutting concerns (request timing, response envelope mapping, correlation IDs).
  4. **Exception Filters (`ExceptionFilter`)**: Centralized mapping of domain errors to RFC 7807 `ProblemDetails`.

## 2. Fastify High-Throughput Patterns
- **JSON Schema Serialization**: Attach response schemas (`schema: { body, querystring, response: { 200: ... } }`) using `@fastify/type-provider-typebox` or `fastify-type-provider-zod` so Fastify compiles fast serializers (`fast-json-stringify`) and strips accidental sensitive fields before sending responses.
- **Plugin Encapsulation**: Use `fastify-plugin` (`fp`) only when decorators/hooks intentionally need to leak to parent scopes; keep route plugins encapsulated.

## 3. Hono (Edge & Ultrafast Node/Bun Services)
- Use `@hono/zod-validator` (`zValidator('json', schema)`) on every mutating route and export `type AppType = typeof routes` when leveraging Hono RPC (`hc<AppType>`) for end-to-end type safety.
