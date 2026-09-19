# syntax=docker/dockerfile:1
#
# Zweistufiger Build:
#   1. "build"  – Node baut die statische Seite samt Tina-Editor nach dist/
#   2. Ausgabe  – nginx liefert nur dist/ aus; Node, Quelltext und
#                 Zugangsdaten landen nicht im fertigen Image.
#
# Bauen:
#   docker compose build
# oder direkt:
#   docker build \
#     --secret id=tina_client_id,env=NEXT_PUBLIC_TINA_CLIENT_ID \
#     --secret id=tina_token,env=TINA_TOKEN \
#     -t mehrmitmohr .

FROM node:22-alpine AS build
WORKDIR /app

# Abhängigkeiten zuerst – so bleibt diese Schicht im Cache, solange sich
# package-lock.json nicht ändert.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG SITE_URL=https://kati.dbm-connect.de
ARG TINA_BRANCH=main
ENV SITE_URL=${SITE_URL} \
    TINA_BRANCH=${TINA_BRANCH} \
    ASTRO_TELEMETRY_DISABLED=1

# Die Tina-Zugangsdaten kommen als Build-Secrets herein: Sie stehen nur
# während dieses einen Schritts als Umgebungsvariable bereit und werden in
# keiner Image-Schicht gespeichert.
RUN --mount=type=secret,id=tina_client_id,env=NEXT_PUBLIC_TINA_CLIENT_ID \
    --mount=type=secret,id=tina_token,env=TINA_TOKEN \
    npm run build


FROM nginx:1.29-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
