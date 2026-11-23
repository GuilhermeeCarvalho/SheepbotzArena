/**
 * Gera os mundos de exemplo de Sumô (spec 004, T011) com `createSumoWorld`.
 * Robôs derivados de componentes reais (research 004 D-05; docs/references/componentes/).
 * Uso: npx tsx scripts/generate-sumo-examples.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  createSumoWorld,
  SUMO_CATEGORIES,
  type SumoRobotInput,
} from '../src/modalities/sumo/index';

const HALF_PI = Math.PI / 2;
const frontBumper = { id: 'frente', type: 'bumper', from: -HALF_PI, to: HALF_PI };

/** 3 sensores digitais de oponente (JSumo JS40F) modelados como laser de 3 raios. */
const opponentLaser = (x: number, maxRange: number, fov: number) => ({
  id: 'oponente',
  type: 'laser',
  position: [x, 0],
  rays: 3,
  fov,
  maxRange,
});

/** 2 sensores de borda (QRE1113) nos cantos frontais: [0,8·r; ±0,6·r]. */
const edgeSensors = (radius: number) => [
  { id: 'piso-esq', type: 'floor', position: [0.8 * radius, 0.6 * radius], noise: 0.03 },
  { id: 'piso-dir', type: 'floor', position: [0.8 * radius, -0.6 * radius], noise: 0.03 },
];

// Mini: Pololu Micro HP 6V 50:1 + JSumo 33 mm → 80% de 1,02 m/s e 25,5 rad/s.
const miniRobot = (
  input: Pick<SumoRobotInput, 'id' | 'name' | 'color' | 'side' | 'theta' | 'controller'>,
): SumoRobotInput => ({
  ...input,
  radius: 0.05,
  mass: 0.5,
  maxLinearSpeed: 0.82,
  maxAngularSpeed: 20,
  sensors: [opponentLaser(0.045, 0.4, 0.6), ...edgeSensors(0.05), frontBumper],
});

// Mega: JSumo Titan 1000 rpm + roda 55 mm, bitola 0,17 m → 80% de 2,88 m/s e 33,9 rad/s.
const megaRobot = (
  input: Pick<SumoRobotInput, 'id' | 'name' | 'color' | 'side' | 'theta' | 'controller'>,
): SumoRobotInput => ({
  ...input,
  radius: 0.1,
  mass: 3,
  maxLinearSpeed: 2.3,
  maxAngularSpeed: 27,
  sensors: [opponentLaser(0.09, 0.8, 0.6), ...edgeSensors(0.1), frontBumper],
});

// LEGO®: sem datasheet nas referências — valores de hipótese (research 004 D-05).
const legoRobot = (
  input: Pick<SumoRobotInput, 'id' | 'name' | 'color' | 'side' | 'theta' | 'controller'>,
): SumoRobotInput => ({
  ...input,
  radius: 0.075,
  mass: 1,
  maxLinearSpeed: 0.5,
  maxAngularSpeed: 6,
  sensors: [opponentLaser(0.07, 1, 0.5), ...edgeSensors(0.075), frontBumper],
});

/**
 * Versões LEGO® das estratégias: mesmo código, com a espera de 5 s (Nota 11).
 * Geradas a partir dos arquivos-base para manter uma única fonte de cada estratégia.
 */
for (const base of ['sumo-search-attack']) {
  const source = readFileSync(
    new URL(`../examples/controllers/${base}.js`, import.meta.url),
    'utf8',
  );
  const lego = source.replace(
    /^const ESPERA_INICIAL = 0;.*$/m,
    'const ESPERA_INICIAL = 5; // s — regra dos 5 segundos do Sumô LEGO® (Nota 11)',
  );
  if (lego === source) throw new Error(`ESPERA_INICIAL não encontrada em ${base}.js`);
  const header = `// Arquivo gerado por scripts/generate-sumo-examples.ts a partir de ${base}.js — não edite.\n`;
  writeFileSync(
    new URL(`../examples/controllers/${base.replace('sumo-', 'sumo-lego-')}.js`, import.meta.url),
    header + lego,
  );
}

