import { ArrowUpRight, MapPin, Phone } from 'lucide-react';
import { SITE } from '../../config/site';
import { ABOUT } from '../../content/landing';
import { InstagramIcon } from '../ui/BrandIcons';
import { ContactLink } from '../ui/ContactLink';
import { CountUp } from '../ui/CountUp';
import { Reveal } from '../ui/Reveal';
import { ZtMark } from '../ui/ZtMark';

export function About() {
  return (
    <section className="section section--paper about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div>
          <Reveal>
            <p className="kicker">{ABOUT.kicker}</p>
            <h2 id="about-title">{ABOUT.title}</h2>
            <p className="about__text">{ABOUT.text}</p>
          </Reveal>

          <dl className="stats">
            {ABOUT.stats.map((stat, index) => (
              <Reveal key={stat.label} className="stats__item" delay={0.06 * index}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="stats__value">
                    <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </span>
                  <span className="stats__label" aria-hidden="true">
                    {stat.label}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <Reveal className="about__card" delay={0.1}>
          <div className="about__seal">
            <ZtMark className="about__seal-mark" />
            <div>
              <p className="about__seal-name">{SITE.legalName}</p>
              <p className="about__seal-doc">CNPJ {SITE.cnpj}</p>
            </div>
          </div>

          <ul className="offices">
            {SITE.offices.map((office) => (
              <li key={office.city}>
                <p className="offices__label">{office.label}</p>
                <a className="offices__line" href={office.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin size={16} aria-hidden="true" />
                  <span>{office.address}</span>
                </a>
                <ContactLink className="offices__line" method="phone" phone={office.phoneE164} location={`sobre_${office.uf.toLowerCase()}`}>
                  <Phone size={16} aria-hidden="true" />
                  <span>{office.phoneDisplay}</span>
                </ContactLink>
              </li>
            ))}
          </ul>

          <ContactLink className="about__instagram" method="instagram" location="sobre">
            <InstagramIcon width={18} height={18} />
            {ABOUT.instagramCta} · {SITE.instagram.handle}
            <ArrowUpRight size={16} aria-hidden="true" />
          </ContactLink>
        </Reveal>
      </div>
    </section>
  );
}
