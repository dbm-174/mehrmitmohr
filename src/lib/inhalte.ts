import { getCollection } from 'astro:content';
import einstellungenJson from '../../content/settings/global.json';
import startseiteJson from '../../content/startseite/index.json';

/* ---------------------------------------------------------------------------
   Zugriff auf die Inhalte, die TinaCMS unter content/ pflegt.

   Einstellungen und Startseite sind Einzeldateien (JSON) und werden direkt
   importiert. Leistungen und Seiten sind Sammlungen und laufen über Astros
   Content Collections (siehe src/content.config.ts).
--------------------------------------------------------------------------- */

export interface NavigationsEintrag {
  label: string;
  href: string;
}

export interface Einstellungen {
  logo: { wortEins: string; wortKursiv: string; wortDrei: string; claim: string };
  navigation: NavigationsEintrag[];
  kontakt: { name: string; email: string; telefon?: string; ort?: string };
  formular: { endpoint?: string };
  footer: { text: string; rechtlicheLinks: NavigationsEintrag[] };
  seo: { titel: string; beschreibung: string };
}

export const einstellungen = einstellungenJson as Einstellungen;
export const startseite = startseiteJson;

/** Alle Leistungen in der von der Redaktion gesetzten Reihenfolge. */
export async function ladeLeistungen() {
  const eintraege = await getCollection('leistungen');
  return eintraege.sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
}

/**
 * Baut den Seitentitel für <title>. Die Startseite bekommt keinen Zusatz
 * doppelt angehängt, alle anderen Seiten "Titel – Mehr mit Mohr".
 */
export function seitentitel(titel?: string): string {
  const basis = einstellungen.seo.titel;
  if (!titel || titel === basis) return basis;
  return `${titel} – ${basis}`;
}

/**
 * Ziel des Kontaktformulars. Solange in den Einstellungen kein Endpunkt
 * hinterlegt ist, zeigt die Kontaktseite stattdessen den E-Mail-Weg an.
 */
export function formularEndpoint(): string | null {
  const endpoint = einstellungen.formular?.endpoint?.trim();
  return endpoint ? endpoint : null;
}

/** mailto-Link mit vorbereitetem Betreff. */
export function mailtoLink(betreff = 'Anfrage über mehrmitmohr.de'): string {
  return `mailto:${einstellungen.kontakt.email}?subject=${encodeURIComponent(betreff)}`;
}
