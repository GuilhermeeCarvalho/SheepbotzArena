# Plano de implementação: Painel de inspeção e replay

**Feature**: `005-inspecao-replay` | **Data**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

## Resumo

Três peças puras e testáveis em `src/app/`, mais a interface:

1. `inspection/inspectRobot.ts` — modelo de exibição das leituras do robô (spec US1).
2. `recording/recording.ts` — gravação (quadros), formato de arquivo, validação.
3. `session/session.ts` — a sessão grava cada tick e ganha o modo replay (índice do quadro).

## Verificação da constituição

| Princípio | Verificação | Situação |
|-----------|-------------|----------|
| I | Painel e replay só leem estados do núcleo. | ✅ |
| IV | Nada no núcleo; `src/ui` ganha `Slider` genérico. | ✅ |
| VI | Replay = quadros gravados (não re-simula), logo idêntico ao simulado. | ✅ |
| VII | Tarefas citam FR; testes por cenário. | ✅ |

## Decisões

- **D-01 — Gravar estados, não entradas**: cada quadro é o `SimulationState` congelado do
  tick (já serializável). Simples e independe de controladores no replay; a gravação de
  entradas (seed + controladores) seria menor, mas exigiria re-simular.
- **D-02 — Todos os ticks**: `advance(session, n)` passa a chamar `step(1)` n vezes, guardando
  cada estado (US2-AC5).
- **D-03 — Limite**: `MAX_FRAMES = 30 000` (5 min a 100 Hz); ao atingir, `recording.truncated = true`.
- **D-04 — Modo replay na sessão**: `replayIndex: number | null`; `displayedState(session)`
  devolve o quadro do replay ou o estado ao vivo; play/step/reset agem sobre o replay quando
  ativo. Gravação aberta de arquivo não tem simulação ao vivo (`liveAvailable = false`).
- **D-05 — Arquivo**: `{ format: 'sheepbotz-recording', version: 1, worldText, controllers,
  frames }`; validação do formato e do mundo via `loadWorld` + registro de modalidades.
- **D-06 — Interface**: aba "Sensores" no painel lateral (`SensorPanel`, usa `Stat`, `Badge`,
  barras); `Timeline` sobre a barra de transporte (componente `Slider` novo em `src/ui`,
  botão "Ao vivo", exportar/abrir gravação).

## Estrutura

```text
src/ui/components/Slider/
src/app/inspection/inspectRobot.ts · src/app/panels/SensorPanel.tsx
src/app/recording/recording.ts · src/app/layout/Timeline.tsx
src/app/session/{session.ts, useSimulationSession.ts}
```
