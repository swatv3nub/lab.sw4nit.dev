# Production deployment

This repository runs the SW4NIT Lab application as an internal Docker deployment. It does not configure the host, DNS, Cloudflare, Certbot, or ORION.

## Deployment topology

```text
Internet → Cloudflare → host nginx :443 → 127.0.0.1:8080 → Docker nginx :80 → lab:3000 → ORION :8000
```

The Docker nginx port is bound only to `127.0.0.1:8080`. Next.js does not publish a host port. The browser talks only to Next.js; the authenticated Next.js route handlers call ORION over the private Docker network.

## Required production environment

Create a production `.env` beside `docker-compose.yml`. It is ignored by Git and must not be committed.

```dotenv
ORION_UPSTREAM=http://orion:8000
ORION_AUTHORIZATION=

SESSION_SECRET=<strong-random-secret>
NEXTAUTH_URL=https://lab.sw4nit.dev

GOOGLE_OAUTH_CLIENT_ID=<google-client-id>
GOOGLE_OAUTH_CLIENT_SECRET=<google-client-secret>

GITHUB_OAUTH_CLIENT_ID=<github-client-id>
GITHUB_OAUTH_CLIENT_SECRET=<github-client-secret>

LAB_ANALYST_EMAILS=
LAB_ADMIN_EMAILS=
```

Generate a session secret on the host with `openssl rand -base64 32`. The Google and GitHub applications must register these callback URLs:

```text
https://lab.sw4nit.dev/api/auth/callback/google
https://lab.sw4nit.dev/api/auth/callback/github
```

## ORION network prerequisite

The Compose configuration expects an externally managed Docker network named `reconix-cloud_default`. The production host must have that network and the ORION container must be attached to it. This repository cannot create or verify that production network.

On the host, inspect it before deployment:

```sh
docker network inspect reconix-cloud_default
docker ps --filter network=reconix-cloud_default --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
docker inspect -f '{{range $network, $_ := .NetworkSettings.Networks}}{{println $network}}{{end}}' <orion-container>
```

The final command must list `reconix-cloud_default` for the ORION container. `orion` must also be the Docker DNS name on that network for `ORION_UPSTREAM=http://orion:8000` to resolve.

## Deploy the application

```sh
cd /path/to/lab.sw4nit.dev
cp .env.example .env
chmod 600 .env
# Populate .env with the production values above, including a unique SESSION_SECRET.
docker compose config
docker compose up -d --build
docker compose ps
```

Verify the private Docker path after the containers are running:

```sh
docker compose exec nginx nginx -t
curl -i http://127.0.0.1:8080/
docker compose exec lab node -e "fetch('http://orion:8000/v1/health').then(async response => { console.log(response.status); console.log(await response.text()) }).catch(error => { console.error(error); process.exit(1) })"
docker compose logs --tail 100 lab nginx
```

The ORION health command tests connectivity from the `lab` container only; it does not expose ORION to the Internet.

## Host nginx configuration

Host nginx and TLS remain outside this repository. Configure the existing host nginx to terminate TLS and proxy only to the loopback Docker listener. This is the required server block, documented here only:

```nginx
server {
    listen 80;
    server_name lab.sw4nit.dev;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name lab.sw4nit.dev;

    ssl_certificate /etc/letsencrypt/live/lab.sw4nit.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lab.sw4nit.dev/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

After adding the host configuration, verify it without exposing Docker nginx directly:

```sh
sudo nginx -t
sudo systemctl reload nginx
curl -I http://127.0.0.1:8080/
curl -I https://lab.sw4nit.dev/
```

Certbot continues to manage `/etc/letsencrypt/live/lab.sw4nit.dev/`. Do not copy certificates into Docker.
