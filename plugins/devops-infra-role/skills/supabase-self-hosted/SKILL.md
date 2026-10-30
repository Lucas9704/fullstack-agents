---
name: supabase-self-hosted
description: >-
  Use this skill when deploying, configuring, hardening, upgrading, or backing up a Self-Hosted Supabase stack (supabase/docker with Docker Compose, Kong, GoTrue Auth, PostgREST, Realtime, Storage S3, Supavisor connection pooler, Vector/Logflare, and Studio).
---

# Supabase Self-Hosted Infrastructure & Operations Skill

Follow these official guidelines when provisioning, securing, or operating **Self-Hosted Supabase** (`supabase/docker`):

## 1. Cryptographic Key Generation (Never Use Default `.env.example` Keys)
- **Critical Security Rule**: Never deploy a self-hosted Supabase stack with the default `.env.example` secrets (`your-super-secret-and-long-postgres-password`, `super-secret-jwt-token-with-at-least-32-characters-long`, or the demo `ANON_KEY` / `SERVICE_ROLE_KEY`). Public scanners actively exploit default Supabase keys.
- **Official Key Generation Scripts**:
  1. Generate unique random passwords, `JWT_SECRET`, `VAULT_ENC_KEY`, `PG_META_CRYPTO_KEY`, `SECRET_KEY_BASE`, and `LOGFLARE_API_KEY`:
     `sh ./utils/generate-keys.sh --update-env`
  2. Generate modern asymmetric ES256 signing keys (`JWT_KEYS` / `JWT_JWKS`) for Auth and PostgREST:
     `sh ./utils/add-new-auth-keys.sh --update-env`
  3. Lock down file permissions immediately: `chmod 600 .env`.

## 2. Network Isolation, Kong Gateway & Studio Protection
- **Bind Internal Ports to Loopback (`127.0.0.1`)**: Never expose raw PostgreSQL (`5432`), Supavisor (`6543`), or Studio (`3000`) ports to `0.0.0.0` on a public host (remember that Docker port mappings bypass `ufw` by default).
- **Reverse Proxy with TLS in Front of Kong**: Terminate HTTPS (`TLS 1.2/1.3`) using **Caddy**, **Nginx**, or **Traefik** in front of the **Kong API Gateway** (`127.0.0.1:8000`).
- **Protect Supabase Studio (`/project/default`)**:
  - Change `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD` to strong credentials.
  - In production, restrict Studio access at the reverse-proxy or network layer (WireGuard/Tailscale VPN, Cloudflare Access, or IP allowlisting) so only public API paths (`/rest/v1/`, `/auth/v1/`, `/storage/v1/`, `/realtime/v1/`, `/functions/v1/`) are reachable from the public internet.

## 3. Core Services Configuration (`GoTrue`, `Supavisor`, `Storage`, `Edge Functions`)
- **URLs & Auth (`GoTrue`)**: Set `SITE_URL` (your frontend URL), `API_EXTERNAL_URL` (your HTTPS Kong domain), and `SUPABASE_PUBLIC_URL` accurately, and configure a real production SMTP server (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL`).
- **Supavisor Connection Pooler**: Use port `6543` (Transaction Mode) for serverless/Stateless app connections and port `5432` (Session Mode) for migrations and long-lived clients.
- **Storage Backend**: For production durability and horizontal scaling, configure `STORAGE_BACKEND=s3` backed by S3/MinIO/Cloudflare R2/Azure Blob S3-compatible storage rather than local container disk alone.
- **Edge Functions (`volumes/functions/`)**: Mount function directories under `volumes/functions/<fn_name>/index.ts` and verify JWTs via `supabase.auth.getClaims()`.

## 4. On-Demand Deep-Dive References
- **Self-Hosted Bootstrap, Reverse Proxy Lockdown, Backups & Zero-Downtime Upgrades**: [references/docker-compose-hardening-and-ops.md](./references/docker-compose-hardening-and-ops.md)
