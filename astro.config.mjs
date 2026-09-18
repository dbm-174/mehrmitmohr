// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Die Domain wird für sitemap.xml und die Canonical-/Open-Graph-URLs gebraucht.
// Sobald die endgültige Adresse feststeht, hier eintragen.
const site = process.env.SITE_URL ?? 'https://www.mehrmitmohr.de';

export default defineConfig({
  site,

  // Bewusst statisch: Die Seite wird als reines HTML gebaut und kann auf jedem
  // Webspace liegen. Tina läuft nur als Editor-Oberfläche unter /admin.
  output: 'static',

  integrations: [mdx(), sitemap()],


  vite: {
    server: {
      // Tina schreibt Inhalte nach content/ – Astro soll darauf reagieren.
      watch: { ignored: ['**/tina/__generated__/**'] },
    },
  },
});
