import { ArrowRight, CalendarCheck, Video } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { WHATSAPP_MESSAGES } from '../../config/site';
import { CTA, HERO } from '../../content/landing';
import { scrollToHash } from '../../lib/motion/smoothScroll';
import { events } from '../../lib/tracking/events';
import { WhatsappIcon } from '../ui/BrandIcons';
import { PixelField } from '../ui/Brackets';
import { ContactLink } from '../ui/ContactLink';
import { ZT_PATHS } from '../ui/ZtMark';

const EASE = [0.22, 1, 0.36, 1] as const;

// Ordem e direção de chegada de cada peça do monograma.
const PIECES: { d: string; from: { x: number; y: number }; accent?: boolean }[] = [
  { d: ZT_PATHS.frameTop, from: { x: -60, y: -60 } },
  { d: ZT_PATHS.frameBottom, from: { x: 60, y: 60 } },
  { d: ZT_PATHS.z, from: { x: -40, y: 0 } },
  { d: ZT_PATHS.tBar, from: { x: 40, y: 0 } },
  { d: ZT_PATHS.tStem, from: { x: 0, y: -40 } },
  { d: ZT_PATHS.dotTop, from: { x: 0, y: -30 }, accent: true },
  { d: ZT_PATHS.dotBottom, from: { x: 0, y: 30 }, accent: true },
];

function useFunnelStep(length: number, reduce: boolean | null) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setStep((value) => (value + 1) % length), 2200);
    return () => window.clearInterval(id);
  }, [length, reduce]);
  return step;
}

export function Hero() {
  const reduce = useReducedMotion();
  const visualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: visualRef, offset: ['start start', 'end start'] });
  const markY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const step = useFunnelStep(HERO.funnel.length, reduce);

  const toForm = (event: MouseEvent) => {
    event.preventDefault();
    events.ctaClick('quero_vender_mais', 'hero');
    scrollToHash('#contato');
  };

  // Sempre declarada: o HTML pré-renderizado sai com o estado inicial e a hidratação precisa animar até o final.
  // Com movimento reduzido, o MotionConfig do App remove os deslocamentos.
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section className="hero section--dark" id="inicio" aria-labelledby="hero-title">
      <PixelField className="hero__pixels" count={16} />

      <div className="container hero__grid">
        <div className="hero__copy">
          <motion.p className="eyebrow" {...enter(0.05)}>
            <span className="eyebrow__dot" aria-hidden="true" />
            {HERO.eyebrow}
          </motion.p>

          <motion.h1 id="hero-title" className="hero__title" {...enter(0.12)}>
            {HERO.titleStart}{' '}
            <span className="marker">
              <span className="marker__text">{HERO.titleHighlight}</span>
              <motion.span
                className="marker__bar"
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
              />
            </span>
          </motion.h1>

          <motion.p className="hero__subtitle" {...enter(0.22)}>
            {HERO.subtitle}
          </motion.p>

          <motion.div className="hero__actions" {...enter(0.32)}>
            <a className="btn btn--primary btn--lg" href="#contato" onClick={toForm}>
              {CTA.primary}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <ContactLink className="btn btn--ghost-dark btn--lg" method="whatsapp" location="hero" message={WHATSAPP_MESSAGES.default}>
              <WhatsappIcon width={19} height={19} />
              {CTA.whatsapp}
            </ContactLink>
          </motion.div>

          <motion.ul className="hero__tags" aria-label="Frentes de trabalho" {...enter(0.42)}>
            {HERO.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </motion.ul>
        </div>

        <div ref={visualRef} className="hero__visual" aria-hidden="true">
          <motion.div className="hero__mark-wrap" style={{ y: markY }}>
            <svg className="hero__mark" viewBox="-20 -20 430 571">
              {PIECES.map((piece, index) => (
                <motion.path
                  key={piece.d}
                  d={piece.d}
                  className={piece.accent ? 'is-accent' : undefined}
                  initial={{ opacity: 0, x: piece.from.x, y: piece.from.y }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.2 + index * 0.08, ease: EASE }}
                />
              ))}
            </svg>
          </motion.div>

          <motion.div className="hero__cards" style={{ y: cardsY }}>
            <motion.div
              className="float-card float-card--lead"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
            >
              <span className="float-card__icon float-card__icon--wa">
                <WhatsappIcon width={18} height={18} />
              </span>
              <span>
                <strong>{HERO.cards.lead.label}</strong>
                <small>{HERO.cards.lead.detail}</small>
              </span>
              <span className="float-card__ping" />
            </motion.div>

            <motion.div
              className="float-card float-card--call"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
            >
              <span className="float-card__icon">
                <Video size={18} />
              </span>
              <span>
                <strong>{HERO.cards.call.label}</strong>
                <small>{HERO.cards.call.detail}</small>
              </span>
            </motion.div>

            <motion.div
              className="float-card float-card--checkin"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.2, ease: EASE }}
            >
              <span className="float-card__icon">
                <CalendarCheck size={18} />
              </span>
              <span>
                <strong>{HERO.cards.checkin.label}</strong>
                <small>{HERO.cards.checkin.detail}</small>
              </span>
            </motion.div>

            <motion.div
              className="funnel-strip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.35, ease: EASE }}
            >
              {HERO.funnel.map((stage, index) => (
                <span key={stage} className={`funnel-strip__stage${index <= step ? ' is-on' : ''}`}>
                  <i>{String(index + 1).padStart(2, '0')}</i>
                  {stage}
                </span>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
