// Utilitários dos testes de Sumô (spec 004).
import { modalityRegistry } from 'src/modalities';
import { buildSimulation, constantSpeed, worldData } from '../../helpers';

export { constantSpeed };

/** Robô de Mini Sumô sem sensores (raio 0,05 m, 0,5 kg). */
export const miniRobot = (id: string, x: number, theta: number, overrides: Record<string, unknown> = {}) => ({
  id,
  pose: { x, y: 0, theta },
  radius: 0.05,
  mass: 0.5,
  ...overrides,
});

export function sumoWorld(
  modality: 'sumo-mini' | 'sumo-mega' | 'sumo-lego',
  robots: unknown[],
  extra: Record<string, unknown> = {},
) {
  return worldData({ modality, dt: 0.05, arena: { width: 1.8, height: 1.8 }, robots, ...extra });
}

export const sumoSimulation = (world: unknown, controllers: Record<string, string> = {}) =>
  buildSimulation(world, controllers, modalityRegistry);

/** Avança até o fim do round (ou `maxTicks`) e devolve o estado final. */
export function runRound(world: unknown, controllers: Record<string, string>, maxTicks = 10_000) {
  const simulation = sumoSimulation(world, controllers);
  let state = simulation.getState();
  for (let i = 0; i < maxTicks && state.match?.phase !== 'finished'; i++) state = simulation.step();
  return state;
}
