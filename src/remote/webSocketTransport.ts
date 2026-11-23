/**
 * Transporte sobre o `WebSocket` padrão, presente no navegador e no Node 22+ (plan D-01, D-04).
 */
import { TransportClosed, TransportTimeout, type Transport } from './protocol';

type Waiter = { resolve: (text: string) => void; reject: (error: Error) => void };

/** Conecta ao programa externo; rejeita com a mensagem do contrato se não conseguir. */
export function connectWebSocket(url: string, timeoutMs = 2000): Promise<Transport> {
  return new Promise((resolveConnect, rejectConnect) => {
    const fail = () =>
      rejectConnect(new Error(`não foi possível conectar ao controlador remoto em ${url}`));
    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch {
      fail();
      return;
    }
    const inbox: string[] = [];
    let waiter: Waiter | null = null;
    let open = false;
    let closed = false;
    const timer = setTimeout(() => {
      if (!open) {
        socket.close();
        fail();
      }
    }, timeoutMs);

    socket.onmessage = (event: MessageEvent) => {
      const text = typeof event.data === 'string' ? event.data : String(event.data);
      if (waiter) {
        const current = waiter;
        waiter = null;
        current.resolve(text);
      } else inbox.push(text);
    };
    socket.onclose = () => {
      closed = true;
      if (!open) {
        clearTimeout(timer);
        fail();
      }
      if (waiter) {
        const current = waiter;
        waiter = null;
        current.reject(new TransportClosed());
      }
    };
    socket.onerror = () => {
      // o fechamento logo em seguida trata o erro
    };
    socket.onopen = () => {
      open = true;
      clearTimeout(timer);
      resolveConnect({
        send(text) {
          if (closed) throw new TransportClosed();
          socket.send(text);
        },
        receive(waitMs) {
          const next = inbox.shift();
          if (next !== undefined) return Promise.resolve(next);
          if (closed) return Promise.reject(new TransportClosed());
          return new Promise((resolve, reject) => {
            const limit = setTimeout(() => {
              waiter = null;
              reject(new TransportTimeout());
            }, waitMs);
            waiter = {
              resolve: (text) => {
                clearTimeout(limit);
                resolve(text);
              },
              reject: (error) => {
                clearTimeout(limit);
                reject(error);
              },
            };
          });
        },
        close() {
          closed = true;
          socket.close();
        },
      });
    };
  });
}
