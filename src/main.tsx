import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App, type Route } from './App';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado');

const route: Route = window.location.pathname.startsWith('/politica-de-privacidade') ? 'privacy' : 'home';
const app = (
  <StrictMode>
    <App route={route} />
  </StrictMode>
);

// Em produção o HTML vem pré-renderizado (SEO); em dev o root chega vazio.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
