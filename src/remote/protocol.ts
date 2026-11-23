/**
 * Mensagens do controlador remoto (spec 009; contracts/protocol.md).
 * Sem DOM nem `node:*`: usado pela interface e pela linha de comando.
 */
import type { MatchStatus, SimulationState, World } from '../core/index';

/** Tempo máximo de espera pela resposta de cada tick (FR-004). */
export const RESPONSE_TIMEOUT_MS = 2000;

/** Canal de texto com o programa externo (plan D-04). */
export type Transport = {
  send(text: string): void;
  /** Próxima mensagem; rejeita com `TransportTimeout` ou `TransportClosed`. */
  receive(timeoutMs: number): Promise<string>;
  close(): void;
};

export class TransportTimeout extends Error {}
export class TransportClosed extends Error {}

export type RemoteCommand = { v: number; w: number };

export function startMessage(world: World, robotId: string): string {
  const robot = world.robots.find((r) => r.id === robotId);
  return JSON.stringify({
    type: 'start',
    robot: robotId,
    dt: world.dt,
    sensors: (robot?.sensors ?? []).map((s) => ({ id: s.id, type: s.type })),
  });
}

/** Leituras que a API em JavaScript entregaria no tick seguinte a `state` (plan D-02). */
export function tickMessage(state: SimulationState, robotId: string): string {
  const robot = state.robots.find((r) => r.id === robotId);
  return JSON.stringify({
    type: 'tick',
    tick: state.tick + 1,
    time: state.time,
    sensors: robot?.sensors ?? {},
    odometry: robot?.odometry ?? null,
  });
}

export function endMessage(state: SimulationState): string {
  const match: MatchStatus | null = state.match;
  return JSON.stringify({ type: 'end', tick: state.tick, match });
}

const FORMAT_HINT = 'resposta do controlador remoto deve ser { "v": número, "w": número }';

/** Valida a resposta `{ v, w }`; lança `Error` com a mensagem do contrato. */
export function parseCommand(text: string): RemoteCommand {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(
      `resposta do controlador remoto não é JSON válido: ${(error as Error).message}`,
      { cause: error },
    );
  }
  const { v, w } = (data ?? {}) as { v?: unknown; w?: unknown };
  if (typeof v !== 'number' || typeof w !== 'number' || !Number.isFinite(v + w)) {
    throw new Error(FORMAT_HINT);
  }
  return { v, w };
}
