/** Gerador de campos de Trekking (spec 007, US3; FR-006). */
import { MARK_SIZE, type MarkCenter } from './parameters';

export const TREKKING_FLOOR = {
  ground: { reflectance: 0.3, color: '#7d8471' },
  mark: { reflectance: 0.7, color: '#f2c200' },
} as const;

export type TrekkingRobotInput = {
  id: string;
  name?: string;
  color?: string;
  theta?: number;
  radius: number;
  mass: number;
  maxLinearSpeed: number;
  maxAngularSpeed: number;
  odometryNoise?: number;
  sensors: unknown[];
  controller?: string;
};

export function createTrekkingWorld(
  field: { width: number; height: number },
  marks: readonly [MarkCenter, MarkCenter, MarkCenter, MarkCenter],
  obstacles: unknown[],
  robot: TrekkingRobotInput,
  options: { name?: string; seed?: number; dt?: number; timeLimit?: number } = {},
) {
  return {
    version: 1,
    name: options.name ?? 'Trekking',
    seed: options.seed ?? 1,
    dt: options.dt ?? 0.05,
    modality: 'trekking',
    modalityOptions: {
      marks: marks.map((m) => [...m]),
      ...(options.timeLimit !== undefined ? { timeLimit: options.timeLimit } : {}),
    },
    arena: { width: field.width, height: field.height, walls: false },
    floor: {
      ...TREKKING_FLOOR.ground,
      regions: marks.map(([x, y]) => ({
        type: 'rect',
        center: [x, y],
        width: MARK_SIZE,
        height: MARK_SIZE,
        ...TREKKING_FLOOR.mark,
      })),
    },
    obstacles,
    robots: [
      {
        id: robot.id,
        ...(robot.name ? { name: robot.name } : {}),
        ...(robot.color ? { color: robot.color } : {}),
        pose: { x: marks[0][0], y: marks[0][1], theta: robot.theta ?? 0 },
        radius: robot.radius,
        mass: robot.mass,
        maxLinearSpeed: robot.maxLinearSpeed,
        maxAngularSpeed: robot.maxAngularSpeed,
        ...(robot.odometryNoise ? { odometry: { noise: robot.odometryNoise } } : {}),
        ...(robot.controller ? { controller: robot.controller } : {}),
        sensors: robot.sensors,
      },
    ],
  };
}
