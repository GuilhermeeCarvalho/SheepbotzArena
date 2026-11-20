/** Raycast contra o mundo: corpos estáticos e outros robôs (FR-013; research D-07). */
import { castRayAtBody, type StaticBody } from '../collision/staticBodies';
import { rayDisc } from '../math/geometry';
import type { Vec2 } from '../math/vec2';

export type RaycastScene = {
  readonly bodies: readonly StaticBody[];
  readonly robots: readonly { x: number; y: number; radius: number }[];
};

/**
 * Distância até o primeiro elemento atingido, limitada a `maxRange`.
 * O robô de índice `selfIndex` é ignorado.
 */
export function castRay(
  scene: RaycastScene,
  origin: Vec2,
  direction: Vec2,
  maxRange: number,
  selfIndex: number,
): number {
  let nearest = maxRange;
  for (const body of scene.bodies) {
    const t = castRayAtBody(body, origin, direction);
    if (t !== null && t < nearest) nearest = t;
  }
  scene.robots.forEach((robot, index) => {
    if (index === selfIndex) return;
    const t = rayDisc(origin, direction, robot, robot.radius);
    if (t !== null && t < nearest) nearest = t;
  });
  return nearest;
}
