# Contrato: reprodução e sessão

Referências: spec US2, US4, US5; research D-04, D-05.

## Relógio (`src/app/session/playbackClock.ts`)

```ts
const MAX_TICKS_PER_FRAME = 20;
const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2, 4] as const;

function createPlaybackClock(dt: number, maxTicksPerFrame = MAX_TICKS_PER_FRAME): {
  /** Acumula elapsedMs × speed e devolve quantos ticks inteiros executar. */
  advance(elapsedMs: number, speed: number): number;
  reset(): void;
};
```

- `acumulado += elapsedMs / 1000 × speed`; `ticks = floor(acumulado / dt)` (com tolerância
  de 1e-9 para arredondamento); `acumulado −= ticks × dt`.
- Se `ticks > max`, devolve `max` e zera o acumulado (tempo excedente descartado).

## Sessão (`src/app/session/session.ts`)

```ts
type SessionState = {
  exampleId: string | null;
  worldText: string;
  world: World;
  controllers: Record<string, string>;   // robotId → código vigente
  simulation: Simulation;
  state: SimulationState;
  running: boolean;
  speed: number;
  worldIssues: ValidationIssue[];        // da última tentativa de aplicar mundo
  controllerIssues: ControllerIssue[];   // da última tentativa de aplicar controlador
};

function createSession(worldText: string, controllers: Record<string, string>, exampleId?: string): SessionState; // lança se inválido
function applyWorld(session, worldText, controllers?, exampleId?): SessionState;  // inválido → mantém e preenche worldIssues
function applyController(session, robotId, source): SessionState;                // inválido → mantém e preenche controllerIssues
function play(session): SessionState;      // não executa se a partida terminou
function pause(session): SessionState;
function stepOnce(session): SessionState;  // só pausado
function advance(session, ticks): SessionState; // usado pelo laço; pausa ao fim da partida
function reset(session): SessionState;
function setSpeed(session, speed): SessionState;
```

Toda transição devolve um novo objeto (imutável); o núcleo é chamado só por
`createSimulation`, `step(n)` e `reset()`.
