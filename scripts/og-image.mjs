// Gera public/og-image.png (1200×630) a partir de HTML, com a fonte e o monograma reais.
// Uso: node scripts/og-image.mjs
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';

const Z = {
  frameTop: 'M0 0H390V54H56V161H0Z',
  frameBottom: 'M390 373H335V480H0V531H390Z',
  tBar: 'M227 106H390V159H227Z',
  tStem: 'M334 162V319H279V214Z',
  z: 'M0 214V267H60L110 216V266L0 372V424H168V372H112L56 424V372L168 267V214Z',
};
const DOTS = ['M114 106H168V161H114Z', 'M223 373H279V424H223Z'];

const html = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;font-family:Sora,sans-serif;color:#eef2f2;overflow:hidden;
    background:radial-gradient(700px 420px at 90% 0%,rgba(255,125,0,.28),transparent 60%),#0b1315;
    display:flex;align-items:center;justify-content:space-between;padding:0 90px}
  .k{font-size:20px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#ff9433;margin-bottom:28px}
  h1{font-size:76px;line-height:1.04;letter-spacing:-.045em;font-weight:700;max-width:680px}
  h1 span{background:#ff7d00;color:#0b1315;padding:0 .1em}
  p{margin-top:28px;font-size:24px;color:#a9b6b8;max-width:620px}
  svg{height:400px}
</style></head><body>
<div><div class="k">ZT Marketing Digital</div>
<h1>Nosso negócio é <span>vender o seu.</span></h1>
<p>Assessoria de marketing completa: tráfego pago, CRM, conteúdo e acompanhamento semanal.</p></div>
<svg viewBox="0 0 390 531" fill="#eef2f2">${Object.values(Z).map((d) => `<path d="${d}"/>`).join('')}${DOTS.map((d) => `<path fill="#ff7d00" d="${d}"/>`).join('')}</svg>
</body></html>`;

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(import.meta.dirname, '..', 'public', 'og-image.png') });
await browser.close();
console.log('public/og-image.png gerado');
