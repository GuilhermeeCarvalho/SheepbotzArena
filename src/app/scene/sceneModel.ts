/**
 * Modelo de cena: converte mundo + estado do núcleo em descritores 3D, sem lógica de
 * simulação (contracts 002/scene-model.md; research D-02, D-03; FR-001 a FR-004).
 */
import {
  rayGeometry,
  type FloorRegionSpec,
  type RobotStatus,
  type SimulationState,
  type World,
} from '../../core/index';

export type Vec3 = [number, number, number];

export const OBSTACLE_HEIGHT = 0.15; // m (apenas visual)
export const WALL_HEIGHT = 0.2; // m (apenas visual)
export const WALL_THICKNESS = 0.04; // m (apenas visual)
export const OBSTACLE_WALL_THICKNESS = 0.03; // m (paredes de espessura zero na simulação)
export const FLOOR_LAYER_STEP = 0.001; // m entre camadas de regiões do piso
export const DEFAULT_OBSTACLE_COLOR = '#64748b';
const MAX_RANGE_EPSILON = 1e-9;

/** (x, y) da simulação → [x, altura, −y] no Three.js (research D-03). */
export const toScene = (x: number, y: number, height = 0): Vec3 => [x, height, -y];

/** Altura visual do corpo do robô. */
export const robotBodyHeight = (radius: number): number => Math.max(0.08, 0.6 * radius);

export type WallMesh = { id: string; position: Vec3; size: Vec3; rotationY: number };

export type FloorRegionMesh =
  | { kind: 'rect'; position: Vec3; width: number; depth: number; rotationY: number; color: string }
  | { kind: 'disc'; position: Vec3; radius: number; color: string }
  | { kind: 'ring'; position: Vec3; innerRadius: number; outerRadius: number; color: string }
  | {
      kind: 'line';
      segments: { position: Vec3; length: number; width: number; rotationY: number }[];
      color: string;
    };

export type ObstacleMesh =
  | { id: string; kind: 'box'; position: Vec3; size: Vec3; rotationY: number; color: string }
  | { id: string; kind: 'cylinder'; position: Vec3; radius: number; height: number; color: string }
  | { id: string; kind: 'wall'; position: Vec3; size: Vec3; rotationY: number; color: string };

export type RobotMesh = {
  id: string;
  name: string;
  color: string;
  position: Vec3;
  rotationY: number;
  radius: number;
  bodyHeight: number;
  status: RobotStatus;
  selected: boolean;
};

export type RayMesh = { robotId: string; sensorId: string; from: Vec3; to: Vec3; hit: boolean };

export type SceneModel = {
  arena: { width: number; depth: number; color: string; walls: WallMesh[] };
  floorRegions: FloorRegionMesh[];
  obstacles: ObstacleMesh[];
  robots: RobotMesh[];
  rays: RayMesh[];
  camera: { position: Vec3; target: Vec3 };
};

export type SceneOptions = { showRays?: boolean; selectedRobotId?: string | null };

const hex = (value: number): string => value.toString(16).padStart(2, '0');

/** Cinza proporcional à refletância (0 = preto, 1 = branco). */
export const reflectanceColor = (reflectance: number): string => {
  const level = hex(Math.round(255 * Math.min(1, Math.max(0, reflectance))));
  return `#${level}${level}${level}`;
};

function arenaWalls(world: World): WallMesh[] {
  if (!world.arena.walls) return [];
  const hw = world.arena.width / 2;
  const hh = world.arena.height / 2;
  const t = WALL_THICKNESS;
  const y = WALL_HEIGHT / 2;
  return [
    {
      id: 'arena:bottom',
      position: toScene(0, -hh - t / 2, y),
      size: [world.arena.width + 2 * t, WALL_HEIGHT, t],
      rotationY: 0,
    },
    {
      id: 'arena:top',
      position: toScene(0, hh + t / 2, y),
      size: [world.arena.width + 2 * t, WALL_HEIGHT, t],
      rotationY: 0,
    },
    {
      id: 'arena:left',
      position: toScene(-hw - t / 2, 0, y),
      size: [t, WALL_HEIGHT, world.arena.height],
      rotationY: 0,
    },
    {
      id: 'arena:right',
      position: toScene(hw + t / 2, 0, y),
      size: [t, WALL_HEIGHT, world.arena.height],
      rotationY: 0,
    },
  ];
}

