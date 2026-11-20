// Aleatoriedade semeada (FR-008, FR-017; research D-08).
import { describe, expect, it } from 'vitest';
import { createStream, hashString, splitmix32 } from 'src/core/random/prng';

const sample = (seed: number, name: string, n = 5) => {
  const stream = createStream(seed, name);
  return Array.from({ length: n }, () => stream.next());
};

describe('prng', () => {
  it('mesma seed e nome → mesma sequência em [0, 1)', () => {
    const a = sample(42, 'x', 1000);
    expect(sample(42, 'x', 1000)).toEqual(a);
    expect(a.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it('fluxos com nomes ou seeds diferentes são independentes', () => {
    expect(sample(42, 'a')).not.toEqual(sample(42, 'b'));
    expect(sample(42, 'a')).not.toEqual(sample(43, 'a'));
  });

  it('gaussiana tem média ≈ 0 e desvio ≈ σ; σ = 0 devolve 0', () => {
    const stream = createStream(1, 'g');
    const values = Array.from({ length: 20000 }, () => stream.gaussian(2));
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
    expect(Math.abs(mean)).toBeLessThan(0.05);
    expect(Math.abs(std - 2)).toBeLessThan(0.05);
    expect(stream.gaussian(0)).toBe(0);
  });

  it('funções de hash são determinísticas e de 32 bits', () => {
    expect(hashString('robot:r1')).toBe(hashString('robot:r1'));
    expect(splitmix32(1)).toBeLessThan(2 ** 32);
    expect(splitmix32(1)).not.toBe(splitmix32(2));
  });
});
