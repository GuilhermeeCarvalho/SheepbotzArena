/** Gerador de mundos do Seguidor de Linha (spec 006, US3; FR-007). */
import {
  FINISH_BEFORE_START,
  LINE_WIDTH,
  MARK_LENGTH,
  MARK_OFFSET,
  MARK_WIDTH,
  type LineFollowerCategory,
} from './categories';
import { buildTrack, pointAt, trackFromPoints, type Point, type TrackSegment } from './track';

export const TRACK_FLOOR = {
  background: { reflectance: 0.05, color: '#141414' },
  line: { reflectance: 0.95, color: '#f5f5f5' },
} as const;

/** Margem entre a linha e a borda da arena (m) — acima dos 0,2 m do Art. 4.11. */
export const ARENA_MARGIN = 0.3;

export type LineFollowerRobotInput = {
  id: string;
  name?: string;
  color?: string;
  radius: number;
  mass: number;
  maxLinearSpeed: number;
  maxAngularSpeed: number;
  sensors: unknown[];
  controller?: string;
};

const round = (v: number) => Math.round(v * 1e6) / 1e6;

/** Marcação lateral à direita da linha no arco-comprimento `s` (hipótese H-05). */
function sideMark(track: ReturnType<typeof trackFromPoints>, s: number) {
  const p = pointAt(track, s);
  const right = { x: Math.sin(p.heading), y: -Math.cos(p.heading) };
  return {
    type: 'rect',
    center: [round(p.x + right.x * MARK_OFFSET), round(p.y + right.y * MARK_OFFSET)],
    width: MARK_LENGTH,
    height: MARK_WIDTH,
    angle: round(p.heading),
    ...TRACK_FLOOR.line,
  };
}

export function createLineFollowerWorld(
  category: LineFollowerCategory,
  segments: readonly TrackSegment[],
  robot: LineFollowerRobotInput,
  options: { name?: string; seed?: number; dt?: number; timeLimit?: number } = {},
) {
  const raw = buildTrack({ x: 0, y: 0, theta: 0 }, segments);
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const points: Point[] = raw.map(([x, y]) => [round(x - cx), round(y - cy)]);
  const track = trackFromPoints(points);
  const start = pointAt(track, 0);
  return {
    version: 1,
    name: options.name ?? category.name,
    seed: options.seed ?? 1,
    dt: options.dt ?? 0.01,
    modality: category.modalityId,
    ...(options.timeLimit !== undefined
      ? { modalityOptions: { timeLimit: options.timeLimit } }
      : {}),
    arena: {
      width: round(Math.max(...xs) - Math.min(...xs) + 2 * ARENA_MARGIN),
      height: round(Math.max(...ys) - Math.min(...ys) + 2 * ARENA_MARGIN),
      walls: false,
    },
    floor: {
      ...TRACK_FLOOR.background,
      regions: [
        { type: 'line', points, width: LINE_WIDTH, ...TRACK_FLOOR.line },
        sideMark(track, 0),
        sideMark(track, track.length - FINISH_BEFORE_START),
      ],
    },
    obstacles: [],
    robots: [
      {
        id: robot.id,
        ...(robot.name ? { name: robot.name } : {}),
        ...(robot.color ? { color: robot.color } : {}),
        pose: { x: round(start.x), y: round(start.y), theta: round(start.heading) },
        radius: robot.radius,
        mass: robot.mass,
        maxLinearSpeed: robot.maxLinearSpeed,
        maxAngularSpeed: robot.maxAngularSpeed,
        ...(robot.controller ? { controller: robot.controller } : {}),
        sensors: robot.sensors,
      },
    ],
  };
}
