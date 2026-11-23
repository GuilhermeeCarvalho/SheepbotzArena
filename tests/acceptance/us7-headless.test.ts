// Spec 001 — História 7: executar sem interface e obter o resultado (FR-021, FR-022, FR-024).
import { describe, expect, it } from 'vitest';
import { createModalityRegistry, type Modality } from 'src/core';
import { EXIT, run } from 'src/cli/run';
import {
  buildSimulation,
  constantSpeed,
  expectPose,
  fixturePath,
  robotData,
  robotState,
  worldData,
} from '../helpers';

describe('US7 — execução headless', () => {
  it('US7-AC1: a CLI imprime o estado final estruturado e termina com sucesso', async () => {
    const result = await run([
      fixturePath('worlds/straight-line.json'),
      '--ticks',
      '20',
      '--controller',
      `r1=${fixturePath('controllers/forward-1ms.js')}`,
    ]);
    expect(result.code).toBe(EXIT.ok);
    const state = JSON.parse(result.stdout);
    expect(state.tick).toBe(20);
    expect(state.time).toBeCloseTo(1, 9);
    const robot = state.robots[0];
    expectPose(robot.pose, { x: 1, y: 0, theta: 0 });
    expect(Object.keys(robot)).toEqual(
      expect.arrayContaining(['pose', 'command', 'odometry', 'sensors', 'status']),
    );
    expect(robot.status).toBe('ok');
  });

  it('US7-AC2: mundo inválido não executa ticks e termina com código de validação', async () => {
    const result = await run([fixturePath('worlds/invalid-three-errors.json'), '--ticks', '5']);
    expect(result.code).toBe(EXIT.invalidWorld);
    expect(result.stdout).toBe('');
    expect(result.stderr.trim().split('\n')).toHaveLength(3);
  });

  it('US7-AC3: step(1) seguido de step(9) equivale a step(10)', () => {
    const world = worldData({
      robots: [
        robotData({
          sensors: [{ id: 'laser', type: 'laser', rays: 5, fov: 2, maxRange: 2, noise: 0.02 }],
        }),
      ],
    });
    const controller = 'function onTick(r) { r.setSpeed(0.3 + r.random() * 0.2, 0.5); }';
    const a = buildSimulation(world, { r1: controller });
    a.step(1);
    const split = a.step(9);
    const whole = buildSimulation(world, { r1: controller }).step(10);
    expect(split).toEqual(whole);
  });

  it('US7-AC4: reset volta exatamente ao estado inicial, incluindo memória e aleatoriedade', () => {
    const world = worldData({ robots: [robotData({ odometry: { noise: 0.01 } })] });
    const controller =
      'let n = 0; function onTick(r) { n++; r.log(n + ":" + r.random()); r.setSpeed(0.2, 0.1); }';
    const simulation = buildSimulation(world, { r1: controller });
    const initial = simulation.getState();
    const firstRun = simulation.step(15);
    expect(simulation.reset()).toEqual(initial);
    expect(simulation.step(15)).toEqual(firstRun);
  });

  it('US7-AC5: robô sem controlador fica parado e sinalizado', () => {
    const world = worldData({
      robots: [robotData(), robotData({ id: 'r2', pose: { x: 1, y: 1, theta: 0 } })],
    });
    const state = buildSimulation(world, { r1: constantSpeed(0.5, 0) }).step(10);
    expect(robotState(state, 'r2').status).toBe('no-controller');
    expect(robotState(state, 'r2').pose).toEqual({ x: 1, y: 1, theta: 0 });
  });

  it('caso de borda: partida encerrada pela modalidade não avança mais ticks', () => {
    const finishAtTick3: Modality = {
      id: 'teste-fim',
      name: 'Modalidade de teste',
      validateWorld: () => [],
      createReferee: () => ({
        evaluate: (state) => ({
          phase: state.tick >= 3 ? 'finished' : 'running',
          winner: state.tick >= 3 ? 'r1' : null,
          reason: state.tick >= 3 ? 'fim de teste' : null,
          score: { r1: state.tick },
        }),
      }),
    };
    const modalities = createModalityRegistry([finishAtTick3]);
    const world = worldData({ modality: 'teste-fim', robots: [robotData()] });
    const simulation = buildSimulation(world, { r1: constantSpeed(1, 0) }, modalities);
    expect(simulation.getState().match?.phase).toBe('running');
    const state = simulation.step(10);
    expect(state.tick).toBe(3);
    expect(state.match).toMatchObject({ phase: 'finished', winner: 'r1', score: { r1: 3 } });
    expect(simulation.reset().match?.phase).toBe('running');
  });

  it('caso de borda: mundo sem robôs avança o tempo; 0 ticks devolve o estado inicial', () => {
    const simulation = buildSimulation(worldData());
    expect(simulation.step(0)).toEqual(simulation.getState());
    expect(simulation.step(4).time).toBeCloseTo(0.2, 9);
    expect(() => simulation.step(-1)).toThrow(RangeError);
    expect(() => simulation.step(1.5)).toThrow(RangeError);
  });
});
