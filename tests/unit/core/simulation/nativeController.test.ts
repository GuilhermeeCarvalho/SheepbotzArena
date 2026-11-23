// Spec 009 — T001: controlador pronto (função) no núcleo (FR-003).
import { describe, expect, it } from 'vitest';
import { createSimulation, type RobotApi } from 'src/core';
import { buildWorld, constantSpeed, expectPose, robotData, worldData } from '../../../helpers';

const twoRobots = buildWorld(
  worldData({
    robots: [
      robotData({ maxLinearSpeed: 0.5 }),
      robotData({ id: 'r2', pose: { x: 0, y: 2, theta: 0 } }),
    ],
  }),
);

describe('nativeControllers', () => {
  it('controla o robô como um controlador em JavaScript, com saturação', () => {
    const native = (robot: unknown) => (robot as RobotApi).setSpeed(2, 0);
    const result = createSimulation(twoRobots, { nativeControllers: { r1: native } });
    if (!result.ok) throw new Error('simulação inválida');
    const state = result.value.step(20);
    expect(state.robots[0]!.status).toBe('ok');
    expect(state.robots[0]!.command).toEqual({ v: 0.5, w: 0 });
    expectPose(state.robots[0]!.pose, { x: 0.5, y: 0, theta: 0 });
    expect(state.robots[1]!.status).toBe('no-controller');
  });

  it('tem precedência sobre o código-fonte do mesmo robô e convive com outros controladores', () => {
    const native = (robot: unknown) => (robot as RobotApi).setSpeed(0, 0);
    const result = createSimulation(twoRobots, {
      controllers: { r1: 'isto não é JavaScript', r2: constantSpeed(1, 0) },
      nativeControllers: { r1: native },
    });
    if (!result.ok) throw new Error('simulação inválida');
    const state = result.value.step(10);
    expectPose(state.robots[0]!.pose, { x: 0, y: 0 });
    expectPose(state.robots[1]!.pose, { x: 0.5, y: 2 });
  });

  it('erro lançado pela função põe só aquele robô em "erro"; reset volta a "ok"', () => {
    let calls = 0;
    const native = (robot: unknown) => {
      calls += 1;
      if (calls === 3) throw new Error('falhou');
      (robot as RobotApi).setSpeed(1, 0);
    };
    const result = createSimulation(twoRobots, {
      controllers: { r2: constantSpeed(1, 0) },
      nativeControllers: { r1: native },
    });
    if (!result.ok) throw new Error('simulação inválida');
    const state = result.value.step(5);
    expect(state.robots[0]).toMatchObject({
      status: 'error',
      command: { v: 0, w: 0 },
      error: { tick: 3, message: 'falhou' },
    });
    expect(state.robots[1]!.status).toBe('ok');
    expect(result.value.reset().robots[0]!.status).toBe('ok');
  });
});
