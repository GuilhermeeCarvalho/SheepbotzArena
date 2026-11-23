# Contrato: modalidade Sumô (`src/modalities/sumo/`)

Implementa `Modality` (feature 001, `contracts/modality.md`).

```ts
type SumoCategoryId = 'mega' | 'mini' | 'lego';

type SumoCategory = {
  id: SumoCategoryId;
  modalityId: `sumo-${SumoCategoryId}`;
  name: string;                 // "Mini Sumô (500 g)"
  dohyoRadius: number;          // m (com Tawara)
  tawaraWidth: number;          // m
  shikiriOffset: number;        // m, do centro ao centro da linha
  shikiriWidth: number;         // m
  shikiriLength: number;        // m
  yochiSize: number;            // m
  maxRobotSize: number;         // m (largura/comprimento)
  maxRobotMass: number | null;  // kg; null = não verificada
  startDelay: number;           // s (5 no LEGO®, 0 nas demais)
};

const SUMO_CATEGORIES: Record<SumoCategoryId, SumoCategory>;
const DEFAULT_ROUND_TIME_LIMIT = 60;          // s (H-04)
const FALSE_START_DISTANCE = 0.02;            // m (H-05)
const FALSE_START_ROTATION = 0.05;            // rad (H-05)

function createSumoModality(category: SumoCategory): Modality;
function isOutOfDohyo(pose: { x: number; y: number }, category: SumoCategory): boolean;

type SumoRobotInput = {
  id: string; name?: string; color?: string;
  side: 'left' | 'right';            // lado da Shikiri-sen (x < 0 ou x > 0)
  theta?: number;                    // padrão: de frente para o centro
  y?: number;                        // padrão 0
  distanceBehindLine?: number;       // folga além da linha (m), padrão 0,02
  radius: number; mass: number; maxLinearSpeed: number; maxAngularSpeed: number;
  sensors: unknown[]; controller?: string;
};
function createSumoWorld(category: SumoCategory, robots: [SumoRobotInput, SumoRobotInput],
  options?: { name?: string; seed?: number; dt?: number; roundTimeLimit?: number }): object; // JSON do mundo
```

## `modalityOptions`

| Campo | Tipo | Padrão | Regra |
|-------|------|--------|-------|
| `roundTimeLimit` | número (s) | 60 | > 0 |

Outros campos em `modalityOptions` geram `MODALITY_RULE` ("opção desconhecida").

## `MatchStatus`

```ts
{
  phase: 'running' | 'finished',
  winner: string | null,                 // id do robô
  reason: string | null,                 // ex.: "r2 saiu do Dohyo — Yuko para r1"
  score: { [robotId]: 0 | 1 },
  details: { category: SumoCategoryId, elapsed: number, timeLimit: number,
             outOfDohyo: string[], falseStart: string[] }
}
```

## Erros de validação (`MODALITY_RULE`)

| Caminho | Mensagem (modelo) |
|---------|-------------------|
| `robots` | `a partida de Sumô exige exatamente 2 robôs (encontrados: N)` |
| `robots[i].radius` | `diâmetro de X m excede o limite de Y m da categoria (Art. 4)` |
| `robots[i].mass` | `massa de X kg excede o limite de Y kg da categoria` |
| `robots[i].pose` | `o robô ultrapassa a Shikiri-sen (Art. 10)` / `o robô está fora da extensão da Shikiri-sen (Art. 10)` |
| `robots` | `os robôs devem começar em lados opostos da Shikiri-sen (Art. 10)` |
| `modalityOptions.roundTimeLimit` | `deve ser maior que 0` |
| `modalityOptions.<campo>` | `opção desconhecida '<campo>' para o Sumô` |
