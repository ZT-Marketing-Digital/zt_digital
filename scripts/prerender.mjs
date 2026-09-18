// Gera o HTML estático (SEO / leitura sem JS) das duas rotas a partir do bundle SSR,
// e escreve sitemap.xml e robots.txt com a URL de produção.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const root = resolve(import.meta.dirname, '..');
const env = loadEnv('production', root, 'VITE_');
const siteUrl = (env.VITE_SITE_URL || 'https://ztdigital.com.br').replace(/\/$/, '');

const template = readFileSync(resolve(root, 'dist/index.html'), 'utf-8');
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href);

const PRIVACY_PATH = '/politica-de-privacidade-e-de-pagamento/';

function page(html, { title, description, path }) {
  let out = template.replace('<!--app-html-->', html);
  if (title) out = out.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
  if (description) {
    out = out.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/s, `$1${description}$2`);
  }
  if (path) {
    out = out
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${siteUrl}${path}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${siteUrl}${path}$2`);
  }
  return out;
}

function assertContains(html, text, label) {
  if (!html.includes(text)) throw new Error(`Pré-render de ${label} não contém: "${text}"`);
}

const home = page(render('home'), {});
assertContains(home, 'Nosso negócio é', 'home');
assertContains(home, 'Serviços que a ZT Digital oferece', 'home');
writeFileSync(resolve(root, 'dist/index.html'), home);

const privacy = page(render('privacy'), {
  title: 'Política de Privacidade e Pagamentos | ZT Digital',
  description: 'Política de Privacidade e Pagamentos da ZT Marketing Digital LTDA: coleta de dados, direitos do titular e condições de pagamento.',
  path: PRIVACY_PATH,
});
assertContains(privacy, 'SEÇÃO 1', 'política');
mkdirSync(resolve(root, `dist${PRIVACY_PATH}`), { recursive: true });
writeFileSync(resolve(root, `dist${PRIVACY_PATH}index.html`), privacy);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  resolve(root, 'dist/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>${siteUrl}${PRIVACY_PATH}</loc><lastmod>${today}</lastmod><priority>0.3</priority></url>
</urlset>
`,
);
writeFileSync(resolve(root, 'dist/robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`Pré-render concluído: / e ${PRIVACY_PATH} (${siteUrl})`);
