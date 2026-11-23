// Spec 008 — US3 (arbitragem), US4 (validação) e US5 (campo e exemplo) do Futebol (FR-006 a FR-008).
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createSimulation, loadWorld, validateWorld, type ValidationIssue } from 'src/core';
import { modalityRegistry } from 'src/modalities';
import { createSoccerWorld, fieldWalls, goalCrossed, isInGoalArea } from 'src/modalities/soccer';
import { buildSimulation, constantSpeed } from '../../helpers';

const PI = Math.PI;
const MODEL = {
  radius: 0.0375,
  mass: 0.18,
  maxLinearSpeed: 1.34,
  maxAngularSpeed: 44.8,
  sensors: [],
};

const match = (timeLimit?: number, verdePose = { x: -0.3, y: 0, theta: 0 }) =>
  createSoccerWorld(
    [
      { name: 'Verde', robots: [{ id: 'v', pose: verdePose }] },
      { name: 'Azul', robots: [{ id: 'a', pose: { x: 0.5, y: 0.5, theta: PI } }] },
    ],
    MODEL,
    { dt: 0.01, ...(timeLimit ? { timeLimit } : {}) },
  );

const errorsOf = (world: unknown): string[] => {
  const result = validateWorld(world, { modalities: modalityRegistry });
  return result.ok ? [] : result.errors.map((e: ValidationIssue) => `${e.path}: ${e.message}`);
};

describe('US3 — arbitragem do Futebol', () => {
  it('US3-AC1: gol quando a bola passa inteira da linha; reposição no mesmo tick', () => {
    // O Verde empurra a bola do centro para o gol direito, em linha reta (|y| = 0 ≤ 0,20).
    const simulation = buildSimulation(match(), { v: constantSpeed(1.34, 0) }, modalityRegistry);
    let state = simulation.getState();
    for (let i = 0; i < 400 && (state.match?.score.Verde ?? 0) === 0; i++)
      state = simulation.step();
    expect(state.match).toMatchObject({
      phase: 'running',
      score: { Verde: 1, Azul: 0 },
      restart: true,
    });
    expect(state.match!.reason).toContain('gol do Verde');
    expect(state.balls[0]!.position).toEqual({ x: 0, y: 0 });
    expect(state.robots[0]!.pose).toEqual({ x: -0.3, y: 0, theta: 0 });
  });

  it('US3-AC2: bola parada 5 s fora das áreas → bola livre', () => {
    const simulation = buildSimulation(match(), {}, modalityRegistry);
    const state = simulation.step(500);
    expect(state.match).toMatchObject({ restart: true });
    expect(state.match!.reason).toContain('bola livre');
    expect(simulation.step(1).match!.restart).toBeUndefined();
  });

  it('US3-AC3: fim do tempo com vencedor ou empate', () => {
    const draw = buildSimulation(match(2), {}, modalityRegistry).step(200);
    expect(draw.match).toMatchObject({ phase: 'finished', winner: null });
    expect(draw.match!.reason).toBe('fim de jogo: Verde 0 × 0 Azul (empate)');
    const simulation = buildSimulation(match(3), { v: constantSpeed(1.34, 0) }, modalityRegistry);
    const won = simulation.step(300);
    expect(won.match).toMatchObject({ phase: 'finished', winner: 'Verde' });
  });

  it('US3-AC4: bola na trave sem cruzar inteira não é gol', () => {
    expect(goalCrossed(0.75 + 0.02, 0, 0.02135)).toBe(0); // ainda tocando a linha
    expect(goalCrossed(0.75 + 0.022, 0, 0.02135)).toBe(1);
    expect(goalCrossed(0.8, 0.21, 0.02135)).toBe(0); // fora da boca do gol
    expect(goalCrossed(-0.8, 0.1, 0.02135)).toBe(-1);
    expect(isInGoalArea(-0.7, 0.3)).toBe(true);
    expect(isInGoalArea(0, 0)).toBe(false);
  });
});

