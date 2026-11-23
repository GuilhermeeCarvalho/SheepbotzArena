// SC-004: 10 000 ticks, 4 robôs com laser de 30 raios e 20 obstáculos em menos de 5 s (tasks 001 T055).
import { describe, expect, it } from 'vitest';
import { buildSimulation, robotData, worldData } from '../helpers';

const obstacles = Array.from({ length: 20 }, (_, i) => ({
  id: `o${i}`,
  type: i % 2 === 0 ? 'disc' : 'box',
  center: [-4 + (i % 5) * 2, -3 + Math.floor(i / 5) * 2],
  ...(i % 2 === 0 ? { radius: 0.2 } : { width: 0.3, height: 0.3 }),
}));

const laser = [{ id: 'laser', type: 'laser', rays: 30, fov: 3, maxRange: 3 }];

describe('desempenho', () => {
  it('SC-004', () => {
    const simulation = buildSimulation(
      worldData({
        arena: { width: 12, height: 12, walls: true },
        obstacles,
        robots: [0, 1, 2, 3].map((i) =>
          robotData({ id: `r${i}`, pose: { x: -5 + i * 3, y: 5, theta: -1.5 }, sensors: laser }),
        ),
      }),
      Object.fromEntries(
        [0, 1, 2, 3].map((i) => [
          `r${i}`,
          'function onTick(r) { const l = r.readLaser(); r.setSpeed(l[15] < 0.5 ? 0 : 0.8, l[15] < 0.5 ? 2 : 0); }',
        ]),
      ),
    );
    const start = performance.now();
    simulation.step(10_000);
    const seconds = (performance.now() - start) / 1000;
    console.log(`10 000 ticks em ${seconds.toFixed(2)} s`);
    expect(seconds).toBeLessThan(5);
  });
});