function floorRegion(region: FloorRegionSpec, index: number): FloorRegionMesh {
  const layer = FLOOR_LAYER_STEP * (index + 1);
  const color = region.color ?? reflectanceColor(region.reflectance);
  switch (region.type) {
    case 'rect':
      return {
        kind: 'rect',
        position: toScene(region.center[0], region.center[1], layer),
        width: region.width,
        depth: region.height,
        rotationY: region.angle,
        color,
      };
    case 'disc':
      return {
        kind: 'disc',
        position: toScene(region.center[0], region.center[1], layer),
        radius: region.radius,
        color,
      };
    case 'ring':
      return {
        kind: 'ring',
        position: toScene(region.center[0], region.center[1], layer),
        innerRadius: region.innerRadius,
        outerRadius: region.outerRadius,
        color,
      };
    case 'line':
      return {
        kind: 'line',
        color,
        segments: region.points.slice(1).map(([bx, by], i) => {
          const [ax, ay] = region.points[i]!;
          return {
            position: toScene((ax + bx) / 2, (ay + by) / 2, layer),
            length: Math.hypot(bx - ax, by - ay),
            width: region.width,
            rotationY: Math.atan2(by - ay, bx - ax),
          };
        }),
      };
  }
}

function obstacle(o: World['obstacles'][number]): ObstacleMesh {
  const color = o.color ?? DEFAULT_OBSTACLE_COLOR;
  switch (o.type) {
    case 'box':
      return {
        id: o.id,
        kind: 'box',
        position: toScene(o.center[0], o.center[1], OBSTACLE_HEIGHT / 2),
        size: [o.width, OBSTACLE_HEIGHT, o.height],
        rotationY: o.angle,
        color,
      };
    case 'disc':
      return {
        id: o.id,
        kind: 'cylinder',
        position: toScene(o.center[0], o.center[1], OBSTACLE_HEIGHT / 2),
        radius: o.radius,
        height: OBSTACLE_HEIGHT,
        color,
      };
    case 'wall': {
      const [ax, ay] = o.from;
      const [bx, by] = o.to;
      return {
        id: o.id,
        kind: 'wall',
        position: toScene((ax + bx) / 2, (ay + by) / 2, WALL_HEIGHT / 2),
        size: [Math.hypot(bx - ax, by - ay), WALL_HEIGHT, OBSTACLE_WALL_THICKNESS],
        rotationY: Math.atan2(by - ay, bx - ax),
        color,
      };
    }
  }
}

function sensorRays(world: World, state: SimulationState): RayMesh[] {
  const rays: RayMesh[] = [];
  world.robots.forEach((spec, index) => {
    const robot = state.robots[index];
    if (!robot) return;
    const height = robotBodyHeight(spec.radius) * 0.8;
    for (const sensor of spec.sensors) {
      if (sensor.type !== 'laser' && sensor.type !== 'sonar') continue;
      const reading = robot.sensors[sensor.id];
      rayGeometry(sensor, robot.pose).forEach(({ origin, angle }, i) => {
        const distance = Array.isArray(reading)
          ? (reading[i] ?? sensor.maxRange)
          : (reading as number);
        rays.push({
          robotId: spec.id,
          sensorId: sensor.id,
          from: toScene(origin.x, origin.y, height),
          to: toScene(
            origin.x + distance * Math.cos(angle),
            origin.y + distance * Math.sin(angle),
            height,
          ),
          hit: distance < sensor.maxRange - MAX_RANGE_EPSILON,
        });
      });
    }
  });
  return rays;
}

/** Partes que só dependem do mundo (memorizáveis enquanto o mundo não muda). */
export type StaticScene = Pick<SceneModel, 'arena' | 'floorRegions' | 'obstacles' | 'camera'>;
/** Partes que mudam a cada tick. */
export type DynamicScene = Pick<SceneModel, 'robots' | 'rays'>;

export function buildStaticScene(world: World): StaticScene {
  const span = Math.max(world.arena.width, world.arena.height);
  return {
    arena: {
      width: world.arena.width,
      depth: world.arena.height,
      color: world.floor.color,
      walls: arenaWalls(world),
    },
    floorRegions: world.floor.regions.map(floorRegion),
    obstacles: world.obstacles.map(obstacle),
    camera: { position: [0, 0.7 * span, 0.7 * span], target: [0, 0, 0] },
  };
}

export function buildDynamicScene(
  world: World,
  state: SimulationState,
  options: SceneOptions = {},
): DynamicScene {
  const { showRays = true, selectedRobotId = null } = options;
  return {
    robots: world.robots.map((spec, index) => {
      const robot = state.robots[index]!;
      const bodyHeight = robotBodyHeight(spec.radius);
      return {
        id: spec.id,
        name: spec.name ?? spec.id,
        color: spec.color,
        position: toScene(robot.pose.x, robot.pose.y, bodyHeight / 2),
        rotationY: robot.pose.theta,
        radius: spec.radius,
        bodyHeight,
        status: robot.status,
        selected: spec.id === selectedRobotId,
      };
    }),
    rays: showRays ? sensorRays(world, state) : [],
  };
}

export const buildSceneModel = (
  world: World,
  state: SimulationState,
  options: SceneOptions = {},
): SceneModel => ({ ...buildStaticScene(world), ...buildDynamicScene(world, state, options) });
