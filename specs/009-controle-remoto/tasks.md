---
description: "Lista de tarefas da feature 009 — Controlador remoto via WebSocket"
---

# Tarefas: Controlador remoto via WebSocket

Commits: `feat(009/<ID>): <descrição> [FR-xxx]`.

- [x] T001 Núcleo aceita `nativeControllers`; testes de ordem, saturação, erro isolado e regressão (FR-003)
- [x] T002 [US1] `src/remote`: mensagens, validação da resposta, `RemoteLink` e transporte em memória; testes `US1-AC1` a `US1-AC5` e `US1-AC7` (FR-002 a FR-005)
- [x] T003 [US1] Adaptador `WebSocket` e opção `--remote` na CLI; testes `US1-AC6` e da CLI (FR-001, FR-004)
- [ ] T004 [US2] Robô remoto na sessão e no painel do controlador; testes `US2-AC1` a `US2-AC4` (FR-001, FR-004)
- [ ] T005 [US3] Programa de exemplo em Python e guia de uso (FR-006)
- [ ] T006 Acabamento: README, HANDOFF e cobertura

## Rastreabilidade

| FR | Tarefas |
|----|---------|
| FR-001 | T003, T004 |
| FR-002 | T002 |
| FR-003 | T001, T002 |
| FR-004 | T002, T003, T004 |
| FR-005 | T002 |
| FR-006 | T005 |
