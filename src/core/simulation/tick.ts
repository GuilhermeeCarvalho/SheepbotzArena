/**
 * Estado interno da simulação e pipeline de um tick (plan 001, "Pipeline de um tick").
 * O estado interno é mutável por desempenho; para fora saem apenas snapshots (snapshot.ts).
 */
import { type CollisionDisc, findContacts, resolveCollisions } from '../collision/resolve';
import { buildStaticBodies, type StaticBody } from '../collision/staticBodies';
import { errorMessage, type OnTick } from '../controller/compile';
import { createRobotApi, type RobotApi } from '../controller/robotApi';
import { integrateArc, saturateCommand } from '../kinematics/diffDrive';
import { normalizeAngle } from '../math/angle';
import { localToWorld } from '../math/vec2';
import type { MatchStatus, Referee } from '../modality/contract';
import { createStream, type RandomStream } from '../random/prng';
import { isBumperPressed } from '../sensors/bumper';
import { readFloor } from '../sensors/floor';
import { advanceOdometry, initialOdometry } from '../sensors/odometry';
import type { RaycastScene } from '../sensors/raycast';
import { readRanges, readSonar } from '../sensors/rangefinder';
import type { RobotSpec, World } from '../world/schema';
import type {
  Command,
  LogEntry,
  OdometryReading,
  Pose,
  RobotStatus,
  SensorReading,
  SimulationState,
} from './state';

export const MAX_LOG_ENTRIES = 100;

export type RobotRuntime = {
  readonly spec: RobotSpec;
  readonly index: number;
  pose: Pose;
  command: Command;
  odometry: OdometryReading;
  readings: Record<string, SensorReading>;
  /** Direções de contato do último tick, no referencial do robô. */
  contacts: number[];
  status: RobotStatus;
  error: { tick: number; message: string } | null;
  logs: LogEntry[];
  onTick: OnTick | null;
  api: RobotApi;
  readonly controllerRng: RandomStream;
  readonly odometryRng: RandomStream;
  readonly sensorRngs: ReadonlyMap<string, RandomStream>;
};

export type SimulationRuntime = {
  readonly world: World;
  readonly bodies: readonly StaticBody[];
  tick: number;
  robots: RobotRuntime[];
  referee: Referee | null;
  match: MatchStatus | null;
};

export const simulationTime = (runtime: SimulationRuntime): number =>
  runtime.tick * runtime.world.dt;

/** Cria o estado inicial; `controllers` mapeia id do robô → `onTick` já compilado. */
export function createRuntime(
  world: World,
  controllers: ReadonlyMap<string, OnTick>,
  referee: Referee | null,
): SimulationRuntime {
  const runtime: SimulationRuntime = {
    world,
    bodies: buildStaticBodies(world),
    tick: 0,
    robots: [],
    referee,
    match: null,
  };
  runtime.robots = world.robots.map((spec, index) => {
    const onTick = controllers.get(spec.id) ?? null;
    const robot: RobotRuntime = {
      spec,
      index,
      pose: { ...spec.pose, theta: normalizeAngle(spec.pose.theta) },
      command: { v: 0, w: 0 },
      odometry: initialOdometry(),
      readings: {},
      contacts: [],
      status: onTick ? 'ok' : 'no-controller',
      error: null,
      logs: [],
      onTick,
      api: undefined as unknown as RobotApi,
      controllerRng: createStream(world.seed, `robot:${spec.id}:controller`),
      odometryRng: createStream(world.seed, `robot:${spec.id}:odometry`),
      sensorRngs: new Map(
        spec.sensors.map((s) => [
          s.id,
          createStream(world.seed, `robot:${spec.id}:sensor:${s.id}`),
        ]),
      ),
    };
    robot.api = createRobotApi({
      id: spec.id,
      sensors: spec.sensors,
      readings: () => robot.readings,
      odometry: () => robot.odometry,
      setCommand: (v, w) => {
        robot.command = saturateCommand({ v, w }, spec.maxLinearSpeed, spec.maxAngularSpeed);
      },
      random: () => robot.controllerRng.next(),
      time: () => simulationTime(runtime),
      log: (message) => {
        robot.logs.push({ tick: runtime.tick + 1, message });
        if (robot.logs.length > MAX_LOG_ENTRIES) robot.logs.shift();
      },
    });
    return robot;
  });
  updateReadings(runtime);
  return runtime;
}

