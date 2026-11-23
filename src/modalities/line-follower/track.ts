/**
 * Geometria da pista do Seguidor de Linha: construção por retas e arcos, projeção do robô
 * e raio mínimo (plan 006, D-02, D-04, D-05).
 */
import type { World } from '../../core/index';

export type Point = [number, number];
export type TrackSegment = { straight: number } | { arc: { radius: number; angle: number } };

export type Track = {
  readonly points: readonly Point[];
  /** Arco-comprimento acumulado até cada ponto. */
  readonly cumulative: readonly number[];
  readonly length: number;
  readonly closed: boolean;
};

const ARC_STEP = (5 * Math.PI) / 180;
const CLOSE_TOLERANCE = 1e-6;
const round = (v: number) => Math.round(v * 1e6) / 1e6;

/** Pontos de uma pista a partir da pose inicial e de segmentos (ângulo positivo = esquerda). */
export function buildTrack(
  start: { x: number; y: number; theta: number },
  segments: readonly TrackSegment[],
): Point[] {
  let { x, y, theta } = start;
  const points: Point[] = [[round(x), round(y)]];
  for (const segment of segments) {
    if ('straight' in segment) {
      x += segment.straight * Math.cos(theta);
      y += segment.straight * Math.sin(theta);
      points.push([round(x), round(y)]);
      continue;
    }
    const { radius, angle } = segment.arc;
    const steps = Math.max(1, Math.ceil(Math.abs(angle) / ARC_STEP));
    const side = Math.sign(angle);
    const cx = x - side * radius * Math.sin(theta);
    const cy = y + side * radius * Math.cos(theta);
    for (let i = 1; i <= steps; i++) {
      const heading = theta + (angle * i) / steps;
      points.push([
        round(cx + side * radius * Math.sin(heading)),
        round(cy - side * radius * Math.cos(heading)),
      ]);
    }
    x = cx + side * radius * Math.sin(theta + angle);
    y = cy - side * radius * Math.cos(theta + angle);
    theta += angle;
  }
  const first = points[0]!;
  const last = points[points.length - 1]!;
  if (Math.hypot(last[0] - first[0], last[1] - first[1]) < 1e-4)
    points[points.length - 1] = [first[0], first[1]];
  return points;
}

export function trackFromPoints(points: readonly Point[]): Track {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1]!;
    const [bx, by] = points[i]!;
    cumulative.push(cumulative[i - 1]! + Math.hypot(bx - ax, by - ay));
  }
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const closed =
    points.length > 2 && Math.hypot(last[0] - first[0], last[1] - first[1]) < CLOSE_TOLERANCE;
  return { points, cumulative, length: cumulative[cumulative.length - 1]!, closed };
}

/** Índice e região `line` que define a pista (D-01): a primeira linha branca do piso. */
export function trackRegionOf(
  world: World,
): { index: number; points: Point[]; width: number } | null {
  const index = world.floor.regions.findIndex((r) => r.type === 'line' && r.reflectance > 0.5);
  if (index < 0) return null;
  const region = world.floor.regions[index]!;
  if (region.type !== 'line') return null;
  return { index, points: region.points as Point[], width: region.width };
}

/** Ponto mais próximo da pista: arco-comprimento `s`, distância e lado (+ esquerda). */
export function projectOnTrack(
  track: Track,
  p: { x: number; y: number },
): { s: number; distance: number } {
  let best = { s: 0, distance: Infinity };
  for (let i = 1; i < track.points.length; i++) {
    const [ax, ay] = track.points[i - 1]!;
    const [bx, by] = track.points[i]!;
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) continue;
    const t = Math.min(1, Math.max(0, ((p.x - ax) * dx + (p.y - ay) * dy) / lengthSq));
    const distance = Math.hypot(p.x - (ax + t * dx), p.y - (ay + t * dy));
    if (distance < best.distance)
      best = { s: track.cumulative[i - 1]! + t * Math.sqrt(lengthSq), distance };
  }
  return best;
}

/** Ponto e direção da pista no arco-comprimento `s`. */
export function pointAt(track: Track, s: number): { x: number; y: number; heading: number } {
  const target = ((s % track.length) + track.length) % track.length;
  for (let i = 1; i < track.points.length; i++) {
    if (track.cumulative[i]! >= target) {
      const [ax, ay] = track.points[i - 1]!;
      const [bx, by] = track.points[i]!;
      const segment = track.cumulative[i]! - track.cumulative[i - 1]!;
      const t = segment === 0 ? 0 : (target - track.cumulative[i - 1]!) / segment;
      return {
        x: ax + t * (bx - ax),
        y: ay + t * (by - ay),
        heading: Math.atan2(by - ay, bx - ax),
      };
    }
  }
  const [x, y] = track.points[0]!;
  return { x, y, heading: 0 };
}

/** Menor raio de curvatura estimado por três pontos consecutivos (D-04). */
export function minTurnRadius(points: readonly Point[]): number {
  const filtered = points.filter(
    (p, i) => i === 0 || Math.hypot(p[0] - points[i - 1]![0], p[1] - points[i - 1]![1]) >= 1e-3,
  );
  const closed =
    filtered.length > 3 &&
    Math.hypot(filtered[0]![0] - filtered.at(-1)![0], filtered[0]![1] - filtered.at(-1)![1]) < 1e-3;
  const ring = closed ? [...filtered.slice(0, -1)] : filtered;
  let best = Infinity;
  const n = ring.length;
  const triples = closed ? n : n - 2;
  for (let i = 0; i < triples; i++) {
    const a = ring[i % n]!;
    const b = ring[(i + 1) % n]!;
    const c = ring[(i + 2) % n]!;
    const ab = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const bc = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const ca = Math.hypot(a[0] - c[0], a[1] - c[1]);
    const cross = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    if (cross < 1e-12) continue; // colineares: raio infinito
    best = Math.min(best, (ab * bc * ca) / (2 * cross));
  }
  return best;
}
