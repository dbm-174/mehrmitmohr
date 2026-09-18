import { defineConfig } from 'tinacms';

/* ---------------------------------------------------------------------------
   TinaCMS – die Bearbeitungsoberfläche unter /admin

   Alle Beschriftungen sind bewusst deutsch und ohne Fachbegriffe gehalten,
   damit die Seite ohne Einarbeitung gepflegt werden kann.

   ACHTUNG: Die Felder hier und die Schemata in src/content.config.ts
   beschreiben dieselben Dateien. Ein neues Feld muss an beiden Stellen
   ergänzt werden, sonst bricht der Build ab.
--------------------------------------------------------------------------- */

const branch =
  process.env.TINA_BRANCH ||
  process.env.GITHUB_BRANCH ||
  process.env.HEAD ||
  'main';

/** Die fünf Akzentfarben aus dem Layout (siehe src/styles/tokens.css). */
const farbOptionen = [
  { value: 'salbei', label: 'Salbeigrün' },
  { value: 'terrakotta', label: 'Terrakotta' },
  { value: 'blaugrau', label: 'Blaugrau' },
  { value: 'ocker', label: 'Ocker' },
  { value: 'oliv', label: 'Oliv' },
];

/** Die verfügbaren Sinnbilder (gezeichnet in src/components/LeistungIcon.astro). */
const iconOptionen = [
  { value: 'dokument', label: 'Dokument' },
  { value: 'stift', label: 'Stift' },
  { value: 'buch', label: 'Aufgeschlagenes Buch' },
  { value: 'funken', label: 'Funken' },
  { value: 'blatt', label: 'Zweig' },
];

