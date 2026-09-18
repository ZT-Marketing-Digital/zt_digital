import { Cookie } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { SITE } from '../../config/site';
import { CONSENT } from '../../content/landing';
import { setConsent } from '../../lib/tracking/consent';

type ConsentBannerProps = { open: boolean; onClose: () => void };

export function ConsentBanner({ open, onClose }: ConsentBannerProps) {
  const acceptRef = useRef<HTMLButtonElement>(null);
  const reopened = useRef(false);

  const choose = (state: 'granted' | 'denied') => {
    setConsent(state);
    onClose();
  };

  // Ao reabrir pelo rodapé, leva o foco ao banner (na primeira visita não rouba o foco da página).
  useEffect(() => {
    if (open && reopened.current) acceptRef.current?.focus();
    if (!open) reopened.current = true;
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          className="consent"
          aria-label="Preferências de cookies"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Cookie className="consent__icon" size={22} aria-hidden="true" />
          <p>
            {CONSENT.text}{' '}
            <a href={SITE.privacyPath} target="_blank" rel="noopener">
              {CONSENT.more}
            </a>
            .
          </p>
          <div className="consent__actions">
            <button type="button" className="btn btn--ghost-dark btn--sm" onClick={() => choose('denied')}>
              {CONSENT.decline}
            </button>
            <button ref={acceptRef} type="button" className="btn btn--primary btn--sm" onClick={() => choose('granted')}>
              {CONSENT.accept}
            </button>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
