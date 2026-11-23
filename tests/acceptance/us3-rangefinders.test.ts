// Spec 001 — História 3: enxergar o mundo com laser e sonar (FR-011 a FR-013, FR-017).
import { describe, expect, it } from 'vitest';
import { loadWorld } from 'src/core';
import {
  buildSimulation,
  expectReadings,
  readFixture,
  robotData,
  robotState,
  worldData,
} from '../helpers';

const PI = Math.PI;
const verticalWall = (x: number) => ({ id: 'parede', type: 'wall', from: [x, -5], to: [x, 5] });
const laser = (overrides: Record<string, unknown> = {}) => ({
  id: 'laser',
  type: 'laser',
  rays: 1,
  fov: PI,
  maxRange: 2,
  ...overrides,
});

/** Leitura do sensor `sensorId` do robô r1 no estado inicial (tick 0). */
function initialReading(world: Record<string, unknown>, sensorId = 'laser') {
  return robotState(buildSimulation(world).getState()).sensors[sensorId];
}

describe('US3 — laser e sonar', () => {
  it('US3-AC1: 3 raios, FOV π, parede em x = 1 → [2; 1; 2]', () => {
    const result = loadWorld(readFixture('worlds/laser-wall-3rays.json'));
    expect(result.ok).toBe(true);
    const world = JSON.parse(readFixture('worlds/laser-wall-3rays.json'));
    expectReadings(initialReading(world) as number[], [2, 1, 2]);
  });

  it('US3-AC2: 5 raios, FOV π/2 → [1,414; 1,082; 1; 1,082; 1,414]', () => {
    const world = worldData({
      obstacles: [verticalWall(1)],
      robots: [robotData({ sensors: [laser({ rays: 5, fov: PI / 2 })] })],
    });
    expectReadings(initialReading(world) as number[], [1.414, 1.082, 1, 1.082, 1.414]);
  });

  it('US3-AC3: laser 0,05 m à frente do centro → [0,95]', () => {
    const world = worldData({
      obstacles: [verticalWall(1)],
      robots: [robotData({ sensors: [laser({ position: [0.05, 0] })] })],
    });
    expectReadings(initialReading(world) as number[], [0.95]);
  });

  it('US3-AC4: robô em θ = π/2 e parede em y = 1,5 → [1,5]', () => {
    const world = worldData({
      obstacles: [{ id: 'parede', type: 'wall', from: [-5, 1.5], to: [5, 1.5] }],
      robots: [robotData({ pose: { x: 0, y: 0, theta: PI / 2 }, sensors: [laser()] })],
    });
    expectReadings(initialReading(world) as number[], [1.5]);
  });

  it('US3-AC5: disco de raio 0,5 em (2; 0) com alcance 3 → [1,5]', () => {
    const world = worldData({
      obstacles: [{ id: 'pilar', type: 'disc', center: [2, 0], radius: 0.5 }],
      robots: [robotData({ sensors: [laser({ maxRange: 3 })] })],
    });
    expectReadings(initialReading(world) as number[], [1.5]);
  });

  it('US3-AC6: outro robô de raio 0,1 em (1; 0) → [0,9]', () => {
    const world = worldData({
      robots: [
        robotData({ sensors: [laser()] }),
        robotData({ id: 'r2', pose: { x: 1, y: 0, theta: 0 } }),
      ],
    });
    expectReadings(initialReading(world) as number[], [0.9]);
  });

  it('US3-AC7: parede além do alcance → leitura igual ao alcance máximo', () => {
    const world = worldData({
      obstacles: [verticalWall(3)],
      robots: [robotData({ sensors: [laser()] })],
    });
    expectReadings(initialReading(world) as number[], [2]);
  });

  it('US3-AC8: sonar de 3 raios, FOV π/3 → 1', () => {
    const world = worldData({
      obstacles: [verticalWall(1)],
      robots: [
        robotData({ sensors: [laser({ id: 'sonar', type: 'sonar', rays: 3, fov: PI / 3 })] }),
      ],
    });
    expect(initialReading(world, 'sonar')).toBeCloseTo(1, 3);
  });

  it('US3-AC9: ruído é reproduzível pela seed e limitado a [0, alcance]', () => {
    const noisyWorld = (seed: number) =>
      worldData({
        seed,
        obstacles: [verticalWall(1.98)],
        robots: [robotData({ sensors: [laser({ rays: 31, noise: 0.05 })] })],
      });
    const run = (seed: number) => {
      const simulation = buildSimulation(noisyWorld(seed));
      const readings = [
        simulation.getState(),
        ...Array.from({ length: 20 }, () => simulation.step()),
      ].map((state) => robotState(state).sensors.laser as number[]);
      return readings;
    };
    const first = run(5);
    expect(run(5)).toEqual(first);
    expect(run(6)).not.toEqual(first);
    for (const values of first)
      for (const value of values) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(2);
      }
  });
});
