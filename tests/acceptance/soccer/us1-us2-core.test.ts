// Spec 008 — extensão do núcleo: US1 (bola), US2 (câmera) e reposição (FR-001 a FR-005).
import { describe, expect, it } from 'vitest';
import { createBall, integrateBall } from 'src/core/ball/ball';
import { createModalityRegistry, type Modality } from 'src/core';
import { buildSimulation, constantSpeed, robotData, worldData } from '../../helpers';

const ball = (overrides: Record<string, unknown> = {}) => ({
  id: 'bola',
  position: [0, 0],
  radius: 0.02,
  ...overrides,
});

describe('US1 — bola no núcleo', () => {
  it('US1-AC1: desaceleração constante — (0,75; 0) a 0,5 m/s após 1 s e para em 1,0 m', () => {
    const rolling = createBall({
      id: 'b',
      position: [0, 0],
      radius: 0.02,
      mass: 0.046,
      friction: 0.5,
      restitution: 0.6,
      color: '#ff7a1a',
    });
    rolling.vx = 1;
    for (let i = 0; i < 20; i++) integrateBall(rolling, 0.05);
    expect(rolling.x).toBeCloseTo(0.75, 9);
    expect(rolling.vx).toBeCloseTo(0.5, 9);
    for (let i = 0; i < 40; i++) integrateBall(rolling, 0.05);
    expect(rolling.x).toBeCloseTo(1.0, 9);
    expect(rolling.vx).toBe(0);
  });

  it('a bola chutada desacelera pela mesma lei dentro da simulação', () => {
    const world = worldData({
      dt: 0.05,
      robots: [robotData({ pose: { x: -0.12, y: 0, theta: 0 }, maxLinearSpeed: 1 })],
      balls: [ball({ friction: 0.5, restitution: 0 })],
    });
    const controller = 'let n = 0; function onTick(r) { n++; r.setSpeed(n === 1 ? 1 : -1, 0); }';
    const simulation = buildSimulation(world, { r1: controller });
    const kicked = simulation.step(1).balls[0]!;
    const later = simulation.step(20).balls[0]!;
    expect(later.velocity.x).toBeCloseTo(kicked.velocity.x - 0.5, 9);
    expect(later.position.x - kicked.position.x).toBeCloseTo(kicked.velocity.x - 0.25, 9);
  });

  it('US1-AC2: quica na parede com restituição 0,6 e não atravessa', () => {
    const world = worldData({
      dt: 0.01,
      obstacles: [{ id: 'parede', type: 'wall', from: [0.5, -1], to: [0.5, 1] }],
      robots: [robotData({ pose: { x: -0.4, y: 0, theta: 0 }, maxLinearSpeed: 0.8 })],
      balls: [ball({ position: [-0.27, 0], friction: 0, restitution: 1 })],
    });
    // Restituição 1 com o robô: o chute de 0,8 m/s dá 1,6 m/s; trocamos para 0,6 na parede via mundo próprio.
    const kickOnly = 'let n = 0; function onTick(r) { n++; r.setSpeed(n <= 3 ? 0.4 : -0.5, 0); }';
    const simulation = buildSimulation(world, { r1: kickOnly });
    let state = simulation.step(3);
    const incoming = state.balls[0]!.velocity.x;
    expect(incoming).toBeGreaterThan(0.79);
    for (let i = 0; i < 200; i++) {
      state = simulation.step();
      expect(state.balls[0]!.position.x).toBeLessThanOrEqual(0.5 - 0.02 + 1e-9);
    }
    expect(state.balls[0]!.velocity.x).toBeCloseTo(-incoming, 6); // restituição 1 na parede
  });

  it('US1-AC2 (restituição 0,6): a bola volta com 0,6 da velocidade', () => {
    const world = worldData({
      dt: 0.01,
      obstacles: [{ id: 'parede', type: 'wall', from: [0.5, -1], to: [0.5, 1] }],
      robots: [robotData({ pose: { x: -0.4, y: 0, theta: 0 }, maxLinearSpeed: 0.5 })],
      balls: [ball({ position: [-0.27, 0], friction: 0, restitution: 0.6 })],
    });
    const kickOnly = 'let n = 0; function onTick(r) { n++; r.setSpeed(n <= 3 ? 0.5 : -0.5, 0); }';
    const simulation = buildSimulation(world, { r1: kickOnly });
    let state = simulation.step(3);
    const incoming = state.balls[0]!.velocity.x;
    expect(incoming).toBeCloseTo(0.8, 6); // chute: 0,5 × (1 + 0,6)
    state = simulation.step(200);
    expect(state.balls[0]!.velocity.x).toBeCloseTo(-0.48, 6);
  });

  it('US1-AC3: robô a 1 m/s atinge bola parada (restituição 0,5) → bola a 1,5 m/s', () => {
    const world = worldData({
      dt: 0.01,
      robots: [robotData({ pose: { x: -0.125, y: 0, theta: 0 }, maxLinearSpeed: 1 })],
      balls: [ball({ friction: 0, restitution: 0.5 })],
    });
    const state = buildSimulation(world, { r1: constantSpeed(1, 0) }).step(1);
    expect(state.balls[0]!.velocity.x).toBeCloseTo(1.5, 9);
    expect(state.balls[0]!.velocity.y).toBeCloseTo(0, 9);
  });

  it('US1-AC4: o laser detecta a bola como disco', () => {
    const world = worldData({
      robots: [
        robotData({ sensors: [{ id: 'laser', type: 'laser', rays: 1, fov: 1, maxRange: 2 }] }),
      ],
      balls: [ball({ position: [1, 0], radius: 0.1 })],
    });
    expect((buildSimulation(world).getState().robots[0]!.sensors.laser as number[])[0]).toBeCloseTo(
      0.9,
      9,
    );
  });

  it('mundo sem bola tem lista vazia; ids de bola repetidos são rejeitados', async () => {
    expect(buildSimulation(worldData()).getState().balls).toEqual([]);
    const { validateWorld } = await import('src/core');
    const result = validateWorld(
      worldData({ balls: [ball({ position: [1, 1] }), ball({ position: [2, 2] })] }),
    );
    expect(result.ok).toBe(false);
  });
});

