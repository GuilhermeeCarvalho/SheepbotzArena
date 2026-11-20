# Contrato: API programática do núcleo (`src/core/index.ts`)

Referências: spec FR-021, FR-023, FR-024, US7; research D-13, D-14.

```ts
// ---- Carregamento ----
type ValidationIssue = { path: string; code: string; message: string };
type Result<T, E> = { ok: true; value: T } | { ok: false; errors: E[] };

function loadWorld(text: string, options?: { modalities?: ModalityRegistry }): Result<World, ValidationIssue>;
function validateWorld(data: unknown, options?: { modalities?: ModalityRegistry }): Result<World, ValidationIssue>;
function formatIssues(issues: ValidationIssue[]): string; // "<path ou (raiz)>: <mensagem>" por linha

// ---- Simulação ----
type ControllerIssue = {
  robotId: string;
  code: 'CONTROLLER_SYNTAX' | 'CONTROLLER_MISSING_ONTICK' | 'CONTROLLER_INIT_ERROR';
  message: string;
  line?: number;
  column?: number;
};

function createSimulation(
  world: World,
  options?: {
    controllers?: Record<string, string>; // robotId → código-fonte; robôs ausentes ficam "no-controller"
    modalities?: ModalityRegistry;        // necessário se world.modality estiver definido
  },
): Result<Simulation, ControllerIssue>;

interface Simulation {
  readonly world: World;
  step(ticks?: number): SimulationState; // padrão 1; ticks inteiro ≥ 0
  getState(): SimulationState;
  reset(): SimulationState;              // reavalia controladores e reinicia fluxos aleatórios
}

// ---- Estado (snapshot profundo, congelado e serializável em JSON) ----
type SimulationState = {
  tick: number;
  time: number;                          // tick · dt
  match: MatchStatus | null;             // null sem modalidade
  robots: RobotState[];                  // ordem do mundo
};

type RobotState = {
  id: string;
  pose: { x: number; y: number; theta: number };
  command: { v: number; w: number };     // após saturação
  odometry: { x: number; y: number; theta: number; distance: number };
  sensors: Record<string, number[] | number | boolean>; // laser → number[]; sonar/floor → number; bumper → boolean
  status: 'ok' | 'error' | 'no-controller';
  error: { tick: number; message: string } | null;
  logs: { tick: number; message: string }[];
};
```

## Garantias

- `createSimulation` calcula as leituras iniciais: `getState()` no tick 0 já contém
  `sensors` coerentes com a pose inicial.
- `step(a)` seguido de `step(b)` ≡ `step(a + b)`.
- `reset()` devolve um estado igual (`deepEqual`) ao de uma simulação recém-criada.
- Duas simulações criadas com as mesmas entradas produzem estados iguais em todos os ticks.
- Se `match.phase === 'finished'`, `step()` devolve o estado sem avançar.
- `step` com `ticks` negativo ou não inteiro lança `RangeError`.
