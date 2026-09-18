import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type SectionHeadingProps = {
  kicker: string;
  title: ReactNode;
  text?: ReactNode;
  id?: string;
  align?: 'left' | 'center';
};

export function SectionHeading({ kicker, title, text, id, align = 'left' }: SectionHeadingProps) {
  return (
    <Reveal className={`section-heading section-heading--${align}`}>
      <p className="kicker">{kicker}</p>
      <h2 id={id}>{title}</h2>
      {text ? <p className="section-heading__text">{text}</p> : null}
    </Reveal>
  );
}
