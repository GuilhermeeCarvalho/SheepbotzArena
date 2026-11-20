# Plano de implementação: Núcleo de simulação headless

**Feature**: `001-nucleo-simulacao` | **Data**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Entrada**: especificação em `specs/001-nucleo-simulacao/spec.md`

## Resumo

Biblioteca TypeScript pura (`src/core`) que carrega e valida mundos JSON, simula robôs de
tração diferencial com integração em arco exato, colisões por posição com subpassos,
sensores analíticos (laser, sonar, bumper, piso, odometria) e executa controladores
JavaScript síncronos por tick numa API limitada. Uma linha de comando (`src/cli`) roda a
simulação sem interface e imprime o estado final em JSON. As decisões estão em
[research.md](./research.md).

## Contexto técnico

**Linguagem/Versão**: TypeScript 5 (modo `strict`, `"type": "module"`), alvo ES2022;
Node.js 22+ para testes e linha de comando.

**Dependências principais**: `zod` 4 (validação do mundo), `acorn` (análise sintática do
controlador). Desenvolvimento: `vitest`, `@vitest/coverage-v8`, `tsx`, `eslint`,
`typescript-eslint`, `prettier`. Sem React/Three.js nesta feature (entram na 002).

**Armazenamento**: arquivos (mundo JSON e controladores `.js`); nenhum banco de dados.

**Testes**: Vitest. `tests/acceptance` contém um teste por cenário de aceitação da spec,
nomeado com o identificador do cenário (ex.: `US2-AC2`); `tests/unit` cobre módulos
internos e casos de borda.

**Plataforma alvo**: Node.js 22+ e navegadores modernos (o núcleo não usa APIs exclusivas
de nenhum dos dois).

**Tipo de projeto**: aplicação web de pacote único; nesta feature, biblioteca + CLI.

**Metas de desempenho**: SC-004 — 10 000 ticks, 4 robôs, laser de 30 raios, 20
obstáculos em menos de 5 s.

**Restrições**: determinismo (princípio VI); sem motor de física; núcleo sem DOM, React,
Three.js ou `node:*`.

**Escala/escopo**: mundos com até ~10 robôs e ~100 obstáculos.

## Verificação da constituição

*Gate: antes da pesquisa (fase 0) e repetida após o desenho (fase 1).*

| Princípio | Verificação | Situação |
|-----------|-------------|----------|
| I. 2D com visualização 3D | Núcleo 2D puro; nenhuma renderização nesta feature; estado serializável para a feature 002. | ✅ |
| II. Regras da RoboCore | Feature genérica, sem regra regulamentar; nenhum parâmetro de categoria é codificado no núcleo. | ✅ (não se aplica) |
| III. Testes dos critérios de aceitação | Cada história tem tarefas de teste e só fecha com os testes aprovados; um teste por cenário numérico. | ✅ |
| IV. Baixo acoplamento | Contrato `Modality` no núcleo com registro injetado (D-14); regra de lint de dependências (D-15). | ✅ |
| V. Idioma | Mensagens de erro e documentação em português; identificadores e campos do JSON em inglês. | ✅ |
| VI. Determinismo e física própria | `dt` e seed fixos, fluxos aleatórios semeados (D-08), controlador sem relógio/aleatoriedade (D-09), cinemática e colisão próprias (D-01, D-05). | ✅ |
| VII. Rastreabilidade e cobertura | Tarefas citam FR; limites de 80% no Vitest; relatório versionado e README atualizado por script (D-16). | ✅ |

Reavaliação após a fase 1: sem violações. A tabela de complexidade não é necessária.

## Arquitetura

