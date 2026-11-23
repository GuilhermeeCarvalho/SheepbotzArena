/**
 * Gravação de simulações: quadros (estados do núcleo) e formato de arquivo
 * (spec 005, US2 e US3; plan 005, D-01, D-03, D-05).
 */
import {
  loadWorld,
  type ModalityRegistry,
  type SimulationState,
  type World,
} from '../../core/index';

/** Limite de quadros em memória (5 min a 100 Hz) — plan 005, D-03. */
export const MAX_FRAMES = 30_000;
export const RECORDING_FORMAT = 'sheepbotz-recording';
export const RECORDING_VERSION = 1;

/**
 * Quadros gravados. O vetor só cresce (por desempenho é anexado no lugar); uma gravação nova
 * é criada a cada simulação nova.
 */
export type Recording = { readonly frames: SimulationState[]; truncated: boolean };

export const createRecording = (first: SimulationState): Recording => ({
  frames: [first],
  truncated: false,
});

/** Anexa um quadro; ao atingir o limite, marca a gravação como truncada. */
export function appendFrame(recording: Recording, state: SimulationState): void {
  if (recording.frames.length >= MAX_FRAMES) {
    recording.truncated = true;
    return;
  }
  recording.frames.push(state);
}

export type RecordingFile = {
  format: typeof RECORDING_FORMAT;
  version: typeof RECORDING_VERSION;
  worldText: string;
  controllers: Record<string, string>;
  frames: SimulationState[];
};

export const serializeRecording = (
  worldText: string,
  controllers: Readonly<Record<string, string>>,
  recording: Recording,
): string =>
  JSON.stringify({
    format: RECORDING_FORMAT,
    version: RECORDING_VERSION,
    worldText,
    controllers,
    frames: recording.frames,
  } satisfies RecordingFile);

export type ParsedRecording = {
  worldText: string;
  world: World;
  controllers: Record<string, string>;
  frames: SimulationState[];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Lê e valida um arquivo de gravação (spec 005, US3-AC3). */
export function parseRecording(
  text: string,
  modalities: ModalityRegistry,
): { ok: true; value: ParsedRecording } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido.' };
  }
  if (!isObject(data) || data.format !== RECORDING_FORMAT) {
    return { ok: false, error: 'O arquivo não é uma gravação do SheepBotz Arena.' };
  }
  if (data.version !== RECORDING_VERSION) {
    return {
      ok: false,
      error: `Versão de gravação não suportada: ${String(data.version)}; use ${RECORDING_VERSION}.`,
    };
  }
  if (
    typeof data.worldText !== 'string' ||
    !Array.isArray(data.frames) ||
    data.frames.length === 0
  ) {
    return { ok: false, error: 'A gravação não tem o mundo ou os quadros.' };
  }
  const world = loadWorld(data.worldText, { modalities });
  if (!world.ok) {
    return {
      ok: false,
      error: `O mundo da gravação é inválido: ${world.errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`,
    };
  }
  const robotCount = world.value.robots.length;
  const framesOk = data.frames.every(
    (f: unknown) =>
      isObject(f) &&
      typeof f.tick === 'number' &&
      Array.isArray(f.robots) &&
      f.robots.length === robotCount,
  );
  if (!framesOk) return { ok: false, error: 'Os quadros da gravação não correspondem ao mundo.' };
  const controllers = isObject(data.controllers)
    ? (Object.fromEntries(
        Object.entries(data.controllers).filter(([, v]) => typeof v === 'string'),
      ) as Record<string, string>)
    : {};
  return {
    ok: true,
    value: {
      worldText: data.worldText,
      world: world.value,
      controllers,
      frames: data.frames as SimulationState[],
    },
  };
}
