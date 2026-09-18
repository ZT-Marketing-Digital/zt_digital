import { ArrowRight, CircleAlert, CircleCheck, LoaderCircle, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { WhatsappIcon } from '../../components/ui/BrandIcons';
import { ContactLink } from '../../components/ui/ContactLink';
import { SITE, WHATSAPP_MESSAGES } from '../../config/site';
import { FORM, FORM_OPTIONS } from '../../content/landing';
import { events } from '../../lib/tracking/events';
import { buildPayload, submitLead } from './submit';
import type { LeadFormErrors, LeadFormField, LeadFormValues } from './types';
import { FIELD_ORDER, INITIAL_VALUES, maskPhone, validate } from './validation';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type TextField = 'name' | 'phone' | 'email' | 'company' | 'segment' | 'revenue' | 'city' | 'uf' | 'instagram' | 'message' | 'website';

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          id={id}
          className="field__error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

function Field({ id, label, error, optional, className = '', children }: FieldProps) {
  return (
    <div className={`field${error ? ' has-error' : ''} ${className}`}>
      <label htmlFor={id}>
        {label}
        {optional ? <span className="field__optional"> (opcional)</span> : null}
      </label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

type ChoiceGroupProps = {
  id: string;
  name: LeadFormField;
  legend: string;
  type: 'radio' | 'checkbox';
  options: readonly { value: string; label: string }[];
  isChecked: (value: string) => boolean;
  error?: string;
  onToggle: (value: string) => void;
};

function ChoiceGroup({ id, name, legend, type, options, isChecked, error, onToggle }: ChoiceGroupProps) {
  return (
    <fieldset
      className={`choice-group${error ? ' has-error' : ''}`}
      aria-describedby={error ? `${id}-error` : undefined}
      data-field={name}
    >
      <legend>{legend}</legend>
      <div className="choice-group__options">
        {options.map((option) => (
          <label key={option.value} className={`chip${isChecked(option.value) ? ' is-selected' : ''}`}>
            <input
              type={type}
              name={name}
              value={option.value}
              checked={isChecked(option.value)}
              aria-invalid={error ? true : undefined}
              onChange={() => onToggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  );
}

export function LeadForm() {
  const uid = useId();
  const id = (field: LeadFormField) => `${uid}-${field}`;
  const formRef = useRef<HTMLFormElement>(null);
  const started = useRef(false);

  const [values, setValues] = useState<LeadFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  const clearError = (field: LeadFormField) => {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onText = (field: TextField) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const raw = event.target.value;
    setValues((current) => ({ ...current, [field]: field === 'phone' ? maskPhone(raw) : raw }));
    clearError(field);
  };

  const toggleInterest = (value: string) => {
    setValues((current) => ({
      ...current,
      interests: current.interests.includes(value)
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value],
    }));
    clearError('interests');
  };

  const onFocus = () => {
    if (started.current) return;
    started.current = true;
    events.leadFormStart();
  };

  const aria = (field: LeadFormField) => ({
    id: id(field),
    name: field,
    'data-field': field,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${id(field)}-error` : undefined,
  });

  const focusFirstError = (invalid: LeadFormField[]) => {
    const first = FIELD_ORDER.find((field) => invalid.includes(field));
    if (!first) return;
    const target = formRef.current?.querySelector<HTMLElement>(
      `[data-field="${first}"] input, input[data-field="${first}"], select[data-field="${first}"], textarea[data-field="${first}"]`,
    );
    target?.focus();
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'submitting') return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    const invalid = (Object.keys(nextErrors) as LeadFormField[]).filter((field) => nextErrors[field]);
    if (invalid.length) {
      events.leadFormError(invalid.join(','));
      focusFirstError(invalid);
      return;
    }

    setStatus('submitting');
    const payload = buildPayload(values);

    try {
      await submitLead(payload);
      // Lead só depois da confirmação do envio, com o mesmo event_id enviado ao backend.
      events.lead(
        {
          interests: values.interests.join(','),
          had_agency: values.hadAgency,
          uf: values.uf,
        },
        payload.tracking.event_id,
      );
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    const firstName = values.name.trim().split(/\s+/)[0];
    return (
      <motion.div
        className="lead-form lead-form--success"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        role="status"
      >
        <motion.span
          className="lead-form__success-icon"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.15 }}
        >
          <CircleCheck size={40} aria-hidden="true" />
        </motion.span>
        <h3>
          {FORM.successTitle}
          {firstName ? `, ${firstName}` : ''}!
        </h3>
        <p>{FORM.successText}</p>
        <p className="lead-form__muted">{FORM.successMore}</p>
        <ContactLink className="btn btn--whatsapp" method="whatsapp" location="form_sucesso" message={WHATSAPP_MESSAGES.afterForm}>
          <WhatsappIcon width={18} height={18} />
          Chamar no WhatsApp
        </ContactLink>
        <button
          type="button"
          className="lead-form__reset"
          onClick={() => {
            setValues(INITIAL_VALUES);
            setErrors({});
            setStatus('idle');
          }}
        >
          <RotateCcw size={14} aria-hidden="true" /> {FORM.reset}
        </button>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} className="lead-form" noValidate onSubmit={onSubmit} onFocus={onFocus} aria-labelledby={`${uid}-title`}>
      <div className="lead-form__head">
        <h3 id={`${uid}-title`}>{FORM.title}</h3>
        <p>{FORM.subtitle}</p>
      </div>

      <div className="lead-form__grid">
        <Field id={id('name')} label="Nome e sobrenome" error={errors.name} className="span-2">
          <input {...aria('name')} autoComplete="name" value={values.name} onChange={onText('name')} />
        </Field>

        <Field id={id('phone')} label="WhatsApp" error={errors.phone}>
          <input
            {...aria('phone')}
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            value={values.phone}
            onChange={onText('phone')}
          />
        </Field>

        <Field id={id('email')} label="E-mail" error={errors.email}>
          <input {...aria('email')} type="email" autoComplete="email" inputMode="email" value={values.email} onChange={onText('email')} />
        </Field>

        <Field id={id('company')} label="Empresa" error={errors.company}>
          <input {...aria('company')} autoComplete="organization" value={values.company} onChange={onText('company')} />
        </Field>

        <Field id={id('segment')} label="Segmento" error={errors.segment}>
          <select {...aria('segment')} value={values.segment} onChange={onText('segment')}>
            <option value="" disabled>
              Selecione
            </option>
            {FORM_OPTIONS.segment.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id={id('revenue')} label="Faturamento mensal aproximado" error={errors.revenue} className="span-2">
          <select {...aria('revenue')} value={values.revenue} onChange={onText('revenue')}>
            <option value="" disabled>
              Selecione uma faixa
            </option>
            {FORM_OPTIONS.revenue.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="span-2">
          <ChoiceGroup
            id={id('interests')}
            name="interests"
            legend="Com o que você quer ajuda? (pode marcar mais de uma)"
            type="checkbox"
            options={FORM_OPTIONS.interests}
            isChecked={(value) => values.interests.includes(value)}
            error={errors.interests}
            onToggle={toggleInterest}
          />
        </div>

        <div className="span-2">
          <ChoiceGroup
            id={id('hadAgency')}
            name="hadAgency"
            legend="Já trabalhou com alguma assessoria de marketing?"
            type="radio"
            options={FORM_OPTIONS.agency}
            isChecked={(value) => values.hadAgency === value}
            error={errors.hadAgency}
            onToggle={(value) => {
              setValues((current) => ({ ...current, hadAgency: value }));
              clearError('hadAgency');
            }}
          />
        </div>

        <Field id={id('city')} label="Cidade" error={errors.city}>
          <input {...aria('city')} autoComplete="address-level2" value={values.city} onChange={onText('city')} />
        </Field>

        <Field id={id('uf')} label="UF" error={errors.uf}>
          <select {...aria('uf')} autoComplete="address-level1" value={values.uf} onChange={onText('uf')}>
            <option value="" disabled>
              UF
            </option>
            {FORM_OPTIONS.uf.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </Field>

        <Field id={id('instagram')} label="Instagram ou site da empresa" optional className="span-2">
          <input {...aria('instagram')} placeholder="@suaempresa" value={values.instagram} onChange={onText('instagram')} />
        </Field>

        <Field id={id('message')} label="Conte um pouco sobre o seu momento" optional className="span-2">
          <textarea {...aria('message')} rows={3} value={values.message} onChange={onText('message')} />
        </Field>

        {/* Honeypot: invisível para pessoas, preenchido por bots. */}
        <div className="hp" aria-hidden="true">
          <label htmlFor={id('website')}>Website</label>
          <input id={id('website')} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={onText('website')} />
        </div>

        <div className={`checkbox span-2${errors.privacy ? ' has-error' : ''}`}>
          <input
            {...aria('privacy')}
            type="checkbox"
            checked={values.privacy}
            onChange={(event) => {
              setValues((current) => ({ ...current, privacy: event.target.checked }));
              clearError('privacy');
            }}
          />
          <label htmlFor={id('privacy')}>
            {FORM.privacyLabelStart}{' '}
            <a href={SITE.privacyPath} target="_blank" rel="noopener">
              {FORM.privacyLink}
            </a>
            .
          </label>
          <FieldError id={`${id('privacy')}-error`} message={errors.privacy} />
        </div>
      </div>

      <AnimatePresence>
        {status === 'error' ? (
          <motion.div className="lead-form__alert" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CircleAlert size={18} aria-hidden="true" />
            <p>
              {FORM.error}{' '}
              <ContactLink method="whatsapp" location="form_erro" message={WHATSAPP_MESSAGES.contact}>
                Abrir WhatsApp
              </ContactLink>
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? (
          <>
            <LoaderCircle className="spin" size={18} aria-hidden="true" /> {FORM.submitting}
          </>
        ) : (
          <>
            {FORM.submit} <ArrowRight size={18} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
