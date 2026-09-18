// Meta Pixel carregado somente após consentimento.
// Equivale ao código-base oficial (fbq + fbevents.js), reescrito com tipos.

export type PixelParams = Record<string, string | number | boolean | undefined>;

type FbqArgs = unknown[];
type Fbq = ((...args: FbqArgs) => void) & {
  callMethod?: (...args: FbqArgs) => void;
  queue: FbqArgs[];
  push: Fbq;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '1400437541519673';

let injected = false;

export function injectMetaPixel() {
  if (injected || typeof window === 'undefined') return;
  injected = true;

  if (!window.fbq) {
    const fbq = function (...args: FbqArgs) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    // Página única: o PageView é disparado uma vez pelo plano de eventos. Sem isso, o Pixel
    // dispararia PageViews extras a cada mudança de âncora na URL (history API).
    fbq.disablePushState = true;
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  window.fbq('init', PIXEL_ID);
}

/**
 * API de consentimento oficial da Meta. Usada quando o visitante muda a escolha depois de o Pixel
 * já ter carregado (rodapé → Preferências de cookies): 'revoke' para eventos automáticos e cookies.
 */
export function setMetaPixelConsent(state: 'grant' | 'revoke') {
  if (!injected) return;
  window.fbq?.('consent', state);
}

export function sendPixel(kind: 'track' | 'trackCustom', name: string, params: PixelParams, eventID: string) {
  window.fbq?.(kind, name, params, { eventID });
}
