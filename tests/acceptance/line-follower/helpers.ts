// Utilitários dos testes do Seguidor de Linha (spec 006).
import { modalityRegistry } from 'src/modalities';
import {
  createLineFollowerWorld,
  LINE_FOLLOWER_CATEGORIES,
  type TrackSegment,
} from 'src/modalities/line-follower';
import { buildSimulation } from '../../helpers';

const PI = Math.PI;

/** Oval Júnior da spec: retas de 2,4 m, curvas de raio 0,4 m, partida no meio da reta inferior. */
export const OVAL: TrackSegment[] = [
  { straight: 1.2 },
  { arc: { radius: 0.4, angle: PI } },
  { straight: 2.4 },
  { arc: { radius: 0.4, angle: PI } },
  { straight: 1.2 },
];

export const ovalWorld = (options: { timeLimit?: number; radius?: number } = {}) =>
  createLineFollowerWorld(
    LINE_FOLLOWER_CATEGORIES.junior,
    OVAL,
    {
      id: 'r',
      radius: options.radius ?? 0.08,
      mass: 0.25,
      maxLinearSpeed: 1.34,
      maxAngularSpeed: 22,
      sensors: [],
    },
    { dt: 0.01, ...(options.timeLimit ? { timeLimit: options.timeLimit } : {}) },
  );

/**
 * Controlador roteirizado: percorre a oval a 0,5 m/s pelo tempo de cada trecho e, se
 * `stopAt` for informado, para depois de percorrer `stopAt` metros.
 */
export const scriptedOval = (stopAt: number | null) => `
  const V = 0.5, R = 0.4, ARCO = Math.PI * R / V;
  const FASES = [[2.4, 0], [ARCO, V / R], [4.8, 0], [ARCO, V / R], [1e9, 0]];
  const PARAR = ${stopAt === null ? 'Infinity' : stopAt / 0.5};
  function onTick(robot) {
    const t = robot.time();
    if (t >= PARAR) { robot.setSpeed(0, 0); return; }
    let inicio = 0;
    for (const [duracao, w] of FASES) {
      if (t < inicio + duracao) { robot.setSpeed(V, w); return; }
      inicio += duracao;
    }
  }`;

export const lineSimulation = (world: unknown, controller?: string) =>
  buildSimulation(world, controller ? { r: controller } : {}, modalityRegistry);

export function runAttempt(world: unknown, controller: string | undefined, maxTicks = 40_000) {
  const simulation = lineSimulation(world, controller);
  let state = simulation.getState();
  for (let i = 0; i < maxTicks && state.match?.phase !== 'finished'; i++) state = simulation.step();
  return state;
}
