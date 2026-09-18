import { motion } from 'motion/react';
import { HERO, HIGHLIGHT } from '../../content/landing';
import { Reveal } from '../ui/Reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

// Partículas determinísticas: cada uma "para" numa etapa do funil (metáfora visual, sem dados).
const PARTICLES = Array.from({ length: 22 }, (_, index) => ({
  left: 12 + ((index * 41) % 76),
  delay: (index * 0.37) % 4,
  stop: index % 7 === 0 ? 4 : index % 3 === 0 ? 3 : index % 2 === 0 ? 2 : 1,
}));

export function Highlight() {
  return (
    <section className="section section--dark highlight" aria-labelledby="highlight-title">
      <div className="highlight__glow" aria-hidden="true" />
      <div className="container highlight__grid">
        <Reveal>
          <p className="kicker kicker--on-dark">{HIGHLIGHT.kicker}</p>
          <h2 id="highlight-title" className="highlight__title">
            <span className="highlight__muted">{HIGHLIGHT.titleStart}</span> {HIGHLIGHT.titleEnd}
          </h2>
          <p className="highlight__text">{HIGHLIGHT.text}</p>
        </Reveal>

        <figure className="funnel" aria-label={`${HIGHLIGHT.chartLabel}: ${HERO.funnel.join(', ')}. ${HIGHLIGHT.note}.`}>
          <div className="funnel__stack" aria-hidden="true">
            {HERO.funnel.map((stage, index) => (
              <motion.div
                key={stage}
                className="funnel__layer"
                style={{ ['--w' as string]: `${100 - index * 18}%` }}
                initial={{ opacity: 0, scaleX: 0.6 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                transition={{ duration: 0.8, delay: 0.1 + index * 0.12, ease: EASE }}
              >
                <span className="funnel__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="funnel__label">{stage}</span>
              </motion.div>
            ))}
            {/* Escondidas via CSS com prefers-reduced-motion (mantém o HTML igual no servidor e no cliente). */}
            <div className="funnel__particles">
              {PARTICLES.map((particle, index) => (
                <i
                  key={index}
                  className={`funnel__particle funnel__particle--stop-${particle.stop}`}
                  style={{ left: `${particle.left}%`, animationDelay: `${particle.delay}s` }}
                />
              ))}
            </div>
          </div>
          <figcaption className="funnel__note">{HIGHLIGHT.note}</figcaption>
        </figure>
      </div>
    </section>
  );
}
