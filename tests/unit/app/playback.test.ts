// Spec 002 — US2: relógio de reprodução (FR-006).
import { describe, expect, it } from 'vitest';
import {
  createPlaybackClock,
  MAX_TICKS_PER_FRAME,
  PLAYBACK_SPEEDS,
} from 'src/app/session/playbackClock';

describe('relógio de reprodução', () => {
  it('US2-AC2: 100 ms a 1× com dt 0,05 → 2 ticks; a 2× → 4', () => {
    expect(createPlaybackClock(0.05).advance(100, 1)).toBe(2);
    expect(createPlaybackClock(0.05).advance(100, 2)).toBe(4);
  });

  it('US2-AC2: a 0,25× o meio tick acumula até completar', () => {
    const clock = createPlaybackClock(0.05);
    expect(clock.advance(100, 0.25)).toBe(0);
    expect(clock.advance(100, 0.25)).toBe(1);
  });

  it('US2-AC3: quadro de 2 s executa no máximo 20 ticks e descarta o excedente', () => {
    const clock = createPlaybackClock(0.05);
    expect(clock.advance(2000, 1)).toBe(MAX_TICKS_PER_FRAME);
    expect(clock.advance(0, 1)).toBe(0);
  });

  it('60 quadros de 1/60 s a 1× somam 20 ticks em 1 s', () => {
    const clock = createPlaybackClock(0.05);
    let total = 0;
    for (let i = 0; i < 60; i++) total += clock.advance(1000 / 60, 1);
    expect(total).toBe(20);
  });

  it('reset zera o acumulado; tempo negativo é ignorado', () => {
    const clock = createPlaybackClock(0.05);
    clock.advance(40, 1);
    clock.reset();
    expect(clock.advance(20, 1)).toBe(0);
    expect(clock.advance(-500, 1)).toBe(0);
  });

  it('velocidades disponíveis', () => {
    expect(PLAYBACK_SPEEDS).toEqual([0.25, 0.5, 1, 2, 4]);
  });
});
