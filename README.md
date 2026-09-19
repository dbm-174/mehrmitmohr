# Mehr mit Mohr

Website für Kati Mohr (Lektorat · Redaktion · Text).

**Astro** baut die Seite als statisches HTML, **TinaCMS** ist die Bearbeitungsoberfläche.
Die Redaktion arbeitet unter `/admin`; Tina schreibt die Änderungen als Commit ins
Repository, ein Build erzeugt daraus die fertige Seite.

Eine Anleitung ohne Technik-Vokabular steht in [REDAKTION.md](REDAKTION.md).

---

## Schnellstart

```bash
npm install
cp .env.example .env     # Zugangsdaten eintragen, siehe unten
npm run dev              # Seite auf :4321, Editor auf :4321/admin
```

Ohne `.env` läuft `npm run dev` trotzdem: Tina startet dann im lokalen Modus,
Änderungen landen direkt in den Dateien unter `content/`, aber nicht auf GitHub.

## Befehle

| Befehl | Wirkung |
| --- | --- |
| `npm run dev` | Astro-Dev-Server **und** TinaCMS zusammen |
| `npm run build` | Vollständiger Build inklusive Editor-Oberfläche → `dist/` |
| `npm run build:site` | Nur die Website bauen, ohne Editor (**funktioniert ohne Tina-Cloud-Zugang**) |
| `npm run preview` | Den Inhalt von `dist/` lokal ausliefern |
| `npm run check` | TypeScript- und Astro-Prüfung |

> `npm run preview` liefert den Stand aus, den `dist/` beim Start des Servers hatte.
> Nach einem neuen Build muss der Preview-Server neu gestartet werden, sonst sieht man
> die alte Fassung.

> `npm run build` bricht mit „Missing clientId, token" ab, solange kein
> Tina-Cloud-Projekt eingerichtet ist. Bis dahin `npm run build:site` benutzen –
> die Website ist dann vollständig, nur die Seite `/admin` fehlt im Ergebnis.

## Noch zu erledigen

1. **Tina Cloud einrichten** – auf [app.tina.io](https://app.tina.io) ein Projekt anlegen,
   dieses Repository verbinden, `Client ID` und `Token` in die `.env` eintragen und als
   Repository-Secrets `NEXT_PUBLIC_TINA_CLIENT_ID` und `TINA_TOKEN` hinterlegen.
   Danach die Redakteurin als zweiten Benutzer einladen (im kostenlosen Tarif sind
   zwei Benutzer enthalten).
2. **Deploy einrichten** – `.github/workflows/build.yml` baut bei jedem Push ein
   Docker-Image nach `ghcr.io/dbm-174/mehrmitmohr`, der Server holt es aber noch nicht
   von selbst. Der Platzhalter für den SSH-Schritt ist dort markiert. Ohne ihn erscheinen
   Änderungen der Redaktion erst nach `docker compose pull && docker compose up -d`.
3. **Domain** – steht auf `https://kati.dbm-connect.de` (in `.env`, `Dockerfile`,
   `docker-compose.yml` und im Workflow). Bei einem Umzug alle vier Stellen anpassen.
4. **Echte Fotos einsetzen** – siehe `public/uploads/README.md`.
5. **Impressum und Datenschutz** – die Texte unter `content/seiten/` sind Vorlagen mit
   Platzhaltern in eckigen Klammern und müssen rechtlich geprüft werden.
6. **Kontaktformular** – aktuell zeigt die Kontaktseite den E-Mail-Weg. Sobald ein
   Formular-Dienst feststeht, dessen Adresse in TinaCMS unter *Einstellungen → Formular*
   eintragen; dann erscheint automatisch das Formular. Der Datenschutztext muss dann um
   diesen Dienst ergänzt werden.

## Docker

Die Seite läuft als nginx-Container, der nur die fertigen Dateien ausliefert.

```bash
docker compose up -d --build     # lokal bauen und starten -> http://localhost:8080
```

Die Tina-Zugangsdaten gehen als Build-Secrets hinein und landen in keiner Image-Schicht.
Auf dem Server liegt nur `docker-compose.yml`; dort genügt

```bash
docker login ghcr.io             # einmalig, solange das Paket privat ist
docker compose pull && docker compose up -d
```

### Automatische Aktualisierung

Auf dem Server (`ssh bandgap`, Verzeichnis `~/mehrmitmohr`) prüft ein systemd-Timer alle drei
Minuten, ob ein neues Image vorliegt, und startet den Container nur dann neu. Die Dateien dazu
liegen in `docker/update.sh` und `docker/systemd/`.

```bash
systemctl --user list-timers mehrmitmohr-update.timer   # wann läuft er das nächste Mal
journalctl --user -u mehrmitmohr-update.service -n 20   # was hat er zuletzt getan
~/mehrmitmohr/update.sh                                 # sofort aktualisieren
```

Der Timer läuft nur, solange der Benutzer-systemd aktiv ist. Damit er einen Neustart und das
Abmelden übersteht, muss einmalig `sudo loginctl enable-linger bandgap` ausgeführt werden.

Der Container lauscht nur auf `127.0.0.1:8080` – nach außen geht es über Caddy:

```
kati.dbm-connect.de {
    reverse_proxy 127.0.0.1:8080
}
```

## Aufbau

```
content/            Alle Inhalte – das schreibt TinaCMS
  settings/         Logo, Menü, Kontaktdaten, Fußzeile
  startseite/       Die Abschnitte der Startseite
  leistungen/       Eine Datei je Leistung (erzeugt auch /leistungen/<name>)
  seiten/           Für Autor:innen, Über mich, Kontakt, Impressum, Datenschutz
public/uploads/     Bilder, die über den Editor hochgeladen werden
src/
  styles/tokens.css Farben, Schriften, Abstände – hier wird das Design angepasst
  components/       Bausteine der Seite
  layouts/          Seitengerüste
  pages/            Die Adressen der Website
  lib/inhalte.ts    Zugriff auf die Inhalte
  content.config.ts Prüfschema für die Inhaltsdateien
tina/config.ts      Aufbau der Editor-Oberfläche
```

## Zwei Dinge, die man wissen muss

**Das Schema steht doppelt.** `tina/config.ts` beschreibt die Eingabefelder,
`src/content.config.ts` prüft dieselben Dateien beim Build. Ein neues Feld muss an beiden
Stellen ergänzt werden – sonst kann die Redaktion es nicht pflegen oder der Build bricht ab.
Astro liest die Dateien bewusst direkt und nicht über die Tina-API: So funktionieren Builds
auch offline und unabhängig davon, ob Tina Cloud gerade erreichbar ist.

**Das Design hängt an `src/styles/tokens.css`.** Alle Farb-, Schrift- und Abstandswerte
stehen dort als CSS-Variablen; die Komponenten greifen ausschließlich darauf zu. Die Werte
sind aus `layout.jpg` ausgemessen und damit Näherungen. Wo das Layout eine Farbe für
Fließtext zu hell verwendet, gibt es zusätzlich eine `-ink`-Variante mit ausreichendem
Kontrast – deshalb sind die „Mehr erfahren"-Links etwas kräftiger als die Icon-Kreise.
