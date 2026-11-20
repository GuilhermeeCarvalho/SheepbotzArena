// Exemplos de demonstração: rodam sem acionar o bumper (tasks 001 T054; SC-005; FR-001, FR-018).
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createSimulation, loadWorld } from 'src/core';

const examplesDir = fileURLToPath(new URL('../../examples/worlds/', import.meta.url));

function loadExample(name: string) {
  const path = resolve(examplesDir, `${name}.json`);
  const world = loadWorld(readFileSync(path, 'utf8'));
  if (!world.ok) throw new Error(JSON.stringify(world.errors));
  const controllers = Object.fromEntries(
    world.value.robots.map((r) => [
      r.id,
      readFileSync(resolve(dirname(path), r.controller!), 'utf8'),
    ]),
  );
  const simulation = createSimulation(world.value, { controllers });
  if (!simulation.ok) throw new Error(JSON.stringify(simulation.errors));
  return simulation.value;
}

describe('exemplos', () => {
  it.each(['corridor', 'obstacle-field'])('%s: 1200 ticks sem bumper acionado nem erro', (name) => {
    const simulation = loadExample(name);
    for (let i = 0; i < 1200; i++) {
      for (const robot of simulation.step().robots) {
        expect(robot.status).toBe('ok');
        expect(robot.sensors.frente).toBe(false);
      }
    }
  });

  it('corridor: o explorador percorre o corredor de ponta a ponta', () => {
    const simulation = loadExample('corridor');
    let maxX = -Infinity;
    for (let i = 0; i < 1200; i++) maxX = Math.max(maxX, simulation.step().robots[0]!.pose.x);
    expect(maxX).toBeGreaterThan(2.5);
  });
});
