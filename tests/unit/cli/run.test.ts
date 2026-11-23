// Linha de comando: argumentos e códigos de término (contracts/cli.md; FR-022).
import { describe, expect, it } from 'vitest';
import { EXIT, parseArgs, run } from 'src/cli/run';
import { fixturePath } from '../../helpers';

const world = (name: string) => fixturePath(`worlds/${name}.json`);
const controller = (name: string) => fixturePath(`controllers/${name}.js`);

describe('parseArgs', () => {
  it('interpreta todas as opções', () => {
    const parsed = parseArgs([
      'm.json',
      '--ticks',
      '7',
      '--controller',
      'a=x.js',
      '--timeout-ms',
      '50',
      '--pretty',
    ]);
    expect(parsed).toEqual({
      ok: true,
      args: {
        worldPath: 'm.json',
        ticks: 7,
        controllers: { a: 'x.js' },
        remotes: {},
        timeoutMs: 50,
        pretty: true,
      },
    });
  });

  it.each([
    [[], 'informe o arquivo de mundo'],
    [['m.json'], 'informe --ticks'],
    [['m.json', '--ticks', '-1'], '--ticks exige'],
    [['m.json', '--ticks', 'x'], '--ticks exige'],
    [['m.json', '--ticks', '1', '--timeout-ms', '0'], '--timeout-ms exige'],
    [['m.json', '--ticks', '1', '--controller', 'semigual'], '--controller exige'],
    [['m.json', '--ticks', '1', '--verbose'], 'opção desconhecida'],
    [['a.json', 'b.json', '--ticks', '1'], 'argumento inesperado'],
  ])('rejeita %j', (argv, message) => {
    const parsed = parseArgs(argv);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.message).toContain(message);
  });
});

describe('run', () => {
  it('uso incorreto → código 1 com instrução de uso', async () => {
    const result = await run(['--ticks', '1']);
    expect(result.code).toBe(EXIT.usage);
    expect(result.stderr).toContain('Uso:');
  });

  it('arquivo de mundo ausente → código 1', async () => {
    const result = await run([world('nao-existe'), '--ticks', '1']);
    expect(result.code).toBe(EXIT.usage);
    expect(result.stderr).toContain('não encontrado');
  });

  it('controlador ausente → código 1', async () => {
    const result = await run([
      world('straight-line'),
      '--ticks',
      '1',
      '--controller',
      `r1=${controller('nao-existe')}`,
    ]);
    expect(result.code).toBe(EXIT.usage);
  });

  it('robô inexistente em --controller → código 1', async () => {
    const result = await run([
      world('straight-line'),
      '--ticks',
      '1',
      '--controller',
      `rX=${controller('idle')}`,
    ]);
    expect(result.code).toBe(EXIT.usage);
    expect(result.stderr).toContain("'rX'");
  });

  it('controlador inválido → código 3', async () => {
    const result = await run([
      world('straight-line'),
      '--ticks',
      '1',
      '--controller',
      `r1=${controller('syntax-error')}`,
    ]);
    expect(result.code).toBe(EXIT.invalidController);
    expect(result.stderr).toContain('linha 2');
  });

  it('laço infinito → código 4 por tempo limite', async () => {
    const result = await run([
      world('straight-line'),
      '--ticks',
      '3',
      '--controller',
      `r1=${controller('infinite-loop')}`,
      '--timeout-ms',
      '1500',
    ]);
    expect(result.code).toBe(EXIT.timeout);
    expect(result.stderr).toContain('Tempo limite de 1500 ms');
  });

  it('usa o controlador declarado no mundo e --controller tem precedência', async () => {
    const fromWorld = JSON.parse((await run([world('with-controller'), '--ticks', '10'])).stdout);
    expect(fromWorld.robots[0].pose.x).toBeCloseTo(0.5, 6);
    expect(fromWorld.robots[1].status).toBe('no-controller');

    const overridden = await run([
      world('with-controller'),
      '--ticks',
      '10',
      '--pretty',
      '--controller',
      `r1=${controller('idle')}`,
    ]);
    expect(overridden.stdout).toContain('\n  "tick": 10');
    expect(JSON.parse(overridden.stdout).robots[0].pose.x).toBe(0);
  });
});
