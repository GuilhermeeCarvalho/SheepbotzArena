/** Elo entre um robô e o programa externo, em lockstep (spec 009; plan D-02 e D-03). */
import type { OnTick, RobotApi, Simulation, SimulationState, World } from '../core/index';
import {
  endMessage,
  parseCommand,
  RESPONSE_TIMEOUT_MS,
  startMessage,
  tickMessage,
  TransportClosed,
  TransportTimeout,
  type RemoteCommand,
  type Transport,
} from './protocol';

export type RemoteLink = {
  readonly robotId: string;
  /** Controlador pronto para `createSimulation({ nativeControllers })`. */
  readonly onTick: OnTick;
  /** Mensagem da falha, se houver (o robô fica em "erro" no próximo tick). */
  readonly failure: string | null;
  start(world: World): void;
  /** Envia as leituras do próximo tick e espera o comando. */
  exchange(state: SimulationState): Promise<void>;
  end(state: SimulationState): void;
  close(): void;
};

export function createRemoteLink(
  robotId: string,
  transport: Transport,
  timeoutMs = RESPONSE_TIMEOUT_MS,
): RemoteLink {
  let command: RemoteCommand = { v: 0, w: 0 };
  let failure: string | null = null;

  const describe = (error: unknown, tick: number): string => {
    if (error instanceof TransportTimeout)
      return `controlador remoto não respondeu em ${timeoutMs} ms (tick ${tick})`;
    if (error instanceof TransportClosed)
      return `conexão com o controlador remoto foi encerrada (tick ${tick})`;
    return (error as Error).message;
  };

  return {
    robotId,
    get failure() {
      return failure;
    },
    onTick: (robot) => {
      if (failure !== null) throw new Error(failure);
      (robot as RobotApi).setSpeed(command.v, command.w);
    },
    start(world) {
      command = { v: 0, w: 0 };
      failure = null;
      transport.send(startMessage(world, robotId));
    },
    async exchange(state) {
      const robot = state.robots.find((r) => r.id === robotId);
      if (failure !== null || robot?.status !== 'ok' || state.match?.phase === 'finished') return;
      try {
        transport.send(tickMessage(state, robotId));
        command = parseCommand(await transport.receive(timeoutMs));
      } catch (error) {
        failure = describe(error, state.tick + 1);
      }
    },
    end(state) {
      try {
        transport.send(endMessage(state));
      } catch {
        // conexão já encerrada: nada a avisar
      }
    },
    close: () => transport.close(),
  };
}

/** Avança `ticks` esperando, a cada tick, a resposta de todos os robôs remotos (FR-003). */
export async function stepRemote(
  simulation: Simulation,
  links: readonly RemoteLink[],
  ticks: number,
): Promise<SimulationState> {
  let state = simulation.getState();
  for (let i = 0; i < ticks; i++) {
    if (state.match?.phase === 'finished') break;
    await Promise.all(links.map((link) => link.exchange(state)));
    state = simulation.step(1);
  }
  return state;
}
