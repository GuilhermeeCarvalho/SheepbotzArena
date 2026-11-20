import type { MatchStatus } from '../modality/contract';

/** Pose 2D: posição em metros e orientação em radianos, normalizada para (−π, π]. */
export type Pose = { x: number; y: number; theta: number };

export type Command = { v: number; w: number };

export type OdometryReading = { x: number; y: number; theta: number; distance: number };

/** Leitura de um sensor: laser → lista; sonar e piso → número; bumper → booleano. */
export type SensorReading = number[] | number | boolean;

export type RobotStatus = 'ok' | 'error' | 'no-controller';

export type LogEntry = { tick: number; message: string };

export type RobotState = {
  id: string;
  pose: Pose;
  command: Command;
  odometry: OdometryReading;
  sensors: Record<string, SensorReading>;
  status: RobotStatus;
  error: { tick: number; message: string } | null;
  logs: LogEntry[];
};

/** Snapshot serializável do estado da simulação (contracts/simulation-api.md). */
export type SimulationState = {
  tick: number;
  time: number;
  match: MatchStatus | null;
  robots: RobotState[];
};

/** Congela profundamente um objeto (snapshots não podem ser alterados pelos consumidores). */
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}
