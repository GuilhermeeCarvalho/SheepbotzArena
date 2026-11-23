/**
 * Campo do Futebol Mini / VSS (spec 008; plan 008, D-06).
 * Fonte: docs/references/robocore/futebol.md (RoboCore, versão 3.0, 27/05/2025).
 */
export const SOCCER_MODALITY_ID = 'futebol-vss';
/** Comprimento e largura do campo (m) — Art. 2.1. */
export const FIELD_LENGTH = 1.5;
export const FIELD_WIDTH = 1.3;
/** Boca e profundidade do gol (m) — Art. 2.3. */
export const GOAL_WIDTH = 0.4;
export const GOAL_DEPTH = 0.1;
/** Cateto dos triângulos de canto (m) — Art. 2.1. */
export const CORNER = 0.07;
/** Raio do círculo central (m) — Art. 2.2. */
export const CENTER_CIRCLE_RADIUS = 0.2;
/** Área do gol: 15 cm à frente da linha por 70 cm (m) — Art. 2.4 (arco não modelado). */
export const GOAL_AREA_DEPTH = 0.15;
export const GOAL_AREA_WIDTH = 0.7;
/** Espessura das linhas brancas (m) — Art. 2.2. */
export const LINE_THICKNESS = 0.003;
/** Bola: diâmetro e massa — Art. 2.5. */
export const BALL_DIAMETER = 0.0427;
export const BALL_DIAMETER_TOLERANCE = 0.001;
export const BALL_MASS = 0.046;
/** Robô com uniforme: lado máximo (m) — Art. 3.2.1. */
export const MAX_ROBOT_SIZE = 0.08;
/** Robôs por time — Art. 3.1. */
export const MIN_TEAM_SIZE = 1;
export const MAX_TEAM_SIZE = 3;
/** Duração do período (s) — Art. 6 (H-01: um período por simulação). */
export const DEFAULT_TIME_LIMIT = 300;
/** Bola parada por este tempo fora das áreas → bola livre (s) — Art. 15. */
export const FREE_BALL_TIME = 5;
/** Bola "parada": deslocou menos que isto desde o início da contagem (m) — hipótese H-03. */
export const BALL_STILL_DISTANCE = 0.01;

export type Team = { name: string; robots: string[] };

const HL = FIELD_LENGTH / 2;
const HW = FIELD_WIDTH / 2;
const G = GOAL_WIDTH / 2;
const C = CORNER;

/** Paredes do campo como segmentos: laterais com aberturas dos gols, cantos e gols. */
export function fieldWalls() {
  const round = ([x, y]: [number, number]): [number, number] => [
    Math.round(x * 1e6) / 1e6,
    Math.round(y * 1e6) / 1e6,
  ];
  const wall = (id: string, from: [number, number], to: [number, number]) => ({
    id,
    type: 'wall',
    from: round(from),
    to: round(to),
    color: '#e9ecef',
  });
  return [
    wall('lateral-superior', [-HL + C, HW], [HL - C, HW]),
    wall('lateral-inferior', [-HL + C, -HW], [HL - C, -HW]),
    wall('canto-1', [-HL, HW - C], [-HL + C, HW]),
    wall('canto-2', [HL - C, HW], [HL, HW - C]),
    wall('canto-3', [HL, -HW + C], [HL - C, -HW]),
    wall('canto-4', [-HL + C, -HW], [-HL, -HW + C]),
    wall('fundo-esq-sup', [-HL, HW - C], [-HL, G]),
    wall('fundo-esq-inf', [-HL, -G], [-HL, -HW + C]),
    wall('fundo-dir-sup', [HL, HW - C], [HL, G]),
    wall('fundo-dir-inf', [HL, -G], [HL, -HW + C]),
    wall('gol-esq-fundo', [-HL - GOAL_DEPTH, -G], [-HL - GOAL_DEPTH, G]),
    wall('gol-esq-sup', [-HL, G], [-HL - GOAL_DEPTH, G]),
    wall('gol-esq-inf', [-HL, -G], [-HL - GOAL_DEPTH, -G]),
    wall('gol-dir-fundo', [HL + GOAL_DEPTH, -G], [HL + GOAL_DEPTH, G]),
    wall('gol-dir-sup', [HL, G], [HL + GOAL_DEPTH, G]),
    wall('gol-dir-inf', [HL, -G], [HL + GOAL_DEPTH, -G]),
  ];
}

