import { useEffect } from 'react';
import { events } from './events';

const MARKS = [25, 50, 75, 90];

export function useScrollDepth() {
  useEffect(() => {
    const sent = new Set<number>();
    let frame = 0;

    const check = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = (window.scrollY / scrollable) * 100;
      MARKS.forEach((mark) => {
        if (percent >= mark && !sent.has(mark)) {
          sent.add(mark);
          events.scrollDepth(mark);
        }
      });
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
}
