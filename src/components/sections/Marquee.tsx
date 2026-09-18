import { MARQUEE } from '../../content/landing';

/** Faixa inclinada em movimento. O conteúdo real fica numa lista acessível; as cópias são decorativas. */
export function Marquee() {
  return (
    <section className="marquee" aria-label="Frentes da assessoria">
      <ul className="sr-only">
        {MARQUEE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="marquee__band" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee__group">
              {MARQUEE.map((item) => (
                <span key={item} className="marquee__item">
                  {item}
                  <i className="marquee__square" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
