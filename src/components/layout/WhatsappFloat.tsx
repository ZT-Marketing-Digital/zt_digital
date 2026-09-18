import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { WHATSAPP_MESSAGES } from '../../config/site';
import { WhatsappIcon } from '../ui/BrandIcons';
import { ContactLink } from '../ui/ContactLink';

/** Botão flutuante: aparece depois do hero e some quando o formulário está na tela. */
export function WhatsappFloat() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let pastHero = false;
    let formVisible = false;
    const update = () => setVisible(pastHero && !formVisible);

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.8;
      update();
    };

    const form = document.getElementById('contato');
    const observer = form
      ? new IntersectionObserver(([entry]) => {
          formVisible = entry.isIntersecting;
          update();
        })
      : null;
    if (form) observer?.observe(form);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="wa-float"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <ContactLink
            method="whatsapp"
            location="botao_flutuante"
            message={WHATSAPP_MESSAGES.default}
            aria-label="Falar com a ZT Digital no WhatsApp"
          >
            <WhatsappIcon width={28} height={28} />
          </ContactLink>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
