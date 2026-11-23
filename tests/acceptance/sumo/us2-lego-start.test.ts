// Spec 004 — US2: regra dos 5 s no Sumô LEGO® (FR-004; Nota 11).
import { describe, expect, it } from 'vitest';
import { constantSpeed, miniRobot, runRound, sumoSimulation, sumoWorld } from './helpers';

const PI = Math.PI;
const robots = [miniRobot('A', -0.2, 0, { mass: 1 }), miniRobot('B', 0.2, PI, { mass: 1 })];
const waitThenGo = 'function onTick(r) { r.setSpeed(r.time() < 5 ? 0 : 0.05, 0); }';

describe('US2 — largada no Sumô LEGO®', () => {
  it('US2-AC1: A se move desde o início → perde no tick 2', () => {
    const state = runRound(sumoWorld('sumo-lego', robots), { A: constantSpeed(0.3, 0) });
    expect(state.tick).toBe(2);
    expect(state.match).toMatchObject({ winner: 'B', details: { falseStart: ['A'] } });
    expect(state.match!.reason).toContain('A se moveu antes de 5 s');
  });

  it('girar no lugar antes de 5 s também queima a largada; os dois → sem vencedor', () => {
    const spin = runRound(sumoWorld('sumo-lego', robots), { B: constantSpeed(0, 1) });
    expect(spin.match).toMatchObject({ winner: 'A', details: { falseStart: ['B'] } });
    const both = runRound(sumoWorld('sumo-lego', robots), { A: constantSpeed(0.3, 0), B: constantSpeed(0.3, 0) });
    expect(both.match).toMatchObject({ phase: 'finished', winner: null });
  });

  it('US2-AC2: esperar 5 s e depois avançar não é infração', () => {
    const simulation = sumoSimulation(sumoWorld('sumo-lego', robots), { A: waitThenGo, B: waitThenGo });
    const state = simulation.step(120);
    expect(state.match).toMatchObject({ phase: 'running', details: { falseStart: [] } });
    expect(state.robots[0]!.pose.x).toBeGreaterThan(-0.2);
  });

  it('US2-AC3: no Mini Sumô não existe a regra dos 5 s', () => {
    const state = sumoSimulation(sumoWorld('sumo-mini', robots.map((r) => ({ ...r, mass: 0.5 }))), {
      A: constantSpeed(0.3, 0),
    }).step(2);
    expect(state.match?.phase).toBe('running');
  });
});
