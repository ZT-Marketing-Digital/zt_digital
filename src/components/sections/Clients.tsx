import { CLIENTS } from '../../content/landing';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

// Logos dos parceiros (assets do próprio site da ZT, convertidos para silhueta branca em WebP).
const LOGOS = import.meta.glob<string>('../../assets/clients/*.webp', { eager: true, import: 'default' });

function logoUrl(slug: string) {
  return LOGOS[`../../assets/clients/${slug}.webp`];
}

export function Clients() {
  return (
    <section className="section section--dark clients" id="clientes" aria-labelledby="clients-title">
      <div className="container">
        <SectionHeading kicker={CLIENTS.kicker} title={CLIENTS.title} id="clients-title" align="center" />

        <ul className="clients__grid">
          {CLIENTS.items.map((client, index) => (
            <Reveal as="li" key={client.slug} className="clients__item" delay={0.03 * (index % 5)} y={16}>
              <img src={logoUrl(client.slug)} alt={client.name} loading="lazy" decoding="async" />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
