import { createEventId, readAttribution, readMetaCookies } from '../../lib/tracking/attribution';
import { getConsent } from '../../lib/tracking/consent';
import type { LeadFormValues, LeadPayload } from './types';

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT;

export function buildPayload(values: LeadFormValues, openedAt: number): LeadPayload {
  const { fbp, fbc } = readMetaCookies();

  return {
    lead: {
      name: values.name.trim().replace(/\s+/g, ' '),
      phone: values.phone,
      email: values.email.trim().toLowerCase(),
      company: values.company.trim(),
      segment: values.segment,
      revenue: values.revenue,
      interests: values.interests,
      had_agency: values.hadAgency,
      city: values.city.trim(),
      uf: values.uf,
      instagram: values.instagram.trim(),
      message: values.message.trim(),
      privacy_accepted: true,
    },
    tracking: {
      event_id: createEventId('lead'),
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      consent_tracking: getConsent(),
      fbp,
      fbc,
      user_agent: navigator.userAgent,
    },
    attribution: readAttribution(),
    meta: { submitted_at: new Date().toISOString(), form: 'contato_comercial', version: 1 },
    honeypot: values.website,
    form_opened_at: openedAt,
  };
}

/** Falha de envio com um motivo que a interface sabe traduzir. */
export class SubmitError extends Error {
  constructor(readonly reason: 'rate_limit' | 'validacao' | 'servidor' | 'rede') {
    super(reason);
    this.name = 'SubmitError';
  }
}

export async function submitLead(payload: LeadPayload) {
  // Sem endpoint configurado: modo simulação (nada sai do navegador).
  if (!ENDPOINT) {
    if (import.meta.env.DEV) console.info('[lead-form] simulação de envio (defina VITE_FORM_ENDPOINT)', payload);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    return;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (response.ok) {
      const body = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      if (body?.ok) return;
      throw new SubmitError('servidor');
    }
    // 429 = limite por IP no servidor; 422 = validação recusada lá também.
    if (response.status === 429) throw new SubmitError('rate_limit');
    if (response.status === 422) throw new SubmitError('validacao');
    throw new SubmitError('servidor');
  } catch (error) {
    if (error instanceof SubmitError) throw error;
    throw new SubmitError('rede');
  } finally {
    window.clearTimeout(timeout);
  }
}
