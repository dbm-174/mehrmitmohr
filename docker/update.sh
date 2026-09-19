#!/bin/sh
# Holt das aktuelle Image aus der GitHub-Registry und startet den Container
# nur dann neu, wenn sich tatsächlich etwas geändert hat.
#
# Wird per cron alle paar Minuten aufgerufen. Dadurch erscheinen Änderungen,
# die die Redaktion in TinaCMS speichert, ohne Zutun auf der Website –
# sobald der GitHub-Workflow das neue Image gebaut hat.
#
# Ausgabe gibt es nur bei einer Aktualisierung oder bei einem Fehler, damit
# das Logfile nicht bei jedem Lauf wächst.
set -eu

IMAGE=ghcr.io/dbm-174/mehrmitmohr:latest

cd "$(dirname "$0")"

# Nicht zwei Läufe gleichzeitig: Ein langsamer Download darf dem nächsten
# cron-Aufruf nicht in die Quere kommen.
exec 9>.update.lock
flock -n 9 || exit 0

zeit() { date '+%Y-%m-%d %H:%M:%S'; }

vorher=$(docker image inspect --format '{{.Id}}' "$IMAGE" 2>/dev/null || echo keins)

if ! ausgabe=$(docker compose pull -q website 2>&1); then
    echo "$(zeit) FEHLER beim Herunterladen: $ausgabe"
    exit 1
fi

nachher=$(docker image inspect --format '{{.Id}}' "$IMAGE")

if [ "$vorher" != "$nachher" ]; then
    if ! ausgabe=$(docker compose up -d website 2>&1); then
        echo "$(zeit) FEHLER beim Starten: $ausgabe"
        exit 1
    fi
    docker image prune -f >/dev/null 2>&1 || true
    kurz=$(echo "${nachher#sha256:}" | cut -c1-12)
    echo "$(zeit) aktualisiert auf $kurz"
fi
