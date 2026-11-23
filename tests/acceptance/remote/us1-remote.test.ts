// Spec 009 — US1: robô comandado por um programa externo, sem interface (FR-002 a FR-005).
import { describe, expect, it } from 'vitest';
import { createSimulation, type SimulationState, type World } from 'src/core';
import { createRemoteLink, stepRemote } from 'src/remote/link';
import { createMemoryTransport } from 'src/remote/memoryTransport';
import { parseCommand } from 'src/remote/protocol';
import { buildWorld, constantSpeed, expectPose, robotData, worldData } from '../../helpers';

const laserWorld = buildWorld(
  worldData({
    obstacles: [{ id: 'parede', type: 'wall', from: [1, -5], to: [1, 5] }],
    robots: [
      robotData({
        sensors: [
          { id: 'laser', type: 'laser', rays: 3, fov: Math.PI, maxRange: 2 },
          { id: 'frente', type: 'bumper', from: -Math.PI / 2, to: Math.PI / 2 },
        ],
      }),
    ],
  }),
);
const freeWorld = buildWorld(
  worldData({
    robots: [robotData(), robotData({ id: 'r2', pose: { x: 0, y: 2, theta: 0 } })],
  }),
);

/** Programa externo que responde a cada `tick` com `reply(mensagem)`. */
const program = (reply: (tick: { tick: number }) => string | null | 'close') =>
  createMemoryTransport((text) => {
    const message = JSON.parse(text) as { type: string; tick: number };
    return message.type === 'tick' ? reply(message) : null;
  });

async function run(world: World, transport: ReturnType<typeof program>, ticks: number) {
  const link = createRemoteLink('r1', transport);
  const result = createSimulation(world, {
    nativeControllers: { r1: link.onTick },
    controllers: world.robots.some((r) => r.id === 'r2') ? { r2: constantSpeed(1, 0) } : {},
  });
  if (!result.ok) throw new Error('simulação inválida');
  link.start(world);
  const state = await stepRemote(result.value, [link], ticks);
  link.end(state);
  return { state, link };
}

const always = (v: number, w: number) => program(() => JSON.stringify({ v, w }));

describe('US1 — controlador remoto', () => {
  it('US1-AC1: v = 1,0 por 20 ticks termina em (1,000; 0; 0), como em JavaScript', async () => {
    const { state } = await run(freeWorld, always(1, 0), 20);
    expectPose(state.robots[0]!.pose, { x: 1, y: 0, theta: 0 });
    expect(state.robots[0]!.status).toBe('ok');
  });

  it('US1-AC2: recebe início, tick, tempo, leituras e odometria do tick', async () => {
    const transport = always(0, 0);
    await run(laserWorld, transport, 1);
    const [start, tick] = transport.sent.map((m) => JSON.parse(m) as Record<string, unknown>);
    expect(start).toEqual({
      type: 'start',
      robot: 'r1',
      dt: 0.05,
      sensors: [
        { id: 'laser', type: 'laser' },
        { id: 'frente', type: 'bumper' },
      ],
    });
    expect(tick).toMatchObject({ type: 'tick', tick: 1, time: 0 });
    const sensors = tick!.sensors as { laser: number[]; frente: boolean };
    sensors.laser.forEach((value, i) => expect(value).toBeCloseTo([2, 1, 2][i]!, 3));
    expect(sensors.frente).toBe(false);
    expect(tick!.odometry).toEqual({ x: 0, y: 0, theta: 0, distance: 0 });
  });

  it('US1-AC3: lockstep — duas execuções produzem estados idênticos', async () => {
    const zigzag = () =>
      program(({ tick }) => JSON.stringify({ v: 0.5, w: tick % 7 === 0 ? 3 : -1 }));
    const states: SimulationState[][] = [[], []];
    for (const run of [0, 1]) {
      const link = createRemoteLink('r1', zigzag());
      const sim = createSimulation(freeWorld, { nativeControllers: { r1: link.onTick } });
      if (!sim.ok) throw new Error('simulação inválida');
      link.start(freeWorld);
      for (let i = 0; i < 50; i++) states[run]!.push(await stepRemote(sim.value, [link], 1));
    }
    expect(states[0]).toEqual(states[1]);
  });

  it('US1-AC4: sem resposta, só o robô remoto fica em erro com a mensagem do tick', async () => {
    const { state } = await run(
      freeWorld,
      program(({ tick }) => (tick < 4 ? JSON.stringify({ v: 1, w: 0 }) : null)),
      10,
    );
    expect(state.robots[0]).toMatchObject({
      status: 'error',
      command: { v: 0, w: 0 },
      error: { tick: 4, message: 'controlador remoto não respondeu em 2000 ms (tick 4)' },
    });
    expectPose(state.robots[0]!.pose, { x: 0.15, y: 0 });
    expectPose(state.robots[1]!.pose, { x: 0.5, y: 2 });
  });

  it('US1-AC5: respostas fora do formato e conexão encerrada', async () => {
    const cases: [string | 'close', string][] = [
      ['oi', 'resposta do controlador remoto não é JSON válido'],
      ['{"v": 1}', 'resposta do controlador remoto deve ser { "v": número, "w": número }'],
      ['{"v": "1", "w": 0}', 'deve ser { "v": número, "w": número }'],
      ['close', 'conexão com o controlador remoto foi encerrada (tick 1)'],
    ];
    for (const [reply, message] of cases) {
      const { state, link } = await run(
        freeWorld,
        program(() => reply),
        3,
      );
      expect(state.robots[0]!.status).toBe('error');
      expect(state.robots[0]!.error!.message).toContain(message);
      expect(link.failure).toContain(message);
    }
    expect(() => parseCommand('{"v": 1, "w": Infinity}')).toThrow();
    expect(parseCommand('{"type": "command", "v": 0.5, "w": -1, "extra": 1}')).toEqual({
      v: 0.5,
      w: -1,
    });
  });

  it('US1-AC7: ao terminar, o programa recebe o fim com o tick e a partida', async () => {
    const transport = always(1, 0);
    await run(freeWorld, transport, 5);
    expect(JSON.parse(transport.sent.at(-1)!)).toEqual({ type: 'end', tick: 5, match: null });
    const ticks = transport.sent.filter((m) => m.includes('"type":"tick"'));
    expect(ticks).toHaveLength(5);
  });

  it('reinício reenvia o início e limpa a falha', async () => {
    const { link } = await run(
      freeWorld,
      program(() => null),
      2,
    );
    expect(link.failure).not.toBeNull();
    link.start(freeWorld);
    expect(link.failure).toBeNull();
    link.close();
  });
});
