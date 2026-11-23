/**
 * Gera as pistas de exemplo do Seguidor de Linha (spec 006, T005) com `createLineFollowerWorld`.
 * Robô derivado de componentes reais (plan 006, D-06). Uso: npx tsx scripts/generate-line-follower-examples.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  buildTrack,
  createLineFollowerWorld,
  LINE_FOLLOWER_CATEGORIES,
  type LineFollowerRobotInput,
  type TrackSegment,
} from '../src/modalities/line-follower/index';

const PI = Math.PI;
const QTR_PITCH = 0.009525; // m (Pololu QTR-8A)

// Pololu Micro HP 6V 30:1 + roda 32 mm, bitola 0,12 m → 80% de 1,68 m/s e 27,9 rad/s.
const robot: LineFollowerRobotInput = {
  id: 'seguidor',
  name: 'Seguidor PD (QTR-8A)',
  color: '#65b033',
  radius: 0.08,
  mass: 0.25,
  maxLinearSpeed: 1.34,
  maxAngularSpeed: 22,
  controller: '../controllers/line-follower-pd.js',
  sensors: [
    ...Array.from({ length: 8 }, (_, k) => ({
      id: `linha-${k}`,
      type: 'floor',
      position: [0.07, Number(((k - 3.5) * QTR_PITCH).toFixed(6))],
      noise: 0.02,
    })),
    { id: 'marca', type: 'floor', position: [0, -0.06], noise: 0.02 },
  ],
};

// Oval: partida no meio da reta inferior, retas de 2,4 m, curvas de raio 0,4 m.
const oval: TrackSegment[] = [
  { straight: 1.2 },
  { arc: { radius: 0.4, angle: PI } },
  { straight: 2.4 },
  { arc: { radius: 0.4, angle: PI } },
  { straight: 1.2 },
];

// "Retângulo" com curvas de raio 0,25 m e uma chicane na reta superior (curvas para os dois
// lados). Partida e chegada na mesma reta inferior (Art. 4.7).
const rectangle: TrackSegment[] = [
  { straight: 0.5 },
  { arc: { radius: 0.25, angle: PI / 2 } },
  { straight: 0.5 },
  { arc: { radius: 0.25, angle: PI / 2 } },
  { straight: 0.5 },
  { arc: { radius: 0.3, angle: -PI / 2 } },
  { arc: { radius: 0.3, angle: PI / 2 } },
  { straight: 0.6 },
  { arc: { radius: 0.25, angle: PI / 2 } },
  { straight: 1.1 },
  { arc: { radius: 0.25, angle: PI / 2 } },
  { straight: 1.2 },
];

const examples = {
  'seguidor-oval': createLineFollowerWorld(LINE_FOLLOWER_CATEGORIES.junior, oval, robot, {
    name: 'Seguidor de Linha Júnior — pista oval',
    seed: 11,
  }),
  'seguidor-retangulo': createLineFollowerWorld(LINE_FOLLOWER_CATEGORIES.pro, rectangle, robot, {
    name: 'Seguidor de Linha Pro — retângulo com chicane',
    seed: 12,
  }),
};

/**
 * Fecha a pista: depois do trecho `prefix` (que deve terminar apontando para −x), acrescenta
 * curva à esquerda, reta descendo, curva à esquerda e a reta final até a partida, com os
 * comprimentos calculados para voltar exatamente ao ponto inicial.
 */
function closeTrack(prefix: TrackSegment[], radius: number): TrackSegment[] {
  const probe = buildTrack({ x: 0, y: 0, theta: 0 }, [
    ...prefix,
    { arc: { radius, angle: PI / 2 } },
    { arc: { radius, angle: PI / 2 } },
  ]);
  const [ex, ey] = probe[probe.length - 1]!;
  const down = Number(ey.toFixed(6));
  const back = Number((-ex).toFixed(6));
  if (down <= 0 || back <= 1.2)
    throw new Error(`pista não fecha bem (descida ${down}, reta final ${back})`);
  return [
    ...prefix,
    { arc: { radius, angle: PI / 2 } },
    { straight: down },
    { arc: { radius, angle: PI / 2 } },
    { straight: back },
  ];
}