```text
             ┌──────────────┐       ┌──────────────────────┐
  mundo.json │  world/      │ World │  simulation/         │ SimulationState
 ───────────►│  loadWorld   ├──────►│  createSimulation    ├────────────────► CLI (JSON)
             │  (Zod + regras│       │  step/reset/getState │                  feature 002 (3D)
             │  semânticas) │       └──┬───────┬───────┬───┘                  feature 005 (replay)
             └──────────────┘          │       │       │
                     ┌─────────────────┘       │       └──────────────┐
                     ▼                         ▼                      ▼
            kinematics/ + collision/     sensors/               controller/
            (arco exato, subpassos,      (raycast, piso,        (acorn + escopo
             resolução por posição)       bumper, odometria)     sombreado, API robot)
                     ▲                         ▲                      ▲
                     └──────── math/ (vec2, ângulos, geometria) ──────┘
                               random/ (mulberry32, fluxos)

  modality/contract.ts  ◄── implementado por src/modalities/* (feature 004+), injetado via registro
```

### Pipeline de um tick (`simulation/tick.ts`)

1. Se a partida terminou, devolver o estado atual sem avançar.
2. Para cada robô (ordem do mundo) com controlador ativo: chamar `onTick(robot)` com as
   leituras do fim do tick anterior; capturar exceções → estado `error`, comando (0, 0).
3. Saturar comandos; calcular `n` subpassos (D-04).
4. Para cada subpasso: integrar todos os robôs por `dt/n` (D-01); resolver colisões (D-05);
   registrar contatos (D-06).
5. Integrar a odometria com o comando saturado por `dt` inteiro e aplicar ruído.
6. Calcular as leituras de laser, sonar, piso e bumpers a partir do estado final.
7. `tick += 1`, `time = tick · dt`.
8. Se houver árbitro: `match = referee.evaluate(snapshot)`.

## Estrutura do projeto

### Documentação (desta feature)

```text
specs/001-nucleo-simulacao/
├── spec.md
├── plan.md               # este arquivo
├── research.md           # decisões D-01..D-16
├── data-model.md         # entidades e regras de validação
├── quickstart.md         # roteiro de validação
├── contracts/
│   ├── world-file.md     # formato do arquivo de mundo e catálogo de erros
│   ├── controller-api.md # API do controlador
│   ├── simulation-api.md # API programática do núcleo
│   ├── cli.md            # linha de comando
│   └── modality.md       # contrato de extensão de modalidades
├── checklists/requirements.md
└── tasks.md
```

### Código-fonte (raiz do repositório)

```text
src/
├── core/
│   ├── index.ts                  # API pública do núcleo (barrel)
│   ├── math/
│   │   ├── vec2.ts               # operações vetoriais 2D
│   │   ├── angle.ts              # normalizeAngle, toRobotFrame
│   │   └── geometry.ts           # distâncias e interseções (segmento, disco, caixa)
│   ├── random/
│   │   └── prng.ts               # mulberry32, splitmix32, createStream, gaussian
│   ├── world/
│   │   ├── schema.ts             # esquema Zod + tipos inferidos
│   │   ├── semanticRules.ts      # ids repetidos, sobreposição, fora da arena, modalidade
│   │   ├── issues.ts             # ValidationIssue, códigos e mensagens pt-BR
│   │   └── loadWorld.ts          # parse JSON (linha/coluna) + esquema + regras
│   ├── kinematics/
│   │   └── diffDrive.ts          # integrateArc, saturateCommand
│   ├── collision/
│   │   ├── staticBodies.ts       # paredes, caixas, discos, bordas da arena
│   │   └── resolve.ts            # resolução estática e robô × robô, contatos
│   ├── sensors/
│   │   ├── raycast.ts            # castRay contra o mundo
│   │   ├── rangefinder.ts        # laser e sonar
│   │   ├── floor.ts              # regiões do piso e leitura
│   │   ├── bumper.ts             # setores e acionamento
│   │   └── odometry.ts           # integração comandada + ruído
│   ├── controller/
│   │   ├── compile.ts            # acorn + avaliação com escopo sombreado
│   │   └── robotApi.ts           # objeto robot exposto ao controlador
│   ├── modality/
│   │   └── contract.ts           # Modality, Referee, MatchStatus, ModalityRegistry
│   └── simulation/
│       ├── state.ts              # tipos de estado e snapshot congelado
│       ├── tick.ts               # pipeline de um tick
│       └── simulation.ts         # createSimulation, step, reset, getState
└── cli/
    ├── run.ts                    # análise de argumentos, leitura de arquivos, códigos de término
    ├── worker.ts                 # execução da simulação na worker thread
    └── main.ts                   # bootstrap (excluído da cobertura)

tests/
├── acceptance/                   # um arquivo por história: us1-world.test.ts … us7-headless.test.ts
├── unit/                         # espelha src/core e src/cli
└── fixtures/
    ├── worlds/                   # mundos válidos e inválidos usados na spec
    └── controllers/              # controladores de exemplo

examples/
├── worlds/                       # mundos de demonstração (obstáculos, corredor)
└── controllers/                  # avoid-obstacles.js, wall-follower.js

scripts/update-readme-stats.mjs   # atualiza a linha de testes e cobertura do README
```

