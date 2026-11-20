/** Sensor de piso: refletância sob o sensor (FR-016, FR-017). */
import {
  distancePointToPolyline,
  isPointInBox,
  isPointInDisc,
  isPointInRing,
} from '../math/geometry';
import type { Vec2 } from '../math/vec2';
import type { RandomStream } from '../random/prng';
import type { FloorRegionSpec, World } from '../world/schema';

const toVec = ([x, y]: readonly [number, number]): Vec2 => ({ x, y });

export function isPointInRegion(region: FloorRegionSpec, p: Vec2): boolean {
  switch (region.type) {
    case 'rect':
      return isPointInBox(p, {
        center: toVec(region.center),
        width: region.width,
        height: region.height,
        angle: region.angle,
      });
    case 'disc':
      return isPointInDisc(p, toVec(region.center), region.radius);
    case 'ring':
      return isPointInRing(p, toVec(region.center), region.innerRadius, region.outerRadius);
    case 'line':
      return distancePointToPolyline(p, region.points.map(toVec)) <= region.width / 2 + 1e-12;
  }
}

/** Refletância do piso no ponto: a última região que contém o ponto vence. */
export function floorReflectanceAt(floor: World['floor'], p: Vec2): number {
  for (let i = floor.regions.length - 1; i >= 0; i--) {
    const region = floor.regions[i]!;
    if (isPointInRegion(region, p)) return region.reflectance;
  }
  return floor.reflectance;
}

/** Leitura com ruído opcional, limitada a [0, 1]. */
export function readFloor(
  floor: World['floor'],
  p: Vec2,
  noise: number,
  rng: RandomStream,
): number {
  const value = floorReflectanceAt(floor, p);
  return noise > 0 ? Math.min(1, Math.max(0, value + rng.gaussian(noise))) : value;
}
