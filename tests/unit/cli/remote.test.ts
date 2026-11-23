// Spec 009 — T003: `--remote` na linha de comando e adaptador WebSocket (FR-001, FR-004).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EXIT, parseArgs, run } from 'src/cli/run';
import { createMemoryTransport } from 'src/remote/memoryTransport';
import { connectWebSocket } from 'src/remote/webSocketTransport';
import { TransportClosed, TransportTimeout } from 'src/remote/protocol';
import { expectPose, fixturePath } from '../../helpers';

const straightLine = fixturePath('worlds/straight-line.json');

const forward = () =>
  createMemoryTransport((text) => (text.includes('"tick"') ? '{"v": 1, "w": 0}' : null));

describe('--remote', () => {
  it('interpreta robô=endereço e rejeita formato inválido', () => {
    const parsed = parseArgs(['m.json', '--ticks', '1', '--remote', 'r1=ws://localhost:8765']);
    expect(parsed.ok && parsed.args.remotes).toEqual({ r1: 'ws://localhost:8765' });
    expect(parseArgs(['m.json', '--ticks', '1', '--remote', 'r1=http://x'])).toMatchObject({
      ok: false,
      message: '--remote exige o formato <robô>=<ws://endereço>',
    });
  });

  it('US1-AC1: 20 ticks comandados pelo programa externo terminam em x = 1,000', async () => {
    const transport = forward();
    const urls: string[] = [];
    const result = await run(['--ticks', '20', straightLine, '--remote', 'r1=ws://robo:8765'], {
      connect: (url) => {
        urls.push(url);
        return Promise.resolve(transport);
      },
    });
    expect(result.code).toBe(EXIT.ok);
    expect(urls).toEqual(['ws://robo:8765']);
    const state = JSON.parse(result.stdout) as { robots: { pose: { x: number; y: number } }[] };
    expectPose(state.robots[0]!.pose, { x: 1, y: 0 });
    expect(JSON.parse(transport.sent.at(-1)!)).toMatchObject({ type: 'end', tick: 20 });
  });

  it('US1-AC6: endereço inacessível impede o início (código 3)', async () => {
    const result = await run(['--ticks', '5', straightLine, '--remote', 'r1=ws://nada:1'], {
      connect: (url) =>
        Promise.reject(new Error(`não foi possível conectar ao controlador remoto em ${url}`)),
    });
    expect(result).toEqual({
      code: EXIT.invalidController,
      stdout: '',
      stderr: 'não foi possível conectar ao controlador remoto em ws://nada:1\n',
    });
  });

  it('robô inexistente e tempo limite', async () => {
    const missing = await run(['--ticks', '5', straightLine, '--remote', 'x=ws://a:1']);
    expect(missing.code).toBe(EXIT.usage);
    expect(missing.stderr).toContain("O mundo não tem robô 'x' (informado em --remote)");

    vi.useFakeTimers({ toFake: ['Date'] });
    const slow = createMemoryTransport((text) => {
      if (text.includes('"tick"')) vi.setSystemTime(Date.now() + 40);
      return text.includes('"tick"') ? '{"v": 1, "w": 0}' : null;
    });
    const timeout = await run(
      ['--ticks', '50', straightLine, '--remote', 'r1=ws://a:1', '--timeout-ms', '100'],
      { connect: () => Promise.resolve(slow) },
    );
    vi.useRealTimers();
    expect(timeout.code).toBe(EXIT.timeout);
  });
});

/** WebSocket falso: abre (ou falha) no próximo ciclo e ecoa o que o teste mandar. */
class FakeSocket {
  static instances: FakeSocket[] = [];
  static failNext = false;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  sent: string[] = [];
  constructor(readonly url: string) {
    FakeSocket.instances.push(this);
    const fail = FakeSocket.failNext;
    FakeSocket.failNext = false;
    queueMicrotask(() => {
      if (fail) {
        this.onerror?.();
        this.onclose?.();
      } else this.onopen?.();
    });
  }
  send(text: string) {
    this.sent.push(text);
  }
  close() {
    this.onclose?.();
  }
}

describe('connectWebSocket', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    FakeSocket.instances = [];
  });

  it('envia, recebe (antes e depois de esperar) e encerra', async () => {
    vi.stubGlobal('WebSocket', FakeSocket);
    const transport = await connectWebSocket('ws://robo:8765');
    const socket = FakeSocket.instances[0]!;
    transport.send('oi');
    expect(socket.sent).toEqual(['oi']);
    socket.onmessage?.({ data: 'primeira' });
    await expect(transport.receive(100)).resolves.toBe('primeira');
    const waiting = transport.receive(100);
    socket.onmessage?.({ data: 'segunda' });
    await expect(waiting).resolves.toBe('segunda');
    await expect(transport.receive(5)).rejects.toBeInstanceOf(TransportTimeout);
    const pending = transport.receive(1000);
    transport.close();
    await expect(pending).rejects.toBeInstanceOf(TransportClosed);
    await expect(transport.receive(5)).rejects.toBeInstanceOf(TransportClosed);
    expect(() => transport.send('x')).toThrow(TransportClosed);
  });

  it('falha de conexão e endereço inválido rejeitam com a mensagem do contrato', async () => {
    vi.stubGlobal('WebSocket', FakeSocket);
    FakeSocket.failNext = true;
    await expect(connectWebSocket('ws://nada:1')).rejects.toThrow(
      'não foi possível conectar ao controlador remoto em ws://nada:1',
    );
    vi.stubGlobal(
      'WebSocket',
      class {
        constructor() {
          throw new SyntaxError('endereço inválido');
        }
      },
    );
    await expect(connectWebSocket('isso')).rejects.toThrow('em isso');
  });

  it('sem abrir dentro do tempo limite, desiste', async () => {
    vi.stubGlobal(
      'WebSocket',
      class {
        onclose: (() => void) | null = null;
        close() {}
      },
    );
    await expect(connectWebSocket('ws://lento:1', 10)).rejects.toThrow('ws://lento:1');
  });
});
