# Nginx, Caddy & Hardened `systemd` Recipes Reference

## 1. Caddyfile (Automatic HTTPS, Security Headers & Reverse Proxy)
Caddy provisions and renews Let's Encrypt/ZeroSSL certificates automatically with HTTP/3 enabled:

```caddyfile
api.example.com {
    encode zstd gzip

    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }

    request_body {
        max_size 10MB
    }

    reverse_proxy 127.0.0.1:3000 {
        health_uri /health/ready
        health_interval 10s
        health_timeout 3s
    }
}
```

## 2. Hardened Nginx Reverse Proxy Block (TLS + WebSockets)
```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    server_tokens off;
    client_max_body_size 10M;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_Connect_timeout 5s;
        proxy_read_timeout 30s;
    }
}
```

## 3. Sandboxed `systemd` Service Unit (`/etc/systemd/system/myapp.service`)
```ini
[Unit]
Description=Production API Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/opt/myapp
EnvironmentFile=/etc/myapp/myapp.env
ExecStart=/opt/myapp/server
Restart=on-failure
RestartSec=5s
LimitNOFILE=65535

# Hardening & Sandboxing
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
```
