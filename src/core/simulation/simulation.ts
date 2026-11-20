/** API programática da simulação (contracts/simulation-api.md; FR-021, FR-024). */
import { compileController, type ControllerIssue, type OnTick } from '../controller/compile';
import { EMPTY_REGISTRY, type ModalityRegistry } from '../modality/contract';
import type { Result } from '../world/loadWorld';
import type { World } from '../world/schema';
import { deepFreeze, type SimulationState } from './state';
import { advanceTick, createRuntime, simulationTime, type SimulationRuntime } from './tick';

export type SimulationOptions = {
  /** id do robô → código-fonte do controlador. Robôs ausentes ficam "no-controller". */
  controllers?: Readonly<Record<string, string>>;
  modalities?: ModalityRegistry;
};

export interface Simulation {
  readonly world: World;
  /** Avança `ticks` (padrão 1) e devolve o estado. */
  step(ticks?: number): SimulationState;
  getState(): SimulationState;
  /** Volta ao estado inicial, reavaliando os controladores e reiniciando os fluxos aleatórios. */
  reset(): SimulationState;
}

/** Copia o estado interno para um snapshot congelado e serializável. */
export function snapshotOf(runtime: SimulationRuntime): SimulationState {
  return deepFreeze({
    tick: runtime.tick,
    time: simulationTime(runtime),
    match: runtime.match ? structuredClone(runtime.match) : null,
    robots: runtime.robots.map((robot) => ({
      id: robot.spec.id,
      pose: { ...robot.pose },
      command: { ...robot.command },
      odometry: { ...robot.odometry },
      sensors: Object.fromEntries(
        Object.entries(robot.readings).map(([id, value]) => [
          id,
          Array.isArray(value) ? [...value] : value,
        ]),
      ),
      status: robot.status,
      error: robot.error ? { ...robot.error } : null,
      logs: robot.logs.map((entry) => ({ ...entry })),
    })),
  });
}

function compileAll(
  world: World,
  sources: Readonly<Record<string, string>>,
): { ok: true; value: Map<string, OnTick> } | { ok: false; errors: ControllerIssue[] } {
  const compiled = new Map<string, OnTick>();
  const errors: ControllerIssue[] = [];
  for (const robot of world.robots) {
    const source = sources[robot.id];
    if (source === undefined) continue;
    const result = compileController(robot.id, source);
    if (result.ok) compiled.set(robot.id, result.onTick);
    else errors.push(result.issue);
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: compiled };
}

export function createSimulation(
  world: World,
  options: SimulationOptions = {},
): Result<Simulation, ControllerIssue> {
  const sources = options.controllers ?? {};
  const modalities = options.modalities ?? EMPTY_REGISTRY;
  const modality = world.modality !== undefined ? modalities.get(world.modality) : undefined;
  if (world.modality !== undefined && modality === undefined) {
    throw new Error(
      `Modalidade '${world.modality}' não registrada; valide o mundo com o mesmo registro`,
    );
  }

  const first = compileAll(world, sources);
  if (!first.ok) return first;

  const build = (controllers: Map<string, OnTick>): SimulationRuntime => {
    const runtime = createRuntime(
      world,
      controllers,
      modality ? modality.createReferee(world) : null,
    );
    if (runtime.referee) runtime.match = runtime.referee.evaluate(snapshotOf(runtime));
    return runtime;
  };

  let runtime = build(first.value);

  const simulation: Simulation = {
    world,
    step(ticks = 1) {
      if (!Number.isInteger(ticks) || ticks < 0) {
        throw new RangeError(`step(ticks) exige um inteiro maior ou igual a 0; recebido ${ticks}`);
      }
      for (let i = 0; i < ticks; i++) advanceTick(runtime, () => snapshotOf(runtime));
      return snapshotOf(runtime);
    },
    getState: () => snapshotOf(runtime),
    reset() {
      // Recompila para reiniciar a memória (variáveis de nível superior) dos controladores.
      const again = compileAll(world, sources);
      if (!again.ok) throw new Error(again.errors.map((e) => e.message).join('\n'));
      runtime = build(again.value);
      return snapshotOf(runtime);
    },
  };
  return { ok: true, value: simulation };
}
