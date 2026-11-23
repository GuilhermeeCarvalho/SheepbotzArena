# Contrato: mensagens do controlador remoto

Referências: spec FR-001 a FR-005; plan D-01 a D-04.

O programa do robô **escuta** num endereço WebSocket (por exemplo `ws://localhost:8765`) e o
simulador se conecta a ele, uma conexão por robô. Cada mensagem é um objeto JSON em texto.

## Simulador → programa

### `start` (ao conectar e a cada reinício)

```json
{ "type": "start", "robot": "sheep", "dt": 0.05,
  "sensors": [{ "id": "oponente", "type": "laser" }, { "id": "frente", "type": "bumper" }] }
```

### `tick` (antes de cada tick; espera um `command`)

```json
{ "type": "tick", "tick": 1, "time": 0,
  "sensors": { "oponente": [2, 1, 2], "frente": false, "piso-esq": 0.1 },
  "odometry": { "x": 0, "y": 0, "theta": 0, "distance": 0 } }
```

`tick` é o tick que vai ser calculado; `time` e as leituras são os que a API em JavaScript
entregaria nesse tick (`robot.time()`, `robot.readLaser()`…). Laser → lista de distâncias (da
direita para a esquerda); sonar e piso → número; bumper → booleano.

### `end` (fim da execução)

```json
{ "type": "end", "tick": 120, "match": { "phase": "finished", "winner": "sheep", "reason": "..." } }
```

`match` é `null` sem modalidade.

## Programa → simulador

### `command` (resposta a cada `tick`)

```json
{ "v": 0.5, "w": 0 }
```

`v` em m/s e `w` em rad/s, números finitos; são saturados às velocidades máximas do robô.
O campo `type` é opcional. Outros campos são ignorados.

## Erros (o robô fica em "erro", comando (0, 0))

| Situação | Mensagem |
|----------|----------|
| sem resposta em 2000 ms | `controlador remoto não respondeu em 2000 ms (tick N)` |
| texto que não é JSON | `resposta do controlador remoto não é JSON válido: ...` |
| `v` ou `w` ausentes ou não numéricos | `resposta do controlador remoto deve ser { "v": número, "w": número }` |
| conexão fechada | `conexão com o controlador remoto foi encerrada (tick N)` |
| endereço inacessível (antes de iniciar) | `não foi possível conectar ao controlador remoto em <endereço>` |

## Linha de comando

```bash
npm run sim -- <mundo.json> --ticks <N> --remote <robô>=<endereço> [...]
# exemplo
npm run sim -- examples/worlds/sumo-mini.json --ticks 600 --remote sheep=ws://localhost:8765
```

Endereço inacessível termina com o código 3 (controlador inválido).
