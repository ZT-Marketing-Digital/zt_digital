import type { SVGProps } from 'react';

/**
 * Monograma ZT redesenhado em vetor a partir da logo original (Logos-versao-1.png).
 * Viewbox 390×531: moldura em duas cantoneiras + "Z" + "T" + dois quadrados.
 */
export const ZT_PATHS = {
  frameTop: 'M0 0H390V54H56V161H0Z',
  frameBottom: 'M390 373H335V480H0V531H390Z',
  dotTop: 'M114 106H168V161H114Z',
  dotBottom: 'M223 373H279V424H223Z',
  tBar: 'M227 106H390V159H227Z',
  tStem: 'M334 162V319H279V214Z',
  z: 'M0 214V267H60L110 216V266L0 372V424H168V372H112L56 424V372L168 267V214Z',
} as const;

type ZtMarkProps = SVGProps<SVGSVGElement> & { title?: string };

export function ZtMark({ title, ...rest }: ZtMarkProps) {
  return (
    <svg viewBox="0 0 390 531" fill="currentColor" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...rest}>
      {title ? <title>{title}</title> : null}
      {Object.values(ZT_PATHS).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

type ZtLogoProps = { className?: string };

/** Assinatura horizontal: monograma + "MARKETING DIGITAL", como na logo original. */
export function ZtLogo({ className = '' }: ZtLogoProps) {
  return (
    <span className={`zt-logo ${className}`}>
      <ZtMark className="zt-logo__mark" />
      <span className="zt-logo__word" aria-hidden="true">
        <span>Marketing</span>
        <span>Digital</span>
      </span>
      <span className="sr-only">ZT Marketing Digital</span>
    </span>
  );
}
