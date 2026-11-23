# Contrato: linha de comando

Referências: spec FR-022, US7; research D-12.

## Uso

```bash
npm run sim -- <mundo.json> --ticks <N> [--controller <robotId>=<arquivo.js>]... [--timeout-ms <ms>] [--pretty]
```

| Argumento | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `<mundo.json>` | sim | arquivo de mundo |
| `--ticks <N>` | sim | inteiro ≥ 0 |
| `--controller r=arq.js` | não, repetível | controlador do robô `r`; tem precedência sobre `robots[].controller` do mundo (caminho relativo ao mundo) |
| `--timeout-ms <ms>` | não | padrão 10000 |
| `--pretty` | não | JSON indentado |

## Saída

- **Sucesso (código 0)**: `stdout` recebe um único JSON `SimulationState` (ver
  `simulation-api.md`). Robôs com erro de controlador em tempo de execução **não**
  mudam o código de término; aparecem com `status: "error"`.
- **Falhas**: nada em `stdout`; mensagens em português em `stderr`, uma por linha.

| Código | Significado | `stderr` |
|--------|-------------|----------|
| 0 | sucesso | — |
| 1 | uso incorreto, arquivo não encontrado ou ilegível | descrição do problema e o uso correto |
| 2 | mundo inválido | `formatIssues(errors)` |
| 3 | controlador inválido (sintaxe, `onTick` ausente, erro na inicialização) | mensagens dos `ControllerIssue` |
| 4 | tempo limite excedido | `Tempo limite de {ms} ms excedido no tick {t}` (tick conhecido mais recente) |

## Exemplo

```bash
$ npm run sim -- tests/fixtures/worlds/straight-line.json --ticks 20 --controller r1=tests/fixtures/controllers/forward-1ms.js
{"tick":20,"time":1,"match":null,"robots":[{"id":"r1","pose":{"x":1,"y":0,"theta":0}, ...}]}
```
