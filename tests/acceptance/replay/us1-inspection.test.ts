// Spec 005 — US1: painel de inspeção (FR-001).
import { describe, expect, it } from 'vitest';
import { inspectRobot, RECENT_LOGS } from 'src/app/inspection/inspectRobot';
import { buildSimulation, robotData, worldData } from '../../helpers';

const PI = Math.PI;
const world = worldData({
  obstacles: [{ id: 'parede', type: 'wall', from: [1, -5], to: [1, 5] }],
  balls: [{ id: 'bola', position: [0.5, 0.4], radius: 0.02 }],
  robots: [
    robotData({
      sensors: [
        { id: 'laser', type: 'laser', rays: 3, fov: PI, maxRange: 2 },
        { id: 'sonar', type: 'sonar', rays: 3, fov: 0.5, maxRange: 2 },
        { id: 'piso', type: 'floor', position: [0, 0] },
        { id: 'frente', type: 'bumper', from: -PI / 2, to: PI / 2 },
        { id: 'cam', type: 'camera' },
      ],
    }),
  ],
});

describe('US1 — painel de inspeção', () => {
  const simulation = buildSimulation(world, {
    r1: 'let n = 0; function onTick(r) { n++; r.log("msg " + n); r.setSpeed(0.2, 0.5); }',
  });
  const initial = inspectRobot(simulation.world, simulation.getState(), 'r1')!;

  it('US1-AC1: raios do laser com leitura e detecção', () => {
    const laser = initial.sensors[0]!;
    expect(laser.kind).toBe('range');
    if (laser.kind !== 'range') return;
    expect(laser.readings.map((d) => Number(d.toFixed(2)))).toEqual([2, 1, 2]);
    expect(laser.hits).toEqual([false, true, false]);
    expect(laser.maxRange).toBe(2);
    expect(initial.sensors[1]).toMatchObject({ kind: 'range', type: 'sonar', hits: [true] });
  });

  it('US1-AC2/AC3: piso e bumper', () => {
    expect(initial.sensors[2]).toEqual({ kind: 'floor', id: 'piso', value: 0.5, white: false });
    expect(initial.sensors[3]).toEqual({ kind: 'bumper', id: 'frente', pressed: false });
  });

  it('US1-AC4/AC6: comando e odometria do tick exibido', () => {
    const later = inspectRobot(simulation.world, simulation.step(20), 'r1')!;
    expect(later.command).toEqual({ v: 0.2, w: 0.5 });
    expect(later.odometry.thetaDeg).toBe(29); // 0,5 rad/s × 1 s
    expect(later.odometry.distance).toBeCloseTo(0.2, 9);
  });

  it('US1-AC5: câmera com a bola; sem bola → null (inclusive vindo de JSON)', () => {
    expect(initial.sensors[4]).toEqual({
      kind: 'camera',
      id: 'cam',
      x: 0,
      y: 0,
      thetaDeg: 0,
      ball: { x: 0.5, y: 0.4 },
    });
    const noBall = JSON.parse(JSON.stringify(buildSimulation({ ...world, balls: [] }).getState()));
    const view = inspectRobot(buildSimulation({ ...world, balls: [] }).world, noBall, 'r1')!;
    expect(view.sensors[4]).toMatchObject({ kind: 'camera', ball: null });
  });

  it('US1-AC7: as 5 mensagens mais recentes de robot.log', () => {
    const view = inspectRobot(simulation.world, simulation.getState(), 'r1')!;
    expect(view.logs).toHaveLength(RECENT_LOGS);
    expect(view.logs.at(-1)).toEqual({ tick: 20, message: 'msg 20' });
  });

  it('robô inexistente → null', () => {
    expect(inspectRobot(simulation.world, simulation.getState(), 'nao-existe')).toBeNull();
  });
});
