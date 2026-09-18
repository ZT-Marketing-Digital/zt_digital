import { ArrowRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, type MouseEvent } from 'react';
import { WHATSAPP_MESSAGES } from '../../config/site';
import { CTA, NAV_LINKS } from '../../content/landing';
import { scrollToHash } from '../../lib/motion/smoothScroll';
import { events } from '../../lib/tracking/events';
import { WhatsappIcon } from '../ui/BrandIcons';
import { ContactLink } from '../ui/ContactLink';
import { ZtLogo } from '../ui/ZtMark';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (hash: string) => (event: MouseEvent) => {
    event.preventDefault();
    setOpen(false);
    scrollToHash(hash);
  };

  const goToForm = (location: string) => (event: MouseEvent) => {
    events.ctaClick('quero_vender_mais', location);
    go('#contato')(event);
  };

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <nav className="site-header__inner container" aria-label="Navegação principal">
        <a className="site-header__brand" href="#inicio" onClick={go('#inicio')} aria-label="ZT Marketing Digital — início">
          <ZtLogo />
        </a>

        <ul className="site-header__links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={go(link.href)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="site-header__actions">
          <ContactLink
            className="btn btn--ghost-dark btn--sm site-header__wa"
            method="whatsapp"
            location="header"
            message={WHATSAPP_MESSAGES.default}
          >
            <WhatsappIcon width={17} height={17} />
            WhatsApp
          </ContactLink>
          <a className="btn btn--primary btn--sm site-header__cta" href="#contato" onClick={goToForm('header')}>
            {CTA.header}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <button
            className="site-header__toggle"
            type="button"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="menu-mobile"
            className="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <ul>
              {NAV_LINKS.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <a href={link.href} onClick={go(link.href)}>
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mobile-menu__actions">
              <a className="btn btn--primary" href="#contato" onClick={goToForm('menu_mobile')}>
                {CTA.primary}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <ContactLink className="btn btn--whatsapp" method="whatsapp" location="menu_mobile" message={WHATSAPP_MESSAGES.default}>
                <WhatsappIcon width={18} height={18} />
                {CTA.whatsapp}
              </ContactLink>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
