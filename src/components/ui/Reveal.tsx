import { motion, type HTMLMotionProps } from 'motion/react';

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  y?: number;
  as?: 'div' | 'li' | 'article';
};

const components = { div: motion.div, li: motion.li, article: motion.article };

/** Entrada suave ao rolar. Com movimento reduzido, o MotionConfig do App remove o deslocamento (fica só o fade). */
export function Reveal({ delay = 0, y = 24, as = 'div', children, ...rest }: RevealProps) {
  const Component = components[as] as typeof motion.div;

  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
