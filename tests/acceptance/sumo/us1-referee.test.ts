// Spec 004 — US1: arbitrar o round (FR-002, FR-003, FR-005).
import { describe, expect, it } from 'vitest';
import { constantSpeed, miniRobot, runRound, sumoSimulation, sumoWorld } from './helpers';

const PI = Math.PI;

describe('US1 — arbitragem do round (Mini Sumô)', () => {
  it('US1-AC1: B sai sozinho do Dohyo no tick 4 → Yuko para A', () => {
    const world = sumoWorld('sumo-mini', [miniRobot('A', -0.2, 0), miniRobot('B', 0.3, 0)]);
    const state = runRound(world, { B: constantSpeed(0.5, 0) });
    expect(state.tick).toBe(4);
    expect(state.match).toMatchObject({
      phase: 'finished',
      winner: 'A',
      score: { A: 1, B: 0 },
      details: { category: 'mini', outOfDohyo: ['B'] },
    });
    expect(state.match!.reason).toContain('B saiu do Dohyo');
  });

  it('US1-AC2: A empurra B (massas iguais) e vence no tick 27', () => {
    const world = sumoWorld('sumo-mini', [miniRobot('A', -0.1, 0), miniRobot('B', 0.1, PI)]);
    const state = runRound(world, { A: constantSpeed(0.5, 0) });
    expect(state.tick).toBe(27);
    expect(state.match).toMatchObject({ phase: 'finished', winner: 'A' });
  });

  it('US1-AC3: tempo limite de 2 s encerra no tick 40 sem vencedor', () => {
    const world = sumoWorld('sumo-mini', [miniRobot('A', -0.2, 0), miniRobot('B', 0.2, PI)], {
      modalityOptions: { roundTimeLimit: 2 },
    });
    const state = runRound(world, {});
    expect(state.tick).toBe(40);
    expect(state.match).toMatchObject({ phase: 'finished', winner: null, score: { A: 0, B: 0 } });
    expect(state.match!.reason).toContain('tempo esgotado');
  });

  it('US1-AC4: saídas no mesmo tick → sem vencedor', () => {
    const world = sumoWorld('sumo-mini', [miniRobot('A', -0.3, PI), miniRobot('B', 0.3, 0)]);
    const state = runRound(world, { A: constantSpeed(0.5, 0), B: constantSpeed(0.5, 0) });
    expect(state.tick).toBe(4);
    expect(state.match).toMatchObject({
      phase: 'finished',
      winner: null,
      details: { outOfDohyo: ['A', 'B'] },
    });
  });

  it('US1-AC5: round encerrado não avança; reset volta a "em andamento"', () => {
    const world = sumoWorld('sumo-mini', [miniRobot('A', -0.2, 0), miniRobot('B', 0.3, 0)]);
    const simulation = sumoSimulation(world, { B: constantSpeed(0.5, 0) });
    expect(simulation.getState().match?.phase).toBe('running');
    expect(simulation.step(50).tick).toBe(4);
    expect(simulation.step(10).tick).toBe(4);
    expect(simulation.reset().match).toMatchObject({
      phase: 'running',
      winner: null,
      details: { timeLimit: 60 },
    });
  });
});
