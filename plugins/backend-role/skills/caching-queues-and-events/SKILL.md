---
name: caching-queues-and-events
description: >-
  Use this skill when implementing distributed caching (Redis), background job queues (BullMQ, Celery, Sidekiq), message brokers (RabbitMQ, Kafka), idempotency keys, transactional outbox patterns, or webhook delivery/ingestion.
---

# Caching, Queues & Event-Driven Architecture Skill

Follow these guidelines when building asynchronous workflows, caches, and distributed messaging:

## 1. Caching Strategies (Redis / In-Memory)
- **Explicit TTL & Key Namespacing**: Every cache key must use a structured namespace prefix (`tenant:{id}:user:{uid}:profile`) and a bounded TTL with slight random jitter to prevent **cache stampedes (thundering herd)**.
- **Cache-Aside & Invalidation**: Treat the cache as disposable ephemeral state; invalidate or update keys deterministically after database commits, and handle Redis unavailability gracefully without crashing read paths where fallback is safe.

## 2. Background Jobs, Queues & Idempotency
- **Idempotent Consumers**: Message brokers and job queues guarantee *at-least-once* delivery, not *exactly-once*. Design every worker/consumer to be idempotent using deterministic **Idempotency Keys** or unique database constraints so retrying a job never duplicates charges, emails, or state transitions.
- **Small Payloads**: Pass entity identifiers (`{ orderId, eventVersion }`) in queue payloads rather than massive serialized objects that can go stale while sitting in the queue.
- **Dead-Letter Queues (DLQ) & Backoff**: Configure bounded retry attempts with exponential backoff and route permanently failing messages (poison pills) to a DLQ for inspection and replay.

## 3. Transactional Outbox & Webhooks
- **Transactional Outbox Pattern**: Never publish an event to Kafka/RabbitMQ/BullMQ inside an uncommitted DB transaction (dual-write anti-pattern). Write the domain state change and an `outbox_events` row in the same ACID transaction, then relay asynchronously.
- **Webhook Security**: Sign outgoing webhooks and verify incoming webhooks using HMAC-SHA256 over `timestamp + raw_body`, rejecting timestamps older than 5 minutes to prevent replay attacks. Acknowledge webhooks quickly (`202 Accepted`) after enqueueing processing.
