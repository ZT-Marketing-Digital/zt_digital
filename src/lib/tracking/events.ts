// Plano de eventos da landing: único ponto que conhece nomes e parâmetros.
// Nunca enviar nome, e-mail ou telefone como parâmetro de evento.
import { track, trackCustom } from './tracker';

const CONTENT = { content_name: 'ZT Digital — Assessoria de marketing', content_category: 'Marketing digital' } as const;

export type ContactMethod = 'whatsapp' | 'phone' | 'email' | 'instagram';

// Segmento e faturamento NÃO entram aqui: os Termos das Ferramentas de Negócios da Meta proíbem
// enviar informação financeira ou de saúde (ex.: "saude_odontologia"). Eles seguem só para o backend.
export type LeadEventParams = {
  interests: string;
  had_agency: string;
  uf: string;
};

export const events = {
  // O GA4 já registra page_view sozinho ao carregar; não espelhar.
  pageView: () => track('PageView'),

  /** Visitante chegou aos serviços: engajamento real, não só carregamento. */
  viewContent: () => track('ViewContent', { ...CONTENT, content_type: 'service' }, { ga4: 'view_item' }),

  sectionView: (section: string) => trackCustom('SectionView', { section }),

  scrollDepth: (percent: number) => trackCustom('ScrollDepth', { percent }, 'scroll_depth'),

  processStepView: (step: number, title: string) => trackCustom('ProcessStepView', { step, title }),

  ctaClick: (cta: string, location: string) => trackCustom('CtaClick', { cta, location }, 'cta_click'),

  contact: (method: ContactMethod, location: string) =>
    track('Contact', { ...CONTENT, method, location }, { ga4: 'contact' }),

  leadFormStart: () => trackCustom('LeadFormStart', CONTENT, 'form_start'),

  /** Somente os nomes dos campos com erro. */
  leadFormError: (fields: string) => trackCustom('LeadFormError', { fields }),

  /** Disparado só após o envio confirmado, com o mesmo event_id enviado ao backend. */
  lead: (params: LeadEventParams, eventID: string) =>
    track('Lead', { ...CONTENT, lead_type: 'contato_comercial', ...params }, { eventID, ga4: 'generate_lead' }),
};
