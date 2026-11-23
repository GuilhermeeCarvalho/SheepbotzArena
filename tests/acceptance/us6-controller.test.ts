// Spec 001 — História 6: controlador contra uma API limitada (FR-018 a FR-020).
import { describe, expect, it } from 'vitest';
import { createSimulation } from 'src/core';
import {
  buildSimulation,
  buildWorld,
  constantSpeed,
  readFixture,
  robotData,
  robotState,
  worldData,
} from '../helpers';

const controller = (name: string) => readFixture(`controllers/${name}.js`);
const create = (source: string) =>
  createSimulation(buildWorld(worldData({ robots: [robotData()] })), {
    controllers: { r1: source },
  });

describe('US6 — controlador', () => {
  it('US6-AC1: para antes da parede usando o laser e nunca aciona o bumper', () => {
    const world = worldData({
      obstacles: [{ id: 'parede', type: 'wall', from: [2, -1], to: [2, 1] }],
      robots: [
        robotData({
          sensors: [
            { id: 'laser', type: 'laser', rays: 3, fov: 1, maxRange: 3 },
            { id: 'frente', type: 'bumper', from: -Math.PI / 2, to: Math.PI / 2 },
          ],
        }),
      ],
    });
    const simulation = buildSimulation(world, { r1: controller('stop-before-wall') });
    for (let i = 0; i < 100; i++) expect(robotState(simulation.step()).sensors.frente).toBe(false);
    const robot = robotState(simulation.getState());
    expect(robot.pose.x).toBeGreaterThan(1.4);
    expect(robot.pose.x).toBeLessThan(1.9);
    expect(robot.command.v).toBe(0);
  });

  it('US6-AC2: erro de sintaxe impede o início e informa robô e linha', () => {
    const result = create(controller('syntax-error'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatchObject({ robotId: 'r1', code: 'CONTROLLER_SYNTAX', line: 2 });
    expect(result.errors[0]!.message).toMatch(/robô 'r1', linha 2/);
  });

  it('US6-AC3: sem onTick a simulação não inicia', () => {
    const result = create(controller('no-ontick'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]!.code).toBe('CONTROLLER_MISSING_ONTICK');
    expect(result.errors[0]!.message).toContain('onTick');
  });

  it('erro no código de nível superior impede o início', () => {
    const result = create(controller('init-error'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]!.code).toBe('CONTROLLER_INIT_ERROR');
  });

  it('US6-AC4: erro no tick 5 coloca só o robô A em "erro"; B continua', () => {
    const world = worldData({
      robots: [robotData(), robotData({ id: 'r2', pose: { x: 0, y: 1, theta: 0 } })],
    });
    const simulation = buildSimulation(world, {
      r1: controller('throws-at-tick-5'),
      r2: constantSpeed(0.5, 0),
    });
    const state = simulation.step(20);
    const a = robotState(state, 'r1');
    const b = robotState(state, 'r2');
    expect(a.status).toBe('error');
    expect(a.error).toEqual({ tick: 5, message: 'falha proposital' });
    expect(a.command).toEqual({ v: 0, w: 0 });
    expect(a.pose.x).toBeCloseTo(0.1, 6); // andou 4 ticks a 0,5 m/s
    expect(b.status).toBe('ok');
    expect(b.pose.x).toBeCloseTo(0.5, 6);
  });

  it.each([
    ['uses-date', /Date não está disponível/],
    ['uses-math-random', /Math.random não está disponível.*robot.random/],
  ])('US6-AC5: recurso não determinístico indisponível (%s)', (name, message) => {
    const simulation = buildSimulation(worldData({ robots: [robotData()] }), {
      r1: controller(name),
    });
    const robot = robotState(simulation.step());
    expect(robot.status).toBe('error');
    expect(robot.error?.message).toMatch(message);
  });

  it('US6-AC5: robot.random() repete a sequência com a mesma seed', () => {
    const run = (seed: number) =>
      robotState(
        buildSimulation(worldData({ seed, robots: [robotData()] }), {
          r1: controller('uses-robot-random'),
        }).step(10),
      ).logs.map((entry) => entry.message);
    expect(run(9)).toEqual(run(9));
    expect(run(9)).not.toEqual(run(10));
  });

  it('US6-AC6: sensor inexistente gera erro claro', () => {
    const simulation = buildSimulation(worldData({ robots: [robotData()] }), {
      r1: controller('unknown-sensor'),
    });
    const robot = robotState(simulation.step());
    expect(robot.status).toBe('error');
    expect(robot.error?.message).toBe("O robô 'r1' não tem sensor 'inexistente'");
  });
});
