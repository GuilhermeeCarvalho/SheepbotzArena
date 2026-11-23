// Spec 006 — US3 (pistas oficiais) e US4 (estratégia PD) (FR-007, FR-008).
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createSimulation, loadWorld } from 'src/core';
import { modalityRegistry } from 'src/modalities';
import {
  buildTrack,
  minTurnRadius,
  pointAt,
  projectOnTrack,
  trackFromPoints,
} from 'src/modalities/line-follower';

const examplesDir = fileURLToPath(new URL('../../../examples/', import.meta.url));

function loadExample(name: string) {
  const path = resolve(examplesDir, 'worlds', `${name}.json`);
  const world = loadWorld(readFileSync(path, 'utf8'), { modalities: modalityRegistry });
  if (!world.ok) throw new Error(JSON.stringify(world.errors));
  return { world: world.value, path };
}

describe('US3 — pistas', () => {
  it('US3-AC1: a oval montada por retas e arcos é fechada e mede 7,313 m', () => {
    const points = buildTrack({ x: 0, y: 0, theta: 0 }, [
      { straight: 1.2 },
      { arc: { radius: 0.4, angle: Math.PI } },
      { straight: 2.4 },
      { arc: { radius: 0.4, angle: Math.PI } },
      { straight: 1.2 },
    ]);
    const track = trackFromPoints(points);
    expect(track.closed).toBe(true);
    expect(track.length).toBeCloseTo(7.313, 2);
    expect(minTurnRadius(points)).toBeCloseTo(0.4, 2);
    const p = pointAt(track, 0.6);
    expect(p.x).toBeCloseTo(0.6, 9);
    expect(p.y).toBeCloseTo(0, 9);
    expect(p.heading).toBeCloseTo(0, 9);
    expect(projectOnTrack(track, { x: 0.6, y: 0.03 }).distance).toBeCloseTo(0.03, 9);
  });

  it.each(['seguidor-oval', 'seguidor-retangulo'])(
    'US3-AC2: %s é válido, com linha de 19 mm e marcações',
    (name) => {
      const { world } = loadExample(name);
      const [line, startMark, finishMark] = world.floor.regions;
      expect(line).toMatchObject({ type: 'line', width: 0.019 });
      expect(startMark).toMatchObject({ type: 'rect', width: 0.04, height: 0.02 });
      expect(finishMark).toMatchObject({ type: 'rect' });
      expect(world.floor.reflectance).toBeLessThan(0.5);
      expect(world.robots[0]!.sensors.map((s) => s.id)).toEqual([
        ...Array.from({ length: 8 }, (_, k) => `linha-${k}`),
        'marca',
      ]);
    },
  );
});

describe('US4 — controlador PD de exemplo', () => {
  it.each(['seguidor-oval', 'seguidor-retangulo'])(
    'US4-AC1: %s completa volta válida, de forma repetível',
    (name) => {
      const run = () => {
        const { world, path } = loadExample(name);
        const controllers = {
          [world.robots[0]!.id]: readFileSync(
            resolve(dirname(path), world.robots[0]!.controller!),
            'utf8',
          ),
        };
        const simulation = createSimulation(world, { controllers, modalities: modalityRegistry });
        if (!simulation.ok) throw new Error('controlador');
        return simulation.value.step(30_000);
      };
      const state = run();
      expect(state.match).toMatchObject({ phase: 'finished', winner: 'seguidor' });
      expect(state.match!.details!.lapTime as number).toBeGreaterThan(0);
      expect(run()).toEqual(state);
    },
  );
});
