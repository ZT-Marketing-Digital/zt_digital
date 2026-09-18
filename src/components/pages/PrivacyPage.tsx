import { ArrowLeft } from 'lucide-react';
import { SITE } from '../../config/site';
import { PRIVACY_BLOCKS, PRIVACY_TITLE } from '../../content/privacy';
import { ZtLogo } from '../ui/ZtMark';

export function PrivacyPage() {
  return (
    <>
      <header className="policy-header section--dark">
        <div className="container policy-header__inner">
          <a href="/" className="site-header__brand" aria-label="ZT Marketing Digital — voltar ao início">
            <ZtLogo />
          </a>
          <a href="/" className="btn btn--ghost-dark btn--sm">
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar ao site
          </a>
        </div>
      </header>
      <main id="conteudo" className="policy section--paper">
        <div className="container policy__inner">
          <p className="kicker">{SITE.legalName}</p>
          <h1>{PRIVACY_TITLE}</h1>
          {PRIVACY_BLOCKS.map((block, index) => {
            if (block.type === 'ul') {
              return (
                <ul key={index}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'h2') return <h2 key={index}>{block.text}</h2>;
            if (block.type === 'h3') return <h3 key={index}>{block.text}</h3>;
            return <p key={index}>{block.text}</p>;
          })}
        </div>
      </main>
    </>
  );
}
