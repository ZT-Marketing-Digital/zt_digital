// GA4 opcional: só carrega se VITE_GA4_ID estiver definido E houver consentimento.

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export const GA4_ID = import.meta.env.VITE_GA4_ID || '';

let injected = false;

export function injectGa4() {
  if (!GA4_ID || injected || typeof window === 'undefined') return;
  injected = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // O gtag.js espera o objeto `arguments`, não um array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);
}

export function sendGa4(name: string, params: Record<string, string | number | boolean | undefined>) {
  window.gtag?.('event', name, params);
}
