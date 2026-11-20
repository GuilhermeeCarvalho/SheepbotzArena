import { type Vec2, add, distance, dot, rotate, scale, sub } from './vec2';

/** Retângulo com rotação; `width` ao longo do eixo x local e `height` ao longo do y local. */
export type OrientedBox = {
  readonly center: Vec2;
  readonly width: number;
  readonly height: number;
  readonly angle: number;
};

/** Ponto do segmento [a, b] mais próximo de `p`. */
export function closestPointOnSegment(p: Vec2, a: Vec2, b: Vec2): Vec2 {
  const ab = sub(b, a);
  const lengthSq = dot(ab, ab);
  if (lengthSq === 0) return a;
  const t = Math.min(1, Math.max(0, dot(sub(p, a), ab) / lengthSq));
  return add(a, scale(ab, t));
}

export const distancePointToSegment = (p: Vec2, a: Vec2, b: Vec2): number =>
  distance(p, closestPointOnSegment(p, a, b));

/** Menor distância de `p` a uma poligonal aberta. */
export function distancePointToPolyline(p: Vec2, points: readonly Vec2[]): number {
  let best = Infinity;
  for (let i = 0; i + 1 < points.length; i++) {
    best = Math.min(best, distancePointToSegment(p, points[i]!, points[i + 1]!));
  }
  return best;
}

const toBoxLocal = (p: Vec2, box: OrientedBox): Vec2 => rotate(sub(p, box.center), -box.angle);
const fromBoxLocal = (p: Vec2, box: OrientedBox): Vec2 => add(box.center, rotate(p, box.angle));

/** Indica se `p` está dentro da caixa (bordas inclusivas). */
export function isPointInBox(p: Vec2, box: OrientedBox, tolerance = 1e-12): boolean {
  const local = toBoxLocal(p, box);
  return (
    Math.abs(local.x) <= box.width / 2 + tolerance &&
    Math.abs(local.y) <= box.height / 2 + tolerance
  );
}

/**
 * Ponto do contorno da caixa mais próximo de `p`. Se `p` estiver dentro, devolve o ponto do
 * contorno no eixo de menor penetração e `inside = true`.
 */
export function closestPointOnBox(p: Vec2, box: OrientedBox): { point: Vec2; inside: boolean } {
  const local = toBoxLocal(p, box);
  const hw = box.width / 2;
  const hh = box.height / 2;
  const inside = Math.abs(local.x) < hw && Math.abs(local.y) < hh;
  if (!inside) {
    const clamped = {
      x: Math.min(hw, Math.max(-hw, local.x)),
      y: Math.min(hh, Math.max(-hh, local.y)),
    };
    return { point: fromBoxLocal(clamped, box), inside: false };
  }
  const penetrationX = hw - Math.abs(local.x);
  const penetrationY = hh - Math.abs(local.y);
  const projected =
    penetrationX <= penetrationY
      ? { x: local.x >= 0 ? hw : -hw, y: local.y }
      : { x: local.x, y: local.y >= 0 ? hh : -hh };
  return { point: fromBoxLocal(projected, box), inside: true };
}

export const isPointInDisc = (p: Vec2, center: Vec2, radius: number, tolerance = 1e-12): boolean =>
  distance(p, center) <= radius + tolerance;

export function isPointInRing(
  p: Vec2,
  center: Vec2,
  innerRadius: number,
  outerRadius: number,
  tolerance = 1e-12,
): boolean {
  const d = distance(p, center);
  return d >= innerRadius - tolerance && d <= outerRadius + tolerance;
}

// ---------------------------------------------------------------------------
// Interseções de raio. `direction` deve ser unitário; o retorno é a distância ao
// longo do raio (≥ 0) ou `null` se não houver interseção.
// ---------------------------------------------------------------------------

export function raySegment(origin: Vec2, direction: Vec2, a: Vec2, b: Vec2): number | null {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const aox = a.x - origin.x;
  const aoy = a.y - origin.y;
  const denominator = direction.x * aby - direction.y * abx;
  if (Math.abs(denominator) < 1e-15) {
    // Raio paralelo ao segmento: só há interseção se forem colineares.
    if (Math.abs(aox * direction.y - aoy * direction.x) > 1e-12) return null;
    const ta = aox * direction.x + aoy * direction.y;
    const tb = (b.x - origin.x) * direction.x + (b.y - origin.y) * direction.y;
    if (ta < 0 && tb < 0) return null;
    if (ta <= 0 || tb <= 0) return 0;
    return Math.min(ta, tb);
  }
  const t = (aox * aby - aoy * abx) / denominator;
  const u = (aox * direction.y - aoy * direction.x) / denominator;
  const eps = 1e-12;
  if (t < -eps || u < -eps || u > 1 + eps) return null;
  return Math.max(0, t);
}

export function rayDisc(
  origin: Vec2,
  direction: Vec2,
  center: Vec2,
  radius: number,
): number | null {
  const ocx = origin.x - center.x;
  const ocy = origin.y - center.y;
  const c = ocx * ocx + ocy * ocy - radius * radius;
  if (c <= 0) return 0; // origem dentro do disco
  const b = ocx * direction.x + ocy * direction.y;
  if (b > 0) return null; // afastando-se do disco
  const discriminant = b * b - c;
  if (discriminant < -1e-12) return null;
  return -b - Math.sqrt(Math.max(0, discriminant));
}

/** Interseção de raio com intervalo [−half, half] num eixo; atualiza [tMin, tMax]. */
function slab(o: number, d: number, half: number, range: [number, number]): boolean {
  if (Math.abs(d) < 1e-15) return o >= -half - 1e-12 && o <= half + 1e-12;
  const t1 = (-half - o) / d;
  const t2 = (half - o) / d;
  range[0] = Math.max(range[0], Math.min(t1, t2));
  range[1] = Math.min(range[1], Math.max(t1, t2));
  return true;
}

export function rayBox(origin: Vec2, direction: Vec2, box: OrientedBox): number | null {
  const cos = Math.cos(-box.angle);
  const sin = Math.sin(-box.angle);
  const rx = origin.x - box.center.x;
  const ry = origin.y - box.center.y;
  const ox = rx * cos - ry * sin;
  const oy = rx * sin + ry * cos;
  const hw = box.width / 2;
  const hh = box.height / 2;
  if (Math.abs(ox) <= hw && Math.abs(oy) <= hh) return 0;
  const dx = direction.x * cos - direction.y * sin;
  const dy = direction.x * sin + direction.y * cos;
  const range: [number, number] = [-Infinity, Infinity];
  if (!slab(ox, dx, hw, range) || !slab(oy, dy, hh, range)) return null;
  const [tMin, tMax] = range;
  if (tMax < tMin - 1e-12 || tMax < 0) return null;
  return Math.max(0, tMin);
}
