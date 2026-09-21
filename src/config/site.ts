// Contatos e links reais extraídos de ztdigital.com.br (ver docs/pesquisa-origem.md).

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://ztdigital.com.br').replace(/\/$/, '');

export const SITE = {
  url: siteUrl,
  name: 'ZT Digital',
  legalName: 'ZT MARKETING DIGITAL LTDA',
  cnpj: '56.634.696/0001-62',
  privacyPath: '/politica-de-privacidade-e-de-pagamento/',
  instagram: {
    handle: '@zt.digital',
    url: 'https://www.instagram.com/zt.digital/',
  },
  contact: {
    email: 'contato@ztdigital.com.br',
    // Número confirmado pela ZT em 21/09/2026 (substitui o 45 98843-0522 que estava no site antigo).
    whatsappE164: '554588281888',
    whatsappDisplay: '+55 45 8828-1888',
  },
  offices: [
    {
      city: 'Toledo',
      uf: 'PR',
      label: 'Sede em Toledo-PR',
      address: 'Rodovia estadual - conexão com BR - PR-182 - Biopark, Toledo - PR, 85906-300',
      phoneE164: '+5545988411379',
      phoneDisplay: '+55 45 98841-1379',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Biopark%2C%20Toledo%20-%20PR%2C%2085906-300',
    },
    {
      city: 'Florianópolis',
      uf: 'SC',
      label: 'Sede em Florianópolis-SC',
      address: 'Rodovia SC 401, 4100 - Km4 - Saco Grande, Florianópolis - SC, 88032-005',
      phoneE164: '+5548988108396',
      phoneDisplay: '+55 48 98810-8396',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Rodovia%20SC%20401%2C%204100%20-%20Saco%20Grande%2C%20Florian%C3%B3polis%20-%20SC',
    },
  ],
} as const;

/** Mensagens pré-prontas. As duas primeiras são as mesmas do site atual. */
export const WHATSAPP_MESSAGES = {
  default: 'Olá equipe da ZT, acessei seu site e fiquei interessado pelos seus serviços.',
  contact: 'Olá equipe da ZT, estou interessado nos seus serviços!',
  afterForm: 'Olá equipe da ZT, acabei de preencher o formulário no site e queria adiantar a conversa.',
} as const;

export function whatsappUrl(message: string = WHATSAPP_MESSAGES.default) {
  return `https://wa.me/${SITE.contact.whatsappE164}?text=${encodeURIComponent(message)}`;
}
