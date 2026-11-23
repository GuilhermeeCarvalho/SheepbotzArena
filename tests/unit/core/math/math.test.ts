// Fundação: ângulos, vetores e geometria (FR-007, FR-009, FR-013, FR-016).
import { describe, expect, it } from 'vitest';
import { isAngleInSector, normalizeAngle } from 'src/core/math/angle';
import {
  closestPointOnBox,
  closestPointOnSegment,
  distancePointToPolyline,
  isPointInBox,
  isPointInRing,
  rayBox,
  rayDisc,
  raySegment,
} from 'src/core/math/geometry';
import { localToWorld, worldToLocal } from 'src/core/math/vec2';

const PI = Math.PI;

describe('normalizeAngle', () => {
  it.each([
    [0, 0],
    [PI, PI],
    [-PI, PI],
    [(3 * PI) / 2, -PI / 2],
    [(-3 * PI) / 2, PI / 2],
    [5 * PI, PI],
    [2 * PI + 0.5, 0.5],
  ])('%f → %f', (input, expected) => expect(normalizeAngle(input)).toBeCloseTo(expected, 12));
});

describe('isAngleInSector', () => {
  it('inclui as bordas do setor', () => {
    expect(isAngleInSector(PI / 2, -PI / 2, PI / 2)).toBe(true);
    expect(isAngleInSector(-PI / 2, -PI / 2, PI / 2)).toBe(true);
    expect(isAngleInSector(PI, -PI / 2, PI / 2)).toBe(false);
  });
  it('aceita setor traseiro que cruza ±π', () => {
    expect(isAngleInSector(PI, PI / 2, (3 * PI) / 2)).toBe(true);
    expect(isAngleInSector(-PI + 0.1, PI / 2, (3 * PI) / 2)).toBe(true);
    expect(isAngleInSector(0, PI / 2, (3 * PI) / 2)).toBe(false);
  });
  it('setor completo contém tudo', () => expect(isAngleInSector(1.23, 0, 2 * PI)).toBe(true));
});

describe('referenciais', () => {
  it('local ↔ mundo são inversos', () => {
    const pose = { x: 1, y: 2, theta: PI / 2 };
    const world = localToWorld(pose, { x: 0.5, y: 0 });
    expect(world.x).toBeCloseTo(1, 12);
    expect(world.y).toBeCloseTo(2.5, 12);
    const back = worldToLocal(pose, world);
    expect(back.x).toBeCloseTo(0.5, 12);
    expect(back.y).toBeCloseTo(0, 12);
  });
});

describe('geometria', () => {
  const box = { center: { x: 0, y: 0 }, width: 2, height: 1, angle: 0 };

  it('ponto mais próximo de segmento, inclusive degenerado', () => {
    expect(closestPointOnSegment({ x: 5, y: 1 }, { x: 0, y: 0 }, { x: 2, y: 0 })).toEqual({
      x: 2,
      y: 0,
    });
    expect(closestPointOnSegment({ x: 5, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 })).toEqual({
      x: 1,
      y: 1,
    });
  });

  it('distância a poligonal', () => {
    expect(
      distancePointToPolyline({ x: 1, y: 1 }, [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
      ]),
    ).toBeCloseTo(1, 12);
  });

  it('caixa: ponto externo, interno e rotacionado', () => {
    expect(closestPointOnBox({ x: 3, y: 0 }, box)).toEqual({
      point: { x: 1, y: 0 },
      inside: false,
    });
    const inside = closestPointOnBox({ x: 0.1, y: 0.3 }, box);
    expect(inside.inside).toBe(true);
    expect(inside.point.y).toBeCloseTo(0.5, 12);
    const insideX = closestPointOnBox({ x: -0.9, y: 0 }, box);
    expect(insideX.point.x).toBeCloseTo(-1, 12);
    const rotated = { ...box, angle: PI / 2 };
    expect(isPointInBox({ x: 0, y: 0.9 }, rotated)).toBe(true);
    expect(isPointInBox({ x: 0.9, y: 0 }, rotated)).toBe(false);
  });

  it('anel inclusivo nas bordas', () => {
    expect(isPointInRing({ x: 0.45, y: 0 }, { x: 0, y: 0 }, 0.45, 0.5)).toBe(true);
    expect(isPointInRing({ x: 0.4, y: 0 }, { x: 0, y: 0 }, 0.45, 0.5)).toBe(false);
  });

  it('raio × segmento: frontal, paralelo, colinear, para trás', () => {
    const dir = { x: 1, y: 0 };
    expect(raySegment({ x: 0, y: 0 }, dir, { x: 1, y: -1 }, { x: 1, y: 1 })).toBeCloseTo(1, 12);
    expect(raySegment({ x: 0, y: 0 }, dir, { x: 0, y: 1 }, { x: 2, y: 1 })).toBeNull();
    expect(raySegment({ x: 0, y: 0 }, dir, { x: 2, y: 0 }, { x: 3, y: 0 })).toBeCloseTo(2, 12);
    expect(raySegment({ x: 0, y: 0 }, dir, { x: -1, y: 0 }, { x: 1, y: 0 })).toBe(0);
    expect(raySegment({ x: 0, y: 0 }, dir, { x: -3, y: 0 }, { x: -2, y: 0 })).toBeNull();
    expect(raySegment({ x: 0, y: 0 }, dir, { x: -1, y: -1 }, { x: -1, y: 1 })).toBeNull();
  });

  it('raio × disco: frontal, tangente, interno, oposto', () => {
    const dir = { x: 1, y: 0 };
    expect(rayDisc({ x: 0, y: 0 }, dir, { x: 2, y: 0 }, 0.5)).toBeCloseTo(1.5, 12);
    expect(rayDisc({ x: 0, y: 0 }, dir, { x: 2, y: 0.5 }, 0.5)).toBeCloseTo(2, 6);
    expect(rayDisc({ x: 2, y: 0 }, dir, { x: 2, y: 0 }, 0.5)).toBe(0);
    expect(rayDisc({ x: 0, y: 0 }, dir, { x: -2, y: 0 }, 0.5)).toBeNull();
    expect(rayDisc({ x: 0, y: 0 }, dir, { x: 2, y: 1 }, 0.5)).toBeNull();
  });

  it('raio × caixa: frontal, quina, paralelo fora, interno, atrás', () => {
    const dir = { x: 1, y: 0 };
    const target = { center: { x: 3, y: 0 }, width: 2, height: 2, angle: 0 };
    expect(rayBox({ x: 0, y: 0 }, dir, target)).toBeCloseTo(2, 12);
    expect(rayBox({ x: 0, y: 1 }, dir, target)).toBeCloseTo(2, 12);
    expect(rayBox({ x: 0, y: 2 }, dir, target)).toBeNull();
    expect(rayBox({ x: 3, y: 0 }, dir, target)).toBe(0);
    expect(rayBox({ x: 5, y: 0 }, dir, target)).toBeNull();
    expect(rayBox({ x: 3, y: -3 }, { x: 0, y: 1 }, target)).toBeCloseTo(2, 12);
  });
});
