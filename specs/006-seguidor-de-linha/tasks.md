---
description: "Lista de tarefas da feature 006 — Seguidor de Linha"
---

# Tarefas: Seguidor de Linha

Commits: `feat(006/<ID>): <descrição> [FR-xxx]`. Testes obrigatórios.

- [ ] T001 [P] `categories.ts` e `track.ts` (construção, projeção, raio mínimo) com testes unitários (FR-001, FR-007)
- [ ] T002 [US1] `referee.ts`: progresso, cruzamento da chegada, parada de 2 s, saída da linha, saída da área, tempo limite (FR-002 a FR-005)
- [ ] T003 [US1] Testes `US1-AC1` a `US1-AC5` em `tests/acceptance/line-follower/us1-lap.test.ts` (FR-002 a FR-005)
- [ ] T004 [US2] `validation.ts` e testes `US2-AC1` a `US2-AC8` (FR-006)
- [ ] T005 [US3] `arena.ts`, registro em `src/modalities/index.ts`, gerador e mundos de exemplo; testes `US3-AC1` e `US3-AC2` (FR-007, FR-008, FR-009)
- [ ] T006 [US4] `examples/controllers/line-follower-pd.js` e teste `US4-AC1` (FR-008)
- [ ] T007 Acabamento: README, HANDOFF, cobertura

## Rastreabilidade

| FR | Tarefas |
|----|---------|
| FR-001 | T001 |
| FR-002 a FR-005 | T002, T003 |
| FR-006 | T004 |
| FR-007 | T001, T005 |
| FR-008 | T005, T006 |
| FR-009 | T005 |
