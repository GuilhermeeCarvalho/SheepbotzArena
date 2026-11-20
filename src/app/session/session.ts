/**
 * Sessão de simulação: transições puras e imutáveis sobre o núcleo
 * (contracts 002/playback.md; research D-05; FR-005 a FR-011).
 */
import {
  createSimulation,
  loadWorld,
  type ControllerIssue,
  type ModalityRegistry,
  type Simulation,
  type SimulationState,
  type ValidationIssue,
  type World,
} from '../../core/index';
import { modalityRegistry } from '../../modalities/index';

export type SessionState = {
  readonly exampleId: string | null;
  readonly worldText: string;
  readonly world: World;
  readonly controllers: Readonly<Record<string, string>>;
  readonly simulation: Simulation;
  readonly state: SimulationState;
  readonly running: boolean;
  readonly speed: number;
  readonly worldIssues: ValidationIssue[];
  readonly controllerIssues: ControllerIssue[];
};

type Built =
  | { ok: true; world: World; simulation: Simulation }
  | { ok: false; worldIssues: ValidationIssue[]; controllerIssues: ControllerIssue[] };

function build(
  worldText: string,
  controllers: Record<string, string>,
  modalities: ModalityRegistry,
): Built {
  const world = loadWorld(worldText, { modalities });
  if (!world.ok) return { ok: false, worldIssues: world.errors, controllerIssues: [] };
  const known = Object.fromEntries(
    Object.entries(controllers).filter(([id]) => world.value.robots.some((r) => r.id === id)),
  );
  const simulation = createSimulation(world.value, { controllers: known, modalities });
  if (!simulation.ok) return { ok: false, worldIssues: [], controllerIssues: simulation.errors };
  return { ok: true, world: world.value, simulation: simulation.value };
}

const fresh = (
  base: Partial<SessionState>,
  built: Extract<Built, { ok: true }>,
  worldText: string,
  controllers: Record<string, string>,
  exampleId: string | null,
): SessionState => ({
  speed: 1,
  ...base,
  exampleId,
  worldText,
  world: built.world,
  controllers: Object.fromEntries(
    Object.entries(controllers).filter(([id]) => built.world.robots.some((r) => r.id === id)),
  ),
  simulation: built.simulation,
  state: built.simulation.getState(),
  running: false,
  worldIssues: [],
  controllerIssues: [],
});

/** Cria a sessão inicial; lança erro se o mundo ou os controladores forem inválidos. */
export function createSession(
  worldText: string,
  controllers: Record<string, string>,
  exampleId: string | null = null,
  modalities: ModalityRegistry = modalityRegistry,
): SessionState {
  const built = build(worldText, controllers, modalities);
  if (!built.ok) {
    const messages = [
      ...built.worldIssues.map((i) => `${i.path}: ${i.message}`),
      ...built.controllerIssues.map((i) => i.message),
    ];
    throw new Error(`Sessão inválida:\n${messages.join('\n')}`);
  }
  return fresh({}, built, worldText, controllers, exampleId);
}

/** Aplica um novo mundo; se inválido, mantém a sessão e registra os erros (FR-010). */
export function applyWorld(
  session: SessionState,
  worldText: string,
  controllers: Record<string, string> = { ...session.controllers },
  exampleId: string | null = null,
  modalities: ModalityRegistry = modalityRegistry,
): SessionState {
  const built = build(worldText, controllers, modalities);
  if (!built.ok)
    return {
      ...session,
      running: false,
      worldIssues: built.worldIssues,
      controllerIssues: built.controllerIssues,
    };
  return fresh({ speed: session.speed }, built, worldText, controllers, exampleId);
}

/** Aplica o controlador de um robô e reinicia no tick 0; se inválido, mantém a sessão (FR-011). */
export function applyController(
  session: SessionState,
  robotId: string,
  source: string,
  modalities: ModalityRegistry = modalityRegistry,
): SessionState {
  const controllers = { ...session.controllers, [robotId]: source };
  const built = build(session.worldText, controllers, modalities);
  if (!built.ok)
    return {
      ...session,
      running: false,
      worldIssues: built.worldIssues,
      controllerIssues: built.controllerIssues,
    };
  return fresh({ speed: session.speed }, built, session.worldText, controllers, session.exampleId);
}

const isFinished = (session: SessionState): boolean => session.state.match?.phase === 'finished';

export const play = (session: SessionState): SessionState =>
  isFinished(session) || session.running ? session : { ...session, running: true };

export const pause = (session: SessionState): SessionState =>
  session.running ? { ...session, running: false } : session;

/** Avança um tick; disponível somente pausado (FR-005). */
export const stepOnce = (session: SessionState): SessionState =>
  session.running ? session : { ...session, state: session.simulation.step(1) };

/** Avança `ticks` (usado pelo laço de reprodução); pausa ao fim da partida (FR-008). */
export function advance(session: SessionState, ticks: number): SessionState {
  if (ticks <= 0) return session;
  const state = session.simulation.step(ticks);
  return { ...session, state, running: session.running && state.match?.phase !== 'finished' };
}

export const reset = (session: SessionState): SessionState => ({
  ...session,
  state: session.simulation.reset(),
  running: false,
});

export const setSpeed = (session: SessionState, speed: number): SessionState => ({
  ...session,
  speed,
});