// Zigue-zague: curvas em S (para os dois lados) na reta superior.
const zigzag = closeTrack(
  [
    { straight: 0.4 },
    { arc: { radius: 0.25, angle: PI / 2 } },
    { straight: 0.5 },
    { arc: { radius: 0.25, angle: PI / 2 } },
    { straight: 0.2 },
    { arc: { radius: 0.2, angle: -PI / 2 } },
    { arc: { radius: 0.2, angle: PI / 2 } },
    { arc: { radius: 0.2, angle: PI / 2 } },
    { arc: { radius: 0.2, angle: -PI / 2 } },
    { straight: 0.2 },
    { arc: { radius: 0.2, angle: -PI / 2 } },
    { arc: { radius: 0.2, angle: PI / 2 } },
    { arc: { radius: 0.2, angle: PI / 2 } },
    { arc: { radius: 0.2, angle: -PI / 2 } },
    { straight: 1.1 },
  ],
  0.25,
);

// Curvas fechadas: raio de 0,12 m, perto do mínimo de 0,10 m (Art. 4.14).
const tight = closeTrack(
  [
    { straight: 0.4 },
    { arc: { radius: 0.12, angle: PI / 2 } },
    { straight: 0.5 },
    { arc: { radius: 0.12, angle: PI / 2 } },
    { straight: 0.3 },
    { arc: { radius: 0.12, angle: -PI / 2 } },
    { arc: { radius: 0.12, angle: PI / 2 } },
    { straight: 1.1 },
  ],
  0.12,
);

/**
 * Variação do controlador PD para a apresentação: mais rápido, ganho menor e sem reduzir nas
 * curvas — completa a volta, mas não consegue parar dentro da área de chegada (volta inválida,
 * Art. 5.7). Gerado a partir do arquivo-base para manter uma única fonte.
 */
const base = readFileSync(
  new URL('../examples/controllers/line-follower-pd.js', import.meta.url),
  'utf8',
);
const aggressive = base
  .replace(
    /^const VELOCIDADE = .*$/m,
    'const VELOCIDADE = 1.3; // m/s — rápido demais para as curvas',
  )
  .replace(/^const KP = .*$/m, 'const KP = 25; // ganho baixo: corrige devagar')
  .replace(/^const REDUCAO_EM_CURVA = .*$/m, 'const REDUCAO_EM_CURVA = 0; // não reduz nas curvas');
if (aggressive === base) throw new Error('constantes do PD não encontradas');
writeFileSync(
  new URL('../examples/controllers/line-follower-pd-agressivo.js', import.meta.url),
  '// Arquivo gerado por scripts/generate-line-follower-examples.ts a partir de line-follower-pd.js — não edite.\n' +
    aggressive,
);

const variations = {
  'seguidor-zigue-zague': createLineFollowerWorld(LINE_FOLLOWER_CATEGORIES.junior, zigzag, robot, {
    name: 'Seguidor de Linha Júnior — zigue-zague (curvas em S)',
    seed: 13,
  }),
  'seguidor-curvas-fechadas': createLineFollowerWorld(LINE_FOLLOWER_CATEGORIES.pro, tight, robot, {
    name: 'Seguidor de Linha Pro — curvas fechadas (raio 0,12 m)',
    seed: 14,
  }),
  'seguidor-pd-agressivo': createLineFollowerWorld(
    LINE_FOLLOWER_CATEGORIES.junior,
    oval,
    {
      ...robot,
      name: 'Seguidor PD agressivo',
      color: '#f25f5c',
      controller: '../controllers/line-follower-pd-agressivo.js',
    },
    {
      name: 'Seguidor de Linha Júnior — PD agressivo (rápido demais para parar na chegada)',
      seed: 15,
    },
  ),
};

for (const [file, world] of Object.entries({ ...examples, ...variations })) {
  writeFileSync(
    new URL(`../examples/worlds/${file}.json`, import.meta.url),
    `${JSON.stringify(world, null, 2)}\n`,
  );
  console.log(`examples/worlds/${file}.json`);
}
