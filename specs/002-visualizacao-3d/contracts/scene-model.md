# Contrato: modelo de cena (`src/app/scene/sceneModel.ts`)

Referências: spec US1, US3, US6; research D-02, D-03.

```ts
type Vec3 = [number, number, number];          // coordenadas Three.js (Y para cima)

/** (x, y) da simulação → [x, altura, −y]. */
function toScene(x: number, y: number, height?: number): Vec3;

type SceneModel = {
  arena: { width: number; depth: number; color: string; walls: WallMesh[] };
  floorRegions: FloorRegionMesh[];               // na ordem do mundo; layer = índice
  obstacles: ObstacleMesh[];
  robots: RobotMesh[];
  rays: RayMesh[];                               // vazio se options.showRays = false
  camera: { position: Vec3; target: Vec3 };      // vista inicial que enquadra a arena
};

type WallMesh = { id: string; position: Vec3; size: Vec3; rotationY: number };
type FloorRegionMesh =
  | { kind: 'rect'; position: Vec3; width: number; depth: number; rotationY: number; color: string }
  | { kind: 'disc'; position: Vec3; radius: number; color: string }
  | { kind: 'ring'; position: Vec3; innerRadius: number; outerRadius: number; color: string }
  | { kind: 'line'; segments: { position: Vec3; length: number; width: number; rotationY: number }[]; color: string };
type ObstacleMesh =
  | { id: string; kind: 'box'; position: Vec3; size: Vec3; rotationY: number; color: string }
  | { id: string; kind: 'cylinder'; position: Vec3; radius: number; height: number; color: string }
  | { id: string; kind: 'wall'; position: Vec3; size: Vec3; rotationY: number; color: string };
type RobotMesh = {
  id: string; name: string; color: string;
  position: Vec3;                                // centro do corpo
  rotationY: number;                             // = θ
  radius: number; bodyHeight: number;
  status: 'ok' | 'error' | 'no-controller';
  selected: boolean;
};
type RayMesh = { robotId: string; sensorId: string; from: Vec3; to: Vec3; hit: boolean };

function buildSceneModel(
  world: World,
  state: SimulationState,
  options?: { showRays?: boolean; selectedRobotId?: string | null },
): SceneModel;
```

## Regras

- Cor de região sem `color`: cinza proporcional à refletância
  (`#rrggbb` com r = g = b = round(255 × refletância)).
- Raio: `from` = origem do sensor no mundo; `to` = `from + leitura × direção`;
  `hit = leitura < maxRange − 1e-9`. Para sonar, todos os raios usam a leitura única.
- Paredes de borda: 4 caixas de espessura 0,04 m centradas nas bordas da arena.
- `rotationY` de caixas = ângulo da simulação; de paredes = `atan2(dy, dx)` do segmento.
- Câmera inicial: alvo no centro; posição `[0, 0,7·L, 0,7·L]` com `L = max(largura, altura)`.
