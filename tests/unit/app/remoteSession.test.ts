// Spec 009 — US2: robô remoto na sessão (FR-001, FR-004).
import { describe, expect, it } from 'vitest';
import {
  advanceRemote,
  applyController,
  applyWorld,
  attachRemote,
  createSession,
  detachRemote,
  hasRemotes,
  play,
  reset,
  type SessionState,
} from 'src/app/session/session';
import { createRemoteLink } from 'src/remote/link';
import { createMemoryTransport } from 'src/remote/memoryTransport';
import { constantSpeed, expectPose, robotData, worldData } from '../../helpers';

const worldText = JSON.stringify(
  worldData({ robots: [robotData(), robotData({ id: 'r2', pose: { x: 0, y: 2, theta: 0 } })] }),
);
const controllers = { r1: constantSpeed(0.2, 0), r2: constantSpeed(1, 0) };

/** Programa externo: responde v = 1 até o tick `until` e depois para de responder. */
const program = (until = Infinity) => {
  const transport = createMemoryTransport((text) => {
    const message = JSON.parse(text) as { type: string; tick: number };
    if (message.type !== 'tick') return null;
    return message.tick <= until ? '{"v": 1, "w": 0}' : null;
  });
  return { transport, link: createRemoteLink('r1', transport) };
};

const r1 = (session: SessionState) => session.state.robots[0]!;

describe('sessão com robô remoto', () => {
  it('US2-AC1/AC2: conectar reinicia no tick 0 e cada tick segue o programa', async () => {
    let session = createSession(worldText, controllers);
    session = { ...session, state: session.simulation.step(5) };
    const { link, transport } = program();
    session = attachRemote(session, link);
    expect(hasRemotes(session)).toBe(true);
    expect(session.state.tick).toBe(0);
    expect(JSON.parse(transport.sent[0]!)).toMatchObject({ type: 'start', robot: 'r1' });

    const current = () => session;
    session = await advanceRemote(current, 1);
    expect(session.state.tick).toBe(1);
    session = play(session);
    session = await advanceRemote(() => session, 19);
    expect(session.running).toBe(true);
    expectPose(r1(session).pose, { x: 1, y: 0 });
    expect(session.recording.frames).toHaveLength(21);
  });

  it('US2-AC3: sem resposta, pausa e mostra o erro', async () => {
    const { link } = program(3);
    let session = play(attachRemote(createSession(worldText, controllers), link));
    session = await advanceRemote(() => session, 10);
    expect(session.running).toBe(false);
    expect(session.state.tick).toBe(4);
    expect(session.remoteError).toBe('controlador remoto não respondeu em 2000 ms (tick 4)');
    expect(r1(session).status).toBe('error');
    expect(reset(session).remoteError).toBeNull();
  });

  it('US2-AC4: desconectar volta ao controlador em JavaScript no tick 0', async () => {
    const { link } = program();
    let session = attachRemote(createSession(worldText, controllers), link);
    session = await advanceRemote(() => session, 3);
    session = detachRemote(session, 'r1');
    expect(hasRemotes(session)).toBe(false);
    expect(session.state.tick).toBe(0);
    expectPose(session.simulation.step(10).robots[0]!.pose, { x: 0.1, y: 0 });
    expect(detachRemote(session, 'r1')).toBe(session);
  });

  it('reinício e novo controlador mantêm o remoto; trocar de mundo o desliga', async () => {
    const { link, transport } = program();
    let session = attachRemote(createSession(worldText, controllers), link);
    session = await advanceRemote(() => session, 2);
    session = reset(session);
    expect(transport.sent.filter((m) => m.includes('"start"'))).toHaveLength(2);
    session = applyController(session, 'r2', constantSpeed(0.5, 0));
    expect(hasRemotes(session)).toBe(true);
    session = await advanceRemote(() => session, 10);
    expect(session.state.tick).toBe(1); // pausado: um tick por vez
    session = play(session);
    session = await advanceRemote(() => session, 9);
    expectPose(r1(session).pose, { x: 0.5, y: 0 });
    const replaced = attachRemote(session, program().link);
    expect(() => transport.send('x')).toThrow();
    expect(hasRemotes(applyWorld(replaced, worldText))).toBe(false);
  });
});
