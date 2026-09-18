// QA do formulário e do consentimento, ponta a ponta.
// Uso: node scripts/qa-form.mjs <url> <cenário>
//   cenários: sucesso (dev, modo simulação) | erro (preview, endpoint inexistente) | recusa
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:5173/';
const scenario = process.argv[3] ?? 'sucesso';
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'msedge' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const logs = [];
const tracking = [];
const errors = [];
page.on('console', (msg) => {
  const text = msg.text();
  if (msg.type() === 'error') errors.push(text);
  if (text.startsWith('[tracking]') || text.startsWith('[lead-form]')) logs.push(text.slice(0, 160));
});
page.on('pageerror', (err) => errors.push(err.message));
page.on('request', (req) => {
  if (/facebook\.(net|com)/.test(req.url())) tracking.push(req.url().slice(0, 90));
});

const check = (label, ok) => console.log(`${ok ? 'OK  ' : 'FALHA'} ${label}`);

await page.goto(url, { waitUntil: 'networkidle' });
check('nenhuma requisição à Meta antes da escolha', tracking.length === 0);

if (scenario === 'recusa') {
  await page.getByRole('button', { name: 'Recusar' }).click();
  await page.locator('#contato').scrollIntoViewIfNeeded();
  await page.getByRole('link', { name: /WhatsApp/ }).first().evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
  await page.getByRole('link', { name: /WhatsApp/ }).first().click();
  await page.waitForTimeout(800);
  check('nenhuma requisição à Meta após recusar', tracking.length === 0);
} else {
  await page.getByRole('button', { name: 'Aceitar' }).click();
  await page.waitForTimeout(1500);
  check('Pixel carregado após aceitar', tracking.some((u) => u.includes('fbevents.js')));
}

const form = page.locator('form.lead-form');
await form.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);

// 1) Envio vazio: erros por campo e foco no primeiro
await form.getByRole('button', { name: 'Quero falar com a ZT' }).click();
await page.waitForTimeout(500);
const errorCount = await form.locator('.field__error').count();
check(`erros exibidos no envio vazio (${errorCount})`, errorCount >= 10);
const focused = await page.evaluate(() => document.activeElement?.getAttribute('name'));
check(`foco no primeiro campo com erro (${focused})`, focused === 'name');
await page.screenshot({ path: `qa-screens/form-${scenario}-erros.png`, fullPage: false });

// 2) Preenche com dados válidos
await form.getByLabel('Nome e sobrenome').fill('Teste Automatizado');
await form.getByLabel('WhatsApp').fill('45999998888');
check('máscara de telefone', (await form.getByLabel('WhatsApp').inputValue()) === '(45) 99999-8888');
await form.getByLabel('E-mail').fill('teste@exemplo.com.br');
await form.getByLabel('Empresa', { exact: true }).fill('Empresa Teste');
await form.getByLabel('Segmento').selectOption('saude_odontologia');
await form.getByLabel('Faturamento mensal aproximado').selectOption('nao_informar');
await form.locator('label.chip', { hasText: 'Tráfego pago' }).click();
await form.locator('label.chip', { hasText: 'CRM' }).click();
await form.locator('label.chip', { hasText: 'Não, seria a primeira' }).click();
await form.getByLabel('Cidade', { exact: true }).fill('Toledo');
await form.getByLabel('UF', { exact: true }).selectOption('PR');
await form.locator('input[name="privacy"]').check();
await form.getByRole('button', { name: 'Quero falar com a ZT' }).click();
await page.waitForTimeout(2500);

if (scenario === 'erro') {
  const alert = await page.locator('.lead-form__alert').textContent().catch(() => '');
  check('estado de erro com alternativa de WhatsApp', Boolean(alert?.includes('WhatsApp')));
  check('Lead NÃO disparado quando o envio falha', !logs.some((l) => l.includes('track Lead')));
  await page.locator('.lead-form__alert').screenshot({ path: `qa-screens/form-erro-alerta.png` });
} else {
  const success = await page.locator('.lead-form--success').isVisible();
  check('estado de sucesso exibido', success);
  await page.locator('.lead-form--success').screenshot({ path: `qa-screens/form-${scenario}-sucesso.png` }).catch(() => undefined);
}

// Nenhum dado pessoal em parâmetros de evento
const leaked = logs.filter((l) => l.startsWith('[tracking]') && /Teste Automatizado|teste@exemplo|99999-8888/.test(l));
check('nenhum dado pessoal nos eventos', leaked.length === 0);

console.log('\n--- logs do plano de eventos ---');
logs.forEach((l) => console.log(l));
console.log('\n--- requisições Meta ---');
tracking.forEach((u) => console.log(u));
console.log('\n--- erros de console ---');
console.log(errors.length ? errors.join('\n') : '(nenhum)');

await browser.close();
