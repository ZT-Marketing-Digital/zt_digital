import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { SITE, whatsappUrl } from '../../config/site';
import { events, type ContactMethod } from '../../lib/tracking/events';

type ContactLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  method: ContactMethod;
  location: string;
  message?: string;
  /** Telefone E.164 quando method = 'phone'. */
  phone?: string;
  children: ReactNode;
};

/** Link de contato direto que dispara o evento `Contact` com a origem do clique. */
export function ContactLink({ method, location, message, phone, children, onClick, ...rest }: ContactLinkProps) {
  const href = {
    whatsapp: whatsappUrl(message),
    phone: `tel:${phone ?? SITE.offices[0].phoneE164}`,
    email: `mailto:${SITE.contact.email}`,
    instagram: SITE.instagram.url,
  }[method];

  const external = method === 'whatsapp' || method === 'instagram';

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={(event) => {
        events.contact(method, location);
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
