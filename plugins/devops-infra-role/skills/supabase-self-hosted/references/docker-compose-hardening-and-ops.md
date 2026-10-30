# Supabase Self-Hosted Docker Compose Hardening, Proxy & Operations Reference

## 1. Production Bootstrap Procedure (`supabase/docker`)
```bash
#!/usr/bin/env bash
set -euo pipefail

git clone --depth 1 https://github.com/supabase/supabase
mkdir -p /opt/supabase-project
cp -rf supabase/docker/* /opt/supabase-project/
cp supabase/docker/.env.example /opt/supabase-project/.env
cd /opt/supabase-project

# 1. Generate unique cryptographic secrets & asymmetric ES256 Auth keys
sh ./utils/generate-keys.sh --update-env
sh ./utils/add-new-auth-keys.sh --update-env
chmod 600 .env

# 2. Pull images and start stack in detached mode
docker compose pull
docker compose up -d
```

## 2. Reverse Proxy Split: Public API vs. Private Studio (Caddy Recipe)
Expose **only** Supabase API endpoints on your public domain (`api.example.com`) and restrict Supabase Studio (`studio.internal.example.com`) to a private VPN/IP range:

```caddyfile
# Public Supabase API Gateway (Kong on 127.0.0.1:8000)
api.example.com {
    encode zstd gzip

    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        -Server
    }

    @public_api {
        path /rest/v1/* /auth/v1/* /realtime/v1/* /storage/v1/* /functions/v1/*
    }

    handle @public_api {
        reverse_proxy 127.0.0.1:8000
    }

    # Block public access to Studio dashboard on the public API domain
    handle {
        respond "Forbidden" 403
    }
}
```

## 3. Applying Migrations & Generating Types Against Self-Hosted Instance
Use the Supabase CLI from your application repository pointing `--db-url` at your self-hosted Postgres instance (over SSH tunnel or private network):

```bash
# Push local migrations (supabase/migrations/*.sql) to self-hosted Postgres
npx supabase db push --db-url "postgresql://postgres:${POSTGRES_PASSWORD}@127.0.0.1:5432/postgres"

# Generate TypeScript types from the self-hosted schema
npx supabase gen types typescript --db-url "postgresql://postgres:${POSTGRES_PASSWORD}@127.0.0.1:5432/postgres" > src/types/database.types.ts
```

## 4. Automated Backups & Safe Upgrades
- **Database Backup (`pg_dumpall` / `pg_dump`)**:
  ```bash
  docker exec supabase-db pg_dumpall -U postgres --roles-only > backup_roles.sql
  docker exec supabase-db pg_dump -U postgres -Fc -d postgres > backup_db.dump
  ```
- **Volumes & `.env` Backup**: Back up `.env`, `volumes/api/kong.yml`, `volumes/functions/`, and `volumes/storage/` (if not using an external S3 bucket).
- **Safe Service Upgrade**:
  1. Take a full DB snapshot (`backup_db.dump`) and `.env` backup.
  2. Review image tag bumps in `supabase/docker/docker-compose.yml` changelog.
  3. Run `docker compose pull && docker compose up -d` to recreate updated containers with minimal downtime.
