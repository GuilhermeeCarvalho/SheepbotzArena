/**
 * Resolução de colisões por posição e registro de contatos (FR-009, FR-010; research D-05, D-06).
 * Opera sobre discos mutáveis; a ordem dos discos é a ordem dos robôs no mundo.
 */
import { type Vec2, distance, length, scale, sub } from '../math/vec2';
import { type StaticBody, closestPointOnBody } from './staticBodies';

/** Distância a partir da qual um robô é considerado encostado (m). */
export const CONTACT_EPSILON = 1e-6;
/** Iterações da resolução robô × robô por subpasso. */
export const ROBOT_PAIR_ITERATIONS = 4;

export type CollisionDisc = {
  x: number;
  y: number;
  readonly radius: number;
  readonly mass: number;
  /** Posição antes do subpasso, usada quando o centro fica exatamente sobre uma parede. */
  previous: Vec2;
};

const normalize = (v: Vec2, fallback: Vec2): Vec2 => {
  const len = length(v);
  return len < 1e-12 ? fallback : scale(v, 1 / len);
};

/** Afasta o disco do corpo estático, se sobreposto. Devolve `true` se moveu. */
function separateFromBody(disc: CollisionDisc, body: StaticBody): boolean {
  const center = { x: disc.x, y: disc.y };
  const { point, inside } = closestPointOnBody(body, center);
  const d = distance(center, point);
  if (!inside && d >= disc.radius) return false;
  const fallback = normalize(sub(disc.previous, point), { x: 1, y: 0 });
  const direction = inside
    ? normalize(sub(point, center), fallback)
    : normalize(sub(center, point), fallback);
  disc.x = point.x + direction.x * disc.radius;
  disc.y = point.y + direction.y * disc.radius;
  return true;
}

export function resolveStatic(discs: CollisionDisc[], bodies: readonly StaticBody[]): void {
  for (const disc of discs) {
    for (const body of bodies) separateFromBody(disc, body);
  }
}

/** Separa dois discos na proporção inversa das massas; `pinned` não se move. */
function separatePair(
  a: CollisionDisc,
  b: CollisionDisc,
  pinnedA = false,
  pinnedB = false,
): boolean {
  const d = distance(a, b);
  const overlap = a.radius + b.radius - d;
  if (overlap <= 0) return false;
  const n = d < 1e-12 ? { x: 1, y: 0 } : { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
  let shareA = b.mass / (a.mass + b.mass);
  let shareB = a.mass / (a.mass + b.mass);
  if (pinnedA && !pinnedB) [shareA, shareB] = [0, 1];
  else if (pinnedB && !pinnedA) [shareA, shareB] = [1, 0];
  a.x -= n.x * overlap * shareA;
  a.y -= n.y * overlap * shareA;
  b.x += n.x * overlap * shareB;
  b.y += n.y * overlap * shareB;
  return true;
}

const touchesStatic = (disc: CollisionDisc, bodies: readonly StaticBody[]): boolean =>
  bodies.some((body) => {
    const { point, inside } = closestPointOnBody(body, disc);
    return inside || distance(disc, point) <= disc.radius + CONTACT_EPSILON;
  });

/**
 * Resolve todas as colisões de um subpasso: estáticos, pares de robôs e estáticos de novo
 * (estáticos sempre vencem). Robôs encurralados contra estáticos ficam fixos na última passada.
 */
export function resolveCollisions(discs: CollisionDisc[], bodies: readonly StaticBody[]): void {
  resolveStatic(discs, bodies);
  for (let iteration = 0; iteration < ROBOT_PAIR_ITERATIONS; iteration++) {
    let moved = false;
    for (let i = 0; i < discs.length; i++) {
      for (let j = i + 1; j < discs.length; j++)
        moved = separatePair(discs[i]!, discs[j]!) || moved;
    }
    if (!moved) break;
  }
  resolveStatic(discs, bodies);
  const pinned = discs.map((disc) => touchesStatic(disc, bodies));
  for (let i = 0; i < discs.length; i++) {
    for (let j = i + 1; j < discs.length; j++)
      separatePair(discs[i]!, discs[j]!, pinned[i], pinned[j]);
  }
  resolveStatic(discs, bodies);
}

/**
 * Direções de contato (rad, referencial do mundo) de cada disco com estáticos e com
 * outros discos, após a resolução.
 */
export function findContacts(
  discs: readonly CollisionDisc[],
  bodies: readonly StaticBody[],
): number[][] {
  return discs.map((disc, i) => {
    const directions: number[] = [];
    for (const body of bodies) {
      const { point, inside } = closestPointOnBody(body, disc);
      const d = distance(disc, point);
      if (inside || d <= disc.radius + CONTACT_EPSILON) {
        const toward = inside ? sub(disc, point) : sub(point, disc);
        directions.push(Math.atan2(toward.y, toward.x));
      }
    }
    discs.forEach((other, j) => {
      if (j === i) return;
      if (distance(disc, other) <= disc.radius + other.radius + CONTACT_EPSILON) {
        directions.push(Math.atan2(other.y - disc.y, other.x - disc.x));
      }
    });
    return directions;
  });
}
