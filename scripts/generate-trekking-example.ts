/**
 * Gera o campo de exemplo do Trekking (spec 007, T005). Robô derivado de componentes reais
 * (plan 007, D-04). Uso: npx tsx scripts/generate-trekking-example.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
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

// ---- Variações para a apresentação -------------------------------------------------

const robot = world.robots[0]!;
const baseController = readFileSync(
  new URL('../examples/controllers/trekking-navigator.js', import.meta.url),
  'utf8',
);

/**
 * Gera um campo e a versão do navegador com as coordenadas medidas desse campo
 * (mesmo código, só a largada e os marcos mudam).
 */
function variation(
  id: string,
  name: string,
  marks: [[number, number], [number, number], [number, number], [number, number]],
  obstacles: unknown[],
  theta: number,
) {
  const controller = baseController
    .replace(
      /^const LARGADA = .*$/m,
      `const LARGADA = { x: ${marks[0][0]}, y: ${marks[0][1]}, theta: ${theta} }; // pose no marco 1`,
    )
    .replace(
      /^const MARCOS = \[[\s\S]*?^\];$/m,
      `const MARCOS = [\n${marks
        .slice(1)
        .map(([x, y], i) => `  [${x}, ${y}], // marco ${i + 2}`)
        .join('\n')}\n];`,
    );
  if (controller === baseController) throw new Error('constantes do navegador não encontradas');
  writeFileSync(
    new URL(`../examples/controllers/trekking-navigator-${id}.js`, import.meta.url),
    `// Arquivo gerado por scripts/generate-trekking-example.ts a partir de trekking-navigator.js — não edite.\n${controller}`,
  );
  const variant = createTrekkingWorld(
    { width: 14, height: 10 },
    marks,
    obstacles,
    {
      id: 'trekker',
      name: robot.name,
      color: robot.color,
      theta,
      radius: robot.radius,
      mass: robot.mass,
      maxLinearSpeed: robot.maxLinearSpeed,
      maxAngularSpeed: robot.maxAngularSpeed,
      odometryNoise: 0.01,
      controller: `../controllers/trekking-navigator-${id}.js`,
      sensors: robot.sensors,
    },
    { name, seed: 31 },
  );
  writeFileSync(
    new URL(`../examples/worlds/trekking-${id}.json`, import.meta.url),
    `${JSON.stringify(variant, null, 2)}\n`,
  );
  console.log(`examples/worlds/trekking-${id}.json`);
}

variation(
  'campo-livre',
  'Trekking — campo livre (percurso em quadrado)',
  [
    [-5, -3.5],
    [5, -3.5],
    [5, 3.5],
    [-5, 3.5],
  ],
  [],
  0,
);

variation(
  'campo-denso',
  'Trekking — campo denso (obstáculos entre todos os marcos)',
  [
    [-5.5, -3.5],
    [5, -2.5],
    [3.5, 3.5],
    [-5, 2.5],
  ],
  [
    {
      id: 'pedra-1',
      type: 'box',
      center: [-2, -3.2],
      width: 0.7,
      height: 0.7,
      angle: 0.3,
      color: '#8a817c',
    },
    { id: 'pedra-2', type: 'disc', center: [1.5, -2.7], radius: 0.35, color: '#8a817c' },
    { id: 'arvore-1', type: 'disc', center: [4.5, 0.5], radius: 0.4, color: '#4a6b3a' },
    {
      id: 'banco',
      type: 'box',
      center: [0, 3.0],
      width: 1.4,
      height: 0.5,
      angle: -0.2,
      color: '#9c6b3e',
    },
    { id: 'arvore-2', type: 'disc', center: [-2.5, 2.7], radius: 0.35, color: '#4a6b3a' },
    { id: 'cerca', type: 'wall', from: [-1, -0.5], to: [1, 0.5], color: '#6b7280' },
  ],
  0.1,
);
