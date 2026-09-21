# ZT Digital — landing page

Nova landing de https://ztdigital.com.br, reconstruída a partir do conteúdo real do site atual (WordPress/Elementor).
O dossiê da extração está em [docs/pesquisa-origem.md](docs/pesquisa-origem.md) e a estratégia/mapa de seções em [docs/estrategia.md](docs/estrategia.md).

Stack: React 19 + TypeScript + Vite, pré-render (SSR → HTML estático), Motion, GSAP + ScrollTrigger, Lenis, lucide-react. CSS puro com tokens. Backend do formulário em PHP para o cPanel.

## Scripts

| Comando | O que faz |
|---|---|
| `npm install` | Instala dependências |
| `npm run dev` | Servidor de desenvolvimento (http://localhost:5173). Formulário em **modo simulação** e logs de eventos no console |
| `npm run build` | Typecheck + build + SSR + pré-render de `/` e `/politica-de-privacidade-e-de-pagamento/`, `sitemap.xml` e `robots.txt` em `dist/` |
| `npm run preview` | Serve o `dist/` (http://localhost:4173) |
| `npm run qa:screens` | Screenshots por seção em 1440 px e 390 px (`qa-screens/`), erros de console e requisições de medição. Aceita `--reduced` |
| `node scripts/qa-form.mjs <url> sucesso\|erro\|recusa` | Teste ponta a ponta do formulário e do consentimento |
| `node scripts/og-image.mjs` | Regera `public/og-image.png` |

Os scripts de QA usam o **Edge instalado na máquina** via `playwright-core` (sem baixar navegador). Para usar o Chrome: `PW_CHANNEL=chrome`.

## Variáveis de ambiente

Veja [.env.example](.env.example). `.env` (local, não versionado) e `.env.production` (valores públicos do build).

| Variável | Uso |
|---|---|
| `VITE_SITE_URL` | Canonical, Open Graph, JSON-LD, sitemap |
| `VITE_META_PIXEL_ID` | Meta Pixel (`1400437541519673`) |
| `VITE_GA4_ID` | GA4 opcional. Vazio = não carrega. O site atual usa `G-8ZZQQ994FV` |
| `VITE_FORM_ENDPOINT` | Endpoint do formulário. Vazio = simulação. Produção: `/api/lead.php` |

## Estrutura

```
src/
  content/landing.ts      # todo o texto da landing (com a origem anotada)
  content/privacy.ts      # política de privacidade integral, gerada do site atual
  config/site.ts          # contatos, sedes, mensagens de WhatsApp
  components/sections/    # uma seção por arquivo
  components/ui/          # ZtMark (logo vetorizada), Brackets, Reveal, CountUp, ícones de marca...
  components/layout/      # banner de consentimento, WhatsApp flutuante
  components/pages/       # página da política
  features/lead-form/     # formulário: tipos, validação, payload, envio
  lib/tracking/           # consentimento, atribuição, Pixel, GA4, despachante e plano de eventos
  lib/motion/             # Lenis + GSAP, hook de viewport
  styles/                 # tokens.css, base.css, components.css, sections.css
api/                      # lead.php + config.example.php (backend no cPanel)
scripts/                  # prerender, QA, OG image
```

## Medição e consentimento

- Nada de terceiros carrega antes da escolha no banner. Eventos disparados antes ficam **em fila**; se o visitante aceitar, são enviados; se recusar, são **descartados**. A escolha fica em `localStorage` (`zt-consent`) e pode ser revista em "Preferências de cookies" no rodapé.
- Todos os disparos passam por `src/lib/tracking/events.ts`. Nenhum componente chama `fbq` direto.
- Em `npm run dev`, cada evento aparece no console com o prefixo `[tracking]`.

### Plano de eventos

| Evento | Tipo | Quando | Parâmetros |
|---|---|---|---|
| `PageView` | padrão | carregamento | — |
| `ViewContent` | padrão | seção Serviços entra na tela | `content_name`, `content_category`, `content_type` |
| `Contact` | padrão | clique em WhatsApp, telefone, e-mail ou Instagram | `method`, `location` |
| `Lead` | padrão | **só após o backend confirmar** o envio | `interests`, `had_agency`, `uf`, `lead_type` + `eventID` (segmento e faturamento ficam fora: a Meta proíbe dados financeiros/de saúde) |
| `ScrollDepth` | custom | 25/50/75/90% | `percent` |
| `SectionView` | custom | Serviços e Contato vistos | `section` |
| `ProcessStepView` | custom | cada etapa do "Como funciona" | `step`, `title` |
| `CtaClick` | custom | CTAs que levam ao formulário | `cta`, `location` |
| `LeadFormStart` | custom | primeiro foco no formulário | — |
| `LeadFormError` | custom | envio com erro de validação | `fields` (só nomes dos campos) |

Nome, e-mail e telefone **nunca** vão em parâmetros de evento no navegador. Com `VITE_GA4_ID` preenchido, `ViewContent`, `Contact`, `Lead`, `ScrollDepth`, `CtaClick` e `LeadFormStart` são espelhados no GA4 (`view_item`, `contact`, `generate_lead`, `scroll_depth`, `cta_click`, `form_start`).

## Contrato do formulário

`POST {VITE_FORM_ENDPOINT}` com `Content-Type: application/json`. Resposta esperada: `2xx` com `{ "ok": true }`. Qualquer outra resposta mostra o estado de erro (com atalho para o WhatsApp) e **não** dispara `Lead`.

```jsonc
{
  "lead": {
    "name": "Maria Souza",
    "phone": "(45) 99999-8888",
    "email": "maria@empresa.com.br",
    "company": "Clínica Exemplo",
    "segment": "saude_odontologia",   // saude_odontologia | estetica_beleza | varejo | servicos | industria | educacao | imobiliario | outro
    "revenue": "50k_100k",            // ate_20k | 20k_50k | 50k_100k | 100k_300k | acima_300k | nao_informar
    "interests": ["trafego", "crm"],  // assessoria_completa | trafego | crm | conteudo | social | sites | design | copy
    "had_agency": "sim",              // sim | nao
    "city": "Toledo",
    "uf": "PR",
    "instagram": "@clinicaexemplo",   // opcional
    "message": "",                    // opcional
    "privacy_accepted": true
  },
  "tracking": {
    "event_id": "lead_6f1c…",         // mesmo eventID do Lead no Pixel → deduplicação na Conversions API
    "event_name": "Lead",
    "event_time": 1789750000,
    "event_source_url": "https://ztdigital.com.br/?utm_source=…",
    "consent_tracking": "granted",    // granted | denied | unknown
    "fbp": "fb.1.…",                  // se existir
    "fbc": "fb.1.…",                  // se existir (ou montado a partir do fbclid)
    "user_agent": "Mozilla/5.0 …"
  },
  "attribution": { "utm_source": "…", "utm_medium": "…", "utm_campaign": "…", "fbclid": "…", "landing_url": "…", "referrer": "…", "first_seen_at": "…" },
  "meta": { "submitted_at": "2026-09-18T18:00:00.000Z", "form": "contato_comercial", "version": 1 },
  "honeypot": ""                      // preenchido = bot
}
```

### Checklist do backend (`api/lead.php`)

- [x] Aceita só `POST` JSON, até 32 KB, de origens da lista `allowed_origins`
- [x] Honeypot preenchido → responde `{ ok: true }` e descarta
- [x] Rate limit por IP (5 envios / 10 min, em arquivo)
- [x] Revalida todos os campos com as mesmas regras e listas fechadas do front
- [x] Grava cada lead em `api/data/leads-AAAA-MM.jsonl` (bloqueado para a web)
- [x] E-mail de notificação para `contato@ztdigital.com.br` com `Reply-To` do lead e link direto de WhatsApp
- [x] Conversions API opcional (token em `config.php`), só com `consent_tracking = granted`, dados com SHA-256 e o mesmo `event_id`
- [ ] **Não executado localmente** (sem PHP na máquina de desenvolvimento). Testar no cPanel após o deploy — ver abaixo.

## Deploy automático (GitHub Actions → HostGator)

Todo push na `main` dispara [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): instala, faz o build, confere o resultado e envia por FTP. Também dá para rodar à mão em **Actions → Deploy para HostGator → Run workflow**.

**Secrets necessários** (repositório → Settings → Secrets and variables → Actions):

| Secret | Valor |
|---|---|
| `FTP_HOST` | host FTP do cPanel (ex.: `ftp.ztdigital.com.br`) |
| `FTP_USERNAME` | usuário da conta de FTP criada para o deploy |
| `FTP_PASSWORD` | senha dessa conta |

Crie no cPanel uma **conta de FTP dedicada ao deploy**, com o diretório apontando direto para a raiz do site (`/home2/ztdigi26/public_html`). Assim o `server-dir: ./` do workflow já cai na raiz. Se usar o usuário principal do cPanel, troque para `server-dir: ./public_html/`.

O que o workflow envia:

- `dist/` → raiz do site (HTML pré-renderizado, assets, `.htaccess`, `sitemap.xml`, `robots.txt`)
- `api/` → `public_html/api/` (backend do formulário)

O que ele **não** toca, porque não está no repositório e o `dangerous-clean-slate` está desligado: `api/config.php` e os leads em `api/data/`.

Antes de conferir o build, o job falha se faltar o `index.html`, a página da política, o texto pré-renderizado, o Pixel no bundle ou o `.htaccess`.

### Antes do primeiro deploy

1. **Backup completo** do site atual (arquivos + banco) pelo cPanel.
2. Decidir o destino de `/contrato/` e `/contrato-bodyprime/`, que hoje são páginas do WordPress.
3. Saber que **o `.htaccess` da raiz será substituído** pelo desta landing. O do WordPress vai embora no primeiro deploy.
4. Os arquivos antigos do WordPress **não são apagados** (o deploy nunca apaga nada). Como o nosso `.htaccess` define `DirectoryIndex index.html`, o site passa a servir a landing, mas a limpeza do WordPress é manual.
5. Criar `api/config.php` no servidor a partir de `api/config.example.php` e a caixa `noreply@ztdigital.com.br` no cPanel.
6. Conferir que `https://ztdigital.com.br/api/config.php` e `/api/data/` retornam **403**.

## Deploy manual (alternativa)

1. `npm run build`.
2. **Antes de apagar o WordPress**, faça backup completo (arquivos + banco) e confirme o que fazer com `/contrato/` e `/contrato-bodyprime/`, que deixam de existir.
3. Envie o conteúdo de `dist/` para `public_html/` (inclui `.htaccess`, `sitemap.xml`, `robots.txt` e a pasta da política no mesmo caminho do WordPress).
4. Envie a pasta `api/` para `public_html/api/`. Copie `api/config.example.php` para `api/config.php` e ajuste (remetente `noreply@ztdigital.com.br` precisa existir no cPanel).
5. Confirme que `https://ztdigital.com.br/api/config.php` e `/api/data/` retornam **403**.
6. Teste o formulário em produção: um envio real, confira o e-mail e o arquivo `.jsonl`. O servidor tem ModSecurity — se o `POST` retornar 406, peça liberação da rota `/api/lead.php` à hospedagem.
7. Valide o Pixel com o **Meta Pixel Helper** e o **Events Manager → Testar eventos** num navegador real (aceite o banner). Sob automação o `fbevents.js` não envia hits, então esse passo não é coberto pelos testes.
8. No Google Search Console, reenvie o `sitemap.xml`.

## Pendências de conteúdo (pedir à ZT)

1. **Telefone de Toledo:** a home mostra +55 45 98841-1379 e a página da política mostra +55 45 8828-1888. Qual vale?
2. ~~**WhatsApp comercial**~~ — resolvido em 21/09/2026: todos os botões usam **+55 45 8828-1888**.
3. **Depoimentos reais** (texto ou vídeo, com autorização). A seção de depoimentos do site atual tem só texto de demonstração do tema, por isso ficou fora.
4. **Cases com números** autorizados pelos clientes (hoje a página não traz nenhum número além de "+100 empresas", que vem do site).
5. **História:** ano de fundação, fundadores, fotos reais da equipe e do espaço no Biopark.
6. **Autorização de uso dos 15 logos** de parceiros (já estão no site atual; a landing só os padronizou em branco).
7. **Política de privacidade:** foi mantida sem alteração, mas cita apenas Google Analytics. Atualizar para citar o Meta Pixel, o banner de consentimento e o formulário.
8. **GA4:** manter `G-8ZZQQ994FV`? Se sim, preencher `VITE_GA4_ID` no `.env.production`.
9. **Conversions API:** gerar o token no Events Manager e colocar em `api/config.php`, se quiserem a deduplicação servidor a servidor.
10. **Contratos** em `/contrato/` e `/contrato-bodyprime/`: migrar, mover para outro caminho ou descartar.
