// SC-002: duas execuções com as mesmas entradas são idênticas em todos os ticks (FR-008; tasks 001 T056).
import { describe, expect, it } from 'vitest';
import { buildSimulation, robotData, worldData } from '../helpers';

const sensors = [
  { id: 'laser', type: 'laser', rays: 30, fov: 4, maxRange: 3, noise: 0.01 },
  { id: 'frente', type: 'bumper', from: -1.5, to: 1.5 },
  { id: 'piso', type: 'floor', position: [0.05, 0], noise: 0.05 },
];

const world = worldData({
  seed: 2024,
  arena: { width: 4, height: 4, walls: true },
  obstacles: [
    { id: 'p1', type: 'disc', center: [0.8, 0.8], radius: 0.2 },
    { id: 'b1', type: 'box', center: [-0.8, 0.5], width: 0.4, height: 0.2, angle: 0.3 },
  ],
  robots: [
    robotData({
      id: 'a',
      pose: { x: -1.5, y: -1.5, theta: 0 },
      sensors,
      odometry: { noise: 0.02 },
    }),
    robotData({ id: 'b', pose: { x: 1.5, y: -1.5, theta: 3 }, sensors }),
    robotData({ id: 'c', pose: { x: 1.5, y: 1.5, theta: -2 }, sensors }),
    robotData({ id: 'd', pose: { x: -1.5, y: 1.5, theta: 1 }, sensors }),
  ],
});

const wander = `
  let turn = 0;
  function onTick(r) {
    const ranges = r.readLaser();
    if (r.readBumper() || Math.min(...ranges.slice(10, 20)) < 0.3) turn = r.random() < 0.5 ? -2 : 2;
    else if (r.random() < 0.05) turn = 0;
    r.setSpeed(turn === 0 ? 0.6 : 0.1, turn);
  }`;
const controllers = { a: wander, b: wander, c: wander, d: wander };

describe('determinismo', () => {
  it('SC-002: 4 robôs, 10 000 ticks, estados idênticos', { timeout: 180_000 }, () => {
    const first = buildSimulation(world, controllers);
    const second = buildSimulation(world, controllers);
    for (let tick = 1; tick <= 10_000; tick++) {
      const a = first.step();
      const b = second.step();
      // Poses a cada tick (barato); estado completo a cada 500 ticks e no final.
      a.robots.forEach((robot, i) => {
        const other = b.robots[i]!.pose;
        if (
          robot.pose.x !== other.x ||
          robot.pose.y !== other.y ||
          robot.pose.theta !== other.theta
        ) {
          expect.fail(`Divergência no tick ${tick}, robô ${robot.id}`);
        }
      });
      if (tick % 500 === 0) expect(a).toEqual(b);
    }
  });
});
