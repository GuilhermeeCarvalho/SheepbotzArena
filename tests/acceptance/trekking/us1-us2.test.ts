// Spec 007 — US1 (arbitragem) e US2 (validação) do Trekking (FR-002 a FR-005).
import { describe, expect, it } from 'vitest';
import { validateWorld, type ValidationIssue } from 'src/core';
import { modalityRegistry } from 'src/modalities';
import { createTrekkingWorld, type MarkCenter } from 'src/modalities/trekking';
import { buildSimulation, constantSpeed } from '../../helpers';

type Marks = [MarkCenter, MarkCenter, MarkCenter, MarkCenter];
const IN_LINE: Marks = [
  [-3, 0],
  [-1.02, 0],
  [0.98, 0],
  [2.98, 0],
];
const ROBOT = { id: 't', radius: 0.2, mass: 3, maxLinearSpeed: 1, maxAngularSpeed: 5, sensors: [] };

const field = (
  marks: Marks = IN_LINE,
  obstacles: unknown[] = [],
  extra: { theta?: number; timeLimit?: number } = {},
) =>
  createTrekkingWorld(
    { width: 10, height: 6 },
    marks,
    obstacles,
    { ...ROBOT, theta: extra.theta ?? 0 },
    {
      dt: 0.05,
      ...(extra.timeLimit ? { timeLimit: extra.timeLimit } : {}),
    },
  );

function run(world: unknown, controller?: string, maxTicks = 2000) {
  const simulation = buildSimulation(world, controller ? { t: controller } : {}, modalityRegistry);
  let state = simulation.getState();
  for (let i = 0; i < maxTicks && state.match?.phase !== 'finished'; i++) state = simulation.step();
  return state;
}

const errorsOf = (world: unknown): string[] => {
  const result = validateWorld(world, { modalities: modalityRegistry });
  return result.ok ? [] : result.errors.map((e: ValidationIssue) => `${e.path}: ${e.message}`);
};

describe('US1 — arbitragem do Trekking', () => {
  it('US1-AC1: marcos 2, 3 e 4 nos ticks 26, 66 e 106', () => {
    const simulation = buildSimulation(field(), { t: constantSpeed(1, 0) }, modalityRegistry);
    const reachedAt: number[] = [];
    let state = simulation.getState();
    while (state.match?.phase !== 'finished') {
      const before = state.match!.details!.marksReached as number;
      state = simulation.step();
      if ((state.match!.details!.marksReached as number) > before) reachedAt.push(state.tick);
    }
    expect(reachedAt).toEqual([26, 66, 106]);
    expect(state.match).toMatchObject({
      winner: 't',
      score: { t: 4 },
      details: { eligible: true },
    });
    expect(state.match!.details!.lastMarkTime as number).toBeCloseTo(5.3, 9);
  });

  it('US1-AC2: colisão com a caixa no tick 22', () => {
    const marks: Marks = [
      [-3, 0],
      [3, 2],
      [3, -2],
      [-3, 2.2],
    ];
    const box = { id: 'caixa', type: 'box', center: [-1.52, 0], width: 0.4, height: 0.4 };
    const state = run(field(marks, [box]), constantSpeed(1, 0));
    expect(state.tick).toBe(22);
    expect(state.match).toMatchObject({
      phase: 'finished',
      winner: null,
      score: { t: 1 },
      details: { eligible: false },
    });
    expect(state.match!.reason).toContain('colidiu com um obstáculo');
  });

  it('US1-AC3: sair do campo no tick 52', () => {
    const state = run(field(), constantSpeed(-0.7, 0));
    expect(state.tick).toBe(52);
    expect(state.match!.reason).toContain('saiu do campo');
  });

  it('US1-AC4: false start após 30 s parado (tick 600)', () => {
    const state = run(field(), undefined, 1000);
    expect(state.tick).toBe(600);
    expect(state.match!.reason).toContain('false start');
  });

  it('US1-AC5: tempo limite de 5 s no tick 100', () => {
    const state = run(field(IN_LINE, [], { timeLimit: 5 }), constantSpeed(0.1, 0));
    expect(state.tick).toBe(100);
    expect(state.match).toMatchObject({ winner: null, score: { t: 1 } });
    expect(state.match!.reason).toContain('tempo esgotado');
  });

  it('US1-AC6: marco 3 antes do 2 não conta', () => {
    const marks: Marks = [
      [-3, 0],
      [3, 2],
      [-1.02, 0],
      [2.5, -2],
    ];
    const state = buildSimulation(field(marks), { t: constantSpeed(1, 0) }, modalityRegistry).step(
      40,
    );
    expect(state.match!.details!.marksReached).toBe(1);
  });
});

describe('US2 — validação do Trekking', () => {
  it('campo de referência válido', () => {
    expect(errorsOf(field())).toEqual([]);
  });

  it('US2-AC1/AC2: 1 robô de até 0,5 m', () => {
    const world = field();
    expect(errorsOf({ ...world, robots: [] })).toContain(
      'robots: o Trekking exige exatamente 1 robô (encontrados: 0)',
    );
    expect(errorsOf({ ...world, robots: [{ ...world.robots[0]!, radius: 0.3 }] })).toContain(
      'robots[0].radius: diâmetro de 0,6 m excede o cubo de 0,5 m (Art. 2.4)',
    );
  });

  it('US2-AC3: 4 marcos obrigatórios', () => {
    const world = field();
    expect(errorsOf({ ...world, modalityOptions: { marks: [[0, 0]] } })).toContain(
      'modalityOptions.marks: informe os centros dos 4 marcos como [[x, y], …] (Art. 4.1)',
    );
  });

  it('US2-AC4: marco fora do campo', () => {
    expect(
      errorsOf(
        field([
          [-3, 0],
          [4.8, 0],
          [0.98, 0],
          [2.98, 0],
        ]),
      ),
    ).toContain('modalityOptions.marks[1]: o marco 2 deve ficar inteiramente dentro do campo');
  });

  it('US2-AC5: obstáculo a menos de 1 m de um marco', () => {
    const near = { id: 'pedra', type: 'disc', center: [0.98, 0.9], radius: 0.05 };
    expect(errorsOf(field(IN_LINE, [near]))).toContain(
      'obstacles[0]: obstáculo a menos de 1 m do centro do marco 3 (Art. 3.7)',
    );
  });

  it('US2-AC6: robô sem tocar o marco 1', () => {
    const world = field();
    expect(
      errorsOf({ ...world, robots: [{ ...world.robots[0]!, pose: { x: -3, y: 1.5, theta: 0 } }] }),
    ).toContain('robots[0].pose: o robô deve partir tocando o marco 1 (Art. 4.2)');
  });

  it('opções desconhecidas e tempo inválido', () => {
    const world = field();
    expect(
      errorsOf({
        ...world,
        modalityOptions: { ...world.modalityOptions, timeLimit: 0, gps: true },
      }),
    ).toEqual([
      "modalityOptions.gps: opção desconhecida 'gps' para o Trekking",
      'modalityOptions.timeLimit: deve ser maior que 0',
    ]);
  });
});
