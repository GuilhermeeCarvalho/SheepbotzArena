/** Transporte em memória: o "programa externo" é uma função (testes e demonstrações). */
import { TransportClosed, TransportTimeout, type Transport } from './protocol';

/**
 * `respond` recebe cada mensagem enviada e devolve a resposta (texto), `null` para não
 * responder ou `'close'` para encerrar a conexão.
 */
export function createMemoryTransport(
  respond: (message: string) => string | null | 'close',
): Transport & { sent: string[] } {
  const sent: string[] = [];
  const pending: string[] = [];
  let closed = false;
  return {
    sent,
    send(text) {
      if (closed) throw new TransportClosed();
      sent.push(text);
      const reply = respond(text);
      if (reply === 'close') closed = true;
      else if (reply !== null) pending.push(reply);
    },
    receive() {
      const next = pending.shift();
      if (next !== undefined) return Promise.resolve(next);
      return Promise.reject(closed ? new TransportClosed() : new TransportTimeout());
    },
    close() {
      closed = true;
    },
  };
}
