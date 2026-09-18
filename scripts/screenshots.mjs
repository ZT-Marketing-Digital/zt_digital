// QA visual: screenshots por seção em desktop e mobile, erros de console e requisições de medição.
// Uso: node scripts/screenshots.mjs [url] [--reduced]
// Usa o Edge/Chrome já instalado (playwright-core, sem baixar navegador).
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';

const url = process.argv.find((arg) => arg.startsWith('http')) ?? 'http://localhost:4173/';
const reduced = process.argv.includes('--reduced');
const outDir = resolve(import.meta.dirname, '..', 'qa-screens', reduced ? 'reduced' : 'default');
mkdirSync(outDir, { recursive: true });

const SECTIONS = [
  ['hero', '#inicio'],
  ['dor', '.pain'],
  ['sobre', '#sobre'],
  ['processo', '#processo'],
  ['servicos', '#servicos'],
  ['faixa', '.marquee'],
  ['destaque', '.highlight'],
  ['acompanhamento', '.follow-up'],
  ['clientes', '#clientes'],
  ['quem-somos', '.about'],
  ['contato', '#contato'],
  ['rodape', '.site-footer'],
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'msedge' });
const report = { consoleErrors: [], trackingBeforeConsent: [] };

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    deviceScaleFactor: vp.deviceScaleFactor ?? 1,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    locale: 'pt-BR',
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') report.consoleErrors.push(`[${vp.name}] ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => report.consoleErrors.push(`[${vp.name}] pageerror: ${err.message}`));
  page.on('request', (req) => {
    if (/facebook\.(net|com)|googletagmanager|google-analytics/.test(req.url())) {
      report.trackingBeforeConsent.push(`[${vp.name}] ${req.url().slice(0, 120)}`);
    }
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  // Primeira dobra com o banner de consentimento visível.
  await page.screenshot({ path: `${outDir}/${vp.name}-00-primeira-dobra.png` });

  // Esconde o banner nas capturas seguintes sem aceitar/recusar (não dispara medição).
  await page.addStyleTag({ content: '.consent{display:none!important}' });

  for (const [index, [name, selector]] of SECTIONS.entries()) {
    const el = page.locator(selector).first();
    // Percorre a seção inteira para disparar as entradas (whileInView) antes da captura.
    await el.evaluate(async (node) => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      for (let y = top; y < top + node.offsetHeight; y += window.innerHeight * 0.5) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 180));
      }
      window.scrollTo({ top: top - 76, behavior: 'instant' });
    });
    await page.waitForTimeout(1300);
    const box = await el.boundingBox();
    const tall = box && box.height > vp.height * 1.6;
    const file = `${outDir}/${vp.name}-${String(index + 1).padStart(2, '0')}-${name}.png`;
    if (tall) {
      // Seções longas: captura a viewport (o painel travado precisa ser visto em uso).
      await page.screenshot({ path: file });
    } else {
      await el.screenshot({ path: file });
    }
  }

  // Processo: uma captura por etapa para conferir a troca de tela do painel travado.
  const steps = page.locator('.process-step');
  const count = await steps.count();
  for (let i = 0; i < count; i += 1) {
    await steps.nth(i).evaluate((node) =>
      window.scrollTo({ top: node.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45, behavior: 'instant' }),
    );
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${outDir}/${vp.name}-processo-etapa-${i + 1}.png` });
  }

  await context.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
console.log(`Screenshots em ${outDir}`);
