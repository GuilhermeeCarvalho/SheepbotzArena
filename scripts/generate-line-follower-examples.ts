/**
 * Gera as pistas de exemplo do Seguidor de Linha (spec 006, T005) com `createLineFollowerWorld`.
 * Robô derivado de componentes reais (plan 006, D-06). Uso: npx tsx scripts/generate-line-follower-examples.ts
 */
import { writeFileSync } from 'node:fs';
import {
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

for (const [file, world] of Object.entries(examples)) {
  writeFileSync(
    new URL(`../examples/worlds/${file}.json`, import.meta.url),
    `${JSON.stringify(world, null, 2)}\n`,
  );
  console.log(`examples/worlds/${file}.json`);
}
