import { createEventId, readAttribution, readMetaCookies } from '../../lib/tracking/attribution';
import { getConsent } from '../../lib/tracking/consent';
import type { LeadFormValues, LeadPayload } from './types';

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT;

export function buildPayload(values: LeadFormValues): LeadPayload {
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
  };
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
    const body = (await response.json().catch(() => null)) as { ok?: boolean } | null;
    if (!response.ok || !body?.ok) throw new Error(`Falha no envio (HTTP ${response.status})`);
  } finally {
    window.clearTimeout(timeout);
  }
}
