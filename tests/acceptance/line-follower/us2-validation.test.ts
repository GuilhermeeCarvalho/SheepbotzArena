// Spec 006 — US2: validar robô e pista (FR-006; Art. 3.2, 4.4, 4.11, 4.14).
import { describe, expect, it } from 'vitest';
import { validateWorld, type ValidationIssue } from 'src/core';
import { modalityRegistry } from 'src/modalities';
import { createLineFollowerWorld, LINE_FOLLOWER_CATEGORIES } from 'src/modalities/line-follower';
import { OVAL, ovalWorld } from './helpers';

type World = ReturnType<typeof ovalWorld>;
const errorsOf = (world: unknown): ValidationIssue[] => {
  const result = validateWorld(world, { modalities: modalityRegistry });
  return result.ok ? [] : result.errors;
};
const withLine = (world: World, change: Record<string, unknown>): World => ({
  ...world,
  floor: {
    ...world.floor,
    regions: [{ ...world.floor.regions[0]!, ...change }, ...world.floor.regions.slice(1)],
  },
});
const messages = (world: unknown) => errorsOf(world).map((e) => `${e.path}: ${e.message}`);

describe('US2 — validação do Seguidor de Linha', () => {
  it('o mundo de referência é válido', () => {
    expect(errorsOf(ovalWorld())).toEqual([]);
  });

  it('US2-AC1: exatamente 1 robô', () => {
    const world = ovalWorld();
    expect(messages({ ...world, robots: [] })).toContain(
      'robots: o Seguidor de Linha exige exatamente 1 robô (encontrados: 0)',
    );
    const twin = {
      ...world.robots[0]!,
      id: 'b',
      pose: { ...world.robots[0]!.pose, x: world.robots[0]!.pose.x + 0.5 },
    };
    expect(messages({ ...world, robots: [...world.robots, twin] })[0]).toContain(
      'exatamente 1 robô',
    );
  });

  it('US2-AC2: diâmetro acima de 0,25 m', () => {
    expect(messages(ovalWorld({ radius: 0.13 }))).toContain(
      'robots[0].radius: diâmetro de 0,26 m excede o limite de 0,25 m (Art. 3.2)',
    );
  });

  it('US2-AC3: sem linha no piso ou linha aberta', () => {
    const world = ovalWorld();
    expect(
      messages({ ...world, floor: { ...world.floor, regions: world.floor.regions.slice(1) } }),
    ).toContain(
      'floor.regions: a pista deve ser uma região "line" branca (refletância > 0,5) no piso',
    );
    const open = withLine(world, {
      points: (world.floor.regions[0] as { points: number[][] }).points.slice(0, -1),
    });
    expect(messages(open)).toContain(
      'floor.regions[0].points: a pista deve ser fechada (último ponto igual ao primeiro)',
    );
  });

  it('US2-AC4: largura da linha fora de 19 ± 1 mm', () => {
    expect(messages(withLine(ovalWorld(), { width: 0.03 }))).toContain(
      'floor.regions[0].width: a linha deve ter 19 ± 1 mm de largura (Art. 4.4); encontrado 30 mm',
    );
  });

  it('US2-AC5: curva de raio 0,05 m', () => {
    const tight = createLineFollowerWorld(
      LINE_FOLLOWER_CATEGORIES.junior,
      [
        { straight: 1 },
        { arc: { radius: 0.05, angle: Math.PI } },
        { straight: 1 },
        { arc: { radius: 0.05, angle: Math.PI } },
      ],
      { id: 'r', radius: 0.04, mass: 0.2, maxLinearSpeed: 1, maxAngularSpeed: 10, sensors: [] },
    );
    expect(messages(tight).some((m) => m.includes('menor que o mínimo de 0,1 m (Art. 4.14)'))).toBe(
      true,
    );
  });

  it('US2-AC6: linha a menos de 0,2 m da borda', () => {
    const world = ovalWorld();
    expect(messages({ ...world, arena: { ...world.arena, width: 3.0 } })).toContain(
      'floor.regions[0].points: a linha deve ficar a pelo menos 0,2 m das bordas da pista (Art. 4.11)',
    );
  });

  it('US2-AC7: pista de 25 m é inválida no Júnior e válida no Pro', () => {
    const long = [
      { straight: 6 },
      { arc: { radius: 0.5, angle: Math.PI } },
      { straight: 12 },
      { arc: { radius: 0.5, angle: Math.PI } },
      { straight: 6 },
    ];
    const robot = {
      id: 'r',
      radius: 0.08,
      mass: 0.25,
      maxLinearSpeed: 1,
      maxAngularSpeed: 10,
      sensors: [],
    };
    const junior = createLineFollowerWorld(LINE_FOLLOWER_CATEGORIES.junior, long, robot);
    expect(messages(junior).some((m) => m.includes('excede 20 m da categoria (Art. 4.4)'))).toBe(
      true,
    );
    expect(errorsOf(createLineFollowerWorld(LINE_FOLLOWER_CATEGORIES.pro, long, robot))).toEqual(
      [],
    );
  });

  it('US2-AC8: robô longe da linha de partida', () => {
    const world = ovalWorld();
    const moved = {
      ...world,
      robots: [
        {
          ...world.robots[0]!,
          pose: { ...world.robots[0]!.pose, x: world.robots[0]!.pose.x + 0.3 },
        },
      ],
    };
    expect(messages(moved)).toContain(
      'robots[0].pose: o robô deve começar sobre a linha de partida (primeiro ponto da pista)',
    );
  });

  it('opções inválidas', () => {
    expect(messages({ ...ovalWorld(), modalityOptions: { timeLimit: -1, voltas: 3 } })).toEqual([
      'modalityOptions.timeLimit: deve ser maior que 0',
      "modalityOptions.voltas: opção desconhecida 'voltas' para o Seguidor de Linha",
    ]);
  });

  it('pista de referência montada a partir dos segmentos da spec', () => {
    expect(OVAL).toHaveLength(5);
  });
});
