// Spec 007 — US3: campo de exemplo e estratégia (FR-006, FR-007).
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createSimulation, loadWorld } from 'src/core';
import { modalityRegistry } from 'src/modalities';

const path = fileURLToPath(new URL('../../../examples/worlds/trekking.json', import.meta.url));

function load() {
  const world = loadWorld(readFileSync(path, 'utf8'), { modalities: modalityRegistry });
  if (!world.ok) throw new Error(JSON.stringify(world.errors));
  return world.value;
}

describe('US3 — Trekking de exemplo', () => {
  it('US3-AC1: campo válido com marcos amarelos e robô com componentes reais', () => {
    const world = load();
    expect(world.floor.regions).toHaveLength(4);
    expect(world.floor.regions.every((r) => r.type === 'rect' && r.color === '#f2c200')).toBe(true);
    expect(world.robots[0]!.sensors.map((s) => s.id)).toEqual(['lidar', 'piso', 'frente']);
  });

  it('US3-AC2: a estratégia completa os 4 marcos sem colidir, de forma repetível', () => {
    const run = () => {
      const world = load();
      const source = readFileSync(resolve(dirname(path), world.robots[0]!.controller!), 'utf8');
      const simulation = createSimulation(world, {
        controllers: { trekker: source },
        modalities: modalityRegistry,
      });
      if (!simulation.ok) throw new Error('controlador');
      return simulation.value.step(12_000);
    };
    const state = run();
    expect(state.match).toMatchObject({
      phase: 'finished',
      winner: 'trekker',
      score: { trekker: 4 },
    });
    expect(run()).toEqual(state);
  });
});
