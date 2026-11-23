---
description: "Lista de tarefas da feature 004 — Modalidade Sumô"
---

# Tarefas: Modalidade Sumô

**Entrada**: `specs/004-modalidade-sumo/` · **Testes**: obrigatórios (constitution, III).

Formato: `[ID] [P?] [História] Descrição (requisitos)`. Commits:
`feat(004/<ID>): <descrição> [FR-xxx]`.

## Fase 1: Fundação

- [ ] T001 [P] Criar `src/modalities/sumo/categories.ts` com `SUMO_CATEGORIES` (Art. 3 e 4), `DEFAULT_ROUND_TIME_LIMIT`, `FALSE_START_DISTANCE`, `FALSE_START_ROTATION` (FR-001)
- [ ] T002 [P] Testes unitários dos parâmetros por categoria em `tests/unit/modalities/sumo/categories.test.ts` (FR-001)

## Fase 2: História 1 — Arbitrar o round (P1) 🎯 MVP

- [ ] T003 [US1] Implementar `isOutOfDohyo` e `createSumoReferee` (saída, saídas simultâneas, tempo limite) em `src/modalities/sumo/referee.ts` (FR-002, FR-003, FR-005)
- [ ] T004 [US1] Implementar `createSumoModality` e `SUMO_MODALITIES` em `src/modalities/sumo/index.ts` e registrar em `src/modalities/index.ts` (FR-001, FR-010)
- [ ] T005 [US1] Testes `US1-AC1` a `US1-AC5` em `tests/acceptance/sumo/us1-referee.test.ts` (FR-002, FR-003, FR-005)

## Fase 3: História 3 — Validar a montagem (P1)

- [ ] T006 [US3] Implementar `validateSumoWorld` em `src/modalities/sumo/validation.ts` (FR-006)
- [ ] T007 [US3] Testes `US3-AC1` a `US3-AC8` em `tests/acceptance/sumo/us3-validation.test.ts` (FR-006)

## Fase 4: História 2 — Regra dos 5 s no LEGO® (P2)

- [ ] T008 [US2] Adicionar largada queimada ao árbitro (H-05) (FR-004)
- [ ] T009 [US2] Testes `US2-AC1` a `US2-AC3` em `tests/acceptance/sumo/us2-lego-start.test.ts` (FR-004)

## Fase 5: História 4 — Arenas oficiais (P1)

- [ ] T010 [US4] Implementar `createSumoWorld` em `src/modalities/sumo/arena.ts` (FR-007)
- [ ] T011 [US4] Criar `scripts/generate-sumo-examples.ts` e gerar `examples/worlds/sumo-{mini,mega,lego}.json` com robôs de componentes reais (research D-05) (FR-008)
- [ ] T012 [US4] Testes `US4-AC1` a `US4-AC4` em `tests/acceptance/sumo/us4-arena.test.ts` (FR-007, FR-008)

## Fase 6: História 5 — Estratégias de exemplo (P2)

- [ ] T013 [P] [US5] Criar `examples/controllers/sumo-search-attack.js` e `sumo-flank.js` (FR-009)
- [ ] T014 [US5] Testes `US5-AC1` a `US5-AC3` em `tests/acceptance/sumo/us5-strategies.test.ts` (FR-009)

## Fase 7: Acabamento

- [ ] T015 Validar `quickstart.md` (CLI e interface), atualizar README, HANDOFF e cobertura

## Dependências

T001 → US1 → US3 → US2 → US4 → US5 → acabamento. US4 depende do árbitro e da validação para
gerar mundos válidos.

## Rastreabilidade

| FR | Tarefas |
|----|---------|
| FR-001 | T001, T002, T004 |
| FR-002 | T003, T005 |
| FR-003 | T003, T005 |
| FR-004 | T008, T009 |
| FR-005 | T003, T005 |
| FR-006 | T006, T007 |
| FR-007 | T010, T012 |
| FR-008 | T011, T012 |
| FR-009 | T013, T014 |
| FR-010 | T004 |