describe('US4 — validação do Futebol', () => {
  it('mundo de referência válido', () => {
    expect(errorsOf(match())).toEqual([]);
  });

  it('US4-AC1: dois times de 1 a 3 robôs, cada robô em um time', () => {
    const world = match();
    expect(
      errorsOf({ ...world, modalityOptions: { teams: [{ name: 'Verde', robots: ['v'] }] } }),
    ).toContain(
      'modalityOptions.teams: informe 2 times como [{ "name": "...", "robots": ["id", ...] }, ...] (Art. 3.1)',
    );
    const crowded = {
      ...world,
      modalityOptions: {
        teams: [
          { name: 'Verde', robots: ['v', 'x', 'y', 'z'] },
          { name: 'Azul', robots: ['a', 'v'] },
        ],
      },
    };
    const errors = errorsOf(crowded);
    expect(errors).toContain(
      'modalityOptions.teams[0].robots: o time Verde deve ter de 1 a 3 robôs (Art. 3.1)',
    );
    expect(errors).toContain("modalityOptions.teams[0].robots: robô 'x' não existe no mundo");
    expect(errors).toContain("modalityOptions.teams[1].robots: robô 'v' está em mais de um time");
    const orphan = {
      ...world,
      modalityOptions: {
        teams: [
          { name: 'Verde', robots: ['v'] },
          { name: 'Azul', robots: [] },
        ],
      },
    };
    expect(errorsOf(orphan)).toContain("robots[1]: o robô 'a' não pertence a nenhum time");
  });

  it('US4-AC2: robô acima de 8 cm', () => {
    const world = match();
    expect(
      errorsOf({ ...world, robots: [{ ...world.robots[0]!, radius: 0.05 }, world.robots[1]!] }),
    ).toContain('robots[0].radius: diâmetro de 0,1 m excede 0,08 m com uniforme (Art. 3.2.1)');
  });

  it('US4-AC3: exatamente 1 bola de 42,7 mm', () => {
    const world = match();
    expect(errorsOf({ ...world, balls: [] })).toContain(
      'balls: o Futebol exige exatamente 1 bola (encontradas: 0)',
    );
    expect(errorsOf({ ...world, balls: [{ ...world.balls[0]!, radius: 0.03 }] })).toContain(
      'balls[0].radius: a bola deve ter 42,7 mm de diâmetro (Art. 2.5); encontrado 60 mm',
    );
  });

  it('US4-AC4: cada time no próprio campo; opções inválidas', () => {
    expect(errorsOf(match(undefined, { x: 0.3, y: 0, theta: 0 }))).toContain(
      "robots[0].pose: o robô 'v' deve começar no campo do time Verde",
    );
    const world = match();
    expect(
      errorsOf({
        ...world,
        modalityOptions: { ...world.modalityOptions, timeLimit: 0, penaltis: true },
      }),
    ).toEqual([
      "modalityOptions.penaltis: opção desconhecida 'penaltis' para o Futebol",
      'modalityOptions.timeLimit: deve ser maior que 0',
    ]);
  });
});

describe('US5 — campo, exemplo e estratégias', () => {
  it('US5-AC1: laterais com aberturas, gols de 40 × 10 cm e cantos de 7 cm', () => {
    const walls = fieldWalls();
    const byId = Object.fromEntries(walls.map((w) => [w.id, w]));
    expect(byId['gol-dir-fundo']).toMatchObject({ from: [0.85, -0.2], to: [0.85, 0.2] });
    expect(byId['fundo-dir-sup']).toMatchObject({ from: [0.75, 0.58], to: [0.75, 0.2] });
    expect(byId['canto-2']).toMatchObject({ from: [0.68, 0.65], to: [0.75, 0.58] });
    const world = match();
    expect(world.balls[0]).toMatchObject({ position: [0, 0], radius: 0.02135, mass: 0.046 });
    expect(world.floor.regions[1]).toMatchObject({
      type: 'ring',
      innerRadius: 0.1985,
      outerRadius: 0.2015,
    });
  });

  it(
    'US5-AC2: o exemplo 2 × 1 produz gol, de forma repetível, sem erros',
    { timeout: 120_000 },
    () => {
      const path = fileURLToPath(
        new URL('../../../examples/worlds/futebol-2x1.json', import.meta.url),
      );
      const run = () => {
        const world = loadWorld(readFileSync(path, 'utf8'), { modalities: modalityRegistry });
        if (!world.ok) throw new Error(JSON.stringify(world.errors));
        const controllers = Object.fromEntries(
          world.value.robots.map((r) => [
            r.id,
            readFileSync(resolve(dirname(path), r.controller!), 'utf8'),
          ]),
        );
        const simulation = createSimulation(world.value, {
          controllers,
          modalities: modalityRegistry,
        });
        if (!simulation.ok) throw new Error('controladores');
        return simulation.value.step(1_500); // 15 s: o primeiro gol sai aos 13,3 s
      };
      const state = run();
      expect(state.match).toMatchObject({ phase: 'running' });
      expect((state.match!.score.Verde ?? 0) + (state.match!.score.Azul ?? 0)).toBeGreaterThan(0);
      expect(state.robots.every((r) => r.status === 'ok')).toBe(true);
      expect(run()).toEqual(state);
    },
  );
});