/** Calcula as leituras de todos os sensores a partir do estado atual (passo 6). */
export function updateReadings(runtime: SimulationRuntime): void {
  const scene: RaycastScene = {
    bodies: runtime.bodies,
    robots: runtime.robots.map((r) => ({ x: r.pose.x, y: r.pose.y, radius: r.spec.radius })),
  };
  for (const robot of runtime.robots) {
    const readings: Record<string, SensorReading> = {};
    for (const sensor of robot.spec.sensors) {
      const rng = robot.sensorRngs.get(sensor.id)!;
      switch (sensor.type) {
        case 'laser':
          readings[sensor.id] = readRanges(sensor, robot.pose, scene, robot.index, rng);
          break;
        case 'sonar':
          readings[sensor.id] = readSonar(sensor, robot.pose, scene, robot.index, rng);
          break;
        case 'bumper':
          readings[sensor.id] = isBumperPressed(sensor, robot.contacts);
          break;
        case 'floor': {
          const point = localToWorld(robot.pose, { x: sensor.position[0], y: sensor.position[1] });
          readings[sensor.id] = readFloor(runtime.world.floor, point, sensor.noise, rng);
          break;
        }
      }
    }
    robot.readings = readings;
  }
}

/** Passo 2: chama os controladores, isolando erros por robô. */
function runControllers(runtime: SimulationRuntime): void {
  for (const robot of runtime.robots) {
    if (robot.status !== 'ok' || !robot.onTick) continue;
    try {
      robot.onTick(robot.api);
    } catch (error) {
      robot.status = 'error';
      robot.error = { tick: runtime.tick + 1, message: errorMessage(error) };
      robot.command = { v: 0, w: 0 };
    }
  }
}

/** Número de subpassos para que nenhum robô avance mais que metade do menor raio (D-04). */
export function substepCount(robots: readonly RobotRuntime[], dt: number): number {
  if (robots.length === 0) return 1;
  const maxDisplacement = Math.max(...robots.map((r) => Math.abs(r.command.v) * dt));
  const minRadius = Math.min(...robots.map((r) => r.spec.radius));
  return Math.max(1, Math.ceil(maxDisplacement / (minRadius / 2)));
}

/** Passos 3 e 4: movimento em subpassos com colisões; registra os contatos. */
function moveRobots(runtime: SimulationRuntime): void {
  const { dt } = runtime.world;
  const robots = runtime.robots;
  const n = substepCount(robots, dt);
  const h = dt / n;
  const contacts: number[][] = robots.map(() => []);
  for (let step = 0; step < n; step++) {
    const discs: CollisionDisc[] = robots.map((robot) => {
      // A posição anterior ao subpasso ajuda a escolher o lado de uma parede fina.
      const previous = { x: robot.pose.x, y: robot.pose.y };
      robot.pose = integrateArc(robot.pose, robot.command.v, robot.command.w, h);
      return {
        x: robot.pose.x,
        y: robot.pose.y,
        radius: robot.spec.radius,
        mass: robot.spec.mass,
        previous,
      };
    });
    resolveCollisions(discs, runtime.bodies);
    const stepContacts = findContacts(discs, runtime.bodies);
    discs.forEach((disc, i) => {
      const robot = robots[i]!;
      robot.pose = { x: disc.x, y: disc.y, theta: robot.pose.theta };
      contacts[i]!.push(
        ...stepContacts[i]!.map((angle) => normalizeAngle(angle - robot.pose.theta)),
      );
    });
  }
  robots.forEach((robot, i) => {
    robot.contacts = contacts[i]!;
  });
}

/** Avança um tick completo. Não faz nada se a partida já terminou. */
export function advanceTick(runtime: SimulationRuntime, snapshot: () => SimulationState): void {
  if (runtime.match?.phase === 'finished') return;
  runControllers(runtime);
  moveRobots(runtime);
  for (const robot of runtime.robots) {
    robot.odometry = advanceOdometry(
      robot.odometry,
      robot.command,
      runtime.world.dt,
      robot.spec.odometry.noise,
      robot.odometryRng,
    );
  }
  updateReadings(runtime);
  runtime.tick += 1;
  if (runtime.referee) runtime.match = runtime.referee.evaluate(snapshot());
}
