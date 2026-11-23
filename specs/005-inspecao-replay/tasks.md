---
description: "Lista de tarefas da feature 005 — Painel de inspeção e replay"
---

# Tarefas: Painel de inspeção e replay

Commits: `feat(005/<ID>): <descrição> [FR-xxx]`.

- [x] T001 [US1] `inspectRobot` (modelo de exibição) e testes `US1-AC1` a `US1-AC7` (FR-001)
- [x] T002 [US1] `SensorPanel` e aba "Sensores"; teste de integração (FR-001)
- [x] T003 [US2] `recording.ts` (quadros, limite) e gravação de todos os ticks na sessão; testes `US2-AC5`, `US2-AC6` e equivalência com o núcleo (FR-002, FR-004)
- [x] T004 [US2] Modo replay na sessão (índice, play, step, reset, ao vivo); testes `US2-AC1` a `US2-AC4` (FR-003, FR-004)
- [x] T005 [US2] `Slider` em `src/ui`, `Timeline` na interface; teste de integração (FR-003)
- [x] T006 [US3] Exportar/abrir gravação (formato, validação, erros); testes `US3-AC1` a `US3-AC3` (FR-005)
- [x] T007 Acabamento: README, HANDOFF, cobertura

## Rastreabilidade

| FR | Tarefas |
|----|---------|
| FR-001 | T001, T002 |
| FR-002 | T003 |
| FR-003 | T004, T005 |
| FR-004 | T003, T004 |
| FR-005 | T006 |
