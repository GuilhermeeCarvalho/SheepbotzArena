// Spec 002 — sessão: US2 (execução), US4 (mundo), US5 (controlador) (FR-005 a FR-011).
import { describe, expect, it } from 'vitest';
import { createModalityRegistry, createSimulation, loadWorld, type Modality } from 'src/core';
import {
  advance,
  applyController,
  applyWorld,
  createSession,
  pause,
  play,
  reset,
  setSpeed,
  stepOnce,
} from 'src/app/session/session';
import { constantSpeed, robotData, worldData } from '../../helpers';

const worldText = JSON.stringify(
  worldData({
    dt: 0.05,
    seed: 11,
    robots: [
      robotData({
        sensors: [{ id: 'laser', type: 'laser', rays: 5, fov: 2, maxRange: 2, noise: 0.01 }],
      }),
      robotData({ id: 'r2', pose: { x: 1, y: 1, theta: 0 } }),
    ],
  }),
);
const wander =
  'function onTick(r) { r.setSpeed(0.2 + r.random() * 0.3, r.readLaser()[2] < 1 ? 1 : 0); }';
const controllers = { r1: wander, r2: constantSpeed(0.3, 0.4) };

describe('US2 — execução', () => {
  it('US2-AC1: três passos → tick 3 e tempo 0,15', () => {
    let session = createSession(worldText, controllers);
    for (let i = 0; i < 3; i++) session = stepOnce(session);
    expect(session.state.tick).toBe(3);
    expect(session.state.time).toBeCloseTo(0.15, 9);
  });

  it('US2-AC4: play/pause; step só pausado', () => {
    let session = play(createSession(worldText, controllers));
    expect(session.running).toBe(true);
    expect(play(session)).toBe(session);
    expect(stepOnce(session).state.tick).toBe(0);
    session = pause(session);
    expect(session.running).toBe(false);
    expect(pause(session)).toBe(session);
    expect(stepOnce(session).state.tick).toBe(1);
  });

  it('US2-AC5: reset volta ao tick 0 e às poses iniciais, pausado', () => {
    const initial = createSession(worldText, controllers);
    const moved = play(advance(initial, 30));
    const back = reset(moved);
    expect(back.running).toBe(false);
    expect(back.state).toEqual(initial.state);
  });

  it('US2-AC6: qualquer combinação de play/step resulta no mesmo estado do núcleo', () => {
    let session = createSession(worldText, controllers);
    for (let i = 0; i < 7; i++) session = stepOnce(session);
    session = play(session);
    for (const chunk of [1, 20, 13, 20, 4, 20, 20, 15]) session = advance(session, chunk);
    session = pause(session);
    while (session.state.tick < 200) session = stepOnce(session);

    const world = loadWorld(worldText);
    if (!world.ok) throw new Error('mundo');
    const direct = createSimulation(world.value, { controllers });
    if (!direct.ok) throw new Error('controladores');
    expect(session.state).toEqual(direct.value.step(200));
  });

  it('advance(0) não muda a sessão; velocidade é preservada', () => {
    const session = createSession(worldText, controllers);
    expect(advance(session, 0)).toBe(session);
    expect(setSpeed(session, 4).speed).toBe(4);
  });

  it('FR-008: pausa automaticamente ao fim da partida e não volta a executar', () => {
    const quick: Modality = {
      id: 'rapida',
      name: 'Rápida',
      validateWorld: () => [],
      createReferee: () => ({
        evaluate: (s) => ({
          phase: s.tick >= 5 ? 'finished' : 'running',
          winner: null,
          reason: s.tick >= 5 ? 'tempo esgotado' : null,
          score: {},
        }),
      }),
    };
    const registry = createModalityRegistry([quick]);
    const text = JSON.stringify(worldData({ modality: 'rapida', robots: [robotData()] }));
    let session = play(createSession(text, {}, null, registry));
    session = advance(session, 20);
    expect(session.state.tick).toBe(5);
    expect(session.running).toBe(false);
    expect(play(session).running).toBe(false);
  });
});

describe('US4 — mundo', () => {
  it('US4-AC3: mundo inválido mantém a sessão e lista os erros', () => {
    const session = createSession(worldText, controllers);
    const next = applyWorld(
      play(session),
      JSON.stringify(worldData({ robots: [robotData({ radius: 0 })] })),
    );
    expect(next.world).toBe(session.world);
    expect(next.running).toBe(false);
    expect(next.worldIssues).toEqual([
      { path: 'robots[0].radius', code: 'OUT_OF_RANGE', message: 'deve ser maior que 0' },
    ]);
  });

  it('US4-AC4: mundo válido substitui; robôs sem controlador ficam parados', () => {
    const session = applyWorld(
      createSession(worldText, controllers),
      JSON.stringify(worldData({ robots: [robotData({ id: 'novo' })] })),
    );
    expect(session.worldIssues).toEqual([]);
    expect(session.world.robots.map((r) => r.id)).toEqual(['novo']);
    expect(session.controllers).toEqual({});
    expect(session.state.robots[0]!.status).toBe('no-controller');
  });

  it('erro de controlador ao trocar de mundo é relatado', () => {
    const next = applyWorld(createSession(worldText, controllers), worldText, { r1: 'function (' });
    expect(next.controllerIssues[0]!.code).toBe('CONTROLLER_SYNTAX');
  });

  it('createSession lança com mundo inválido', () => {
    expect(() => createSession('{', {})).toThrow(/Sessão inválida/);
    expect(() => createSession(worldText, { r1: 'let x = 1;' })).toThrow(/onTick/);
  });
});

describe('US5 — controlador', () => {
  it('US5-AC2: aplicar reinicia no tick 0 com o novo controlador', () => {
    const session = advance(createSession(worldText, controllers), 10);
    const next = applyController(session, 'r2', constantSpeed(0, 0));
    expect(next.state.tick).toBe(0);
    expect(next.controllers.r2).toBe(constantSpeed(0, 0));
    expect(advance(next, 10).state.robots[1]!.pose).toEqual({ x: 1, y: 1, theta: 0 });
  });

  it('US5-AC3: erro de sintaxe mantém a simulação anterior e informa linha', () => {
    const session = advance(createSession(worldText, controllers), 10);
    const next = applyController(session, 'r2', 'function onTick(r) {\n  r.setSpeed(1,;\n}');
    expect(next.simulation).toBe(session.simulation);
    expect(next.state.tick).toBe(10);
    expect(next.controllerIssues[0]).toMatchObject({ robotId: 'r2', line: 2 });
  });

  it('US5-AC4: erro em execução aparece no estado do robô', () => {
    const next = advance(
      applyController(
        createSession(worldText, controllers),
        'r2',
        'function onTick() { throw new Error("pane"); }',
      ),
      3,
    );
    expect(next.state.robots[1]).toMatchObject({
      status: 'error',
      error: { tick: 1, message: 'pane' },
    });
  });
});
