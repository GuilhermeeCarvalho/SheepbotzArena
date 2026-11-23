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
import type { RemoteLink } from '../../remote/index';
import {
  appendFrame,
  createRecording,
  type ParsedRecording,
  type Recording,
} from '../recording/recording';

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
  /** Quadros de todos os ticks desde o tick 0 (spec 005, FR-002). */
  readonly recording: Recording;
  /** Quadro exibido no modo replay; `null` = ao vivo (spec 005, FR-003). */
  readonly replayIndex: number | null;
  /** `false` para gravações abertas de arquivo: não há simulação para continuar. */
  readonly liveAvailable: boolean;
  /** Robôs comandados por um programa externo (spec 009, US2). */
  readonly remotes: Readonly<Record<string, RemoteLink>>;
  /** Falha do controlador remoto que pausou a simulação (spec 009, US2-AC3). */
  readonly remoteError: string | null;
};

type Built =
  | { ok: true; world: World; simulation: Simulation }
  | { ok: false; worldIssues: ValidationIssue[]; controllerIssues: ControllerIssue[] };

function build(
  worldText: string,
  controllers: Record<string, string>,
  modalities: ModalityRegistry,
  remotes: Readonly<Record<string, RemoteLink>> = {},
): Built {
  const world = loadWorld(worldText, { modalities });
  if (!world.ok) return { ok: false, worldIssues: world.errors, controllerIssues: [] };
  const known = Object.fromEntries(
    Object.entries(controllers).filter(([id]) => world.value.robots.some((r) => r.id === id)),
  );
  const nativeControllers = Object.fromEntries(
    Object.values(remotes)
      .filter((link) => world.value.robots.some((r) => r.id === link.robotId))
      .map((link) => [link.robotId, link.onTick]),
  );
  const simulation = createSimulation(world.value, {
    controllers: known,
    nativeControllers,
    modalities,
  });
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
  remotes: {},
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
  recording: createRecording(built.simulation.getState()),
  replayIndex: null,
  liveAvailable: true,
  remoteError: null,
});

const closeRemotes = (session: SessionState): void =>
  Object.values(session.remotes).forEach((link) => link.close());

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
  closeRemotes(session);
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
  const built = build(session.worldText, controllers, modalities, session.remotes);
  if (!built.ok)
    return {
      ...session,
      running: false,
      worldIssues: built.worldIssues,
      controllerIssues: built.controllerIssues,
    };
  Object.values(session.remotes).forEach((link) => link.start(built.world));
  return fresh(
    { speed: session.speed, remotes: session.remotes },
    built,
    session.worldText,
    controllers,
    session.exampleId,
  );
}

/** Recria a simulação com outro conjunto de robôs remotos, no tick 0 (spec 009, US2). */
function withRemotes(
  session: SessionState,
  remotes: Record<string, RemoteLink>,
  modalities: ModalityRegistry,
): SessionState {
  const built = build(session.worldText, { ...session.controllers }, modalities, remotes);
  if (!built.ok) return session;
  Object.values(remotes).forEach((link) => link.start(built.world));
  return fresh(
    { speed: session.speed, remotes },
    built,
    session.worldText,
    { ...session.controllers },
    session.exampleId,
  );
}

/** Liga um robô ao programa externo e reinicia no tick 0 (US2-AC1). */
export function attachRemote(
  session: SessionState,
  link: RemoteLink,
  modalities: ModalityRegistry = modalityRegistry,
): SessionState {
  session.remotes[link.robotId]?.close();
  return withRemotes(session, { ...session.remotes, [link.robotId]: link }, modalities);
}

/** Desliga o robô remoto; ele volta ao controlador em JavaScript, no tick 0 (US2-AC4). */
export function detachRemote(
  session: SessionState,
  robotId: string,
  modalities: ModalityRegistry = modalityRegistry,
): SessionState {
  const link = session.remotes[robotId];
  if (!link) return session;
  link.close();
  const remotes = { ...session.remotes };
  delete remotes[robotId];
  return withRemotes(session, remotes, modalities);
}

export const hasRemotes = (session: SessionState): boolean =>
  Object.keys(session.remotes).length > 0;

