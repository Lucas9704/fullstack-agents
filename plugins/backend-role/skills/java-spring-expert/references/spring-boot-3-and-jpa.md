# Spring Boot 3+, Spring Security & JPA Optimization Reference

## 1. Spring Security 6+ (`SecurityFilterChain`)
- Configure security using functional lambda DSL beans (`@Bean public SecurityFilterChain filterChain(HttpSecurity http)`) with stateless sessions (`SessionCreationPolicy.STATELESS`) for REST/JWT APIs.
- Use method-level authorization (`@EnableMethodSecurity` + `@PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")`) and always verify resource ownership at the service/query layer to prevent BOLA/IDOR.

## 2. High-Performance Spring Data JPA & Hibernate
- **Read-Only DTO Projections**: For list and read endpoints, return Java `record` projections directly from Spring Data repositories (`List<OrderSummaryView> findByCustomerId(UUID customerId)`) so Hibernate never hydrates managed entity graphs.
- **Batch Inserts/Updates**: Enable `spring.jpa.properties.hibernate.jdbc.batch_size=50` and `order_inserts=true`, and avoid `GenerationType.IDENTITY` when high-throughput JDBC batching is required (prefer `GenerationType.SEQUENCE` on Postgres).
- **Optimistic Locking**: Add `@Version private Long version;` on concurrently updated entities to detect lost updates automatically (`ObjectOptimisticLockingFailureException`).

## 3. Integration Testing with `Testcontainers`
- Prefer `@DataJpaTest` + `@ServiceConnection` with `PostgreSQLContainer` (`Testcontainers`) over H2 in-memory databases so Postgres-specific SQL, JSONB, and Flyway/Liquibase migrations are tested realistically.
