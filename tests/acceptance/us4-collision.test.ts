// Spec 001 — História 4: colidir sem atravessar e sentir o contato (FR-009, FR-010, FR-015).
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
const frontBumper = { id: 'frente', type: 'bumper', from: -PI / 2, to: PI / 2 };
const wallAt = (x: number) => ({ id: 'parede', type: 'wall', from: [x, -1], to: [x, 1] });
const robotWithBumper = (overrides: Record<string, unknown> = {}) =>
  robotData({ sensors: [frontBumper], ...overrides });

describe('US4 — colisão e bumper', () => {
  it('US4-AC1: para encostado na parede em x = 0,5 com bumper acionado', () => {
    const world = worldData({ obstacles: [wallAt(0.5)], robots: [robotWithBumper()] });
    const robot = robotState(runTicks(world, { r1: constantSpeed(1, 0) }, 20));
    expectPose(robot.pose, { x: 0.4, y: 0, theta: 0 });
    expect(robot.sensors.frente).toBe(true);
  });

  it('US4-AC2: o mesmo resultado contra uma caixa 0,2 × 2 centrada em (0,6; 0)', () => {
    const box = { id: 'caixa', type: 'box', center: [0.6, 0], width: 0.2, height: 2 };
    const world = worldData({ obstacles: [box], robots: [robotWithBumper()] });
    const robot = robotState(runTicks(world, { r1: constantSpeed(1, 0) }, 20));
    expectPose(robot.pose, { x: 0.4, y: 0, theta: 0 });
  });

  it('US4-AC3: a 2 m/s não atravessa a parede fina', () => {
    const world = worldData({
      obstacles: [wallAt(0.5)],
      robots: [robotWithBumper({ maxLinearSpeed: 2 })],
    });
    const robot = robotState(runTicks(world, { r1: constantSpeed(2, 0) }, 20));
    expectPose(robot.pose, { x: 0.4, y: 0, theta: 0 });
  });

  it('US4-AC4: ao recuar da parede, o bumper desaciona', () => {
    const world = worldData({
      obstacles: [wallAt(0.5)],
      robots: [robotWithBumper({ pose: { x: 0.4, y: 0, theta: 0 } })],
    });
    const simulation = buildSimulation(world, { r1: constantSpeed(-0.5, 0) });
    expect(robotState(simulation.step()).sensors.frente).toBe(false);
  });

  it('US4-AC5: A (massa 1) empurra B parado (massa 1) → A em 0,3 e B em 0,5', () => {
    const world = worldData({
      robots: [robotWithBumper(), robotWithBumper({ id: 'r2', pose: { x: 0.3, y: 0, theta: PI } })],
    });
    const state = runTicks(world, { r1: constantSpeed(0.5, 0) }, 20);
    expectPose(robotState(state, 'r1').pose, { x: 0.3, y: 0 });
    expectPose(robotState(state, 'r2').pose, { x: 0.5, y: 0 });
    expect(robotState(state, 'r1').sensors.frente).toBe(true);
    expect(robotState(state, 'r2').sensors.frente).toBe(true);
  });

  it('US4-AC6: com A de massa 3 → A em 0,4 e B em 0,6', () => {
    const world = worldData({
      robots: [
        robotWithBumper({ mass: 3 }),
        robotWithBumper({ id: 'r2', pose: { x: 0.3, y: 0, theta: PI } }),
      ],
    });
    const state = runTicks(world, { r1: constantSpeed(0.5, 0) }, 20);
    expectPose(robotState(state, 'r1').pose, { x: 0.4, y: 0 });
    expectPose(robotState(state, 'r2').pose, { x: 0.6, y: 0 });
  });

  it('US4-AC7: robôs iguais empurrando frente a frente não avançam após o contato', () => {
    const world = worldData({
      robots: [robotWithBumper(), robotWithBumper({ id: 'r2', pose: { x: 0.3, y: 0, theta: PI } })],
    });
    const simulation = buildSimulation(world, {
      r1: constantSpeed(0.5, 0),
      r2: constantSpeed(0.5, 0),
    });
    const atContact = simulation.step(2);
    const later = simulation.step(20);
    expectPose(robotState(atContact, 'r1').pose, { x: 0.05, y: 0 });
    expectPose(robotState(later, 'r1').pose, { x: 0.05, y: 0 });
    expectPose(robotState(later, 'r2').pose, { x: 0.25, y: 0 });
  });

  it('US4-AC8: sem obstáculos ao redor, o bumper nunca aciona', () => {
    const world = worldData({ robots: [robotWithBumper()] });
    const simulation = buildSimulation(world, { r1: constantSpeed(0.8, 1.2) });
    for (let i = 0; i < 100; i++) expect(robotState(simulation.step()).sensors.frente).toBe(false);
  });
});