/** Espera as respostas do próximo tick e o simula; pausa com a falha, se houver (US2-AC2/AC3). */
export async function advanceRemote(
  current: () => SessionState,
  ticks: number,
): Promise<SessionState> {
  let session = current();
  for (let i = 0; i < ticks; i++) {
    const links = Object.values(session.remotes);
    await Promise.all(links.map((link) => link.exchange(session.state)));
    session = current();
    session = session.running
      ? advance(session, 1)
      : { ...session, state: simulateTicks(session, 1) };
    const failure = links.find((link) => link.failure !== null)?.failure ?? null;
    if (failure !== null) return { ...session, running: false, remoteError: failure };
    if (!session.running) return session;
  }
  return session;
}

/** Estado exibido: o quadro do replay ou o estado ao vivo (spec 005, D-04). */
export const displayedState = (session: SessionState): SimulationState =>
  session.replayIndex === null ? session.state : session.recording.frames[session.replayIndex]!;

const lastFrame = (session: SessionState): number => session.recording.frames.length - 1;
const inReplay = (session: SessionState): boolean => session.replayIndex !== null;
const isFinished = (session: SessionState): boolean => session.state.match?.phase === 'finished';

export function play(session: SessionState): SessionState {
  if (session.running) return session;
  if (inReplay(session))
    return session.replayIndex! >= lastFrame(session) ? session : { ...session, running: true };
  return isFinished(session) || !session.liveAvailable ? session : { ...session, running: true };
}

export const pause = (session: SessionState): SessionState =>
  session.running ? { ...session, running: false } : session;

/** Simula um tick e o grava (ao vivo). */
function simulateTicks(session: SessionState, ticks: number): SimulationState {
  let state = session.state;
  for (let i = 0; i < ticks; i++) {
    const next = session.simulation.step(1);
    if (next.tick === state.tick) break; // partida encerrada: o núcleo não avança mais
    state = next;
    appendFrame(session.recording, state);
  }
  return state;
}

/** Avança um tick (ou um quadro no replay); disponível somente pausado (FR-005 da 002). */
export function stepOnce(session: SessionState): SessionState {
  if (session.running) return session;
  if (inReplay(session))
    return { ...session, replayIndex: Math.min(session.replayIndex! + 1, lastFrame(session)) };
  if (!session.liveAvailable) return session;
  return { ...session, state: simulateTicks(session, 1) };
}

/**
 * Avança `ticks` (laço de reprodução). Ao vivo, simula e grava cada tick (spec 005, D-02);
 * no replay, avança nos quadros gravados. Pausa ao fim da partida ou da gravação.
 */
export function advance(session: SessionState, ticks: number): SessionState {
  if (ticks <= 0) return session;
  if (inReplay(session)) {
    const replayIndex = Math.min(session.replayIndex! + ticks, lastFrame(session));
    return {
      ...session,
      replayIndex,
      running: session.running && replayIndex < lastFrame(session),
    };
  }
  const state = simulateTicks(session, ticks);
  return { ...session, state, running: session.running && state.match?.phase !== 'finished' };
}

/** Ao vivo: reinicia a simulação (gravação nova). No replay: volta ao quadro 0. */
export function reset(session: SessionState): SessionState {
  if (inReplay(session)) return { ...session, replayIndex: 0, running: false };
  const state = session.simulation.reset();
  Object.values(session.remotes).forEach((link) => link.start(session.world));
  return {
    ...session,
    state,
    running: false,
    remoteError: null,
    recording: createRecording(state),
  };
}

/** Vai ao quadro `index` da gravação, entrando no modo replay (spec 005, US2-AC1). */
export const seek = (session: SessionState, index: number): SessionState => ({
  ...session,
  running: false,
  replayIndex: Math.max(0, Math.min(Math.round(index), lastFrame(session))),
});

/** Sai do replay e volta ao último estado simulado (spec 005, US2-AC3). */
export const goLive = (session: SessionState): SessionState =>
  session.liveAvailable ? { ...session, replayIndex: null, running: false } : session;

/** Abre uma gravação de arquivo em modo replay, sem controladores (spec 005, US3-AC2). */
export function openRecording(
  session: SessionState,
  parsed: ParsedRecording,
  modalities: ModalityRegistry = modalityRegistry,
): SessionState {
  const built = build(parsed.worldText, {}, modalities);
  if (!built.ok) return session;
  closeRemotes(session);
  const opened = fresh({ speed: session.speed }, built, parsed.worldText, parsed.controllers, null);
  return {
    ...opened,
    controllers: parsed.controllers,
    recording: { frames: parsed.frames, truncated: false },
    replayIndex: 0,
    liveAvailable: false,
  };
}

export const setSpeed = (session: SessionState, speed: number): SessionState => ({
  ...session,
  speed,
});
