// Spec 002 — modelo de cena: US1 (arena e robôs), US3 (raios), US6 (destaque) (FR-001 a FR-004, FR-012).
import { describe, expect, it } from 'vitest';
import {
  buildSceneModel,
  OBSTACLE_HEIGHT,
  reflectanceColor,
  robotBodyHeight,
  toScene,
  type Vec3,
  WALL_HEIGHT,
} from 'src/app/scene/sceneModel';
import { buildSimulation, robotData, worldData } from '../../helpers';

const PI = Math.PI;

function modelOf(data: Record<string, unknown>, options = {}) {
  const simulation = buildSimulation(data);
  return buildSceneModel(simulation.world, simulation.getState(), options);
}

const expectVec = (actual: Vec3, expected: Vec3) =>
  actual.forEach((value, i) => expect(value).toBeCloseTo(expected[i]!, 9));

describe('toScene', () => {
  it('(x, y) → [x, h, −y]', () => {
    expect(toScene(1, 2, 0.5)).toEqual([1, 0.5, -2]);
  });
});

describe('US1 — arena e robôs', () => {
  it('US1-AC1: obstáculos nas posições e dimensões declaradas e quatro paredes de borda', () => {
    const model = modelOf(
      worldData({
        arena: { width: 4, height: 3, walls: true },
        obstacles: [
          { id: 'pilar', type: 'disc', center: [1, 0.5], radius: 0.2 },
          {
            id: 'caixa',
            type: 'box',
            center: [-1, 0],
            width: 0.3,
            height: 0.6,
            angle: 0.5,
            color: '#ff0000',
          },
          { id: 'muro', type: 'wall', from: [0, -1], to: [1, 0] },
        ],
      }),
    );
    const [pilar, caixa, muro] = model.obstacles;
    expect(pilar).toMatchObject({ kind: 'cylinder', radius: 0.2, height: OBSTACLE_HEIGHT });
    expectVec(pilar!.position, [1, OBSTACLE_HEIGHT / 2, -0.5]);
    expect(caixa).toMatchObject({
      kind: 'box',
      size: [0.3, OBSTACLE_HEIGHT, 0.6],
      rotationY: 0.5,
      color: '#ff0000',
    });
    expectVec(caixa!.position, [-1, OBSTACLE_HEIGHT / 2, 0]);
    expect(muro!.kind).toBe('wall');
    if (muro!.kind === 'wall') {
      expect(muro!.size[0]).toBeCloseTo(Math.SQRT2, 9);
      expect(muro!.rotationY).toBeCloseTo(PI / 4, 9);
      expectVec(muro!.position, [0.5, WALL_HEIGHT / 2, 0.5]);
    }
    expect(model.arena).toMatchObject({ width: 4, depth: 3 });
    expect(model.arena.walls.map((w) => w.id)).toEqual([
      'arena:bottom',
      'arena:top',
      'arena:left',
      'arena:right',
    ]);
    expectVec(model.arena.walls[0]!.position, [0, WALL_HEIGHT / 2, 1.52]);
    expectVec(model.arena.walls[3]!.position, [2.02, WALL_HEIGHT / 2, 0]);
  });

  it('arena sem paredes não tem paredes de borda', () => {
    expect(modelOf(worldData()).arena.walls).toEqual([]);
  });

  it('US1-AC2: robô de raio 0,1 em (1; 2; π/2) com diâmetro 0,2 e frente para +y', () => {
    const model = modelOf(
      worldData({ robots: [robotData({ pose: { x: 1, y: 2, theta: PI / 2 }, color: '#e53935' })] }),
    );
    const robot = model.robots[0]!;
    expect(robot.radius * 2).toBeCloseTo(0.2, 9);
    expectVec(robot.position, [1, robotBodyHeight(0.1) / 2, -2]);
    expect(robot.rotationY).toBeCloseTo(PI / 2, 9);
    // Rotação positiva em Y leva +X a −Z, isto é, ao +y da simulação.
    const forward: Vec3 = [Math.cos(robot.rotationY), 0, -Math.sin(robot.rotationY)];
    expectVec(forward, toScene(0, 1));
    expect(robot).toMatchObject({
      color: '#e53935',
      name: 'r1',
      status: 'no-controller',
      selected: false,
    });
  });

  it('US1-AC3: regiões do piso na ordem declarada, cor padrão pela refletância', () => {
    const model = modelOf(
      worldData({
        floor: {
          regions: [
            { type: 'disc', center: [0, 0], radius: 0.5, reflectance: 0.1 },
            {
              type: 'ring',
              center: [0, 0],
              innerRadius: 0.45,
              outerRadius: 0.5,
              reflectance: 1,
              color: '#ffffff',
            },
            { type: 'rect', center: [1, 1], width: 0.4, height: 0.2, angle: 0.3, reflectance: 0.5 },
            {
              type: 'line',
              points: [
                [0, 0],
                [1, 0],
                [1, 1],
              ],
              width: 0.02,
              reflectance: 0.9,
            },
          ],
        },
      }),
    );
    expect(model.floorRegions.map((r) => r.kind)).toEqual(['disc', 'ring', 'rect', 'line']);
    expect(model.floorRegions[0]).toMatchObject({ radius: 0.5, color: '#1a1a1a' });
    expect(model.floorRegions[1]).toMatchObject({
      innerRadius: 0.45,
      outerRadius: 0.5,
      color: '#ffffff',
    });
    expect(model.floorRegions[2]).toMatchObject({ width: 0.4, depth: 0.2, rotationY: 0.3 });
    // A camada sobe a cada região: a última fica por cima.
    const heights = model.floorRegions
      .slice(0, 3)
      .map((r) => ('position' in r ? r.position[1] : 0));
    expect(heights[0]! < heights[1]! && heights[1]! < heights[2]!).toBe(true);
    const line = model.floorRegions[3]!;
    expect(line.kind).toBe('line');
    if (line.kind === 'line') {
      expect(line.segments).toHaveLength(2);
      expect(line.segments[0]!.length).toBeCloseTo(1, 9);
      expect(line.segments[1]!.rotationY).toBeCloseTo(PI / 2, 9);
      expectVec(line.segments[0]!.position, [0.5, line.segments[0]!.position[1], 0]);
    }
  });

  it('cor de refletância', () => {
    expect(reflectanceColor(0)).toBe('#000000');
    expect(reflectanceColor(1)).toBe('#ffffff');
    expect(reflectanceColor(2)).toBe('#ffffff');
  });

  it('câmera inicial enquadra a arena', () => {
    const model = modelOf(worldData({ arena: { width: 20, height: 10 } }));
    expect(model.camera).toEqual({ position: [0, 14, 14], target: [0, 0, 0] });
  });
});

