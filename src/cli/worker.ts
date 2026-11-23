/**
 * Executa a simulação numa worker thread, para que a CLI possa encerrá-la por tempo limite
 * (research 001 D-12). Publica o tick atual a cada passo e o estado final ao terminar.
 */
import { parentPort, workerData } from 'node:worker_threads';
import { createSimulation, loadWorld } from '../core/index';
import { modalityRegistry } from '../modalities/index';

export type WorkerInput = { worldText: string; controllers: Record<string, string>; ticks: number };
export type WorkerMessage =
  | { type: 'progress'; tick: number }
  | { type: 'done'; state: unknown }
  | { type: 'failed'; message: string };

function execute({ worldText, controllers, ticks }: WorkerInput): void {
  const port = parentPort!;
  const world = loadWorld(worldText, { modalities: modalityRegistry });
  if (!world.ok) throw new Error('Mundo inválido no worker');
  const simulation = createSimulation(world.value, { controllers, modalities: modalityRegistry });
  if (!simulation.ok) throw new Error('Controlador inválido no worker');
  let state = simulation.value.getState();
  for (let i = 0; i < ticks; i++) {
    state = simulation.value.step();
    port.postMessage({ type: 'progress', tick: state.tick } satisfies WorkerMessage);
    if (state.match?.phase === 'finished') break;
  }
  port.postMessage({ type: 'done', state } satisfies WorkerMessage);
}

try {
  execute(workerData as WorkerInput);
} catch (error) {
  parentPort!.postMessage({
    type: 'failed',
    message: error instanceof Error ? error.message : String(error),
  } satisfies WorkerMessage);
}
