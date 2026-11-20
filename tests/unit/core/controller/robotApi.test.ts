// API do robô (contracts/controller-api.md; FR-018 a FR-020).
import { describe, expect, it } from 'vitest';
import { MAX_LOG_ENTRIES } from 'src/core/simulation/tick';
import { buildSimulation, robotData, robotState, worldData } from '../../../helpers';

const sensors = [
  { id: 'laser', type: 'laser', rays: 3, fov: 1, maxRange: 2 },
  { id: 'sonar', type: 'sonar', rays: 3, fov: 1, maxRange: 2 },
  { id: 'frente', type: 'bumper', from: -1, to: 1 },
  { id: 'piso', type: 'floor', position: [0, 0] },
];

const runOnce = (source: string, robot: Record<string, unknown> = { sensors }) =>
  robotState(buildSimulation(worldData({ robots: [robotData(robot)] }), { r1: source }).step());

describe('robot API', () => {
  it('lê todos os tipos de sensor por padrão e por id', () => {
    const robot = runOnce(`function onTick(r) {
      r.log(JSON.stringify([r.readLaser(), r.readLaser('laser').length, r.readSonar(), r.readBumper(), r.readFloor('piso'), r.readOdometry(), r.id, r.time()]));
    }`);
    expect(robot.status).toBe('ok');
    expect(JSON.parse(robot.logs[0]!.message)).toEqual([
      [2, 2, 2],
      3,
      2,
      false,
      0.5,
      { x: 0, y: 0, theta: 0, distance: 0 },
      'r1',
      0,
    ]);
  });

  it('readLaser devolve cópia: alterar não afeta a leitura', () => {
    const robot = runOnce(
      `function onTick(r) { const a = r.readLaser(); a[0] = 99; r.log(r.readLaser()[0]); }`,
    );
    expect(robot.logs[0]!.message).toBe('2');
  });

  it('sensor de outro tipo e robô sem sensor do tipo geram erro', () => {
    expect(runOnce(`function onTick(r) { r.readSonar('laser'); }`).error?.message).toContain(
      'é do tipo laser, não sonar',
    );
    expect(runOnce(`function onTick(r) { r.readLaser(); }`, {}).error?.message).toBe(
      "O robô 'r1' não tem laser",
    );
  });

  it.each(['NaN, 0', '0, Infinity', '"1", 0'])('setSpeed(%s) é erro do controlador', (args) => {
    const robot = runOnce(`function onTick(r) { r.setSpeed(${args}); }`);
    expect(robot.status).toBe('error');
    expect(robot.error?.message).toContain('setSpeed(v, w) exige números finitos');
  });

  it(`log mantém as últimas ${MAX_LOG_ENTRIES} mensagens`, () => {
    const simulation = buildSimulation(worldData({ robots: [robotData()] }), {
      r1: 'function onTick(r) { r.log(r.time()); }',
    });
    const robot = robotState(simulation.step(MAX_LOG_ENTRIES + 20));
    expect(robot.logs).toHaveLength(MAX_LOG_ENTRIES);
    expect(robot.logs[0]!.tick).toBe(21);
  });

  it.each([
    'globalThis.x',
    'process.exit()',
    'require("fs")',
    'new Date()',
    'setTimeout(() => 0, 1)',
  ])('%s é bloqueado com mensagem clara', (expression) => {
    const robot = runOnce(`function onTick(r) { ${expression}; }`);
    expect(robot.status).toBe('error');
    expect(robot.error?.message).toMatch(/não está disponível no controlador/);
  });

  it('o estado devolvido é congelado', () => {
    const state = buildSimulation(worldData({ robots: [robotData()] })).getState();
    expect(() => {
      (state.robots[0]!.pose as { x: number }).x = 5;
    }).toThrow(TypeError);
  });
});
