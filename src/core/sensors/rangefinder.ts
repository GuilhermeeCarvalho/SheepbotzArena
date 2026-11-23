/** Laser e sonar (FR-011, FR-012, FR-017). */
import { fromAngle, localToWorld } from '../math/vec2';
import type { RandomStream } from '../random/prng';
import type { Pose } from '../simulation/state';
import type { RangeSensorSpec } from '../world/schema';
import { castRay, type RaycastScene } from './raycast';

/**
 * Ângulos dos raios no referencial do robô, do mais à direita para o mais à esquerda.
 * Com N ≥ 2: `angle − fov/2 + i·fov/(N−1)`; com N = 1: `angle`.
 */
export function rayAngles(spec: Pick<RangeSensorSpec, 'angle' | 'fov' | 'rays'>): number[] {
  if (spec.rays === 1) return [spec.angle];
  const step = spec.fov / (spec.rays - 1);
  return Array.from({ length: spec.rays }, (_, i) => spec.angle - spec.fov / 2 + i * step);
}

/** Origem do sensor e direção de cada raio no referencial do mundo. */
export function rayGeometry(spec: RangeSensorSpec, pose: Pose) {
  const origin = localToWorld(pose, { x: spec.position[0], y: spec.position[1] });
  return rayAngles(spec).map((angle) => ({ origin, angle: pose.theta + angle }));
}

const clampRange = (value: number, maxRange: number): number =>
  Math.min(maxRange, Math.max(0, value));

/** Leituras do laser (uma por raio), com ruído opcional limitado a [0, maxRange]. */
export function readRanges(
  spec: RangeSensorSpec,
  pose: Pose,
  scene: RaycastScene,
  selfIndex: number,
  rng: RandomStream,
): number[] {
  return rayGeometry(spec, pose).map(({ origin, angle }) => {
    const distance = castRay(scene, origin, fromAngle(angle), spec.maxRange, selfIndex);
    return spec.noise > 0
      ? clampRange(distance + rng.gaussian(spec.noise), spec.maxRange)
      : distance;
  });
}

/** Leitura do sonar: a menor distância entre os raios do cone. */
export const readSonar = (...args: Parameters<typeof readRanges>): number =>
  Math.min(...readRanges(...args));
