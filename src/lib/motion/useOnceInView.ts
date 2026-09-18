import { useEffect, useRef } from 'react';

/** Executa `callback` uma única vez quando o elemento entra na tela (ex.: eventos de seção). */
export function useOnceInView<T extends HTMLElement>(callback: () => void, threshold = 0.35) {
  const ref = useRef<T>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callbackRef.current();
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
