import type { ReactNode } from 'react';

type BracketsProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'span';
};

/**
 * Motivo gráfico da marca: as duas cantoneiras da logo ZT (superior esquerda e inferior direita)
 * emoldurando um conteúdo. Puro CSS (ver .brackets em components.css).
 */
export function Brackets({ children, className = '', as = 'div' }: BracketsProps) {
  const Tag = as;
  return <Tag className={`brackets ${className}`}>{children}</Tag>;
}

type PixelFieldProps = { className?: string; count?: number };

/** Padrão de fundo com os "quadrados" soltos da logo, em grade irregular. */
export function PixelField({ className = '', count = 18 }: PixelFieldProps) {
  // Posições determinísticas (mesmo HTML no servidor e no cliente).
  const cells = Array.from({ length: count }, (_, index) => {
    const x = (index * 37 + 11) % 100;
    const y = (index * 53 + 7) % 100;
    const size = index % 3 === 0 ? 14 : index % 3 === 1 ? 9 : 6;
    return { x, y, size, delay: (index % 6) * 0.6 };
  });

  return (
    <div className={`pixel-field ${className}`} aria-hidden="true">
      {cells.map((cell, index) => (
        <span
          key={index}
          style={{
            left: `${cell.x}%`,
            top: `${cell.y}%`,
            width: cell.size,
            height: cell.size,
            animationDelay: `${cell.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
