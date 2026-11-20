// Spec 001 — História 1: descrever um mundo e receber erros claros (FR-001 a FR-004).
import { describe, expect, it } from 'vitest';
import { formatIssues, loadWorld } from 'src/core';
import { readFixture } from '../helpers';

const load = (fixture: string) => loadWorld(readFixture(`worlds/${fixture}`));

describe('US1 — mundo e validação', () => {
  it('US1-AC1: aceita um mundo válido com o robô na pose declarada', () => {
    const result = load('valid-basic.json');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.robots[0]!.pose).toEqual({ x: -1, y: 0.5, theta: 0 });
    expect(result.value.obstacles).toHaveLength(1);
  });

  it('US1-AC2: rejeita JSON inválido informando linha e coluna', () => {
    const result = load('invalid-syntax.json');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe('JSON_SYNTAX');
    expect(result.errors[0]!.message).toMatch(/linha 3, coluna \d+/);
  });

  it('US1-AC3: aponta robots[0].radius quando o raio é 0', () => {
    const result = load('invalid-radius-zero.json');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual([
      { path: 'robots[0].radius', code: 'OUT_OF_RANGE', message: 'deve ser maior que 0' },
    ]);
  });

  it('US1-AC4: informa três erros independentes juntos, cada um com seu caminho', () => {
    const result = load('invalid-three-errors.json');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => [e.path, e.code])).toEqual([
      ['robots[0].radius', 'OUT_OF_RANGE'],
      ['robots[0].sensors[0].type', 'UNKNOWN_TYPE'],
      ['robots[1].id', 'DUPLICATE_ID'],
    ]);
    expect(result.errors[1]!.message).toContain("'lidar3d'");
    expect(formatIssues(result.errors).split('\n')).toHaveLength(3);
  });

  it('US1-AC5: aponta campo desconhecido', () => {
    const result = load('invalid-unknown-field.json');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual({
      path: 'robots[0].raio',
      code: 'UNKNOWN_FIELD',
      message: "campo desconhecido 'raio'",
    });
    expect(result.errors).toContainEqual({
      path: 'robots[0].radius',
      code: 'REQUIRED',
      message: 'campo obrigatório ausente',
    });
  });

  it('US1-AC6: identifica robô sobreposto a obstáculo e a outro robô', () => {
    const result = load('invalid-overlap.json');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(2);
    expect(result.errors.every((e) => e.code === 'INITIAL_OVERLAP')).toBe(true);
    expect(result.errors[0]!.message).toContain('obstacles[0]');
    expect(result.errors[1]!.message).toContain('robots[0]');
  });

  it('US1-AC7: adota dt = 0,05 e seed = 1 quando omitidos', () => {
    const result = load('defaults.json');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.dt).toBe(0.05);
    expect(result.value.seed).toBe(1);
  });
});
