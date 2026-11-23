/**
 * Gera o exemplo do Futebol (2 × 1) (spec 008, T007). Robôs derivados de componentes reais
 * (plan 008, D-07). Uso: npx tsx scripts/generate-soccer-example.ts
 */
import { writeFileSync } from 'node:fs';
import { createSoccerWorld } from '../src/modalities/soccer/index';

const PI = Math.PI;
// Disco de 7,5 cm; Pololu Micro HP 6V 30:1 + roda 32 mm, bitola 0,06 m → 80% de 1,68 m/s e 56 rad/s.
const model = {
  radius: 0.0375,
  mass: 0.18,
  maxLinearSpeed: 1.34,
  maxAngularSpeed: 44.8,
  sensors: [{ id: 'camera', type: 'camera', noise: 0.002 }], // visão global com ruído de 2 mm (hipótese)
};

const world = createSoccerWorld(
  [
    {
      name: 'Verde',
      robots: [
        {
          id: 'verde-goleiro',
          name: 'Verde · goleiro',
          color: '#65b033',
          pose: { x: -0.68, y: 0, theta: PI / 2 },
          controller: '../controllers/soccer-goalkeeper.js',
        },
        {
          id: 'verde-atacante',
          name: 'Verde · atacante',
          color: '#65b033',
          pose: { x: -0.3, y: 0.12, theta: 0 },
          controller: '../controllers/soccer-striker.js',
        },
      ],
    },
    {
      name: 'Azul',
      robots: [
        {
          // Montagem mais lenta: Pololu Micro HP 6V 50:1 + roda 32 mm → 80% de 0,99 m/s e 33 rad/s.
          id: 'azul-atacante',
          name: 'Azul · atacante (50:1)',
          color: '#204b98',
          pose: { x: 0.3, y: -0.2, theta: PI },
          controller: '../controllers/soccer-striker.js',
          model: { maxLinearSpeed: 0.79, maxAngularSpeed: 26 },
        },
      ],
    },
  ],
  model,
  { name: 'Futebol VSS — Verde (goleiro + atacante) × Azul (atacante)', seed: 8, timeLimit: 120 },
);

writeFileSync(
  new URL('../examples/worlds/futebol-2x1.json', import.meta.url),
  `${JSON.stringify(world, null, 2)}\n`,
);
console.log('examples/worlds/futebol-2x1.json');
