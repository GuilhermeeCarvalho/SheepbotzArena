import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect } from 'vitest';
import {
  createSimulation,
  type ModalityRegistry,
  type Simulation,
  type SimulationState,
  validateWorld,
  type World,
} from 'src/core';

/** Tolerância de aceitação da spec 001 (0,001 m / 0,001 rad). */
export const TOLERANCE = 1e-3;

export const fixturePath = (relative: string): string =>
  fileURLToPath(new URL(`./fixtures/${relative}`, import.meta.url));

export const readFixture = (relative: string): string =>
  readFileSync(fixturePath(relative), 'utf8');

/** Mundo mínimo válido; `overrides` substitui campos da raiz. */
export function worldData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { version: 1, arena: { width: 10, height: 10 }, ...overrides };
}

/** Robô com raio 0,1 na origem, sem sensores; `overrides` substitui campos. */
export function robotData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { id: 'r1', pose: { x: 0, y: 0, theta: 0 }, radius: 0.1, ...overrides };
}

export function buildWorld(data: unknown, modalities?: ModalityRegistry): World {
  const result = validateWorld(data, { modalities });
  if (!result.ok)
    throw new Error(`Mundo de teste inválido:\n${JSON.stringify(result.errors, null, 2)}`);
  return result.value;
}

export function buildSimulation(
  data: unknown,
  controllers: Record<string, string> = {},
  modalities?: ModalityRegistry,
): Simulation {
  const result = createSimulation(buildWorld(data, modalities), { controllers, modalities });
  if (!result.ok)
    throw new Error(`Controladores inválidos:\n${JSON.stringify(result.errors, null, 2)}`);
  return result.value;
}

/** Controlador que comanda (v, w) constantes. */
export const constantSpeed = (v: number, w: number): string =>
  `function onTick(robot) { robot.setSpeed(${v}, ${w}); }`;

export function runTicks(
  data: unknown,
  controllers: Record<string, string>,
  ticks: number,
): SimulationState {
  return buildSimulation(data, controllers).step(ticks);
}

export function expectPose(
  actual: { x: number; y: number; theta?: number },
  expected: { x: number; y: number; theta?: number },
  tolerance = TOLERANCE,
): void {
  expect(
    Math.abs(actual.x - expected.x),
    `x = ${actual.x}, esperado ${expected.x}`,
  ).toBeLessThanOrEqual(tolerance);
  expect(
    Math.abs(actual.y - expected.y),
    `y = ${actual.y}, esperado ${expected.y}`,
  ).toBeLessThanOrEqual(tolerance);
  if (expected.theta !== undefined && actual.theta !== undefined) {
    expect(
      Math.abs(actual.theta - expected.theta),
      `θ = ${actual.theta}, esperado ${expected.theta}`,
    ).toBeLessThanOrEqual(tolerance);
  }
}

export function expectReadings(
  actual: readonly number[],
  expected: readonly number[],
  tolerance = TOLERANCE,
): void {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, i) => {
    expect(
      Math.abs(value - expected[i]!),
      `leitura[${i}] = ${value}, esperado ${expected[i]}`,
    ).toBeLessThanOrEqual(tolerance);
  });
}

export const robotState = (state: SimulationState, id = 'r1') => {
  const robot = state.robots.find((r) => r.id === id);
  if (!robot) throw new Error(`Robô ${id} não encontrado no estado`);
  return robot;
};
