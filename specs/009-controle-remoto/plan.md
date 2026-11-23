# Plano de implementação: Controlador remoto via WebSocket

**Feature**: `009-controle-remoto` | **Data**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

## Resumo

1. Núcleo: `createSimulation` aceita `nativeControllers` (funções `onTick` prontas), tratadas
   como qualquer controlador (ordem, isolamento de erro, saturação).
2. `src/remote/` (novo, sem DOM nem `node:*`): mensagens, validação da resposta e o elo de um
   robô remoto (`RemoteLink`), sobre um transporte abstrato; adaptador para o `WebSocket`
   padrão (presente no navegador e no Node 22+).
3. CLI: opção `--remote robô=endereço`, com laço assíncrono tick a tick.
4. Interface: campo "Controle remoto" no painel do controlador; o laço de reprodução espera
   as respostas quando há robô remoto.
5. Exemplo em Python (`examples/remote/sumo_remoto.py`) e contrato das mensagens.

## Verificação da constituição

| Princípio | Verificação | Situação |
|-----------|-------------|----------|
| I | O núcleo continua síncrono e sem rede; a espera pela resposta fica fora dele. | ✅ |
| IV | Extensão genérica do núcleo (controlador como função), justificada na spec, com testes e a suíte 001–008 como regressão. `src/remote` depende só do núcleo. | ✅ |
| VI | Lockstep: um tick só é calculado com a resposta em mãos; mesma entrada → mesmo estado. | ✅ |
| Stack | Sem dependência nova no simulador (`WebSocket` padrão). O exemplo usa a biblioteca Python `websockets`, fora do build. | ✅ |

## Decisões

- **D-01 — Quem escuta**: o programa do robô é o servidor e o simulador, o cliente. O
  navegador não pode abrir portas, e assim o mesmo cliente serve à interface e à CLI.
- **D-02 — Lockstep**: antes de `step(1)`, o elo envia `tick` com as leituras de
  `getState()` (as que a API entrega no tick seguinte, feature 001 US3) e espera o `command`;
  o `onTick` nativo só aplica o último comando recebido. Assim o núcleo não muda de regra.
- **D-03 — Falhas**: tempo limite de 2000 ms, resposta inválida ou conexão fechada marcam o
  elo como falho; o `onTick` nativo lança o erro, e o núcleo põe só aquele robô em "erro"
  (mesmo caminho dos erros de controladores em JavaScript).
- **D-04 — Transporte abstrato**: `Transport = { send(text), receive(timeoutMs), close() }`.
  Os testes usam um transporte em memória; `connectWebSocket(url)` adapta o `WebSocket`
  padrão e falha com a mensagem do contrato se a conexão não abrir.
- **D-05 — Interface**: a sessão guarda os elos por robô (`remotes`) e recria a simulação com
  os `nativeControllers`; com elos ativos, o laço de reprodução vira assíncrono (um tick por
  resposta) e "Avançar um tick" espera a resposta.

## Estrutura

```text
src/core/simulation/simulation.ts           # nativeControllers
src/remote/{protocol.ts, link.ts, webSocketTransport.ts, index.ts}
src/cli/run.ts                              # --remote
src/app/session/{session.ts, useSimulationSession.ts} · src/app/panels/ControllerPanel.tsx
examples/remote/sumo_remoto.py · examples/remote/README.md
tests/unit/core/nativeController.test.ts · tests/unit/remote/*.test.ts · tests/acceptance/remote/*.test.ts
```
