/**
 * Compilação do controlador JavaScript (FR-018 a FR-020; research D-09).
 * Garante determinismo e uma API limitada; NÃO é uma sandbox de segurança.
 */
import { parse } from 'acorn';

export type ControllerIssueCode =
  'CONTROLLER_SYNTAX' | 'CONTROLLER_MISSING_ONTICK' | 'CONTROLLER_INIT_ERROR';

export type ControllerIssue = {
  robotId: string;
  code: ControllerIssueCode;
  message: string;
  line?: number;
  column?: number;
};

export type OnTick = (robot: unknown) => void;

/** Lança um erro claro ao usar recursos indisponíveis (inclusive `Date.now()` e `new Date()`). */
function unavailable(name: string, hint: string): unknown {
  const fail = (): never => {
    throw new Error(`${name} não está disponível no controlador; ${hint}`);
  };
  return new Proxy(function blocked() {}, {
    get: fail,
    apply: fail,
    construct: fail,
    has: fail,
    set: fail,
  });
}

function createSafeMath(): Math {
  const safe: Record<string, unknown> = {};
  for (const key of Object.getOwnPropertyNames(Math))
    safe[key] = (Math as unknown as Record<string, unknown>)[key];
  safe.random = () => {
    throw new Error('Math.random não está disponível no controlador; use robot.random()');
  };
  return Object.freeze(safe) as unknown as Math;
}

const SAFE_MATH = createSafeMath();

/** Identificadores sombreados no escopo do controlador e seus substitutos. */
const SHADOWED_GLOBALS: [string, unknown][] = [
  ['Math', SAFE_MATH],
  ['Date', unavailable('Date', 'use robot.time()')],
  ['performance', unavailable('performance', 'use robot.time()')],
  ['setTimeout', unavailable('setTimeout', 'o controlador é chamado a cada tick')],
  ['setInterval', unavailable('setInterval', 'o controlador é chamado a cada tick')],
  ['queueMicrotask', unavailable('queueMicrotask', 'o controlador é síncrono')],
  ['fetch', unavailable('fetch', 'o controlador não acessa a rede')],
  ['globalThis', unavailable('globalThis', 'use apenas a API do robô')],
  ['window', unavailable('window', 'use apenas a API do robô')],
  ['self', unavailable('self', 'use apenas a API do robô')],
  ['global', unavailable('global', 'use apenas a API do robô')],
  ['process', unavailable('process', 'use apenas a API do robô')],
  ['require', unavailable('require', 'o controlador não importa módulos')],
];

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** Verifica a sintaxe, avalia o código uma vez e devolve `onTick`. */
export function compileController(
  robotId: string,
  source: string,
): { ok: true; onTick: OnTick } | { ok: false; issue: ControllerIssue } {
  try {
    parse(source, { ecmaVersion: 2022, sourceType: 'script', locations: true });
  } catch (error) {
    const loc = (error as { loc?: { line: number; column: number } }).loc;
    const line = loc?.line ?? 1;
    const column = (loc?.column ?? 0) + 1;
    const detail = errorMessage(error).replace(/\s*\(\d+:\d+\)$/, '');
    return {
      ok: false,
      issue: {
        robotId,
        code: 'CONTROLLER_SYNTAX',
        line,
        column,
        message: `Controlador do robô '${robotId}', linha ${line}, coluna ${column}: erro de sintaxe (${detail})`,
      },
    };
  }

  let onTick: unknown;
  try {
    const names = SHADOWED_GLOBALS.map(([name]) => name);
    const body = `"use strict";\n${source}\n;return typeof onTick === 'function' ? onTick : undefined;`;
    const factory = new Function(...names, body) as (...args: unknown[]) => unknown;
    onTick = factory(...SHADOWED_GLOBALS.map(([, value]) => value));
  } catch (error) {
    return {
      ok: false,
      issue: {
        robotId,
        code: 'CONTROLLER_INIT_ERROR',
        message: `Controlador do robô '${robotId}': erro na inicialização (${errorMessage(error)})`,
      },
    };
  }

  if (typeof onTick !== 'function') {
    return {
      ok: false,
      issue: {
        robotId,
        code: 'CONTROLLER_MISSING_ONTICK',
        message: `Controlador do robô '${robotId}': a função onTick(robot) é obrigatória`,
      },
    };
  }
  return { ok: true, onTick: onTick as OnTick };
}

export { errorMessage };
