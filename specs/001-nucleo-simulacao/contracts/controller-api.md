# Contrato: API do controlador

Referências: spec US6, FR-018 a FR-020; research D-09.

## Forma do controlador

Um controlador é um arquivo JavaScript (script, não módulo: sem `import`/`export`) que
declara `onTick(robot)`. O código de nível superior roda **uma vez**, na criação (ou
reinício) da simulação; `onTick` roda a cada tick. Variáveis de nível superior
funcionam como memória entre ticks.

```js
// Exemplo: anda e desvia de obstáculos
let turning = false;

function onTick(robot) {
  const ranges = robot.readLaser();
  const front = ranges[Math.floor(ranges.length / 2)];
  if (front < 0.4) turning = true;
  if (front > 0.8) turning = false;
  robot.setSpeed(turning ? 0 : 0.5, turning ? 1.5 : 0);
}
```

## Objeto `robot`

| Operação | Assinatura | Retorno / efeito | Erros |
|----------|-----------|------------------|-------|
| `readLaser` | `(id?: string) => number[]` | distâncias do laser, do raio mais à direita para o mais à esquerda (cópia nova a cada chamada) | sem laser / id inexistente / id de outro tipo |
| `readSonar` | `(id?: string) => number` | menor distância do cone | idem |
| `readBumper` | `(id?: string) => boolean` | bumper acionado no último tick | idem |
| `readFloor` | `(id?: string) => number` | refletância em [0, 1] | idem |
| `readOdometry` | `() => { x, y, theta, distance }` | odometria (cópia) | — |
| `setSpeed` | `(v: number, w: number) => void` | define o comando; saturado às velocidades máximas | `v`/`w` não finitos |
| `random` | `() => number` | [0, 1), fluxo semeado `robot:<id>:controller` | — |
| `time` | `() => number` | tempo simulado (s) no início do tick | — |
| `log` | `(message: unknown) => void` | registra `{ tick, message: String(message) }` (máx. 100 por robô) | — |
| `id` | `string` (somente leitura) | identificador do robô | — |

Sem `id`, `read*` usa o **primeiro** sensor do tipo na ordem do mundo.

## Ambiente

Disponíveis: sintaxe JavaScript ES2022, `Math` (exceto `Math.random`), `JSON`, `Number`,
`String`, `Array`, `Object`, `Boolean`, `Map`, `Set`, `Infinity`, `NaN`, `isFinite`,
`parseFloat`, `parseInt`.

Indisponíveis (lançam erro em português ao uso): `Math.random`, `Date`, `performance`,
`setTimeout`, `setInterval`, `queueMicrotask`, `fetch`, `globalThis`, `window`, `self`,
`global`, `process`, `require`.

## Erros

| Momento | Situação | Resultado |
|---------|----------|-----------|
| Criação | erro de sintaxe | criação falha: `{ robotId, code: "CONTROLLER_SYNTAX", line, column, message }` |
| Criação | `onTick` ausente ou não é função | criação falha: `code: "CONTROLLER_MISSING_ONTICK"` |
| Criação | erro no código de nível superior | criação falha: `code: "CONTROLLER_INIT_ERROR"` |
| Tick | exceção em `onTick`, recurso indisponível, argumento inválido | robô passa a `status: "error"`, comando (0, 0), `error: { tick, message }`; não volta a ser chamado até `reset()` |

Mensagens de exemplo:

- `Controlador do robô 'r1', linha 3, coluna 7: erro de sintaxe (Unexpected token)`
- `Controlador do robô 'r1': a função onTick(robot) é obrigatória`
- `Math.random não está disponível no controlador; use robot.random()`
- `Date não está disponível no controlador; use robot.time()`
- `O robô 'r1' não tem sensor 'inexistente'`
