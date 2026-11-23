/**
 * Relógio de reprodução: converte tempo real × velocidade em ticks inteiros
 * (contracts 002/playback.md; research D-04; FR-006).
 */
export const MAX_TICKS_PER_FRAME = 20;
export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2, 4] as const;
const ROUNDING_TOLERANCE = 1e-9;

export type PlaybackClock = {
  /** Acumula `elapsedMs × speed` e devolve quantos ticks executar neste quadro. */
  advance(elapsedMs: number, speed: number): number;
  reset(): void;
};

export function createPlaybackClock(
  dt: number,
  maxTicksPerFrame = MAX_TICKS_PER_FRAME,
): PlaybackClock {
  let accumulated = 0; // segundos simulados pendentes
  return {
    advance(elapsedMs, speed) {
      accumulated += (Math.max(0, elapsedMs) / 1000) * speed;
      const ticks = Math.floor(accumulated / dt + ROUNDING_TOLERANCE);
      if (ticks > maxTicksPerFrame) {
        accumulated = 0; // tempo excedente descartado: mais lento, nunca diferente
        return maxTicksPerFrame;
      }
      accumulated = Math.max(0, accumulated - ticks * dt);
      return ticks;
    },
    reset() {
      accumulated = 0;
    },
  };
}
