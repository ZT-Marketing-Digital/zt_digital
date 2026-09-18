import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { CTA, PROCESS } from '../../content/landing';
import { scrollToHash } from '../../lib/motion/smoothScroll';
import { events } from '../../lib/tracking/events';
import { PixelField } from '../ui/Brackets';
import { SectionHeading } from '../ui/SectionHeading';
import { ProcessScreen } from './ProcessScreen';

// useLayoutEffect avisa no servidor; no SSR não há rolagem para medir.
const useIsoLayoutEffect = typeof window === 'undefined' ? () => undefined : useLayoutEffect;

export function Process() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const seen = useRef(new Set<number>());

  useIsoLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const steps = stepsRef.current;
    if (!steps) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.process-step', steps).forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => {
            if (!self.isActive) return;
            setActive(index);
            if (!seen.current.has(index)) {
              seen.current.add(index);
              events.processStepView(index + 1, PROCESS.steps[index].title);
            }
          },
        });
      });

      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: steps, start: 'top 62%', end: 'bottom 62%', scrub: true },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toForm = (event: MouseEvent) => {
    event.preventDefault();
    events.ctaClick('quero_vender_mais', 'processo');
    scrollToHash('#contato');
  };

  return (
    <section ref={sectionRef} className="section section--dark process" id="processo" aria-labelledby="process-title">
      <PixelField className="process__pixels" count={12} />
      <div className="container">
        <SectionHeading kicker={PROCESS.kicker} title={PROCESS.title} text={PROCESS.text} id="process-title" />

        <div className="process__layout">
          <div className="process__sticky">
            <div className="process__device" aria-hidden="true">
              <div className="process__device-bar">
                <span />
                <span />
                <span />
                <p>{PROCESS.steps[active].title}</p>
              </div>
              <ProcessScreen step={active} />
            </div>
            <div className="process__dots" aria-hidden="true">
              {PROCESS.steps.map((step, index) => (
                <span key={step.number} className={index <= active ? 'is-on' : ''} />
              ))}
            </div>
            <p className="process__note">{PROCESS.note}</p>
          </div>

          <div className="process__steps-wrap">
            <div className="process__rail" aria-hidden="true">
              <div ref={progressRef} className="process__rail-fill" />
            </div>
            <ol ref={stepsRef} className="process__steps">
              {PROCESS.steps.map((step, index) => (
                <li
                  key={step.number}
                  className={`process-step${index === active ? ' is-active' : ''}`}
                  aria-current={index === active ? 'step' : undefined}
                >
                  <span className="process-step__number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <ul>
                    {step.points.map((point) => (
                      <li key={point}>
                        <Check size={16} aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <a className="btn btn--primary btn--lg process__cta" href="#contato" onClick={toForm}>
              {CTA.primary}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
