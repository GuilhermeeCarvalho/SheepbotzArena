---
description: "Lista de tarefas da feature 001 — Núcleo de simulação headless"
---

# Tarefas: Núcleo de simulação headless

**Entrada**: documentos de `specs/001-nucleo-simulacao/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/)

**Testes**: obrigatórios (constitution, princípio III). Cada história tem suas tarefas
de teste; a ordem entre teste e implementação é livre, mas a história só fecha com os
testes aprovados.

**Organização**: uma fase por história de usuário, em ordem de prioridade. Cada fase é uma
fatia vertical: ao final, a história funciona e é testável sozinha.

## Formato: `[ID] [P?] [História] Descrição (requisitos)`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[USx]**: história de usuário da spec
- Toda tarefa cita os `FR` que atende; o commit que a implementa segue o formato
  `<tipo>(001/<ID>): <descrição> [<FR>, ...]` (constitution, princípio VII)

---

## Fase 1: Preparação (infraestrutura compartilhada)

**Objetivo**: projeto TypeScript com testes, cobertura, lint e README prontos.

- [x] T001 Criar `package.json` (`"type": "module"`, Node ≥ 22) com scripts `test`, `test:coverage`, `lint`, `format`, `sim`, `readme:stats` e dependências `zod`, `acorn`; dev: `typescript`, `vitest`, `@vitest/coverage-v8`, `tsx`, `eslint`, `typescript-eslint`, `prettier` (plan: Contexto técnico)
- [x] T002 [P] Criar `tsconfig.json` (`strict`, ES2022, `moduleResolution: bundler`, alias `src/*`) (plan: Contexto técnico)
- [x] T003 [P] Criar `vitest.config.ts` com cobertura V8, reporters `text`/`html`/`json-summary`, limites de 80% em linhas, funções, ramificações e instruções, exclusão apenas de `src/cli/main.ts`, e reporter JSON em `coverage/test-results.json` (research D-16)
- [x] T004 [P] Criar `eslint.config.js` com `typescript-eslint` e a regra de direção de dependências de `src/core/**` (sem `src/modalities`, `src/app`, `src/cli`, `react`, `three`, `node:*`) e `.prettierrc` (research D-15)
- [x] T005 [P] Criar `scripts/update-readme-stats.mjs`, que reescreve a linha entre `<!-- stats:start -->` e `<!-- stats:end -->` do `README.md` com "N testes · X% de cobertura" a partir de `coverage/` (research D-16)
- [x] T006 Ajustar `.gitignore` (`node_modules/`, `dist/`) mantendo `coverage/` versionado (research D-16)

**Checkpoint**: `npm test` roda (sem testes), `npm run lint` passa.

---

## Fase 2: Fundação (pré-requisitos bloqueantes)

**Objetivo**: matemática, aleatoriedade e tipos de estado usados por todas as histórias.

- [x] T007 [P] Testes de `tests/unit/core/math/angle.test.ts`: `normalizeAngle` nas fronteiras −π, π, 3π/2, −3π/2, 0 (FR-007)
- [x] T008 [P] Testes de `tests/unit/core/math/geometry.test.ts`: distância ponto–segmento, ponto–caixa orientada, ponto dentro de disco/anel/caixa/linha com espessura (FR-009, FR-016)
- [x] T009 [P] Testes de `tests/unit/core/random/prng.test.ts`: mesma seed → mesma sequência; fluxos com nomes diferentes são independentes; gaussiana com média e desvio aproximados (FR-008, FR-017)
- [x] T010 [P] Implementar `src/core/math/vec2.ts` e `src/core/math/angle.ts` (FR-007)
- [x] T011 [P] Implementar `src/core/math/geometry.ts` (FR-009, FR-016)
- [x] T012 [P] Implementar `src/core/random/prng.ts` (mulberry32, splitmix32, `createStream(seed, name)`, `gaussian`) (FR-008, FR-017; research D-08)
- [x] T013 [P] Definir tipos em `src/core/simulation/state.ts` (`SimulationState`, `RobotState`) e `src/core/modality/contract.ts` (`Modality`, `Referee`, `MatchStatus`, `createModalityRegistry`) conforme os contratos (FR-021, FR-024)

**Checkpoint**: fundação testada; histórias podem começar.

---

## Fase 3: História 1 — Descrever um mundo e receber erros claros (P1) 🎯 MVP

**Objetivo**: carregar e validar mundos com todos os erros, caminho e motivo em português.

**Teste independente**: `loadWorld` sobre os fixtures, sem executar ticks.

### Testes da história 1

- [x] T014 [P] [US1] Criar fixtures em `tests/fixtures/worlds/` (`valid-basic.json`, `invalid-syntax.json`, `invalid-radius-zero.json`, `invalid-three-errors.json`, `invalid-unknown-field.json`, `invalid-overlap.json`, `defaults.json`) (FR-001, FR-003)
- [x] T015 [P] [US1] Testes de aceitação `US1-AC1` a `US1-AC7` em `tests/acceptance/us1-world.test.ts` (FR-001 a FR-004)
- [x] T016 [P] [US1] Testes unitários do catálogo de erros em `tests/unit/core/world/issues.test.ts` (cada código de `contracts/world-file.md`), incluindo `OUT_OF_ARENA` com e sem paredes, `INVALID_GEOMETRY`, `UNSUPPORTED_VERSION` e `UNKNOWN_MODALITY` (FR-002, FR-003)

### Implementação da história 1

- [x] T017 [US1] Implementar `src/core/world/issues.ts` (tipo `ValidationIssue`, códigos, `formatIssues`) (FR-002)
- [x] T018 [US1] Implementar `src/core/world/schema.ts` (esquema Zod estrito, padrões, mensagens em português, conversão de problemas do Zod em `ValidationIssue`) (FR-001, FR-003, FR-004)
- [x] T019 [US1] Implementar `src/core/world/semanticRules.ts` (ids repetidos, modalidade desconhecida, fora da arena, sobreposição inicial) (FR-003)
- [x] T020 [US1] Implementar `src/core/world/loadWorld.ts` (`JSON.parse` com linha/coluna, `validateWorld`, `loadWorld`) e exportar em `src/core/index.ts` (FR-001 a FR-004)

**Checkpoint**: US1 completa e testada isoladamente.

---

## Fase 4: História 2 — Mover um robô de forma previsível (P1)

**Objetivo**: simulação por ticks com cinemática em arco exato e controlador mínimo
(`onTick` + `setSpeed`).

**Teste independente**: mundos sem obstáculos, controladores de velocidade constante.

### Testes da história 2

- [x] T021 [P] [US2] Testes unitários de `integrateArc` e `saturateCommand` em `tests/unit/core/kinematics/diffDrive.test.ts`, incluindo equivalência de 1 passo `h` com `n` passos `h/n` (FR-005, FR-006)
- [x] T022 [P] [US2] Criar fixtures `tests/fixtures/worlds/straight-line.json` e controladores `tests/fixtures/controllers/forward-1ms.js`, `arc-quarter.js`, `spin.js`, `idle.js` (FR-005)
- [x] T023 [P] [US2] Testes de aceitação `US2-AC1` a `US2-AC8` em `tests/acceptance/us2-kinematics.test.ts` (FR-005 a FR-008)

### Implementação da história 2

- [x] T024 [US2] Implementar `src/core/kinematics/diffDrive.ts` (FR-005, FR-006)
- [x] T025 [US2] Implementar versão mínima de `src/core/controller/compile.ts` (avaliação com `new Function`, retorno de `onTick`) e `src/core/controller/robotApi.ts` com `setSpeed`, `time` e `id` (FR-018)
- [x] T026 [US2] Implementar `src/core/simulation/tick.ts` (passos 2, 3, 4 sem colisão e 7 do pipeline do plano) e `src/core/simulation/simulation.ts` (`createSimulation`, `step`, `getState` com snapshot congelado) (FR-005, FR-007, FR-008, FR-021)

**Checkpoint**: US1 e US2 funcionam; pose final após N ticks verificável.

---

## Fase 5: História 3 — Enxergar o mundo com laser e sonar (P1)

**Objetivo**: raycast analítico contra paredes, caixas, discos e outros robôs.

**Teste independente**: um tick em mundos simples; comparar leituras.

### Testes da história 3

- [x] T027 [P] [US3] Testes unitários de `castRay` em `tests/unit/core/sensors/raycast.test.ts`: segmento, disco (incluindo tangente), caixa orientada (incluindo quina), origem interna → 0, ignorar o próprio robô (FR-011, FR-013)
- [x] T028 [P] [US3] Criar fixtures `tests/fixtures/worlds/laser-*.json` para os cenários da US3 (FR-011 a FR-013)
- [x] T029 [P] [US3] Testes de aceitação `US3-AC1` a `US3-AC9` em `tests/acceptance/us3-rangefinders.test.ts` (FR-011 a FR-013, FR-017)

### Implementação da história 3

- [x] T030 [US3] Implementar `src/core/sensors/raycast.ts` e `src/core/collision/staticBodies.ts` (paredes, caixas, discos e bordas da arena como corpos consultáveis) (FR-011, FR-013)
- [x] T031 [US3] Implementar `src/core/sensors/rangefinder.ts` (distribuição de raios, ordem direita → esquerda, sonar = mínimo, ruído semeado com limite [0, maxRange]) (FR-011, FR-012, FR-017)
- [x] T032 [US3] Integrar leituras ao pipeline (passo 6 e leituras iniciais) e adicionar `readLaser`/`readSonar` em `src/core/controller/robotApi.ts` (FR-011, FR-012, FR-018)

**Checkpoint**: critérios de aceitação de posição e laser do trabalho cobertos.

---

## Fase 6: História 7 — Executar sem interface e obter o resultado (P1)

**Objetivo**: API completa (`reset`, `step(n)`) e linha de comando com códigos de término.

**Teste independente**: `run()` da CLI com fixtures; propriedades de `step` e `reset`.

### Testes da história 7

- [x] T033 [P] [US7] Testes de aceitação `US7-AC1` a `US7-AC5` em `tests/acceptance/us7-headless.test.ts`, mais o caso de borda "partida encerrada não avança" com uma modalidade falsa de teste registrada (FR-021, FR-022, FR-024)
- [x] T034 [P] [US7] Testes de `tests/unit/cli/run.test.ts`: argumentos inválidos (código 1), arquivo ausente (1), mundo inválido (2), controlador inválido (3), tempo limite (4), precedência de `--controller` sobre `robots[].controller` (FR-022)

### Implementação da história 7

- [x] T035 [US7] Implementar `reset()`, status `no-controller` e avaliação do árbitro (passos 1 e 8 do pipeline) em `src/core/simulation/simulation.ts` e `tick.ts` (FR-021, FR-024)
- [x] T036 [US7] Implementar `src/cli/run.ts` e `src/cli/worker.ts` (worker thread com tempo limite) (FR-022)
- [x] T037 [US7] Implementar `src/cli/main.ts` (bootstrap) e o script `sim` no `package.json` (FR-022)

**Checkpoint**: MVP completo para os testes de aceitação do trabalho (posição, laser, erros).

---

## Fase 7: História 4 — Colidir sem atravessar e sentir o contato (P2)

**Objetivo**: colisão estática e entre robôs com subpassos; bumpers por setor.

**Teste independente**: parede ou segundo robô à frente; poses finais e bumpers.

### Testes da história 4

- [x] T038 [P] [US4] Testes unitários de `tests/unit/core/collision/resolve.test.ts`: separação estática, divisão por massa, centros coincidentes, robô encurralado (estáticos vencem), ordem fixa (FR-009, FR-010)
- [x] T039 [P] [US4] Testes unitários de `tests/unit/core/sensors/bumper.test.ts`: setor inclusivo, setor que cruza ±π (FR-015)
- [x] T040 [P] [US4] Testes de aceitação `US4-AC1` a `US4-AC8` em `tests/acceptance/us4-collision.test.ts` (FR-009, FR-010, FR-015)

### Implementação da história 4

- [x] T041 [US4] Implementar `src/core/collision/resolve.ts` (research D-05, D-06) (FR-009, FR-010)
- [x] T042 [US4] Implementar subpassos no `src/core/simulation/tick.ts` (research D-04) (FR-009)
- [x] T043 [US4] Implementar `src/core/sensors/bumper.ts` e `readBumper` na API do robô (FR-015, FR-018)

**Checkpoint**: robôs não atravessam nada; empurrão proporcional à massa.

---

## Fase 8: História 5 — Odometria e piso (P2)

**Objetivo**: odometria por comando no referencial inicial e sensor de refletância.

**Teste independente**: movimentos simples e sensores sobre regiões conhecidas.

### Testes da história 5

- [x] T044 [P] [US5] Testes unitários de `tests/unit/core/sensors/floor.test.ts` (rect com rotação, disco, anel, linha, prioridade da última região, borda inclusiva) (FR-016)
- [x] T045 [P] [US5] Testes de aceitação `US5-AC1` a `US5-AC4` em `tests/acceptance/us5-odometry-floor.test.ts` (FR-014, FR-016, FR-017)

### Implementação da história 5

- [x] T046 [US5] Implementar `src/core/sensors/odometry.ts` e integrá-la ao passo 5 do pipeline (FR-014, FR-017)
- [x] T047 [US5] Implementar `src/core/sensors/floor.ts` e integrá-lo ao passo 6 (FR-016, FR-017)
- [x] T048 [US5] Adicionar `readOdometry` e `readFloor` à API do robô (FR-014, FR-016, FR-018)

**Checkpoint**: sensores necessários às modalidades Sumô e Seguidor de Linha prontos.

---

## Fase 9: História 6 — Controlador contra API limitada (P2)

**Objetivo**: erros claros, isolamento do determinismo e API completa.

**Teste independente**: controladores corretos, com erro de sintaxe, sem `onTick`, com
exceção e usando recursos proibidos.

### Testes da história 6

- [x] T049 [P] [US6] Criar controladores em `tests/fixtures/controllers/` (`syntax-error.js`, `no-ontick.js`, `throws-at-tick-5.js`, `uses-date.js`, `uses-math-random.js`, `stop-before-wall.js`, `unknown-sensor.js`) (FR-018 a FR-020)
- [x] T050 [P] [US6] Testes de aceitação `US6-AC1` a `US6-AC6` em `tests/acceptance/us6-controller.test.ts` (FR-018 a FR-020)
- [x] T051 [P] [US6] Testes unitários de `tests/unit/core/controller/robotApi.test.ts` (`random` semeado, `log` com limite de 100, `setSpeed` com `NaN`, sensor de outro tipo) (FR-018, FR-019)

### Implementação da história 6

- [x] T052 [US6] Completar `src/core/controller/compile.ts`: verificação com `acorn` (linha/coluna), escopo sombreado, `CONTROLLER_*` (research D-09) (FR-019, FR-020)
- [x] T053 [US6] Completar `src/core/controller/robotApi.ts` (`random`, `log`, erros de sensor) e tratamento de exceções por robô no `tick.ts` (FR-018, FR-020)

**Checkpoint**: todas as histórias funcionam e são testáveis isoladamente.

---

## Fase 10: Acabamento e transversais

- [x] T054 [P] Criar `examples/worlds/corridor.json`, `examples/worlds/obstacle-field.json` e `examples/controllers/avoid-obstacles.js`, `examples/controllers/wall-follower.js`, com teste em `tests/acceptance/examples.test.ts` que roda cada exemplo sem bumper acionado (SC-005; FR-001, FR-018)
- [x] T055 [P] Teste de desempenho SC-004 em `tests/perf/throughput.test.ts`, fora da suíte padrão (`npm run test:perf`) (SC-004)
- [x] T056 [P] Teste de determinismo SC-002 (4 robôs, 10 000 ticks, duas execuções) em `tests/acceptance/determinism.test.ts` (FR-008; SC-002)
- [x] T057 Validar `quickstart.md` de ponta a ponta e corrigir divergências (todos os FR)
- [x] T058 Rodar `npm run test:coverage`, versionar `coverage/` e atualizar o README com `npm run readme:stats` (constitution, princípio VII)

---

## Dependências e ordem de execução

### Entre fases

- **Preparação (1)** → **Fundação (2)** → histórias.
- **US1 (3)** → **US2 (4)**: a simulação usa mundos validados.
- **US3 (5)**, **US4 (7)**, **US5 (8)** dependem de US2; são independentes entre si
  (arquivos distintos; os pontos de integração em `tick.ts` e `robotApi.ts` são pequenos
  e devem ser feitos em sequência).
- **US7 (6)** depende de US2; recomenda-se após US3 para o MVP cobrir posição e laser.
- **US6 (9)** depende de US2; reforça o controlador mínimo.
- **Acabamento (10)** depende de todas.

### Dentro de cada história

Fixtures → implementação e testes (em qualquer ordem) → integração no pipeline → testes aprovados → checkpoint.

### Oportunidades de paralelismo

- T002 a T005; T007 a T013; testes [P] de cada história.
- Com duas pessoas, após US2: uma segue US3 → US7, a outra US4 → US5; US6 por último.

## Exemplo de paralelismo: História 3

```text
Em paralelo: T027 (raycast.test.ts), T028 (fixtures laser-*.json), T029 (us3-rangefinders.test.ts)
Em seguida:  T030 → T031 → T032
```

## Estratégia de implementação

### MVP primeiro

1. Fases 1 e 2.
2. US1 → US2 → US3 → US7: cobre os três critérios dos testes de aceitação do trabalho
   (posição após N ticks, laser, mundos inválidos) via CLI.
3. **Parar e validar** com o `quickstart.md` (seções 1 a 4).

### Entregas incrementais

4. US4 (colisão e bumper) → US5 (odometria e piso) → US6 (controlador robusto).
5. Acabamento: exemplos, desempenho, determinismo, cobertura e README.

## Rastreabilidade

| Requisito | Tarefas |
|-----------|---------|
| FR-001 | T014, T015, T018, T020, T054 |
| FR-002 | T015, T016, T017, T018, T020 |
| FR-003 | T014, T015, T016, T018, T019, T020 |
| FR-004 | T015, T018, T020 |
| FR-005 | T021, T022, T023, T024, T026 |
| FR-006 | T021, T023, T024 |
| FR-007 | T007, T010, T023, T026 |
| FR-008 | T009, T012, T023, T026, T056 |
| FR-009 | T008, T011, T038, T040, T041, T042 |
| FR-010 | T038, T040, T041 |
| FR-011 | T027, T028, T029, T030, T031, T032 |
| FR-012 | T028, T029, T031, T032 |
| FR-013 | T027, T028, T029, T030 |
| FR-014 | T045, T046, T048 |
| FR-015 | T039, T040, T043 |
| FR-016 | T008, T011, T044, T045, T047, T048 |
| FR-017 | T009, T012, T029, T031, T045, T046, T047 |
| FR-018 | T025, T032, T043, T048, T049, T050, T051, T053, T054 |
| FR-019 | T049, T050, T051, T052 |
| FR-020 | T049, T050, T052, T053 |
| FR-021 | T013, T026, T033, T035 |
| FR-022 | T033, T034, T036, T037 |
| FR-023 | T029, T040, T056 (cenários com vários robôs) |
| FR-024 | T013, T033, T035 (contrato e modalidade falsa de teste; implementações nas features 003+) |

## Notas

- [P] = arquivos diferentes, sem dependências pendentes.
- Uma história só é concluída com todos os seus testes aprovados.
- Um commit por tarefa (ou por par teste/implementação), sempre citando ID e FR.
- Parar em cada checkpoint para validar a história isoladamente.
