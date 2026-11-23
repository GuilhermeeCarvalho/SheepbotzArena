/**
 * Gerador da arena oficial de Sumô (spec 004, US4; FR-007; research D-04).
 * Devolve o JSON do mundo (formato da feature 001), pronto para `validateWorld`.
 */
import type { SumoCategory } from './categories';

/** Refletância e cores do piso (research D-04). */
export const SUMO_FLOOR = {
  dohyo: { reflectance: 0.05, color: '#111111' },
  tawara: { reflectance: 0.95, color: '#f5f5f5' },
  shikiri: { reflectance: 0.3, color: '#7a4a2a' },
  outside: { reflectance: 0.55, color: '#c9ccd1' },
} as const;

/** Passo de tempo padrão das arenas de Sumô (s) — 100 Hz (research D-04). */
export const SUMO_DEFAULT_DT = 0.01;
/** Folga padrão entre o robô e a Shikiri-sen (m). */
export const DEFAULT_DISTANCE_BEHIND_LINE = 0.02;

export type SumoRobotInput = {
  id: string;
  name?: string;
  color?: string;
  side: 'left' | 'right';
  theta?: number;
  y?: number;
  distanceBehindLine?: number;
  radius: number;
  mass: number;
  maxLinearSpeed: number;
  maxAngularSpeed: number;
  sensors: unknown[];
  controller?: string;
};

export type SumoWorldOptions = { name?: string; seed?: number; dt?: number; roundTimeLimit?: number };

const round = (value: number) => Number(value.toFixed(6));

/** Pose de partida atrás da Shikiri-sen do lado escolhido, de frente para o centro. */
export function startPose(category: SumoCategory, robot: SumoRobotInput) {
  const sign = robot.side === 'left' ? -1 : 1;
  const behind = robot.distanceBehindLine ?? DEFAULT_DISTANCE_BEHIND_LINE;
  const x = sign * (category.shikiriOffset + category.shikiriWidth / 2 + behind + robot.radius);
  const theta = robot.theta ?? (robot.side === 'left' ? 0 : Math.PI);
  return { x: round(x), y: robot.y ?? 0, theta: round(theta) };
}

export function createSumoWorld(
  category: SumoCategory,
  robots: readonly [SumoRobotInput, SumoRobotInput],
  options: SumoWorldOptions = {},
) {
  const r = category.dohyoRadius;
  const shikiri = (sign: number) => ({
    type: 'rect',
    center: [round(sign * category.shikiriOffset), 0],
    width: category.shikiriWidth,
    height: category.shikiriLength,
    ...SUMO_FLOOR.shikiri,
  });
  return {
    version: 1,
    name: options.name ?? category.name,
    seed: options.seed ?? 1,
    dt: options.dt ?? SUMO_DEFAULT_DT,
    modality: category.modalityId,
    ...(options.roundTimeLimit !== undefined ? { modalityOptions: { roundTimeLimit: options.roundTimeLimit } } : {}),
    arena: { width: category.yochiSize, height: category.yochiSize, walls: false },
    floor: {
      ...SUMO_FLOOR.outside,
      regions: [
        { type: 'disc', center: [0, 0], radius: round(r), ...SUMO_FLOOR.dohyo },
        { type: 'ring', center: [0, 0], innerRadius: round(r - category.tawaraWidth), outerRadius: round(r), ...SUMO_FLOOR.tawara },
        shikiri(-1),
        shikiri(1),
      ],
    },
    obstacles: [],
    robots: robots.map((robot) => ({
      id: robot.id,
      ...(robot.name ? { name: robot.name } : {}),
      ...(robot.color ? { color: robot.color } : {}),
      pose: startPose(category, robot),
      radius: robot.radius,
      mass: robot.mass,
      maxLinearSpeed: robot.maxLinearSpeed,
      maxAngularSpeed: robot.maxAngularSpeed,
      ...(robot.controller ? { controller: robot.controller } : {}),
      sensors: robot.sensors,
    })),
  };
}