const examples = {
  'sumo-mini': createSumoWorld(
    SUMO_CATEGORIES.mini,
    [
      miniRobot({
        id: 'sheep',
        name: 'Sheep (busca e ataque)',
        color: '#e8590c',
        side: 'left',
        controller: '../controllers/sumo-search-attack.js',
      }),
      miniRobot({
        id: 'rival',
        name: 'Rival (flanco)',
        color: '#1c7ed6',
        side: 'right',
        theta: HALF_PI,
        controller: '../controllers/sumo-flank.js',
      }),
    ],
    { name: 'Mini Sumô — busca e ataque × flanco', seed: 7 },
  ),
  'sumo-mega': createSumoWorld(
    SUMO_CATEGORIES.mega,
    [
      megaRobot({
        id: 'sheep',
        name: 'Sheep (busca e ataque)',
        color: '#e8590c',
        side: 'left',
        theta: HALF_PI,
        controller: '../controllers/sumo-search-attack.js',
      }),
      megaRobot({
        id: 'rival',
        name: 'Rival (flanco)',
        color: '#1c7ed6',
        side: 'right',
        theta: -HALF_PI,
        controller: '../controllers/sumo-flank.js',
      }),
    ],
    { name: 'Mega Sumô — busca e ataque × flanco', seed: 3 },
  ),
  'sumo-lego': createSumoWorld(
    SUMO_CATEGORIES.lego,
    [
      legoRobot({
        id: 'sheep',
        name: 'Sheep (busca e ataque)',
        color: '#e8590c',
        side: 'left',
        controller: '../controllers/sumo-lego-search-attack.js',
      }),
      // Sem a espera de 5 s: demonstra a largada queimada (Nota 11; hipótese H-05).
      legoRobot({
        id: 'rival',
        name: 'Rival (sem espera de 5 s)',
        color: '#1c7ed6',
        side: 'right',
        theta: HALF_PI,
        controller: '../controllers/sumo-search-attack.js',
      }),
    ],
    { name: 'Sumô LEGO® — regra dos 5 segundos', seed: 5 },
  ),
};

/** Variações para a apresentação: trocar estratégia, peso e motor e ver o resultado mudar. */
const variations = {
  'sumo-mini-estrategias-invertidas': createSumoWorld(
    SUMO_CATEGORIES.mini,
    [
      miniRobot({
        id: 'sheep',
        name: 'Sheep (flanco)',
        color: '#e8590c',
        side: 'left',
        theta: -HALF_PI,
        controller: '../controllers/sumo-flank.js',
      }),
      miniRobot({
        id: 'rival',
        name: 'Rival (busca e ataque)',
        color: '#1c7ed6',
        side: 'right',
        controller: '../controllers/sumo-search-attack.js',
      }),
    ],
    { name: 'Mini Sumô — estratégias invertidas (flanco × busca e ataque)', seed: 17 },
  ),
  // Mesmo duelo, só a massa do Sheep muda: 300 g perde, 500 g vence (empurrão por massa).
  'sumo-mini-peso-300g': createSumoWorld(
    SUMO_CATEGORIES.mini,
    [
      {
        ...miniRobot({
          id: 'sheep',
          name: 'Sheep (flanco, 300 g)',
          color: '#e8590c',
          side: 'left',
          theta: HALF_PI,
          controller: '../controllers/sumo-flank.js',
        }),
        mass: 0.3,
      },
      miniRobot({
        id: 'rival',
        name: 'Rival (busca e ataque, 500 g)',
        color: '#1c7ed6',
        side: 'right',
        theta: -HALF_PI,
        controller: '../controllers/sumo-search-attack.js',
      }),
    ],
    { name: 'Mini Sumô — mesmo duelo com o Sheep de 300 g', seed: 5 },
  ),
  'sumo-mini-peso-500g': createSumoWorld(
    SUMO_CATEGORIES.mini,
    [
      {
        ...miniRobot({
          id: 'sheep',
          name: 'Sheep (flanco, 500 g)',
          color: '#e8590c',
          side: 'left',
          theta: HALF_PI,
          controller: '../controllers/sumo-flank.js',
        }),
        mass: 0.5,
      },
      miniRobot({
        id: 'rival',
        name: 'Rival (busca e ataque, 500 g)',
        color: '#1c7ed6',
        side: 'right',
        theta: -HALF_PI,
        controller: '../controllers/sumo-search-attack.js',
      }),
    ],
    { name: 'Mini Sumô — mesmo duelo com o Sheep de 500 g', seed: 5 },
  ),
  'sumo-mega-motores': createSumoWorld(
    SUMO_CATEGORIES.mega,
    [
      megaRobot({
        id: 'titan',
        name: 'JSumo Titan (2,3 m/s)',
        color: '#e8590c',
        side: 'left',
        controller: '../controllers/sumo-search-attack.js',
      }),
      // Pololu 37D 12V 50:1 + roda 55 mm, bitola 0,17 m → 80% de 0,58 m/s e 6,8 rad/s.
      {
        ...megaRobot({
          id: 'pololu',
          name: 'Pololu 37D 50:1 (0,46 m/s)',
          color: '#1c7ed6',
          side: 'right',
          controller: '../controllers/sumo-search-attack.js',
        }),
        maxLinearSpeed: 0.46,
        maxAngularSpeed: 5.4,
      },
    ],
    { name: 'Mega Sumô — motor rápido × motor lento (frente a frente)', seed: 5 },
  ),
};

for (const [file, world] of Object.entries({ ...examples, ...variations })) {
  writeFileSync(
    new URL(`../examples/worlds/${file}.json`, import.meta.url),
    `${JSON.stringify(world, null, 2)}\n`,
  );
  console.log(`examples/worlds/${file}.json`);
}
