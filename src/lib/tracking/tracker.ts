// Despachante único: fila até a decisão de consentimento, envio só se aceito, descarte se recusado.
import { createEventId } from './attribution';
import { getConsent, onConsentChange } from './consent';
import { GA4_ID, injectGa4, sendGa4 } from './ga4';
import { injectMetaPixel, sendPixel, setMetaPixelConsent, type PixelParams } from './metaPixel';

export type StandardEvent = 'PageView' | 'ViewContent' | 'Contact' | 'Lead';
export type CustomEvent =
  | 'ScrollDepth'
  | 'SectionView'
  | 'ProcessStepView'
  | 'CtaClick'
  | 'LeadFormStart'
  | 'LeadFormError';

type QueuedEvent = {
  kind: 'track' | 'trackCustom';
  name: StandardEvent | CustomEvent;
  params: PixelParams;
  eventID: string;
  /** Nome equivalente no GA4, quando faz sentido espelhar. */
  ga4?: string;
};

const DEBUG = import.meta.env.DEV;
let pending: QueuedEvent[] = [];
let started = false;

function clean(params: PixelParams): PixelParams {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
}

function loadVendors() {
  injectMetaPixel();
  injectGa4();
}

function send(event: QueuedEvent) {
  const params = clean(event.params);
  sendPixel(event.kind, event.name, params, event.eventID);
  if (GA4_ID && event.ga4) sendGa4(event.ga4, params);
  if (DEBUG) console.info(`[tracking] ${event.kind} ${event.name}`, params, event.eventID);
}

function dispatch(event: QueuedEvent) {
  if (typeof window === 'undefined') return event.eventID;

  const consent = getConsent();
  if (consent === 'granted') {
    loadVendors();
    send(event);
  } else if (consent === 'unknown') {
    pending.push(event);
    if (DEBUG) console.info(`[tracking] na fila (aguardando consentimento): ${event.name}`);
  } else if (DEBUG) {
    console.info(`[tracking] descartado (consentimento recusado): ${event.name}`);
  }
  return event.eventID;
}

export function initTracking() {
  if (started || typeof window === 'undefined') return;
  started = true;
  if (getConsent() === 'granted') loadVendors();

  onConsentChange((state) => {
    if (state === 'granted') {
      loadVendors();
      setMetaPixelConsent('grant');
      pending.forEach(send);
    } else {
      // Pixel já carregado numa escolha anterior: sinaliza a revogação para a Meta.
      setMetaPixelConsent('revoke');
    }
    pending = [];
  });
}

type TrackOptions = { eventID?: string; ga4?: string };

export function track(name: StandardEvent, params: PixelParams = {}, options: TrackOptions = {}) {
  return dispatch({
    kind: 'track',
    name,
    params,
    eventID: options.eventID ?? createEventId(name.toLowerCase()),
    ga4: options.ga4,
  });
}

export function trackCustom(name: CustomEvent, params: PixelParams = {}, ga4?: string) {
  return dispatch({ kind: 'trackCustom', name, params, eventID: createEventId(name.toLowerCase()), ga4 });
}
