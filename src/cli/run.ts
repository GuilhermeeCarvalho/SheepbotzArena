/**
 * Linha de comando headless (contracts/cli.md; FR-022).
 * Toda a lógica fica aqui, testável; `main.ts` apenas conecta ao processo.
 */
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Worker } from 'node:worker_threads';
import { createSimulation, formatIssues, loadWorld } from '../core/index';
import { modalityRegistry } from '../modalities/index';
import type { WorkerMessage } from './worker';

export const DEFAULT_CLI_TIMEOUT_MS = 10_000;

export const EXIT = { ok: 0, usage: 1, invalidWorld: 2, invalidController: 3, timeout: 4 } as const;

export type CliResult = { code: number; stdout: string; stderr: string };

export const USAGE =
  'Uso: npm run sim -- <mundo.json> --ticks <N> [--controller <robô>=<arquivo.js>]... [--timeout-ms <ms>] [--pretty]';

type CliArgs = {
  worldPath: string;
  ticks: number;
  controllers: Record<string, string>;
  timeoutMs: number;
  pretty: boolean;
};

const fail = (code: number, message: string): CliResult => ({
  code,
  stdout: '',
  stderr: `${message}\n`,
});

const isNonNegativeInteger = (text: string | undefined): boolean =>
  text !== undefined && /^\d+$/.test(text);

export function parseArgs(
  argv: readonly string[],
): { ok: true; args: CliArgs } | { ok: false; message: string } {
  const args: Partial<CliArgs> & { controllers: Record<string, string> } = {
    controllers: {},
    timeoutMs: DEFAULT_CLI_TIMEOUT_MS,
    pretty: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    const value = argv[i + 1];
    switch (arg) {
      case '--ticks':
        if (!isNonNegativeInteger(value))
          return { ok: false, message: '--ticks exige um inteiro maior ou igual a 0' };
        args.ticks = Number(value);
        i++;
        break;
      case '--timeout-ms':
        if (!isNonNegativeInteger(value) || Number(value) === 0) {
          return { ok: false, message: '--timeout-ms exige um inteiro maior que 0' };
        }
        args.timeoutMs = Number(value);
        i++;
        break;
      case '--controller': {
        const match = value === undefined ? null : /^([^=]+)=(.+)$/.exec(value);
        if (!match)
          return { ok: false, message: '--controller exige o formato <robô>=<arquivo.js>' };
        args.controllers[match[1]!] = match[2]!;
        i++;
        break;
      }
      case '--pretty':
        args.pretty = true;
        break;
      default:
        if (arg.startsWith('--')) return { ok: false, message: `opção desconhecida: ${arg}` };
        if (args.worldPath !== undefined)
          return { ok: false, message: `argumento inesperado: ${arg}` };
        args.worldPath = arg;
    }
  }
  if (args.worldPath === undefined) return { ok: false, message: 'informe o arquivo de mundo' };
  if (args.ticks === undefined) return { ok: false, message: 'informe --ticks <N>' };
  return { ok: true, args: args as CliArgs };
}

async function readText(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

/** Executa a simulação na worker thread, encerrando-a ao exceder `timeoutMs`. */
function runInWorker(
  input: { worldText: string; controllers: Record<string, string>; ticks: number },
  timeoutMs: number,
): Promise<
  | { kind: 'done'; state: unknown }
  | { kind: 'timeout'; tick: number }
  | { kind: 'failed'; message: string }
> {
  return new Promise((resolvePromise) => {
    const worker = new Worker(new URL('./worker-entry.mjs', import.meta.url), {
      workerData: input,
    });
    let lastTick = 0;
    let settled = false;
    const settle = (value: Parameters<typeof resolvePromise>[0]) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      resolvePromise(value);
    };
    const timer = setTimeout(() => settle({ kind: 'timeout', tick: lastTick }), timeoutMs);
    worker.on('message', (message: WorkerMessage) => {
      if (message.type === 'progress') lastTick = message.tick;
      else if (message.type === 'done') settle({ kind: 'done', state: message.state });
      else settle({ kind: 'failed', message: message.message });
    });
    worker.on('error', (error: Error) => settle({ kind: 'failed', message: error.message }));
  });
}

export async function run(argv: readonly string[]): Promise<CliResult> {
  const parsed = parseArgs(argv);
  if (!parsed.ok) return fail(EXIT.usage, `${parsed.message}\n${USAGE}`);
  const { worldPath, ticks, timeoutMs, pretty } = parsed.args;

  const worldText = await readText(worldPath);
  if (worldText === null)
    return fail(EXIT.usage, `Arquivo de mundo não encontrado ou ilegível: ${worldPath}`);

  const world = loadWorld(worldText, { modalities: modalityRegistry });
  if (!world.ok) return fail(EXIT.invalidWorld, formatIssues(world.errors));

  // Controladores: os do mundo (relativos ao arquivo) e, com precedência, os da linha de comando.
  const paths: Record<string, string> = {};
  for (const robot of world.value.robots) {
    if (robot.controller) paths[robot.id] = resolve(dirname(worldPath), robot.controller);
  }
  Object.assign(paths, parsed.args.controllers);

  const controllers: Record<string, string> = {};
  for (const [robotId, path] of Object.entries(paths)) {
    if (!world.value.robots.some((r) => r.id === robotId)) {
      return fail(EXIT.usage, `O mundo não tem robô '${robotId}' (informado em --controller)`);
    }
    const source = await readText(path);
    if (source === null)
      return fail(EXIT.usage, `Arquivo de controlador não encontrado ou ilegível: ${path}`);
    controllers[robotId] = source;
  }

  const check = createSimulation(world.value, { controllers, modalities: modalityRegistry });
  if (!check.ok) return fail(EXIT.invalidController, check.errors.map((e) => e.message).join('\n'));

  const outcome = await runInWorker({ worldText, controllers, ticks }, timeoutMs);
  if (outcome.kind === 'timeout') {
    return fail(EXIT.timeout, `Tempo limite de ${timeoutMs} ms excedido no tick ${outcome.tick}`);
  }
  if (outcome.kind === 'failed') return fail(EXIT.usage, `Falha na execução: ${outcome.message}`);
  const json = pretty ? JSON.stringify(outcome.state, null, 2) : JSON.stringify(outcome.state);
  return { code: EXIT.ok, stdout: `${json}\n`, stderr: '' };
}
