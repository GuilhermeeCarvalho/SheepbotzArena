// Ponto de entrada da worker thread: registra o carregador TypeScript (tsx) e carrega o worker.
import { register } from 'tsx/esm/api';

register();
await import('./worker.ts');
