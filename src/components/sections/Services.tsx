import {
  Clapperboard,
  Handshake,
  Megaphone,
  MessagesSquare,
  MonitorSmartphone,
  Palette,
  PenLine,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import type { PointerEvent } from 'react';
import { SERVICES, type AdPlatformId, type ServiceId } from '../../content/landing';
import { useOnceInView } from '../../lib/motion/useOnceInView';
import { events } from '../../lib/tracking/events';
import { GoogleLogo, LinkedinLogo, MetaLogo } from '../ui/BrandIcons';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

const ICONS: Record<ServiceId, LucideIcon> = {
  trafego: Megaphone,
  crm: MessagesSquare,
  conteudo: Clapperboard,
  social: Share2,
  sites: MonitorSmartphone,
  design: Palette,
  copy: PenLine,
  onboarding: Handshake,
};

const PLATFORM_LOGOS: Record<AdPlatformId, typeof MetaLogo> = {
  meta: MetaLogo,
  google: GoogleLogo,
  linkedin: LinkedinLogo,
};

/** Atualiza as variáveis CSS que posicionam o brilho sob o cursor. */
function trackPointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
}

export function Services() {
  const ref = useOnceInView<HTMLElement>(() => {
    events.viewContent();
    events.sectionView('servicos');
  }, 0.2);

  return (
    <section ref={ref} className="section section--paper services" id="servicos" aria-labelledby="services-title">
      <div className="container">
        <SectionHeading kicker={SERVICES.kicker} title={SERVICES.title} id="services-title" />

        <ul className="bento">
          {SERVICES.items.map((service, index) => {
            const Icon = ICONS[service.id];
            return (
              <Reveal
                as="li"
                key={service.id}
                className={`bento__card bento__card--${service.id}`}
                delay={0.06 * (index % 4)}
                onPointerMove={trackPointer}
              >
                <span className="bento__icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                {service.id === 'trafego' ? (
                  <>
                    <ul className="ad-platforms" aria-label={SERVICES.adPlatformsLabel}>
                      {SERVICES.adPlatforms.map((platform) => {
                        const Logo = PLATFORM_LOGOS[platform.id];
                        return (
                          <li key={platform.id} className={`ad-platforms__chip ad-platforms__chip--${platform.id}`}>
                            <span className="ad-platforms__logo">
                              <Logo />
                            </span>
                            {platform.name}
                            <span className="ad-platforms__live" aria-hidden="true" />
                          </li>
                        );
                      })}
                    </ul>
                    <span className="bento__corner" aria-hidden="true">
                      <span />
                      <span />
                    </span>
                  </>
                ) : null}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
