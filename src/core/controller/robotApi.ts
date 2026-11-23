/** Objeto `robot` exposto ao controlador (contracts/controller-api.md; FR-018). */
import type { OdometryReading, SensorReading } from '../simulation/state';
import type { SensorSpec } from '../world/schema';

export type RobotApiContext = {
  readonly id: string;
  readonly sensors: readonly SensorSpec[];
  readings(): Readonly<Record<string, SensorReading>>;
  odometry(): OdometryReading;
  setCommand(v: number, w: number): void;
  random(): number;
  time(): number;
  log(message: string): void;
};

export type RobotApi = {
  readonly id: string;
  readLaser(id?: string): number[];
  readSonar(id?: string): number;
  readBumper(id?: string): boolean;
  readFloor(id?: string): number;
  readOdometry(): OdometryReading;
  readCamera(id?: string): CameraReading;
  setSpeed(v: number, w: number): void;
  random(): number;
  time(): number;
  log(message: unknown): void;
};

type SensorType = SensorSpec['type'];

/** Leitura da câmera de visão global (feature 008). */
export type CameraReading = {
  x: number;
  y: number;
  theta: number;
  ball: { x: number; y: number } | null;
};

const TYPE_LABEL: Record<SensorType, string> = {
  laser: 'laser',
  sonar: 'sonar',
  bumper: 'bumper',
  floor: 'sensor de piso',
  camera: 'câmera',
};

export function createRobotApi(ctx: RobotApiContext): RobotApi {
  const find = (type: SensorType, id?: string): string => {
    if (id === undefined) {
      const first = ctx.sensors.find((s) => s.type === type);
      if (!first) throw new Error(`O robô '${ctx.id}' não tem ${TYPE_LABEL[type]}`);
      return first.id;
    }
    const sensor = ctx.sensors.find((s) => s.id === id);
    if (!sensor) throw new Error(`O robô '${ctx.id}' não tem sensor '${id}'`);
    if (sensor.type !== type) {
      throw new Error(`O sensor '${id}' do robô '${ctx.id}' é do tipo ${sensor.type}, não ${type}`);
    }
    return sensor.id;
  };
  const read = (type: SensorType, id?: string): SensorReading => ctx.readings()[find(type, id)]!;

  return Object.freeze({
    id: ctx.id,
    readLaser: (id?: string) => [...(read('laser', id) as number[])],
    readSonar: (id?: string) => read('sonar', id) as number,
    readBumper: (id?: string) => read('bumper', id) as boolean,
    readFloor: (id?: string) => read('floor', id) as number,
    readOdometry: () => ({ ...ctx.odometry() }),
    readCamera: (id?: string): CameraReading => {
      const [x, y, theta, ballX, ballY] = read('camera', id) as number[];
      return {
        x: x!,
        y: y!,
        theta: theta!,
        ball: Number.isNaN(ballX) ? null : { x: ballX!, y: ballY! },
      };
    },
    setSpeed: (v: number, w: number) => {
      if (
        typeof v !== 'number' ||
        typeof w !== 'number' ||
        !Number.isFinite(v) ||
        !Number.isFinite(w)
      ) {
        throw new Error(
          `setSpeed(v, w) exige números finitos; recebido (${String(v)}, ${String(w)})`,
        );
      }
      ctx.setCommand(v, w);
    },
    random: () => ctx.random(),
    time: () => ctx.time(),
    log: (message: unknown) => ctx.log(String(message)),
  });
}
