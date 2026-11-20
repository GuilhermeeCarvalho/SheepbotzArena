/**
 * Esquema do arquivo de mundo, versão 1 (contracts/world-file.md; research D-10).
 * Os tipos do domínio são inferidos deste esquema, já com os valores padrão aplicados.
 */
import { z } from 'zod';
import type { IssueCode } from './issues';

export const DEFAULT_DT = 0.05; // s (FR-004)
export const MAX_DT = 0.1; // s (FR-004)
export const DEFAULT_SEED = 1; // FR-004
export const DEFAULT_MAX_LINEAR_SPEED = 1.0; // m/s (FR-006)
export const DEFAULT_MAX_ANGULAR_SPEED = 2 * Math.PI; // rad/s (FR-006)
export const DEFAULT_FLOOR_REFLECTANCE = 0.5;
export const DEFAULT_FLOOR_COLOR = '#808080';
export const DEFAULT_ROBOT_COLOR = '#1e88e5';
export const MAX_RAYS = 360;
const TWO_PI = 2 * Math.PI;

const withCode = (code: IssueCode, message: string) => ({ error: message, params: { code } });

const positive = z.number().positive();
const nonNegative = z.number().min(0);
const unit = z.number().min(0).max(1);
const point = z.tuple([z.number(), z.number()]);
const color = z
  .string()
  .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, { error: 'cor inválida; use o formato #rgb ou #rrggbb' });
const identifier = z
  .string()
  .regex(/^[A-Za-z0-9_-]+$/, { error: 'identificador inválido; use letras, números, "_" ou "-"' });

// ---- Piso ----------------------------------------------------------------

const regionBase = { reflectance: unit, color: color.optional() };

const rectRegion = z.strictObject({
  type: z.literal('rect'),
  center: point,
  width: positive,
  height: positive,
  angle: z.number().default(0),
  ...regionBase,
});
const discRegion = z.strictObject({
  type: z.literal('disc'),
  center: point,
  radius: positive,
  ...regionBase,
});
const ringRegion = z
  .strictObject({
    type: z.literal('ring'),
    center: point,
    innerRadius: nonNegative,
    outerRadius: positive,
    ...regionBase,
  })
  .refine(
    (r) => r.innerRadius < r.outerRadius,
    withCode('INVALID_GEOMETRY', 'o raio interno do anel deve ser menor que o externo'),
  );
const lineRegion = z
  .strictObject({ type: z.literal('line'), points: z.array(point), width: positive, ...regionBase })
  .refine(
    (r) => r.points.length >= 2,
    withCode('INVALID_GEOMETRY', 'a linha precisa de pelo menos 2 pontos'),
  );

const floorRegion = z.discriminatedUnion('type', [rectRegion, discRegion, ringRegion, lineRegion]);

const floor = z.strictObject({
  reflectance: unit.default(DEFAULT_FLOOR_REFLECTANCE),
  color: color.default(DEFAULT_FLOOR_COLOR),
  regions: z.array(floorRegion).default([]),
});

// ---- Obstáculos ------------------------------------------------------------

const wallObstacle = z
  .strictObject({
    id: identifier,
    type: z.literal('wall'),
    from: point,
    to: point,
    color: color.optional(),
  })
  .refine(
    (w) => w.from[0] !== w.to[0] || w.from[1] !== w.to[1],
    withCode('INVALID_GEOMETRY', 'a parede precisa ter comprimento maior que 0'),
  );
const boxObstacle = z.strictObject({
  id: identifier,
  type: z.literal('box'),
  center: point,
  width: positive,
  height: positive,
  angle: z.number().default(0),
  color: color.optional(),
});
const discObstacle = z.strictObject({
  id: identifier,
  type: z.literal('disc'),
  center: point,
  radius: positive,
  color: color.optional(),
});

const obstacle = z.discriminatedUnion('type', [wallObstacle, boxObstacle, discObstacle]);

