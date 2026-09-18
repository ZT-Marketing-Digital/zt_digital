// Captura UTMs / fbclid na chegada e lê os cookies do Pixel (_fbp/_fbc)
// para anexar ao lead e permitir deduplicação via Conversions API.

const KEY = 'zt-attribution';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'] as const;

export type Attribution = Partial<Record<(typeof PARAMS)[number], string>> & {
  landing_url?: string;
  referrer?: string;
  first_seen_at?: string;
};

export function captureAttribution() {
  try {
    const url = new URL(window.location.href);
    const found: Attribution = {};
    PARAMS.forEach((param) => {
      const value = url.searchParams.get(param);
      if (value) found[param] = value;
    });

    const stored = readAttribution();
    // Mantém a primeira origem da sessão, mas atualiza se chegar uma nova campanha.
    if (Object.keys(found).length || !stored.first_seen_at) {
      const next: Attribution = {
        ...stored,
        ...found,
        landing_url: stored.landing_url ?? url.href,
        referrer: stored.referrer ?? (document.referrer || undefined),
        first_seen_at: stored.first_seen_at ?? new Date().toISOString(),
      };
      window.sessionStorage.setItem(KEY, JSON.stringify(next));
    }
  } catch {
    /* sem sessionStorage: atribuição fica vazia */
  }
}

export function readAttribution(): Attribution {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) ?? '{}') as Attribution;
  } catch {
    return {};
  }
}

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function readMetaCookies() {
  let fbc = readCookie('_fbc');
  const { fbclid } = readAttribution();
  // Formato oficial do fbc quando o cookie ainda não foi criado pelo Pixel.
  if (!fbc && fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  return { fbp: readCookie('_fbp'), fbc };
}

export function createEventId(prefix = 'evt') {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}
