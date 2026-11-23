// Bootstrap da interface (sem lógica; excluído da cobertura — plan 002).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../ui/tokens.css';
import { Root } from './Root';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
