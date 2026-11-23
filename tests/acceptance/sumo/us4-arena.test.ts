// Spec 004 — US4: arenas oficiais prontas (FR-007, FR-008; Art. 3).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadWorld, validateWorld } from 'src/core';
import { modalityRegistry } from 'src/modalities';
import {
  createSumoWorld,
  SUMO_CATEGORIES,
  startPose,
  type SumoRobotInput,
} from 'src/modalities/sumo';
import { buildSimulation } from '../../helpers';

const PI = Math.PI;
const robot = (
  id: string,
  side: 'left' | 'right',
  extra: Partial<SumoRobotInput> = {},
): SumoRobotInput => ({
  id,
  side,
  radius: 0.05,
  mass: 0.5,
  maxLinearSpeed: 0.8,
  maxAngularSpeed: 20,
  sensors: [{ id: 'piso', type: 'floor', position: [0, 0] }],
  ...extra,
});

describe('US4 — arenas oficiais', () => {
  it('US4-AC1: Mini Sumô — Dohyo 0,385 m, Tawara 0,36–0,385 m, Shikiri-sen em ±0,05 m, Yochi 1,8 m', () => {
    const world = createSumoWorld(SUMO_CATEGORIES.mini, [robot('A', 'left'), robot('B', 'right')]);
    const [dohyo, tawara, left, right] = world.floor.regions as Record<string, unknown>[];
    expect(dohyo).toMatchObject({ type: 'disc', radius: 0.385 });
    expect(dohyo!.reflectance).toBeLessThan(0.5);
    expect(tawara).toMatchObject({ type: 'ring', innerRadius: 0.36, outerRadius: 0.385 });
    expect(tawara!.reflectance).toBeGreaterThan(0.5);
    expect(left).toMatchObject({ type: 'rect', center: [-0.05, 0], width: 0.01, height: 0.1 });
    expect(right).toMatchObject({ center: [0.05, 0] });
    expect(world.arena).toEqual({ width: 1.8, height: 1.8, walls: false });
    expect(world.modality).toBe('sumo-mini');
    expect(validateWorld(world, { modalities: modalityRegistry }).ok).toBe(true);
  });

  it('US4-AC2: Mega Sumô — Dohyo 0,77 m, Tawara 0,72–0,77 m, faixas 0,02 × 0,20 em ±0,10 m, Yochi 3,6 m', () => {
    const big = (id: string, side: 'left' | 'right') => robot(id, side, { radius: 0.1, mass: 3 });
    const world = createSumoWorld(SUMO_CATEGORIES.mega, [big('A', 'left'), big('B', 'right')], {
      roundTimeLimit: 30,
    });
    expect(world.floor.regions[0]).toMatchObject({ radius: 0.77 });
    expect(world.floor.regions[1]).toMatchObject({ innerRadius: 0.72, outerRadius: 0.77 });
    expect(world.floor.regions[2]).toMatchObject({ center: [-0.1, 0], width: 0.02, height: 0.2 });
    expect(world.arena.width).toBe(3.6);
    expect(world.modalityOptions).toEqual({ roundTimeLimit: 30 });
    expect(validateWorld(world, { modalities: modalityRegistry }).ok).toBe(true);
  });

  it('posição de partida atrás da linha, de frente para o centro', () => {
    const left = startPose(SUMO_CATEGORIES.mini, robot('A', 'left'));
    expect(left.x).toBeCloseTo(-(0.05 + 0.005 + 0.02 + 0.05), 6);
    expect(left.theta).toBe(0);
    expect(startPose(SUMO_CATEGORIES.mini, robot('B', 'right')).theta).toBeCloseTo(PI, 6);
  });

  it.each(['sumo-mini', 'sumo-mega', 'sumo-lego'])(
    'US4-AC3: exemplo %s é válido e usa componentes reais',
    (name) => {
      const path = fileURLToPath(new URL(`../../../examples/worlds/${name}.json`, import.meta.url));
      const result = loadWorld(readFileSync(path, 'utf8'), { modalities: modalityRegistry });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.robots).toHaveLength(2);
      for (const r of result.value.robots) {
        expect(r.sensors.map((s) => s.id)).toEqual(['oponente', 'piso-esq', 'piso-dir', 'frente']);
        expect(r.controller).toMatch(/^\.\.\/controllers\/sumo-/);
      }
    },
  );

  it('US4-AC4: piso lido sobre a Tawara > 0,5 e sobre o Dohyo < 0,5', () => {
    const tawaraX = 0.3725 - 0.0; // meio da Tawara do Mini (0,36 a 0,385)
    const world = createSumoWorld(SUMO_CATEGORIES.mini, [
      robot('A', 'left'),
      robot('B', 'right', {
        sensors: [{ id: 'piso', type: 'floor', position: [tawaraX - 0.2, 0] }],
      }),
    ]);
    const state = buildSimulation(
      {
        ...world,
        robots: [
          { ...world.robots[0], pose: { x: -0.2, y: 0, theta: 0 } },
          { ...world.robots[1], pose: { x: 0.2, y: 0, theta: 0 } },
        ],
      },
      {},
      modalityRegistry,
    ).getState();
    expect(state.robots[0]!.sensors.piso).toBeLessThan(0.5);
    expect(state.robots[1]!.sensors.piso).toBeGreaterThan(0.5);
  });
});