// ---- Sensores --------------------------------------------------------------

const rangeFields = {
  id: identifier,
  position: point.default([0, 0]),
  angle: z.number().default(0),
  rays: z.number().int().min(1).max(MAX_RAYS),
  fov: z.number().positive().max(TWO_PI),
  maxRange: positive,
  noise: nonNegative.default(0),
};

const laserSensor = z.strictObject({ type: z.literal('laser'), ...rangeFields });
const sonarSensor = z.strictObject({ type: z.literal('sonar'), ...rangeFields });
const bumperSensor = z
  .strictObject({ id: identifier, type: z.literal('bumper'), from: z.number(), to: z.number() })
  .refine(
    (b) => b.to - b.from > 0 && b.to - b.from <= TWO_PI + 1e-12,
    withCode(
      'OUT_OF_RANGE',
      'o setor do bumper deve ter "to" maior que "from" e no máximo 2π de abertura',
    ),
  );
const floorSensor = z.strictObject({
  id: identifier,
  type: z.literal('floor'),
  position: point,
  noise: nonNegative.default(0),
});

const sensor = z.discriminatedUnion('type', [laserSensor, sonarSensor, bumperSensor, floorSensor]);

// ---- Robôs -----------------------------------------------------------------

const pose = z.strictObject({ x: z.number(), y: z.number(), theta: z.number() });

const robot = z.strictObject({
  id: identifier,
  name: z.string().min(1).optional(),
  color: color.default(DEFAULT_ROBOT_COLOR),
  pose,
  radius: positive,
  mass: positive.default(1),
  maxLinearSpeed: positive.default(DEFAULT_MAX_LINEAR_SPEED),
  maxAngularSpeed: positive.default(DEFAULT_MAX_ANGULAR_SPEED),
  controller: z.string().min(1).optional(),
  odometry: z.strictObject({ noise: nonNegative.default(0) }).default({ noise: 0 }),
  sensors: z.array(sensor).default([]),
});

// ---- Mundo -----------------------------------------------------------------

export const worldSchema = z.strictObject({
  version: z
    .number()
    .refine(
      (v) => v === 1,
      withCode('UNSUPPORTED_VERSION', 'versão de formato não suportada; use 1'),
    ),
  name: z.string().min(1).default('Mundo sem nome'),
  seed: z.number().int().min(0).max(4294967295).default(DEFAULT_SEED),
  dt: z.number().positive().max(MAX_DT).default(DEFAULT_DT),
  modality: z.string().min(1).optional(),
  modalityOptions: z.record(z.string(), z.unknown()).optional(),
  arena: z.strictObject({ width: positive, height: positive, walls: z.boolean().default(false) }),
  floor: floor.default({
    reflectance: DEFAULT_FLOOR_REFLECTANCE,
    color: DEFAULT_FLOOR_COLOR,
    regions: [],
  }),
  obstacles: z.array(obstacle).default([]),
  robots: z.array(robot).default([]),
});

export type World = z.infer<typeof worldSchema>;
export type RobotSpec = World['robots'][number];
export type SensorSpec = RobotSpec['sensors'][number];
export type LaserSpec = Extract<SensorSpec, { type: 'laser' }>;
export type SonarSpec = Extract<SensorSpec, { type: 'sonar' }>;
export type RangeSensorSpec = LaserSpec | SonarSpec;
export type BumperSpec = Extract<SensorSpec, { type: 'bumper' }>;
export type FloorSensorSpec = Extract<SensorSpec, { type: 'floor' }>;
export type ObstacleSpec = World['obstacles'][number];
export type FloorRegionSpec = World['floor']['regions'][number];
export type Point = [number, number];

/** Nomes amigáveis dos elementos com `type`, para mensagens de tipo desconhecido. */
export const ELEMENT_KIND_BY_COLLECTION: Record<string, string> = {
  sensors: 'sensor',
  obstacles: 'obstáculo',
  regions: 'região do piso',
};