describe('US3 — raios dos sensores', () => {
  const laserWorld = (sensor: Record<string, unknown>) =>
    worldData({
      obstacles: [{ id: 'parede', type: 'wall', from: [1, -5], to: [1, 5] }],
      robots: [
        robotData({
          sensors: [{ id: 'laser', type: 'laser', rays: 3, fov: PI, maxRange: 2, ...sensor }],
        }),
      ],
    });

  it('US3-AC1: 3 raios terminando em (0; −2), (1; 0) e (0; 2)', () => {
    const rays = modelOf(laserWorld({})).rays;
    expect(rays).toHaveLength(3);
    const expected = [
      [0, -2],
      [1, 0],
      [0, 2],
    ];
    rays.forEach((ray, i) => {
      expect(ray.to[0]).toBeCloseTo(expected[i]![0]!, 9);
      expect(-ray.to[2]).toBeCloseTo(expected[i]![1]!, 9);
      expect(ray.from[0]).toBeCloseTo(0, 9);
    });
  });

  it('US3-AC2: detecção × alcance máximo', () => {
    expect(modelOf(laserWorld({})).rays.map((r) => r.hit)).toEqual([false, true, false]);
  });

  it('US3-AC3: sonar desenha todos os raios com a leitura única', () => {
    const rays = modelOf(laserWorld({ id: 'sonar', type: 'sonar', fov: PI / 3 })).rays;
    expect(rays).toHaveLength(3);
    rays.forEach((r) =>
      expect(Math.hypot(r.to[0] - r.from[0], r.to[2] - r.from[2])).toBeCloseTo(1, 9),
    );
    expect(rays.every((r) => r.hit)).toBe(true);
  });

  it('US3-AC4: ocultar raios', () => {
    expect(modelOf(laserWorld({}), { showRays: false }).rays).toEqual([]);
  });
});

describe('US6 — destaque', () => {
  it('US6-AC2: robô selecionado recebe destaque', () => {
    const model = modelOf(
      worldData({ robots: [robotData(), robotData({ id: 'r2', pose: { x: 1, y: 1, theta: 0 } })] }),
      { selectedRobotId: 'r2' },
    );
    expect(model.robots.map((r) => r.selected)).toEqual([false, true]);
  });
});
