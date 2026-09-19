// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Die Domain wird für sitemap.xml und die Canonical-/Open-Graph-URLs gebraucht.
// Sobald die endgültige Adresse feststeht, hier eintragen.
const site = process.env.SITE_URL ?? 'https://kati.dbm-connect.de';

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
    plugins: [adminOhneIndexHtml()],
  },
});

/**
 * Der TinaCMS-Editor liegt als fertige Datei unter public/admin/index.html.
 * Ein Webserver liefert dafür auch bei /admin/ automatisch die index.html aus –
 * Astros Entwicklungsserver tut das nicht und antwortet mit 404.
 *
 * Damit die Adresse lokal und online dieselbe ist, wird /admin und /admin/
 * hier auf die Datei umgeschrieben. Betrifft nur den Entwicklungsserver.
 *
 * @returns {import('vite').Plugin}
 */
function adminOhneIndexHtml() {
  return {
    name: 'mehrmitmohr:admin-ohne-index-html',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url) {
          const [pfad, rest] = req.url.split(/(?=[?#])/, 2);
          if (pfad === '/admin' || pfad === '/admin/') {
            req.url = `/admin/index.html${rest ?? ''}`;
          }
        }
        next();
      });
    },
  };
}
