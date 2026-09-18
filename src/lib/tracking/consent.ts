export type ConsentState = 'granted' | 'denied' | 'unknown';

const KEY = 'zt-consent';
const listeners = new Set<(state: ConsentState) => void>();
// Guarda a escolha em memória quando o localStorage não está disponível (aba anônima, bloqueio).
let memory: ConsentState = 'unknown';

export function getConsent(): ConsentState {
  try {
    const value = window.localStorage.getItem(KEY);
    if (value === 'granted' || value === 'denied') return value;
  } catch {
    /* sem localStorage */
  }
  return memory;
}

export function setConsent(state: Exclude<ConsentState, 'unknown'>) {
  memory = state;
  try {
    window.localStorage.setItem(KEY, state);
  } catch {
    /* a escolha vale só para esta sessão */
  }
  listeners.forEach((listener) => listener(state));
}

export function onConsentChange(listener: (state: ConsentState) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
