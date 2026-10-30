#!/usr/bin/env node
/**
 * Zero-dependency Multi-Language Backend Stack Detector for Antigravity Subagents.
 * Usage: node detect-backend-stack.mjs [project-root-path]
 *
 * Inspects package.json, pyproject.toml, requirements.txt, go.mod, Cargo.toml,
 * pom.xml, build.gradle(.kts), *.csproj, and Supabase/ORM directories to output
 * detected runtimes, frameworks, and recommended Antigravity skills & references.
 */

import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve(process.argv[2] || process.cwd());
const fileExists = (relPath) => fs.existsSync(path.join(targetDir, relPath));
const readText = (relPath) =>
  fileExists(relPath) ? fs.readFileSync(path.join(targetDir, relPath), 'utf8') : '';

const topLevelFiles = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];

const detectedRuntimes = [];
const frameworks = [];
const dataLayer = [];
const messagingAndCache = [];
const recommendedSkills = [];
const recommendedReferences = [];

// 1. Node.js / TypeScript detection
if (fileExists('package.json')) {
  try {
    const pkg = JSON.parse(readText('package.json'));
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const has = (name) => Boolean(deps[name]);

    if (
      has('@nestjs/core') ||
      has('fastify') ||
      has('express') ||
      has('hono') ||
      has('@prisma/client') ||
      has('drizzle-orm')
    ) {
      detectedRuntimes.push('node-typescript');
      recommendedSkills.push('node-typescript-expert');
      recommendedReferences.push('node-typescript-expert/references/nestjs-and-fastify-patterns.md');
    }
    if (has('@nestjs/core')) frameworks.push('nestjs');
    if (has('fastify')) frameworks.push('fastify');
    if (has('express')) frameworks.push('express');
    if (has('hono')) frameworks.push('hono');

    if (has('@prisma/client') || has('prisma')) {
      dataLayer.push('prisma');
      recommendedReferences.push('node-typescript-expert/references/prisma-and-drizzle-orms.md');
    }
    if (has('drizzle-orm')) {
      dataLayer.push('drizzle');
      recommendedReferences.push('node-typescript-expert/references/prisma-and-drizzle-orms.md');
    }
    if (has('bullmq') || has('ioredis') || has('redis') || has('amqplib') || has('kafkajs')) {
      messagingAndCache.push('redis/queues');
      recommendedSkills.push('caching-queues-and-events');
    }
    if (has('@supabase/supabase-js') || has('@supabase/ssr')) {
      dataLayer.push('supabase');
      recommendedSkills.push('supabase-platform');
      recommendedReferences.push('supabase-platform/references/rls-postgres-and-edge-functions.md');
    }
  } catch {
    // Ignore malformed package.json
  }
}

// 2. Python detection
const pyText = `${readText('pyproject.toml')}\n${readText('requirements.txt')}`;
if (pyText.trim().length > 0) {
  detectedRuntimes.push('python');
  recommendedSkills.push('python-backend-expert');
  if (/fastapi/i.test(pyText)) frameworks.push('fastapi');
  if (/django/i.test(pyText)) frameworks.push('django');
  if (/flask/i.test(pyText)) frameworks.push('flask');
  if (/sqlalchemy|alembic|asyncpg|psycopg/i.test(pyText)) {
    dataLayer.push('sqlalchemy/postgres');
    recommendedSkills.push('sql-api-architect');
  }
  if (/celery|redis|Dramatiq|rq/i.test(pyText)) {
    messagingAndCache.push('celery/redis');
    recommendedSkills.push('caching-queues-and-events');
  }
  recommendedReferences.push('python-backend-expert/references/fastapi-and-sqlalchemy-async.md');
}

