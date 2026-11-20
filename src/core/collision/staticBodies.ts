/**
 * Corpos estáticos do mundo (paredes, caixas, discos e bordas da arena), em forma
 * consultável por colisão e raycast (research D-03, D-05, D-07).
 */
import {
  closestPointOnBox,
  closestPointOnSegment,
  type OrientedBox,
  rayBox,
  rayDisc,
  raySegment,
} from '../math/geometry';
import { type Vec2, distance, sub, scale, add, length } from '../math/vec2';
import type { World } from '../world/schema';

export type StaticBody =
  | { kind: 'segment'; id: string; a: Vec2; b: Vec2 }
  | { kind: 'box'; id: string; box: OrientedBox }
  | { kind: 'disc'; id: string; center: Vec2; radius: number };

const toVec = ([x, y]: readonly [number, number]): Vec2 => ({ x, y });

/** Constrói os corpos estáticos na ordem: obstáculos do mundo, depois bordas da arena. */
export function buildStaticBodies(world: World): StaticBody[] {
  const bodies: StaticBody[] = world.obstacles.map((o): StaticBody => {
    switch (o.type) {
      case 'wall':
        return { kind: 'segment', id: o.id, a: toVec(o.from), b: toVec(o.to) };
      case 'box':
        return {
          kind: 'box',
          id: o.id,
          box: { center: toVec(o.center), width: o.width, height: o.height, angle: o.angle },
        };
      case 'disc':
        return { kind: 'disc', id: o.id, center: toVec(o.center), radius: o.radius };
    }
  });
  if (world.arena.walls) {
    const hw = world.arena.width / 2;
    const hh = world.arena.height / 2;
    bodies.push(
      { kind: 'segment', id: 'arena:bottom', a: { x: -hw, y: -hh }, b: { x: hw, y: -hh } },
      { kind: 'segment', id: 'arena:right', a: { x: hw, y: -hh }, b: { x: hw, y: hh } },
      { kind: 'segment', id: 'arena:top', a: { x: hw, y: hh }, b: { x: -hw, y: hh } },
      { kind: 'segment', id: 'arena:left', a: { x: -hw, y: hh }, b: { x: -hw, y: -hh } },
    );
  }
  return bodies;
}

/**
 * Ponto do corpo mais próximo de `p`. `inside` indica que `p` está dentro de um corpo
 * sólido (caixa ou disco).
 */
export function closestPointOnBody(body: StaticBody, p: Vec2): { point: Vec2; inside: boolean } {
  switch (body.kind) {
    case 'segment':
      return { point: closestPointOnSegment(p, body.a, body.b), inside: false };
    case 'box':
      return closestPointOnBox(p, body.box);
    case 'disc': {
      const offset = sub(p, body.center);
      const d = length(offset);
      if (d === 0) return { point: add(body.center, { x: body.radius, y: 0 }), inside: true };
      return { point: add(body.center, scale(offset, body.radius / d)), inside: d < body.radius };
    }
  }
}

/** Profundidade de sobreposição entre um disco (robô) e o corpo; ≤ 0 se não sobrepõe. */
export function discPenetration(body: StaticBody, center: Vec2, radius: number): number {
  const { point, inside } = closestPointOnBody(body, center);
  const d = distance(center, point);
  return inside ? radius + d : radius - d;
}

/** Distância ao longo do raio até o corpo, ou `null`. */
export function castRayAtBody(body: StaticBody, origin: Vec2, direction: Vec2): number | null {
  switch (body.kind) {
    case 'segment':
      return raySegment(origin, direction, body.a, body.b);
    case 'box':
      return rayBox(origin, direction, body.box);
    case 'disc':
      return rayDisc(origin, direction, body.center, body.radius);
  }
}
