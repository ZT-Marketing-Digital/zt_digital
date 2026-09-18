import { OVERVIEW } from '../../content/landing';
import { Brackets } from '../ui/Brackets';
import { Reveal } from '../ui/Reveal';

export function Overview() {
  return (
    <section className="section section--surface overview" id="sobre" aria-labelledby="overview-title">
      <div className="container overview__grid">
        <div>
          <Reveal>
            <p className="kicker">{OVERVIEW.kicker}</p>
            <h2 id="overview-title">{OVERVIEW.title}</h2>
            <p className="overview__lead">{OVERVIEW.text}</p>
          </Reveal>

          <div className="overview__pillars">
            {OVERVIEW.pillars.map((pillar, index) => (
              <Reveal key={pillar.title} className="pillar" delay={0.08 * index}>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.12}>
          <Brackets className="fact-sheet">
            <p className="fact-sheet__title">Ficha rápida</p>
            <dl>
              {OVERVIEW.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Brackets>
        </Reveal>
      </div>
    </section>
  );
}