/** Suchmaschinen-Angaben – auf jeder Seite gleich aufgebaut. */
const seoFeld = {
  type: 'object' as const,
  name: 'seo',
  label: 'Suchmaschine & Vorschau',
  description: 'Wird bei Google und beim Teilen in sozialen Netzwerken angezeigt.',
  fields: [
    {
      type: 'string' as const,
      name: 'titel',
      label: 'Titel',
      description: 'Bleibt leer, wenn der Seitentitel passt.',
    },
    {
      type: 'string' as const,
      name: 'beschreibung',
      label: 'Kurzbeschreibung',
      description: 'Ein bis zwei Sätze, höchstens etwa 160 Zeichen.',
      ui: { component: 'textarea' as const },
    },
  ],
};

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? '',
  token: process.env.TINA_TOKEN ?? '',

  // Die Oberfläche wird nach public/admin gebaut und ist damit Teil der Seite.
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  // Hochgeladene Bilder landen im Repository unter public/uploads.
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      /* --------------------------------------------------------------- */
      {
        name: 'einstellungen',
        label: 'Einstellungen',
        path: 'content/settings',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/',
        },
        fields: [
          {
            type: 'object',
            name: 'logo',
            label: 'Logo',
            fields: [
              { type: 'string', name: 'wortEins', label: 'Erstes Wort', required: true },
              {
                type: 'string',
                name: 'wortKursiv',
                label: 'Mittleres Wort (kursiv)',
                required: true,
              },
              { type: 'string', name: 'wortDrei', label: 'Letztes Wort', required: true },
              {
                type: 'string',
                name: 'claim',
                label: 'Zeile unter dem Logo',
                description: 'Wird in Großbuchstaben dargestellt.',
              },
            ],
          },
          {
            type: 'object',
            name: 'navigation',
            label: 'Menü oben',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.label ?? 'Neuer Menüpunkt' }),
            },
            fields: [
              { type: 'string', name: 'label', label: 'Beschriftung', required: true },
              {
                type: 'string',
                name: 'href',
                label: 'Ziel',
                description: 'Zum Beispiel /leistungen oder /kontakt',
                required: true,
              },
            ],
          },
          {
            type: 'object',
            name: 'kontakt',
            label: 'Kontaktangaben',
            fields: [
              { type: 'string', name: 'name', label: 'Name', required: true },
              { type: 'string', name: 'email', label: 'E-Mail-Adresse', required: true },
              { type: 'string', name: 'telefon', label: 'Telefon (optional)' },
              { type: 'string', name: 'ort', label: 'Ort (optional)' },
            ],
          },
          {
            type: 'object',
            name: 'formular',
            label: 'Kontaktformular',
            description:
              'Solange hier keine Adresse steht, zeigt die Kontaktseite statt des Formulars den E-Mail-Weg an.',
            fields: [
              {
                type: 'string',
                name: 'endpoint',
                label: 'Adresse des Formular-Dienstes',
                description:
                  'Wird vom technischen Betreuer eingetragen (z. B. eine Formspree-Adresse).',
              },
            ],
          },
          {
            type: 'object',
            name: 'footer',
            label: 'Fußzeile',
            fields: [
              {
                type: 'string',
                name: 'text',
                label: 'Kurztext',
                ui: { component: 'textarea' },
              },
              {
                type: 'object',
                name: 'rechtlicheLinks',
                label: 'Rechtliche Links',
                list: true,
                ui: { itemProps: (item) => ({ label: item?.label ?? 'Neuer Link' }) },
                fields: [
                  { type: 'string', name: 'label', label: 'Beschriftung', required: true },
                  { type: 'string', name: 'href', label: 'Ziel', required: true },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'seo',
            label: 'Suchmaschine (Grundangaben)',
            fields: [
              { type: 'string', name: 'titel', label: 'Name der Website', required: true },
              {
                type: 'string',
                name: 'beschreibung',
                label: 'Kurzbeschreibung der Website',
                ui: { component: 'textarea' },
              },
            ],
          },
        ],
      },

      /* --------------------------------------------------------------- */
      {
        name: 'startseite',
        label: 'Startseite',
        path: 'content/startseite',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/',
        },
        fields: [
          seoFeld,
          {
            type: 'object',
            name: 'hero',
            label: 'Oberer Bereich',
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Überzeile', required: true },
              { type: 'string', name: 'ueberschrift', label: 'Große Überschrift', required: true },
              {
                type: 'string',
                name: 'text',
                label: 'Einleitungstext',
                ui: { component: 'textarea' },
                required: true,
              },
              { type: 'string', name: 'buttonText', label: 'Beschriftung der Schaltfläche' },
              { type: 'string', name: 'buttonLink', label: 'Ziel der Schaltfläche' },
              { type: 'image', name: 'bild', label: 'Bild' },
              {
                type: 'string',
                name: 'bildAlt',
                label: 'Bildbeschreibung',
                description: 'Für blinde Besucher und Suchmaschinen. Kurz beschreiben, was zu sehen ist.',
              },
              {
                type: 'string',
                name: 'handschrift',
                label: 'Handschriftliche Notiz im Bild',
              },
            ],
          },
          {
            type: 'object',
            name: 'leistungen',
            label: 'Leistungen-Bereich',
            description: 'Die Karten selbst werden unter „Leistungen" gepflegt.',
            fields: [{ type: 'string', name: 'eyebrow', label: 'Überzeile', required: true }],
          },
          {
            type: 'object',
            name: 'ueberMich',
            label: 'Über-mich-Bereich',
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Überzeile' },
              { type: 'string', name: 'ueberschrift', label: 'Überschrift', required: true },
              {
                type: 'string',
                name: 'textEins',
                label: 'Erster Absatz',
                ui: { component: 'textarea' },
                required: true,
              },
              {
                type: 'string',
                name: 'textZwei',
                label: 'Zweiter Absatz',
                ui: { component: 'textarea' },
              },
              { type: 'string', name: 'linkText', label: 'Beschriftung des Links' },
              { type: 'string', name: 'linkZiel', label: 'Ziel des Links' },
              { type: 'image', name: 'bild', label: 'Bild' },
              { type: 'string', name: 'bildAlt', label: 'Bildbeschreibung' },
              { type: 'string', name: 'handschrift', label: 'Handschriftliche Notiz' },
            ],
          },
          {
            type: 'object',
            name: 'zitat',
            label: 'Zitat-Band',
            fields: [
              {
                type: 'string',
                name: 'text',
                label: 'Zitat',
                ui: { component: 'textarea' },
                required: true,
              },
              { type: 'image', name: 'hintergrundbild', label: 'Hintergrundbild' },
              { type: 'string', name: 'badgeText', label: 'Text im Farbfleck' },
              { type: 'string', name: 'badgeLink', label: 'Ziel des Farbflecks' },
            ],
          },
          {
            type: 'object',
            name: 'abschluss',
            label: 'Grünes Band am Seitenende',
            description: 'Erscheint auch auf den Unterseiten.',
            fields: [
              { type: 'string', name: 'ueberschrift', label: 'Überschrift', required: true },
              {
                type: 'string',
                name: 'text',
                label: 'Text',
                ui: { component: 'textarea' },
                required: true,
              },
              { type: 'string', name: 'buttonText', label: 'Beschriftung der Schaltfläche' },
              { type: 'string', name: 'buttonLink', label: 'Ziel der Schaltfläche' },
              { type: 'image', name: 'bild', label: 'Bild rechts' },
              { type: 'string', name: 'bildAlt', label: 'Bildbeschreibung' },
            ],
          },
        ],
      },

      /* --------------------------------------------------------------- */
      {
        name: 'leistungen',
        label: 'Leistungen',
        path: 'content/leistungen',
        format: 'md',
        ui: {
          router: ({ document }) => `/leistungen/${document._sys.filename}`,
          filename: {
            // Aus "KI-Text-Redaktion" wird die Adresse /leistungen/ki-text-redaktion
            slugify: (values) =>
              (values?.titel ?? 'neue-leistung')
                .toLowerCase()
                .replace(/ä/g, 'ae')
                .replace(/ö/g, 'oe')
                .replace(/ü/g, 'ue')
                .replace(/ß/g, 'ss')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, ''),
          },
        },
        defaultItem: () => ({
          reihenfolge: 99,
          icon: 'dokument',
          farbe: 'salbei',
        }),
        fields: [
          { type: 'string', name: 'titel', label: 'Titel', isTitle: true, required: true },
          {
            type: 'number',
            name: 'reihenfolge',
            label: 'Reihenfolge',
            description: 'Kleinere Zahl steht weiter links bzw. weiter oben.',
            required: true,
          },
          {
            type: 'string',
            name: 'icon',
            label: 'Sinnbild',
            options: iconOptionen,
            required: true,
          },
          {
            type: 'string',
            name: 'farbe',
            label: 'Farbe',
            options: farbOptionen,
            required: true,
          },
          {
            type: 'string',
            name: 'teaser',
            label: 'Kurztext für die Karte',
            description: 'Zwei bis drei Zeilen. Erscheint auf der Startseite.',
            ui: { component: 'textarea' },
            required: true,
          },
          seoFeld,
          {
            type: 'rich-text',
            name: 'body',
            label: 'Text der Unterseite',
            isBody: true,
          },
        ],
      },

      /* --------------------------------------------------------------- */
      {
        name: 'seiten',
        label: 'Seiten',
        path: 'content/seiten',
        format: 'md',
        ui: {
          // Zu jeder Seite gehört eine feste Adresse im Programmcode –
          // neue Dateien hätten keine. Deshalb nur bearbeiten, nicht anlegen.
          allowedActions: { create: false, delete: false },
          router: ({ document }) => `/${document._sys.filename}`,
        },
        fields: [
          { type: 'string', name: 'titel', label: 'Überschrift', isTitle: true, required: true },
          { type: 'string', name: 'untertitel', label: 'Unterzeile' },
          { type: 'string', name: 'eyebrow', label: 'Überzeile' },
          {
            type: 'string',
            name: 'einleitung',
            label: 'Einleitung',
            ui: { component: 'textarea' },
          },
          { type: 'image', name: 'bild', label: 'Bild' },
          { type: 'string', name: 'bildAlt', label: 'Bildbeschreibung' },
          { type: 'string', name: 'handschrift', label: 'Handschriftliche Notiz' },
          {
            type: 'boolean',
            name: 'zeigeFormular',
            label: 'Kontaktformular anzeigen',
          },
          {
            type: 'boolean',
            name: 'zeigeKontaktBanner',
            label: 'Grünes Band am Seitenende anzeigen',
          },
          seoFeld,
          {
            type: 'rich-text',
            name: 'body',
            label: 'Inhalt',
            isBody: true,
          },
        ],
      },
    ],
  },
});
