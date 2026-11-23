// Spec 006 — US1: cronometrar e validar a volta (FR-002 a FR-005; Art. 5.3, 5.6, 5.7).
import { describe, expect, it } from 'vitest';
import { trackFromPoints } from 'src/modalities/line-follower';
import { lineSimulation, ovalWorld, runAttempt, scriptedOval } from './helpers';

const ovalLine = ovalWorld().floor.regions[0] as { points: [number, number][] };
const length = trackFromPoints(ovalLine.points).length;

describe('US1 — volta do Seguidor de Linha (oval Júnior)', () => {
  it('a oval mede 7,313 m', () => {
    expect(length).toBeCloseTo(4.8 + 0.8 * Math.PI, 2);
  });

  it('US1-AC1: volta válida em 12,63 s, validada 2 s após a parada', () => {
    const state = runAttempt(ovalWorld(), scriptedOval(length - 0.5));
    expect(state.match).toMatchObject({ phase: 'finished', winner: 'r' });
    const lapTime = state.match!.details!.lapTime as number;
    expect(Math.abs(lapTime - 12.63)).toBeLessThanOrEqual(0.02);
    expect(state.match!.score.r).toBe(lapTime);
    expect(state.match!.reason).toContain('volta válida');
    expect(Math.abs(state.time - (13.63 + 2))).toBeLessThanOrEqual(0.03);
  });

  it('US1-AC2: seguir reto na primeira curva → saiu da linha', () => {
    const state = runAttempt(ovalWorld(), 'function onTick(r) { r.setSpeed(0.5, 0); }');
    expect(state.match).toMatchObject({ phase: 'finished', winner: null });
    expect(state.match!.reason).toContain('saiu da linha');
    expect(state.time).toBeGreaterThan(2.4);
    expect(state.time).toBeLessThan(4);
  });

  it('US1-AC3: cruzar a chegada sem parar → volta inválida ao sair da área', () => {
    const state = runAttempt(ovalWorld(), scriptedOval(null));
    expect(state.match).toMatchObject({ phase: 'finished', winner: null });
    expect(state.match!.reason).toContain('saiu da área de partida-chegada');
    expect(state.match!.details!.lapTime).not.toBeNull();
  });

  it('US1-AC4: tempo limite de 3 s encerra no tick 300', () => {
    const state = runAttempt(ovalWorld({ timeLimit: 3 }), undefined);
    expect(state.tick).toBe(300);
    expect(state.match).toMatchObject({ phase: 'finished', winner: null, score: { r: 0 } });
    expect(state.match!.reason).toContain('tempo esgotado');
  });

  it('US1-AC5: progresso em andamento (m e %)', () => {
    const state = lineSimulation(ovalWorld(), scriptedOval(null)).step(100);
    expect(state.match?.phase).toBe('running');
    expect(state.match!.details!.progress as number).toBeCloseTo(0.5, 2);
    expect(state.match!.details!.progressPercent as number).toBeCloseTo((0.5 / length) * 100, 1);
  });

  it('dar ré na partida reduz o progresso e não completa a volta', () => {
    const state = lineSimulation(ovalWorld(), 'function onTick(r) { r.setSpeed(-0.1, 0); }').step(
      50,
    );
    expect(state.match!.details!.progress).toBe(0);
  });
});
