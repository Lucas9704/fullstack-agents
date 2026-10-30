---
name: reverse-proxy-and-linux-servers
description: >-
  Use this skill when configuring or auditing reverse proxies (Nginx, Caddy, Traefik), TLS/HTTPS certificates, HTTP security headers, systemd service units, or Linux server hardening (SSH, UFW/firewall, logrotate).
---

# Reverse Proxy (Nginx / Caddy / Traefik) & Linux Server Hardening Skill

Follow these guidelines when configuring edge proxies and Linux host services:

## 1. Reverse Proxy & TLS/HTTPS Configuration
- **Modern TLS Only**: Enforce `TLSv1.2` and `TLSv1.3` only, enable HTTP/2 (`http2`) and HTTP/3 (QUIC where supported), and redirect all HTTP (`:80`) traffic permanently (`301`) to HTTPS (`:443`).
- **Mandatory Security Headers**:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (or `Content-Security-Policy: frame-ancestors 'none'`)
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Upstream Proxy Headers & Timeouts**: Forward `Host`, `X-Real-IP`, `X-Forwarded-For`, and `X-Forwarded-Proto` only from trusted upstream proxies, set explicit `client_max_body_size` limits, and configure bounded `proxy_read_timeout` / `proxy_connect_timeout`.

## 2. Hardened `systemd` Service Units
- Run application services under a dedicated unprivileged system user (`User=appuser`, `Group=appuser`, `DynamicUser=yes` when stateless).
- Enable `systemd` sandboxing directives: `NoNewPrivileges=true`, `PrivateTmp=true`, `ProtectSystem=strict`, `ProtectHome=true`, and `Restart=on-failure` with `RestartSec=5s`.

## 3. Linux Host & SSH Hardening
- **SSH (`sshd_config`)**: Disable root login (`PermitRootLogin no`) and password authentication (`PasswordAuthentication no`), allowing only Ed25519/RSA public-key authentication.
- **Firewall (`ufw` / `nftables`)**: Default to `deny incoming`, `allow outgoing`, and expose only required ports (`22/tcp` rate-limited, `80/tcp`, `443/tcp/udp`). Never bind Docker container ports directly to `0.0.0.0` (`-p 5432:5432`) on a public host because Docker bypasses `ufw` iptables chains by default—bind internal services to loopback (`127.0.0.1:5432:5432`).

## 4. On-Demand Deep-Dive References
- **Production Nginx, Caddy & Hardened `systemd` Unit Recipes**: [references/nginx-caddy-and-systemd-recipes.md](./references/nginx-caddy-and-systemd-recipes.md)