**Decisão de estrutura**: pacote único com fronteiras por diretório. O código de `src/`
usa imports relativos (o alias `src/*` é usado só nos testes), porque a worker thread da
CLI carrega o TypeScript com `tsx` sem resolução de aliases (`src/cli/worker-entry.mjs`). `src/modalities/` e
`src/app/` serão criados pelas features 004 e 002. A regra de lint D-15 garante a
direção `app → modalities → core` e `cli → core`.

## Estratégia de testes

| Camada | O que cobre | Onde |
|--------|-------------|------|
| Aceitação | Cada cenário `USx-ACy` da spec, com valores numéricos e tolerância 1e-3 | `tests/acceptance/` |
| Unidade | Geometria, normalização, PRNG, esquema, mensagens, resolução de colisão, API do robô | `tests/unit/` |
| Propriedade simples | Determinismo (duas execuções iguais), `step(1)×10 ≡ step(10)`, reset | `tests/acceptance/us7-headless.test.ts` |
| CLI | `run()` com argumentos e arquivos de fixture; códigos de término | `tests/unit/cli/` |
| Desempenho | SC-004 como teste marcado (`perf`) fora da suíte padrão | `tests/perf/` |

Cada história tem suas tarefas de teste na mesma fase; teste e implementação podem ser
escritos em qualquer ordem, mas o checkpoint da história exige a suíte aprovada.

## Unidades e constantes nomeadas

| Constante | Valor | Unidade | Origem |
|-----------|-------|---------|--------|
| `DEFAULT_DT` | 0,05 | s | spec FR-004 |
| `MAX_DT` | 0,1 | s | spec FR-004 |
| `DEFAULT_SEED` | 1 | — | spec FR-004 |
| `DEFAULT_MAX_LINEAR_SPEED` | 1,0 | m/s | spec FR-006 |
| `DEFAULT_MAX_ANGULAR_SPEED` | 2π | rad/s | spec FR-006 |
| `CONTACT_EPSILON` | 1e-6 | m | research D-06 |
| `ROBOT_PAIR_ITERATIONS` | 4 | — | research D-05 |
| `MAX_LOG_ENTRIES` | 100 | — | research D-13 |
| `DEFAULT_CLI_TIMEOUT_MS` | 10 000 | ms | research D-12 |

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Diferenças de ponto flutuante entre motores JS | Tolerância nos critérios; determinismo exigido só no mesmo ambiente. |
| Robô preso entre parede e robô oscila | Estáticos sempre vencem (D-05 passo 3); teste de caso de borda. |
| Controlador em laço infinito trava o navegador | Limitação documentada; tempo limite na CLI; feature 002 avalia aviso na UI. |
| Cobertura cair abaixo de 80% com a UI (002) | Lógica da UI em funções puras testáveis; limites verificados a cada entrega. |
