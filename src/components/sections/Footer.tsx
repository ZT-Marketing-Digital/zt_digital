import type { MouseEvent } from 'react';
import { SITE, WHATSAPP_MESSAGES } from '../../config/site';
import { FOOTER, NAV_LINKS } from '../../content/landing';
import { scrollToHash } from '../../lib/motion/smoothScroll';
import { InstagramIcon, WhatsappIcon } from '../ui/BrandIcons';
import { ContactLink } from '../ui/ContactLink';
import { ZtLogo } from '../ui/ZtMark';

type FooterProps = {
  onManageCookies: () => void;
  /** Na página da política, as âncoras apontam para a home. */
  anchorBase?: string;
};

export function Footer({ onManageCookies, anchorBase = '' }: FooterProps) {
  const go = (hash: string) => (event: MouseEvent) => {
    if (anchorBase) return;
    event.preventDefault();
    scrollToHash(hash);
  };

  return (
    <footer className="site-footer section--dark">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <ZtLogo />
          <p>{FOOTER.tagline}</p>
          <div className="site-footer__social">
            <ContactLink method="instagram" location="rodape" aria-label="Instagram da ZT Digital">
              <InstagramIcon />
            </ContactLink>
            <ContactLink method="whatsapp" location="rodape" message={WHATSAPP_MESSAGES.default} aria-label="WhatsApp da ZT Digital">
              <WhatsappIcon />
            </ContactLink>
          </div>
        </div>

        <nav aria-label="Rodapé">
          <p className="site-footer__title">{FOOTER.navTitle}</p>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={`${anchorBase}${link.href}`} onClick={go(link.href)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="site-footer__title">{FOOTER.contactTitle}</p>
          <ul>
            <li>
              <ContactLink method="email" location="rodape">
                {SITE.contact.email}
              </ContactLink>
            </li>
            <li>
              <ContactLink method="whatsapp" location="rodape_texto" message={WHATSAPP_MESSAGES.default}>
                WhatsApp {SITE.contact.whatsappDisplay}
              </ContactLink>
            </li>
            {SITE.offices.map((office) => (
              <li key={office.city}>
                <ContactLink method="phone" phone={office.phoneE164} location={`rodape_${office.uf.toLowerCase()}`}>
                  {office.phoneDisplay} · {office.city}-{office.uf}
                </ContactLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="site-footer__title">{FOOTER.officesTitle}</p>
          <ul className="site-footer__offices">
            {SITE.offices.map((office) => (
              <li key={office.city}>
                <strong>{office.label}</strong>
                <span>{office.address}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container site-footer__legal">
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} {SITE.legalName} · CNPJ {SITE.cnpj}
        </p>
        <div className="site-footer__legal-links">
          <a href={SITE.privacyPath}>{FOOTER.privacy}</a>
          <button type="button" onClick={onManageCookies}>
            {FOOTER.cookies}
          </button>
        </div>
      </div>
    </footer>
  );
}