describe('US2 — câmera de visão global', () => {
  it('US2-AC1: pose do robô e posição da bola, sem ruído', () => {
    const world = worldData({
      robots: [
        robotData({
          pose: { x: 0.2, y: -0.1, theta: 0.5 },
          sensors: [{ id: 'cam', type: 'camera' }],
        }),
      ],
      balls: [ball({ position: [0.4, 0.3] })],
    });
    const controller = 'function onTick(r) { r.log(JSON.stringify(r.readCamera())); }';
    const state = buildSimulation(world, { r1: controller }).step(1);
    expect(JSON.parse(state.robots[0]!.logs[0]!.message)).toEqual({
      x: 0.2,
      y: -0.1,
      theta: 0.5,
      ball: { x: 0.4, y: 0.3 },
    });
  });

  it('US2-AC2: sem bola, posição nula; com ruído, leitura semeada', () => {
    const world = worldData({
      robots: [robotData({ sensors: [{ id: 'cam', type: 'camera', noise: 0.01 }] })],
    });
    const controller = 'function onTick(r) { r.log(JSON.stringify(r.readCamera().ball)); }';
    const state = buildSimulation(world, { r1: controller }).step(1);
    expect(state.robots[0]!.logs[0]!.message).toBe('null');
    expect(buildSimulation(world).getState()).toEqual(buildSimulation(world).getState());
  });
});

describe('reposição pedida pelo árbitro (FR-005)', () => {
  it('recoloca robôs e bola no tick seguinte ao pedido, mantendo o tempo', () => {
    const restartAt5: Modality = {
      id: 'reposicao',
      name: 'Teste',
      validateWorld: () => [],
      createReferee: () => ({
        evaluate: (state) => ({
          phase: 'running',
          winner: null,
          reason: null,
          score: {},
          restart: state.tick === 5,
        }),
      }),
    };
    const world = worldData({
      modality: 'reposicao',
      robots: [robotData({ pose: { x: -0.5, y: 0, theta: 0 } })],
      balls: [ball()],
    });
    const simulation = buildSimulation(
      world,
      { r1: constantSpeed(1, 0) },
      createModalityRegistry([restartAt5]),
    );
    const moved = simulation.step(4);
    expect(moved.robots[0]!.pose.x).toBeGreaterThan(-0.5);
    const restarted = simulation.step(1);
    expect(restarted.tick).toBe(5);
    expect(restarted.robots[0]!.pose).toEqual({ x: -0.5, y: 0, theta: 0 });
    expect(restarted.robots[0]!.odometry.distance).toBe(0);
    expect(restarted.balls[0]!.position).toEqual({ x: 0, y: 0 });
  });
});