// 3. Go detection
const goMod = readText('go.mod');
if (goMod) {
  detectedRuntimes.push('golang');
  recommendedSkills.push('golang-backend-expert');
  recommendedReferences.push(
    'golang-backend-expert/references/http-grpc-and-sqlc.md',
    'golang-backend-expert/references/concurrency-channels-and-profiling.md'
  );
  if (/go-chi\/chi/.test(goMod)) frameworks.push('chi');
  if (/gin-gonic\/gin/.test(goMod)) frameworks.push('gin');
  if (/labstack\/echo/.test(goMod)) frameworks.push('echo');
  if (/google\.golang\.org\/grpc/.test(goMod)) frameworks.push('grpc');
  if (/jackc\/pgx|sqlx|gorm/.test(goMod)) {
    dataLayer.push('pgx/sql');
    recommendedSkills.push('sql-api-architect');
  }
}

// 4. Rust detection
const cargoToml = readText('Cargo.toml');
if (cargoToml) {
  detectedRuntimes.push('rust');
  recommendedSkills.push('rust-backend-expert');
  recommendedReferences.push(
    'rust-backend-expert/references/axum-tokio-and-sqlx.md',
    'rust-backend-expert/references/async-concurrency-and-zero-copy.md'
  );
  if (/axum/.test(cargoToml)) frameworks.push('axum');
  if (/actix-web/.test(cargoToml)) frameworks.push('actix-web');
  if (/tonic/.test(cargoToml)) frameworks.push('tonic-grpc');
  if (/sqlx|sea-orm|diesel/.test(cargoToml)) {
    dataLayer.push('sqlx/orm');
    recommendedSkills.push('sql-api-architect');
  }
}

// 5. Java / Spring Boot detection
const jvmBuild = `${readText('pom.xml')}\n${readText('build.gradle')}\n${readText('build.gradle.kts')}`;
if (jvmBuild.trim().length > 0) {
  detectedRuntimes.push('java-jvm');
  recommendedSkills.push('java-spring-expert');
  recommendedReferences.push('java-spring-expert/references/spring-boot-3-and-jpa.md');
  if (/spring-boot/.test(jvmBuild)) frameworks.push('spring-boot');
  if (/spring-data-jpa|hibernate|flyway|liquibase/.test(jvmBuild)) {
    dataLayer.push('jpa/hibernate');
    recommendedSkills.push('sql-api-architect');
  }
}

// 6. C# / .NET detection
const hasDotnet = topLevelFiles.some((f) => f.endsWith('.csproj') || f.endsWith('.sln'));
if (hasDotnet) {
  detectedRuntimes.push('dotnet');
  recommendedSkills.push('dotnet-backend-expert');
  recommendedReferences.push('dotnet-backend-expert/references/minimal-apis-and-efcore.md');
}

// 7. Supabase CLI & SQL directories
if (fileExists('supabase/config.toml') || fileExists('supabase/migrations') || fileExists('supabase/schemas')) {
  dataLayer.push('supabase-cli');
  recommendedSkills.push('supabase-platform', 'sql-api-architect');
  recommendedReferences.push(
    'supabase-platform/references/rls-postgres-and-edge-functions.md',
    'sql-api-architect/references/postgres-optimization-and-indexing.md'
  );
}

// Always recommend foundational backend security, observability, and architecture skills
recommendedSkills.push(
  'auth-and-api-security',
  'observability-and-resilience',
  'architecture-and-domain-design'
);

if (recommendedSkills.includes('sql-api-architect')) {
  recommendedReferences.push('sql-api-architect/references/postgres-optimization-and-indexing.md');
}

const report = {
  projectRoot: targetDir,
  detectedRuntimes: [...new Set(detectedRuntimes)],
  frameworks: [...new Set(frameworks)],
  dataLayer: [...new Set(dataLayer)],
  messagingAndCache: [...new Set(messagingAndCache)],
  antigravityRecommendations: {
    skillsToActivate: [...new Set(recommendedSkills)],
    referencesToRead: [...new Set(recommendedReferences)],
  },
};

console.log(JSON.stringify(report, null, 2));
