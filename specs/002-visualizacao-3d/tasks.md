---
description: "Lista de tarefas da feature 002 — Visualização 3D e controles"
---

# Tarefas: Visualização 3D e controles

**Entrada**: documentos de `specs/002-visualizacao-3d/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[contracts/](./contracts/)

**Testes**: obrigatórios (constitution, princípio III). Cada história tem suas tarefas de
teste; a ordem entre teste e implementação é livre, mas a história só fecha com os
testes aprovados.

## Formato: `[ID] [P?] [História] Descrição (requisitos)`

Commits: `<tipo>(002/<ID>): <descrição> [<FR>, ...]`.

---

## Fase 1: Preparação

- [ ] T001 Criar `vite.config.ts` (plugin React), `index.html`, scripts `dev`, `build`, `preview` no `package.json` (plan)
- [ ] T002 [P] Configurar Vitest para `*.test.tsx` em `jsdom`, `tests/setup-dom.ts` com `@testing-library/jest-dom`, e declarar módulos CSS (`src/vite-env.d.ts`) (research D-09)
- [ ] T003 [P] Regra de lint: `src/ui/**` não importa `src/core`, `src/modalities`, `src/app`; exclusão de cobertura de `src/app/main.tsx` (constitution v2.1.0)

---

## Fase 2: Fundação — biblioteca de componentes

**Objetivo**: `src/ui` com tokens e componentes usados por todas as histórias.

- [ ] T004 Criar `src/ui/tokens.css` (cores, espaçamentos, raios, sombras, tipografia, reset) (FR-013)
- [ ] T005 [P] Implementar `Button`, `IconButton`, `ButtonGroup`, `Toolbar`, `Kbd` em `src/ui/components/` (FR-013)
- [ ] T006 [P] Implementar `Panel`, `Tabs`, `SplitLayout`, `EmptyState` em `src/ui/components/` (FR-013, FR-014)
- [ ] T007 [P] Implementar `Select`, `Toggle`, `Field`, `Badge`, `StatusDot`, `Stat`, `IssueList` em `src/ui/components/` (FR-013)
- [ ] T008 [P] Implementar `CodeEditor` (CodeMirror 6, JavaScript/JSON, tema escuro) em `src/ui/components/CodeEditor/` (FR-011, FR-013)
- [ ] T009 Exportar tudo em `src/ui/index.ts` e testar os componentes em `tests/ui/components.test.tsx` (renderização, estados, eventos, acessibilidade básica) (FR-013)

**Checkpoint**: biblioteca pronta e testada.

---

## Fase 3: História 1 — Ver a arena e os robôs em 3D (P1) 🎯 MVP

- [ ] T010 [P] [US1] Implementar `toScene` e `buildSceneModel` (arena, paredes, regiões, obstáculos, robôs, câmera) em `src/app/scene/sceneModel.ts` (FR-001, FR-002, FR-003)
- [ ] T011 [P] [US1] Testes `US1-AC1` a `US1-AC3` (números exatos) em `tests/unit/app/sceneModel.test.ts` (FR-001, FR-002)
- [ ] T012 [US1] Implementar componentes R3F `Viewport`, `SceneContent`, `ArenaMesh`, `FloorRegions`, `ObstacleMesh`, `RobotMesh` em `src/app/scene/` com câmera orbital e "Centralizar vista" (FR-001 a FR-003)
- [ ] T013 [US1] Testes da cena com `@react-three/test-renderer` em `tests/scene/scene.test.tsx` (malhas e posições) (FR-001, FR-002)

**Checkpoint**: mundo exibido em 3D.

---

## Fase 4: História 2 — Controlar a execução (P1)

- [ ] T014 [P] [US2] Implementar `createPlaybackClock` em `src/app/session/playbackClock.ts` (FR-006)
- [ ] T015 [P] [US2] Implementar transições puras em `src/app/session/session.ts` (`createSession`, `play`, `pause`, `stepOnce`, `advance`, `reset`, `setSpeed`) (FR-005 a FR-008)
- [ ] T016 [US2] Testes `US2-AC1` a `US2-AC6` em `tests/unit/app/playback.test.ts` e `tests/unit/app/session.test.ts`, incluindo equivalência com `step(200)` do núcleo (FR-005 a FR-008)
- [ ] T017 [US2] Implementar `useSimulationSession` (requestAnimationFrame + relógio) em `src/app/session/useSimulationSession.ts` (FR-006)
- [ ] T018 [US2] Implementar `TopBar` (executar/pausar, avançar, reiniciar, velocidade, centralizar) e `StatusBar` (tick, tempo, resultado da partida) em `src/app/layout/` (FR-005, FR-008)

**Checkpoint**: simulação reproduzível na tela.

---

## Fase 5: História 3 — Ver os raios dos sensores (P1)

- [ ] T019 [US3] Adicionar raios ao `buildSceneModel` (origem, fim, `hit`, sonar, opção de ocultar) (FR-004)
- [ ] T020 [P] [US3] Implementar `SensorRays` (linhas coloridas por detecção) em `src/app/scene/SensorRays.tsx` e o `Toggle` "Mostrar raios" (FR-004)
- [ ] T021 [US3] Testes `US3-AC1` a `US3-AC4` em `tests/unit/app/sceneModel.test.ts` e `tests/scene/scene.test.tsx` (FR-004)

---

## Fase 6: História 4 — Escolher e editar o mundo (P2)

- [ ] T022 [P] [US4] Implementar exemplos embutidos em `src/app/examples/examples.ts` (FR-009)
- [ ] T023 [US4] Implementar `applyWorld` na sessão e `WorldPanel` (seletor de exemplo, abrir arquivo, editor JSON, aplicar, `IssueList`) em `src/app/panels/WorldPanel.tsx` (FR-009, FR-010)
- [ ] T024 [US4] Testes `US4-AC1` a `US4-AC4` em `tests/unit/app/session.test.ts`, `tests/unit/app/examples.test.ts` e `tests/integration/app.test.tsx` (FR-009, FR-010)

---

## Fase 7: História 5 — Editar o controlador de cada robô (P2)

- [ ] T025 [US5] Implementar `applyController` na sessão e `ControllerPanel` (seletor de robô, `CodeEditor`, aplicar, descartar, erros, ajuda da API) em `src/app/panels/ControllerPanel.tsx` (FR-011)
- [ ] T026 [US5] Testes `US5-AC1` a `US5-AC5` em `tests/unit/app/session.test.ts` e `tests/integration/app.test.tsx` (FR-011, FR-012)

---

## Fase 8: História 6 — Acompanhar o estado dos robôs (P3)

- [ ] T027 [US6] Implementar `RobotList` (nome, cor, estado, pose, erro, seleção) em `src/app/panels/RobotList.tsx` e anel de destaque no `RobotMesh` (FR-012)
- [ ] T028 [US6] Testes `US6-AC1` e `US6-AC2` em `tests/integration/app.test.tsx` e `tests/unit/app/sceneModel.test.ts` (FR-012)

---

## Fase 9: Acabamento

- [ ] T029 Compor `App.tsx`, `AppShell` e `main.tsx`; layout responsivo ≥ 1280 × 720 (FR-013, FR-014)
- [ ] T030 Validar `quickstart.md` no navegador (`npm run dev`, `npm run build`) (todos os FR)
- [ ] T031 Atualizar README (como abrir a interface) e estatísticas de testes/cobertura (constitution, princípio VII)

## Dependências

Preparação → Fundação (biblioteca) → US1 → US2 → US3 → US4 → US5 → US6 → Acabamento.
US4 e US5 dependem da sessão (US2). Tarefas [P] da fundação podem rodar em paralelo.

## Rastreabilidade

| Requisito | Tarefas |
|-----------|---------|
| FR-001 | T010, T011, T012, T013 |
| FR-002 | T010, T011, T012, T013 |
| FR-003 | T010, T012 |
| FR-004 | T019, T020, T021 |
| FR-005 | T015, T016, T018 |
| FR-006 | T014, T015, T016, T017 |
| FR-007 | T015, T016 |
| FR-008 | T015, T016, T018 |
| FR-009 | T022, T023, T024 |
| FR-010 | T023, T024 |
| FR-011 | T008, T025, T026 |
| FR-012 | T026, T027, T028 |
| FR-013 | T004 a T009, T029 |
| FR-014 | T006, T029 |
