import type { LeadFormErrors, LeadFormField, LeadFormValues } from './types';

export const INITIAL_VALUES: LeadFormValues = {
  name: '',
  phone: '',
  email: '',
  company: '',
  segment: '',
  revenue: '',
  interests: [],
  hadAgency: '',
  city: '',
  uf: '',
  instagram: '',
  message: '',
  privacy: false,
  website: '',
};

/** Ordem visual dos campos: usada para focar o primeiro erro. */
export const FIELD_ORDER: LeadFormField[] = [
  'name',
  'phone',
  'email',
  'company',
  'segment',
  'revenue',
  'interests',
  'hadAgency',
  'city',
  'uf',
  'instagram',
  'message',
  'privacy',
];

export function maskPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(values: LeadFormValues): LeadFormErrors {
  const errors: LeadFormErrors = {};
  const phoneDigits = values.phone.replace(/\D/g, '');

  if (values.name.trim().split(/\s+/).filter(Boolean).length < 2) errors.name = 'Informe nome e sobrenome.';
  if (phoneDigits.length < 10) errors.phone = 'Informe o WhatsApp com DDD.';
  if (!EMAIL.test(values.email.trim())) errors.email = 'Informe um e-mail válido.';
  if (values.company.trim().length < 2) errors.company = 'Informe o nome da empresa.';
  if (!values.segment) errors.segment = 'Selecione o segmento.';
  if (!values.revenue) errors.revenue = 'Selecione uma faixa (ou "Prefiro não informar").';
  if (values.interests.length === 0) errors.interests = 'Escolha pelo menos uma opção.';
  if (!values.hadAgency) errors.hadAgency = 'Selecione uma opção.';
  if (values.city.trim().length < 2) errors.city = 'Informe a cidade.';
  if (!values.uf) errors.uf = 'Selecione a UF.';
  if (!values.privacy) errors.privacy = 'É necessário concordar para que a ZT possa entrar em contato.';

  return errors;
}
