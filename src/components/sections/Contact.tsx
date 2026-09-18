import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { SITE, WHATSAPP_MESSAGES } from '../../config/site';
import { CONTACT } from '../../content/landing';
import { LeadForm } from '../../features/lead-form/LeadForm';
import { useOnceInView } from '../../lib/motion/useOnceInView';
import { events } from '../../lib/tracking/events';
import { InstagramIcon, WhatsappIcon } from '../ui/BrandIcons';
import { ContactLink } from '../ui/ContactLink';
import { Reveal } from '../ui/Reveal';

export function Contact() {
  const ref = useOnceInView<HTMLElement>(() => events.sectionView('contato'), 0.2);

  return (
    <section ref={ref} className="section section--surface contact" id="contato" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div className="contact__aside">
          <Reveal>
            <p className="kicker">{CONTACT.kicker}</p>
            <h2 id="contact-title">{CONTACT.title}</h2>
            <p className="contact__text">{CONTACT.text}</p>
          </Reveal>

          <Reveal className="channels" delay={0.1}>
            <p className="channels__title">{CONTACT.channelsTitle}</p>

            <ContactLink className="channel channel--wa" method="whatsapp" location="contato" message={WHATSAPP_MESSAGES.default}>
              <span className="channel__icon">
                <WhatsappIcon width={20} height={20} />
              </span>
              <span>
                <strong>WhatsApp</strong>
                <small>{SITE.contact.whatsappDisplay}</small>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </ContactLink>

            <ContactLink className="channel" method="email" location="contato">
              <span className="channel__icon">
                <Mail size={20} aria-hidden="true" />
              </span>
              <span>
                <strong>E-mail</strong>
                <small>{SITE.contact.email}</small>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </ContactLink>

            {SITE.offices.map((office) => (
              <ContactLink
                key={office.city}
                className="channel"
                method="phone"
                phone={office.phoneE164}
                location={`contato_${office.uf.toLowerCase()}`}
              >
                <span className="channel__icon">
                  <Phone size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>
                    {office.city}-{office.uf}
                  </strong>
                  <small>{office.phoneDisplay}</small>
                </span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </ContactLink>
            ))}

            <ContactLink className="channel" method="instagram" location="contato">
              <span className="channel__icon">
                <InstagramIcon width={20} height={20} />
              </span>
              <span>
                <strong>Instagram</strong>
                <small>{SITE.instagram.handle}</small>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </ContactLink>
          </Reveal>
        </div>

        <Reveal className="contact__form" delay={0.05}>
          <LeadForm />
        </Reveal>
      </div>
    </section>
  );
}