/** Marcações brancas do piso: linha central, círculo central e áreas dos gols. */
export function fieldMarkings() {
  const white = { reflectance: 0.95, color: '#f1f3f5' };
  const line = (points: [number, number][]) => ({
    type: 'line',
    points,
    width: LINE_THICKNESS,
    ...white,
  });
  const area = (sign: number): [number, number][] => [
    [sign * HL, GOAL_AREA_WIDTH / 2],
    [sign * (HL - GOAL_AREA_DEPTH), GOAL_AREA_WIDTH / 2],
    [sign * (HL - GOAL_AREA_DEPTH), -GOAL_AREA_WIDTH / 2],
    [sign * HL, -GOAL_AREA_WIDTH / 2],
  ];
  return [
    line([
      [0, -HW],
      [0, HW],
    ]),
    {
      type: 'ring',
      center: [0, 0],
      innerRadius: CENTER_CIRCLE_RADIUS - LINE_THICKNESS / 2,
      outerRadius: CENTER_CIRCLE_RADIUS + LINE_THICKNESS / 2,
      ...white,
    },
    line(area(-1)),
    line(area(1)),
  ];
}

/** Indica se a bola está dentro de uma das áreas de gol (H-03). */
export const isInGoalArea = (x: number, y: number): boolean =>
  Math.abs(x) >= HL - GOAL_AREA_DEPTH && Math.abs(x) <= HL && Math.abs(y) <= GOAL_AREA_WIDTH / 2;

/** Lado do gol que a bola cruzou inteira (Art. 8.1): −1 esquerdo, +1 direito, 0 nenhum. */
export function goalCrossed(x: number, y: number, radius: number): -1 | 0 | 1 {
  if (Math.abs(y) > G) return 0;
  if (x > HL + radius) return 1;
  if (x < -HL - radius) return -1;
  return 0;
}

export type SoccerRobotInput = {
  id: string;
  name?: string;
  color?: string;
  pose: { x: number; y: number; theta: number };
  controller?: string;
  /** Montagem própria do robô (ex.: outro motor), sobre o modelo comum. */
  model?: Partial<SoccerRobotModel>;
};

export type SoccerRobotModel = {
  radius: number;
  mass: number;
  maxLinearSpeed: number;
  maxAngularSpeed: number;
  sensors: unknown[];
};

export function createSoccerWorld(
  teams: [
    { name: string; robots: SoccerRobotInput[] },
    { name: string; robots: SoccerRobotInput[] },
  ],
  model: SoccerRobotModel,
  options: { name?: string; seed?: number; dt?: number; timeLimit?: number } = {},
) {
  return {
    version: 1,
    name: options.name ?? 'Futebol Mini / VSS',
    seed: options.seed ?? 1,
    dt: options.dt ?? 0.01,
    modality: SOCCER_MODALITY_ID,
    modalityOptions: {
      teams: teams.map((t) => ({ name: t.name, robots: t.robots.map((r) => r.id) })),
      ...(options.timeLimit !== undefined ? { timeLimit: options.timeLimit } : {}),
    },
    arena: { width: FIELD_LENGTH + 2 * GOAL_DEPTH + 0.1, height: FIELD_WIDTH + 0.1, walls: false },
    floor: { reflectance: 0.05, color: '#101010', regions: fieldMarkings() },
    obstacles: fieldWalls(),
    balls: [
      {
        id: 'bola',
        position: [0, 0],
        radius: BALL_DIAMETER / 2,
        mass: BALL_MASS,
        color: '#ff7a1a',
      },
    ],
    robots: teams.flatMap((team) =>
      team.robots.map((robot) => ({
        id: robot.id,
        ...(robot.name ? { name: robot.name } : {}),
        ...(robot.color ? { color: robot.color } : {}),
        pose: robot.pose,
        ...model,
        ...robot.model,
        ...(robot.controller ? { controller: robot.controller } : {}),
      })),
    ),
  };
}
