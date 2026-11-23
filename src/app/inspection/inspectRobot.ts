/**
 * Modelo de exibição do painel de inspeção (spec 005, US1; FR-001): converte as leituras do
 * estado do núcleo em valores prontos para mostrar, sem lógica de simulação.
 */
import type { RobotSpec, SimulationState, World } from '../../core/index';

export const RECENT_LOGS = 5;
const WHITE_THRESHOLD = 0.5;
const HIT_EPSILON = 1e-9;

export type SensorView =
  | {
      kind: 'range';
      id: string;
      type: 'laser' | 'sonar';
      maxRange: number;
      readings: number[];
      hits: boolean[];
    }
  | { kind: 'floor'; id: string; value: number; white: boolean }
  | { kind: 'bumper'; id: string; pressed: boolean }
  | {
      kind: 'camera';
      id: string;
      x: number;
      y: number;
      thetaDeg: number;
      ball: { x: number; y: number } | null;
    };

export type RobotInspection = {
  id: string;
  name: string;
  color: string;
  status: SimulationState['robots'][number]['status'];
  error: { tick: number; message: string } | null;
  command: { v: number; w: number };
  odometry: { x: number; y: number; thetaDeg: number; distance: number };
  sensors: SensorView[];
  logs: { tick: number; message: string }[];
};

const toDegrees = (rad: number): number => Math.round((rad * 180) / Math.PI);
/** Leituras vindas de JSON trocam NaN por `null`; ambos significam "sem valor". */
const isMissing = (value: unknown): boolean =>
  value === null || value === undefined || Number.isNaN(value);

function sensorView(spec: RobotSpec['sensors'][number], reading: unknown): SensorView {
  switch (spec.type) {
    case 'laser':
    case 'sonar': {
      const readings = Array.isArray(reading) ? (reading as number[]) : [reading as number];
      return {
        kind: 'range',
        id: spec.id,
        type: spec.type,
        maxRange: spec.maxRange,
        readings,
        hits: readings.map((d) => d < spec.maxRange - HIT_EPSILON),
      };
    }
    case 'floor':
      return {
        kind: 'floor',
        id: spec.id,
        value: reading as number,
        white: (reading as number) > WHITE_THRESHOLD,
      };
    case 'bumper':
      return { kind: 'bumper', id: spec.id, pressed: reading === true };
    case 'camera': {
      const [x, y, theta, bx, by] = reading as (number | null)[];
      return {
        kind: 'camera',
        id: spec.id,
        x: x as number,
        y: y as number,
        thetaDeg: toDegrees(theta as number),
        ball: isMissing(bx) || isMissing(by) ? null : { x: bx as number, y: by as number },
      };
    }
  }
}

/** Leituras do robô `robotId` no estado exibido; `null` se o robô não existir. */
export function inspectRobot(
  world: World,
  state: SimulationState,
  robotId: string,
): RobotInspection | null {
  const index = world.robots.findIndex((r) => r.id === robotId);
  const robot = state.robots[index];
  if (index < 0 || !robot) return null;
  const spec = world.robots[index]!;
  return {
    id: spec.id,
    name: spec.name ?? spec.id,
    color: spec.color,
    status: robot.status,
    error: robot.error,
    command: { ...robot.command },
    odometry: {
      x: robot.odometry.x,
      y: robot.odometry.y,
      thetaDeg: toDegrees(robot.odometry.theta),
      distance: robot.odometry.distance,
    },
    sensors: spec.sensors.map((s) => sensorView(s, robot.sensors[s.id])),
    logs: robot.logs.slice(-RECENT_LOGS),
  };
}
