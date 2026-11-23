/**
 * Gera o campo de exemplo do Trekking (spec 007, T005). Robô derivado de componentes reais
 * (plan 007, D-04). Uso: npx tsx scripts/generate-trekking-example.ts
 */
import { writeFileSync } from 'node:fs';
import { createTrekkingWorld } from '../src/modalities/trekking/index';

const world = createTrekkingWorld(
  { width: 14, height: 10 },
  [
    [-5.5, -3.5],
    [4.5, -3.0],
    [4.0, 3.5],
    [-4.5, 3.0],
  ],
  [
    {
      id: 'pedra',
      type: 'box',
      center: [0, -3.2],
      width: 0.8,
      height: 0.8,
      angle: 0.4,
      color: '#8a817c',
    },
    { id: 'arvore', type: 'disc', center: [4.3, 0.3], radius: 0.35, color: '#4a6b3a' },
    {
      id: 'banco',
      type: 'box',
      center: [0, 3.3],
      width: 1.2,
      height: 0.5,
      angle: 0.3,
      color: '#9c6b3e',
    },
    { id: 'poste', type: 'disc', center: [-1.5, 0], radius: 0.15, color: '#6b7280' },
  ],
  {
    id: 'trekker',
    name: 'Trekker (odometria + lidar)',
    color: '#65b033',
    theta: 0.05,
    // Pololu 37D 12V 30:1 + roda 60 mm, bitola 0,30 m → 80% de 1,04 m/s e 6,9 rad/s.
    radius: 0.2,
    mass: 3,
    maxLinearSpeed: 0.83,
    maxAngularSpeed: 5.5,
    odometryNoise: 0.01,
    controller: '../controllers/trekking-navigator.js',
    sensors: [
      // 9 × ST VL53L1X (modo longo: 4 m, σ ≈ 2,5 mm) a cada 22,5°, modelados como laser de 9 raios em 180°.
      {
        id: 'lidar',
        type: 'laser',
        position: [0.15, 0],
        rays: 9,
        fov: Math.PI,
        maxRange: 4,
        noise: 0.0025,
      },
      { id: 'piso', type: 'floor', position: [0, 0], noise: 0.02 },
      { id: 'frente', type: 'bumper', from: -Math.PI / 2, to: Math.PI / 2 },
    ],
  },
  { name: 'Trekking — campo com obstáculos', seed: 21 },
);

writeFileSync(
  new URL('../examples/worlds/trekking.json', import.meta.url),
  `${JSON.stringify(world, null, 2)}\n`,
);
console.log('examples/worlds/trekking.json');
