// Spec 004 — US5: estratégias de exemplo em código (FR-009).
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createSimulation, loadWorld } from 'src/core';
import { modalityRegistry } from 'src/modalities';
import { createSumoWorld, SUMO_CATEGORIES } from 'src/modalities/sumo';
import { buildSimulation } from '../../helpers';

const examplesDir = fileURLToPath(new URL('../../../examples/', import.meta.url));
const controller = (name: string) =>
  readFileSync(resolve(examplesDir, 'controllers', `${name}.js`), 'utf8');

function runExample(name: string, maxTicks = 6000) {
  const path = resolve(examplesDir, 'worlds', `${name}.json`);
  const world = loadWorld(readFileSync(path, 'utf8'), { modalities: modalityRegistry });
  if (!world.ok) throw new Error(JSON.stringify(world.errors));
  const controllers = Object.fromEntries(
    world.value.robots.map((r) => [
      r.id,
      readFileSync(resolve(dirname(path), r.controller!), 'utf8'),
    ]),
  );
  const simulation = createSimulation(world.value, { controllers, modalities: modalityRegistry });
  if (!simulation.ok) throw new Error(JSON.stringify(simulation.errors));
  return simulation.value.step(maxTicks);
}

describe('US5 — estratégias de exemplo', () => {
  it('US5-AC1: Mini Sumô termina com vencedor antes do tempo, de forma repetível', () => {
    const first = runExample('sumo-mini');
    expect(first.match).toMatchObject({ phase: 'finished' });
    expect(first.match!.winner).not.toBeNull();
    expect(first.time).toBeLessThan(60);
    expect(runExample('sumo-mini')).toEqual(first);
  });

  it('US5-AC2: busca e ataque não sai do Dohyo sozinho em 10 s', () => {
    const sensors = [
      { id: 'oponente', type: 'laser', position: [0.045, 0], rays: 3, fov: 0.6, maxRange: 0.4 },
      { id: 'piso-esq', type: 'floor', position: [0.04, 0.03], noise: 0.03 },
      { id: 'piso-dir', type: 'floor', position: [0.04, -0.03], noise: 0.03 },
      { id: 'frente', type: 'bumper', from: -Math.PI / 2, to: Math.PI / 2 },
    ];
    const world = createSumoWorld(SUMO_CATEGORIES.mini, [
      {
        id: 'A',
        side: 'left',
        theta: Math.PI,
        radius: 0.05,
        mass: 0.5,
        maxLinearSpeed: 0.82,
        maxAngularSpeed: 20,
        sensors,
      },
      {
        id: 'B',
        side: 'right',
        radius: 0.05,
        mass: 0.5,
        maxLinearSpeed: 0.82,
        maxAngularSpeed: 20,
        sensors: [],
      },
    ]);
    // Oponente parado e encostado na borda oposta: fora do alcance de 0,4 m na maior parte do tempo.
    const far = {
      ...world,
      robots: [world.robots[0], { ...world.robots[1], pose: { x: 0.33, y: 0, theta: 0 } }],
    };
    const simulation = buildSimulation(far, { A: controller('sumo-flank') }, modalityRegistry);
    const searchOnly = buildSimulation(
      far,
      { A: controller('sumo-search-attack') },
      modalityRegistry,
    );
    for (const sim of [simulation, searchOnly]) {
      const state = sim.step(1000);
      expect(state.match?.details?.outOfDohyo).not.toContain('A');
    }
  });

  it.each(['sumo-mini', 'sumo-mega', 'sumo-lego'])(
    'US5-AC3: %s roda sem erro de controlador',
    (name) => {
      const state = runExample(name);
      expect(state.robots.every((r) => r.status === 'ok')).toBe(true);
      expect(state.match?.phase).toBe('finished');
    },
  );

  it('o exemplo LEGO® demonstra a largada queimada (Nota 11)', () => {
    expect(runExample('sumo-lego').match).toMatchObject({
      winner: 'sheep',
      details: { falseStart: ['rival'] },
    });
  });
});
