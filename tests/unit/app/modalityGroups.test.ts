// Spec 010 — US2: modalidades da tela inicial (FR-003).
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildExamples, type Example } from 'src/app/examples/examples';
import { groupExamples } from 'src/app/home/modalityGroups';

const dir = (sub: string) => fileURLToPath(new URL(`../../../examples/${sub}/`, import.meta.url));
const readAll = (sub: string) =>
  Object.fromEntries(
    readdirSync(dir(sub)).map((name) => [
      `/examples/${sub}/${name}`,
      readFileSync(dir(sub) + name, 'utf8'),
    ]),
  );

const example = (id: string, modality?: string): Example => ({
  id,
  name: id,
  ...(modality !== undefined && { modality }),
  worldText: '{}',
  controllers: {},
});

describe('groupExamples', () => {
  const examples = buildExamples(readAll('worlds'), readAll('controllers'));
  const groups = groupExamples(examples);

  it('US2-AC1: ordem das modalidades e Sumô como foco da equipe', () => {
    expect(groups.map((g) => g.name)).toEqual([
      'Sumô',
      'Seguidor de Linha',
      'Trekking',
      'Futebol de robôs',
      'Livre',
    ]);
    expect(groups.filter((g) => g.featured).map((g) => g.id)).toEqual(['sumo']);
    for (const group of groups) expect(group.description).not.toBe('');
  });

  it('US2-AC2: quantidades com os exemplos do repositório', () => {
    expect(Object.fromEntries(groups.map((g) => [g.name, g.examples.length]))).toEqual({
      Sumô: 7,
      'Seguidor de Linha': 5,
      Trekking: 3,
      'Futebol de robôs': 4,
      Livre: 2,
    });
  });

  it('SC-002: cada exemplo aparece em exatamente uma modalidade', () => {
    const grouped = groups.flatMap((g) => g.examples.map((e) => e.id));
    expect(grouped.sort()).toEqual(examples.map((e) => e.id).sort());
  });

  it('categorias agrupadas e modalidade desconhecida em Livre', () => {
    const result = groupExamples([
      example('mega', 'sumo-mega'),
      example('lego', 'sumo-lego'),
      example('pro', 'seguidor-pro'),
      example('vss', 'futebol-vss'),
      example('nova', 'combate'),
      example('sem'),
    ]);
    expect(result.map((g) => [g.id, g.examples.map((e) => e.id)])).toEqual([
      ['sumo', ['mega', 'lego']],
      ['line-follower', ['pro']],
      ['soccer', ['vss']],
      ['free', ['nova', 'sem']],
    ]);
  });

  it('US2-AC4: modalidade sem exemplos não aparece', () => {
    expect(groupExamples([example('t', 'trekking')]).map((g) => g.id)).toEqual(['trekking']);
    expect(groupExamples([])).toEqual([]);
  });
});
