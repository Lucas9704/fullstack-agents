---
name: java-spring-expert
description: >-
  Use this skill when building, refactoring, or reviewing Modern Java (Java 21+) and Spring Boot 3+ backend applications. Covers Virtual Threads, Records, constructor injection, Spring Security, JPA/Hibernate performance, and RFC 7807 ProblemDetail error handling.
---

# Java & Spring Boot Expert Skill

Follow these guidelines when developing or auditing **Java 21+ / Spring Boot 3+** backend services:

## 1. Modern Java & Spring Idioms
- **Constructor Injection Only**: Never use field injection (`@Autowired` on fields); declare dependencies as `private final` fields injected via constructor (or `@RequiredArgsConstructor`).
- **Java Records for DTOs**: Use immutable `record` types with Jakarta Bean Validation annotations (`@NotBlank`, `@NotNull`, `@Valid`) for all API request/response payloads and configuration properties (`@ConfigurationProperties`).
- **Virtual Threads (Java 21+)**: Enable virtual threads (`spring.threads.virtual.enabled=true`) for high-throughput blocking I/O services, and avoid pinning virtual threads inside `synchronized` blocks that perform I/O (use `ReentrantLock` instead).

## 2. Persistence (Spring Data JPA / Hibernate)
- **Never Expose JPA Entities in Controllers**: Map between JPA `@Entity` classes and API `record` DTOs explicitly (e.g., via MapStruct or domain mapper methods) to prevent lazy-loading `LazyInitializationException` and mass-assignment vulnerabilities.
- **Read-Only Transactions**: Annotate query methods with `@Transactional(readOnly = true)` to skip dirty checking and enable Hibernate read optimizations.
- **Eliminate N+1 Queries**: Use `@EntityGraph`, `JOIN FETCH` JPQL queries, or DTO projections (`interface` or `record` projections) instead of relying on default lazy collection iteration.

## 3. Centralized Error Handling
- Use `@RestControllerAdvice` returning standard **RFC 7807 `ProblemDetail`** objects (`ProblemDetail.forStatusAndDetail(...)`) with appropriate HTTP status codes and correlation metadata.

## 4. On-Demand Deep-Dive References
- **Spring Security 6+, JPA Record Projections, JDBC Batching & Testcontainers**: [references/spring-boot-3-and-jpa.md](./references/spring-boot-3-and-jpa.md)

## 5. Verification
1. Run `./mvnw test` or `./gradlew test` (or `mvn test-compile`) to verify compilation and tests.
