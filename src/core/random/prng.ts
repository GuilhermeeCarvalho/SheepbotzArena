/**
 * Aleatoriedade semeada e determinística (constitution, princípio VI; research D-08).
 * Cada consumidor recebe um fluxo independente, identificado por nome.
 */

export type RandomStream = {
  /** Número em [0, 1). */
  next(): number;
  /** Amostra normal com média 0 e desvio `stdDev`. */
  gaussian(stdDev: number): number;
};

/** Mistura de 32 bits (splitmix32) usada para derivar sementes. */
export function splitmix32(value: number): number {
  let z = (value + 0x9e3779b9) | 0;
  z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
  z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
  return (z ^ (z >>> 16)) >>> 0;
}

/** Hash FNV-1a de 32 bits de um texto. */
export function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Gerador mulberry32 a partir de uma semente de 32 bits. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cria o fluxo `name` derivado da seed da simulação. */
export function createStream(seed: number, name: string): RandomStream {
  const next = mulberry32(splitmix32((seed ^ hashString(name)) >>> 0));
  return {
    next,
    gaussian(stdDev: number): number {
      if (stdDev === 0) return 0;
      // Box-Muller; 1 − u evita log(0).
      const u1 = 1 - next();
      const u2 = next();
      return stdDev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    },
  };
}
