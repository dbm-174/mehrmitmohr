import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

/* ---------------------------------------------------------------------------
   Astro liest die Inhalte direkt aus content/ – also genau aus den Dateien,
   die TinaCMS beim Speichern schreibt. Dadurch ist der Build unabhängig davon,
   ob Tina Cloud gerade erreichbar ist.

   WICHTIG: Diese Schemata und tina/config.ts beschreiben dieselben Felder.
   Wer hier ein Feld ergänzt, muss es auch dort ergänzen (und umgekehrt) –
   sonst kann die Redaktion das Feld nicht pflegen bzw. der Build bricht ab.
--------------------------------------------------------------------------- */

/** Die fünf Akzentfarben aus dem Layout – siehe src/styles/tokens.css. */
export const FARBEN = ['salbei', 'terrakotta', 'blaugrau', 'ocker', 'oliv'] as const;

/** Verfügbare Icons – gezeichnet in src/components/LeistungIcon.astro. */
export const ICONS = ['dokument', 'stift', 'buch', 'funken', 'blatt'] as const;

const seo = z
  .object({
    titel: z.string().optional(),
    beschreibung: z.string().optional(),
  })
  .optional();

const leistungen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/leistungen' }),
  schema: z.object({
    titel: z.string(),
    reihenfolge: z.number().default(99),
    icon: z.enum(ICONS).default('dokument'),
    farbe: z.enum(FARBEN).default('salbei'),
    teaser: z.string(),
    seo,
  }),
});

const seiten = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/seiten' }),
  schema: z.object({
    titel: z.string(),
    untertitel: z.string().optional(),
    eyebrow: z.string().optional(),
    einleitung: z.string().optional(),
    bild: z.string().optional(),
    bildAlt: z.string().optional(),
    handschrift: z.string().optional(),
    zeigeFormular: z.boolean().default(false),
    zeigeKontaktBanner: z.boolean().default(true),
    seo,
  }),
});

export const collections = { leistungen, seiten };
