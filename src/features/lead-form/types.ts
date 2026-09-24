import type { Attribution } from '../../lib/tracking/attribution';
import type { ConsentState } from '../../lib/tracking/consent';

export type LeadFormValues = {
  name: string;
  phone: string;
  email: string;
  company: string;
  segment: string;
  revenue: string;
  interests: string[];
  hadAgency: string;
  city: string;
  uf: string;
  instagram: string;
  message: string;
  privacy: boolean;
  /** Honeypot anti-spam: deve permanecer vazio. */
  website: string;
};

export type LeadFormField = keyof LeadFormValues;
export type LeadFormErrors = Partial<Record<LeadFormField, string>>;

/**
 * Contrato do POST para o backend (api/lead.php).
 * Content-Type: application/json. Resposta esperada: 2xx com `{ "ok": true }`.
 */
export type LeadPayload = {
  lead: {
    name: string;
    phone: string;
    email: string;
    company: string;
    segment: string;
    revenue: string;
    interests: string[];
    had_agency: string;
    city: string;
    uf: string;
    instagram: string;
    message: string;
    privacy_accepted: true;
  };
  tracking: {
    /** Mesmo eventID do `Lead` no Pixel — usar na Conversions API para deduplicar. */
    event_id: string;
    event_name: 'Lead';
    event_time: number;
    event_source_url: string;
    consent_tracking: ConsentState;
    fbp?: string;
    fbc?: string;
    user_agent: string;
  };
  attribution: Attribution;
  meta: { submitted_at: string; form: 'contato_comercial'; version: 1 };
  honeypot: string;
  /** Momento (ms) em que o formulário apareceu: o servidor descarta envio rápido demais. */
  form_opened_at: number;
};
