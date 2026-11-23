// Spec 001 — História 2: mover um robô de tração diferencial de forma previsível (FR-005 a FR-008).
import { describe, expect, it } from 'vitest';
import {
  constantSpeed,
  expectPose,
  readFixture,
  robotData,
  robotState,
  runTicks,
  worldData,
} from '../helpers';

const singleRobot = (dt: number, robot: Record<string, unknown> = {}) =>
  worldData({ dt, robots: [robotData(robot)] });

describe('US2 — cinemática diferencial', () => {
  it('US2-AC1: v = 1, w = 0, 20 ticks de 0,05 → (1; 0; 0)', () => {
    const state = runTicks(
      singleRobot(0.05),
      { r1: readFixture('controllers/forward-1ms.js') },
      20,
    );
    expectPose(robotState(state).pose, { x: 1, y: 0, theta: 0 });
  });

  it('US2-AC2: v = 0,5, w = π/2, 20 ticks → (0,318; 0,318; 1,571)', () => {
    const state = runTicks(
      singleRobot(0.05),
      { r1: readFixture('controllers/arc-quarter.js') },
      20,
    );
    expectPose(robotState(state).pose, { x: 0.318, y: 0.318, theta: 1.571 });
  });

  it('US2-AC3: v = 0, w = 1, 10 ticks de 0,1 → (0; 0; 1)', () => {
    const state = runTicks(singleRobot(0.1), { r1: readFixture('controllers/spin.js') }, 10);
    expectPose(robotState(state).pose, { x: 0, y: 0, theta: 1 });
  });

  it('US2-AC4: três quartos de volta normalizam para −1,571', () => {
    const state = runTicks(singleRobot(0.05), { r1: constantSpeed(0, Math.PI / 2) }, 60);
    expectPose(robotState(state).pose, { x: 0, y: 0, theta: -1.571 });
  });

  it('US2-AC5: comando acima do máximo é saturado', () => {
    const state = runTicks(
      singleRobot(0.05, { maxLinearSpeed: 0.5 }),
      { r1: constantSpeed(2, 0) },
      20,
    );
    expectPose(robotState(state).pose, { x: 0.5, y: 0, theta: 0 });
    expect(robotState(state).command).toEqual({ v: 0.5, w: 0 });
  });

  it('US2-AC6: robô em (1; 2; π) andando 10 ticks a 1 m/s → (0,5; 2; π)', () => {
    const data = singleRobot(0.05, { pose: { x: 1, y: 2, theta: Math.PI } });
    const state = runTicks(data, { r1: constantSpeed(1, 0) }, 10);
    expectPose(robotState(state).pose, { x: 0.5, y: 2, theta: 3.142 });
  });

  it('US2-AC7: controlador que não comanda mantém o robô parado', () => {
    const state = runTicks(singleRobot(0.05), { r1: readFixture('controllers/idle.js') }, 100);
    expect(robotState(state).pose).toEqual({ x: 0, y: 0, theta: 0 });
  });

  it('US2-AC8: duas execuções iguais produzem estados idênticos em todos os ticks', async () => {
    const { buildSimulation } = await import('../helpers');
    const data = worldData({
      seed: 3,
      robots: [
        robotData({
          sensors: [{ id: 'laser', type: 'laser', rays: 9, fov: 3, maxRange: 3, noise: 0.01 }],
        }),
        robotData({ id: 'r2', pose: { x: 1, y: 1, theta: 2 } }),
      ],
    });
    const wander = 'function onTick(r) { r.setSpeed(r.random(), r.random() * 2 - 1); }';
    const a = buildSimulation(data, { r1: wander, r2: wander });
    const b = buildSimulation(data, { r1: wander, r2: wander });
    for (let tick = 0; tick < 1000; tick++) {
      expect(a.step()).toEqual(b.step());
    }
  });
});
