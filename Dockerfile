# syntax=docker/dockerfile:1

# Self-hosted build for Coolify. next.config.mjs sets `output: "standalone"`,
# so the runtime image holds only the traced server, not the whole node_modules.

FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# package-lock.json is git-ignored in this repo, so Coolify resolves versions
# fresh on every build, as Vercel did. .dockerignore keeps a local lock file
# out too: one made on Windows lacks the Linux builds of native packages.
# patches/ must be in place before the install: postinstall runs patch-package.
COPY package.json ./
COPY patches ./patches
RUN --mount=type=cache,target=/root/.npm npm install --legacy-peer-deps

COPY . .

# NEXT_PUBLIC_* values are baked into the bundle and into the CSP header at
# build time, so Coolify must pass them as build variables. The build also
# prerenders pages that read the database (the refs layouts), so DATABASE_URL
# is needed here as well as at runtime. ARG alone keeps it out of the image.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_SERVER_URL
ARG NEXT_PUBLIC_MOA_API_URL
ARG NEXT_PUBLIC_ORCA_URL
ARG NEXT_PUBLIC_CLIENT_URL
ARG NEXT_PUBLIC_CLIENT_HIRE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_PREVIEW_URL
ARG NEXT_PUBLIC_SERVER_API_KEY_TURNSTILE
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_MAX_RESUMES_ALLOWED
ARG NEXT_PUBLIC_MAINTENANCE_MODE
ARG NEXT_PUBLIC_CACHE_STALE_TIME
ARG NEXT_PUBLIC_CACHE_GC_TIME
ARG DATABASE_URL
ARG GUIDES_PREVIEW
RUN --mount=type=cache,target=/app/.next/cache \
    NODE_OPTIONS="--max-old-space-size=4096" npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0

# Standalone output leaves out public/ and .next/static; copy both in. The
# OG image routes read public/ from disk at runtime.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

# The server rewrites cached pages under .next/ (page cache), so it must own it.
USER node
EXPOSE 3000
CMD ["node", "server.js"]
