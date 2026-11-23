// Todos os mundos de exemplo (vitrine da apresentação): válidos, controladores compilam e
// rodam sem erro; resultados-chave das demos de comparação (RB-24, RB-26).
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createSimulation, loadWorld } from 'src/core';
import { modalityRegistry } from 'src/modalities';

const worldsDir = fileURLToPath(new URL('../../examples/worlds/', import.meta.url));
const names = readdirSync(worldsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''));

function simulate(name: string, ticks: number) {
  const path = resolve(worldsDir, `${name}.json`);
  const world = loadWorld(readFileSync(path, 'utf8'), { modalities: modalityRegistry });
  if (!world.ok) throw new Error(`${name}: ${JSON.stringify(world.errors)}`);
  const controllers = Object.fromEntries(
    world.value.robots
      .filter((r) => r.controller)
      .map((r) => [r.id, readFileSync(resolve(dirname(path), r.controller!), 'utf8')]),
  );
  const simulation = createSimulation(world.value, { controllers, modalities: modalityRegistry });
  if (!simulation.ok) throw new Error(`${name}: ${JSON.stringify(simulation.errors)}`);
  return simulation.value.step(ticks);
}

describe('todos os exemplos', () => {
  it('há exemplos de todas as categorias', () => {
    for (const prefix of ['sumo-', 'seguidor-', 'trekking', 'futebol-']) {
      expect(names.filter((n) => n.startsWith(prefix)).length).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(names)('%s é válido e roda 200 ticks sem erro de controlador', (name) => {
    const state = simulate(name, 200);
    expect(state.robots.every((r) => r.status !== 'error')).toBe(true);
  });

  it('mesmo duelo de Mini Sumô: com 300 g o Sheep perde; com 500 g vence', () => {
    expect(simulate('sumo-mini-peso-300g', 6000).match).toMatchObject({
      phase: 'finished',
      winner: 'rival',
    });
    expect(simulate('sumo-mini-peso-500g', 6000).match).toMatchObject({
      phase: 'finished',
      winner: 'sheep',
    });
  });

  it('Mega Sumô: o motor rápido vence o lento frente a frente', () => {
    expect(simulate('sumo-mega-motores', 6000).match).toMatchObject({ winner: 'titan' });
  });

  it('Seguidor: o PD agressivo não consegue parar na chegada', () => {
    const state = simulate('seguidor-pd-agressivo', 30000);
    expect(state.match).toMatchObject({ phase: 'finished', winner: null });
    expect(state.match!.reason).toContain('sem parar');
  });
});
