import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';
import { FOLLOW_UP } from '../../content/landing';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

const useIsoLayoutEffect = typeof window === 'undefined' ? () => undefined : useLayoutEffect;

export function FollowUp() {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const list = listRef.current;
    const fill = fillRef.current;
    if (!list || !fill) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>('.timeline__item', list).forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 68%',
          onEnter: () => item.classList.add('is-reached'),
          onLeaveBack: () => item.classList.remove('is-reached'),
        });
      });
    }, list);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section section--surface follow-up" aria-labelledby="follow-title">
      <div className="container follow-up__grid">
        <div className="follow-up__intro">
          <SectionHeading kicker={FOLLOW_UP.kicker} title={FOLLOW_UP.title} text={FOLLOW_UP.text} id="follow-title" />
        </div>

        <div className="timeline">
          <div className="timeline__rail" aria-hidden="true">
            <div ref={fillRef} className="timeline__fill" />
          </div>
          <ol ref={listRef} className="timeline__list">
            {FOLLOW_UP.steps.map((step, index) => (
              <Reveal as="li" key={step.title} className="timeline__item" delay={0.04 * index}>
                <span className="timeline__node" aria-hidden="true" />
                <p className="timeline__tag">{step.tag}</p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
