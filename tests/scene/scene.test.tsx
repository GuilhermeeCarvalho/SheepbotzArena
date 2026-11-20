// Spec 002 — cena 3D renderizada sem WebGL (US1, US3, US6; FR-001, FR-002, FR-004, FR-012).
import ReactThreeTestRenderer from '@react-three/test-renderer';
import type { BufferGeometry, Object3D } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { DynamicSceneContent, StaticSceneContent } from 'src/app/scene/SceneContent';
import { buildDynamicScene, buildStaticScene } from 'src/app/scene/sceneModel';
import { buildSimulation, robotData, worldData } from '../helpers';

const PI = Math.PI;

/** Número de vértices da geometria de uma linha/pontos da cena. */
const vertexCount = (object: Object3D): number =>
  (object as Object3D & { geometry: BufferGeometry }).geometry.getAttribute('position').count;

const world = worldData({
  arena: { width: 4, height: 3, walls: true },
  floor: {
    regions: [
      { type: 'disc', center: [0, 0], radius: 0.5, reflectance: 0.1 },
      { type: 'ring', center: [0, 0], innerRadius: 0.45, outerRadius: 0.5, reflectance: 1 },
      { type: 'rect', center: [1, 1], width: 0.4, height: 0.2, reflectance: 0.5 },
      {
        type: 'line',
        points: [
          [-1, -1],
          [1, -1],
          [1, -0.5],
        ],
        width: 0.02,
        reflectance: 0.9,
      },
    ],
  },
  obstacles: [
    { id: 'pilar', type: 'disc', center: [1.5, 0.5], radius: 0.2 },
    { id: 'caixa', type: 'box', center: [-1.5, 0], width: 0.3, height: 0.6, angle: 0.5 },
    { id: 'parede', type: 'wall', from: [1, -1.4], to: [1, 1.4] },
  ],
  robots: [
    robotData({ sensors: [{ id: 'laser', type: 'laser', rays: 3, fov: PI, maxRange: 1.2 }] }),
    robotData({ id: 'r2', pose: { x: -1, y: 1, theta: PI / 2 } }),
  ],
});

async function renderScene(options = {}, onSelect?: (id: string) => void) {
  const simulation = buildSimulation(world);
  const staticScene = buildStaticScene(simulation.world);
  const dynamicScene = buildDynamicScene(simulation.world, simulation.getState(), options);
  return ReactThreeTestRenderer.create(
    <>
      <StaticSceneContent scene={staticScene} />
      <DynamicSceneContent scene={dynamicScene} onSelectRobot={onSelect} />
    </>,
  );
}

describe('cena 3D', () => {
  it('US1: arena, paredes de borda, regiões do piso e obstáculos', async () => {
    const renderer = await renderScene();
    const scene = renderer.scene;
    expect(scene.findByProps({ name: 'arena-floor' })).toBeDefined();
    for (const id of [
      'arena:bottom',
      'arena:top',
      'arena:left',
      'arena:right',
      'pilar',
      'caixa',
      'parede',
    ]) {
      expect(scene.findByProps({ name: id })).toBeDefined();
    }
    const pillar = scene.findByProps({ name: 'pilar' });
    expect(pillar.instance.position.x).toBeCloseTo(1.5, 9);
    expect(pillar.instance.position.z).toBeCloseTo(-0.5, 9);
    expect(scene.findByProps({ name: 'caixa' }).instance.rotation.y).toBeCloseTo(0.5, 9);
    // disc + ring + rect + 2 segmentos de linha (com junta) = 1 + 1 + 1 + 4 malhas
    expect(scene.findByProps({ name: 'floor-regions' }).findAllByType('Mesh')).toHaveLength(7);
  });

  it('US1-AC2: robô com chassi, duas rodas e indicador de frente na pose', async () => {
    const renderer = await renderScene();
    const robot = renderer.scene.findByProps({ name: 'robot-r2' });
    expect(robot.instance.position.x).toBeCloseTo(-1, 9);
    expect(robot.instance.position.z).toBeCloseTo(-1, 9);
    expect(robot.instance.rotation.y).toBeCloseTo(PI / 2, 9);
    expect(robot.findAllByProps({ name: 'wheel' })).toHaveLength(2);
    expect(robot.findByProps({ name: 'front-marker' })).toBeDefined();
  });

  it('US3: raios divididos entre detecção e livres, com pontos de impacto', async () => {
    const renderer = await renderScene();
    const hit = renderer.scene.findByProps({ name: 'rays-hit' });
    const free = renderer.scene.findByProps({ name: 'rays-free' });
    // parede em x = 1 detectada pelo raio central; laterais livres (bordas a 1,5 m > alcance 1,2 m)
    expect(vertexCount(hit.instance)).toBe(2);
    expect(vertexCount(free.instance)).toBe(4);
    expect(vertexCount(renderer.scene.findByProps({ name: 'rays-hit-points' }).instance)).toBe(1);
  });

  it('US3-AC4: raios ocultos não geram segmentos', async () => {
    const renderer = await renderScene({ showRays: false });
    expect(vertexCount(renderer.scene.findByProps({ name: 'rays-hit' }).instance)).toBe(0);
  });

  it('US6-AC2: anel de destaque e seleção por clique', async () => {
    const onSelect = vi.fn();
    const renderer = await renderScene({ selectedRobotId: 'r1' }, onSelect);
    expect(
      renderer.scene.findByProps({ name: 'robot-r1' }).findAllByProps({ name: 'selection-ring' }),
    ).toHaveLength(1);
    expect(
      renderer.scene.findByProps({ name: 'robot-r2' }).findAllByProps({ name: 'selection-ring' }),
    ).toHaveLength(0);
    await renderer.fireEvent(renderer.scene.findByProps({ name: 'robot-r2' }), 'onClick', {
      stopPropagation: () => {},
    });
    expect(onSelect).toHaveBeenCalledWith('r2');
  });
});
