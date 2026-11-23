// Spec 001 — História 5: odometria e piso (FR-014, FR-016, FR-017).
import { describe, expect, it } from 'vitest';
import {
  buildSimulation,
  constantSpeed,
  expectPose,
  robotData,
  robotState,
  runTicks,
  worldData,
} from '../helpers';

const PI = Math.PI;

describe('US5 — odometria e piso', () => {
  it('US5-AC1: odometria no referencial inicial diverge da pose global', () => {
    const world = worldData({ robots: [robotData({ pose: { x: 1, y: 1, theta: PI / 2 } })] });
    const robot = robotState(runTicks(world, { r1: constantSpeed(1, 0) }, 20));
    expectPose(robot.odometry, { x: 1, y: 0, theta: 0 });
    expect(robot.odometry.distance).toBeCloseTo(1, 3);
    expectPose(robot.pose, { x: 1, y: 2, theta: 1.571 });
  });

  it('US5-AC2: robô bloqueado na parede — odometria 1,0 e pose real 0,4', () => {
    const world = worldData({
      obstacles: [{ id: 'parede', type: 'wall', from: [0.5, -1], to: [0.5, 1] }],
      robots: [robotData()],
    });
    const robot = robotState(runTicks(world, { r1: constantSpeed(1, 0) }, 20));
    expect(robot.odometry.x).toBeCloseTo(1, 3);
    expect(robot.pose.x).toBeCloseTo(0.4, 3);
  });

  describe('US5-AC3: Dohyo com Tawara', () => {
    const dohyoWorld = (x: number) =>
      worldData({
        floor: {
          reflectance: 0.5,
          regions: [
            { type: 'disc', center: [0, 0], radius: 0.5, reflectance: 0.1 },
            { type: 'ring', center: [0, 0], innerRadius: 0.45, outerRadius: 0.5, reflectance: 0.9 },
          ],
        },
        robots: [
          robotData({
            pose: { x, y: 0, theta: 0 },
            radius: 0.05,
            sensors: [{ id: 'piso', type: 'floor', position: [0.1, 0] }],
          }),
        ],
      });
    const reading = (x: number) =>
      robotState(buildSimulation(dohyoWorld(x)).getState()).sensors.piso;

    it('centro do Dohyo → 0,1', () => expect(reading(0)).toBe(0.1));
    it('sensor sobre a Tawara (x = 0,47) → 0,9', () => expect(reading(0.37)).toBe(0.9));
    it('sensor fora do Dohyo (x = 0,55) → 0,5', () => expect(reading(0.45)).toBe(0.5));
  });

  it('US5-AC4: linha de espessura 0,02 detectada a 0,005 m e não a 0,02 m', () => {
    const lineWorld = (y: number) =>
      worldData({
        floor: {
          regions: [
            {
              type: 'line',
              points: [
                [-1, 0],
                [1, 0],
              ],
              width: 0.02,
              reflectance: 0.9,
            },
          ],
        },
        robots: [
          robotData({
            pose: { x: 0, y, theta: 0 },
            sensors: [{ id: 'piso', type: 'floor', position: [0, 0] }],
          }),
        ],
      });
    expect(robotState(buildSimulation(lineWorld(0.005)).getState()).sensors.piso).toBe(0.9);
    expect(robotState(buildSimulation(lineWorld(0.02)).getState()).sensors.piso).toBe(0.5);
  });

  it('ruído de odometria e piso é semeado e limitado', () => {
    const world = (seed: number) =>
      worldData({
        seed,
        robots: [
          robotData({
            odometry: { noise: 0.05 },
            sensors: [{ id: 'piso', type: 'floor', position: [0, 0], noise: 0.3 }],
          }),
        ],
      });
    const run = (seed: number) => runTicks(world(seed), { r1: constantSpeed(0.5, 0.2) }, 50);
    expect(run(1)).toEqual(run(1));
    expect(robotState(run(1)).odometry).not.toEqual(robotState(run(2)).odometry);
    const floor = robotState(run(1)).sensors.piso as number;
    expect(floor).toBeGreaterThanOrEqual(0);
    expect(floor).toBeLessThanOrEqual(1);
  });
});
