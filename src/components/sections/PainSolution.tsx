import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { PAIN } from '../../content/landing';
import { SectionHeading } from '../ui/SectionHeading';

const EASE = [0.22, 1, 0.36, 1] as const;

export function PainSolution() {
  return (
    <section className="section section--paper pain" aria-labelledby="pain-title">
      <div className="container">
        <SectionHeading kicker={PAIN.kicker} title={PAIN.title} id="pain-title" />

        <ol className="pain__list">
          {PAIN.items.map((item, index) => (
            <motion.li
              key={item.before}
              className="pain-item"
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, margin: '0px 0px -18% 0px' }}
              variants={{ hidden: {}, shown: {} }}
            >
              <span className="pain-item__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>

              <p className="pain-item__before">
                <span className="sr-only">Antes: </span>
                <motion.span
                  className="strike"
                  variants={{ hidden: { backgroundSize: '0% 2px' }, shown: { backgroundSize: '100% 2px' } }}
                  transition={{ duration: 0.7, delay: 0.35 + index * 0.08, ease: EASE }}
                >
                  {item.before}
                </motion.span>
              </p>

              <ArrowRight className="pain-item__arrow" size={22} aria-hidden="true" />

              <motion.p
                className="pain-item__after"
                variants={{ hidden: { opacity: 0, x: -12 }, shown: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.6, delay: 0.75 + index * 0.08, ease: EASE }}
              >
                <span className="pain-item__check" aria-hidden="true">
                  <Check size={16} strokeWidth={3} />
                </span>
                <span>
                  <span className="sr-only">Com a ZT: </span>
                  {item.after}
                </span>
              </motion.p>
            </motion.li>
          ))}
        </ol>

        <p className="pain__closing">{PAIN.closing}</p>
      </div>
    </section>
  );
}
