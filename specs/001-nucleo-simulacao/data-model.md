# Modelo de dados: Núcleo de simulação headless

**Feature**: `001-nucleo-simulacao` | Referências: spec (Entidades-chave), contracts/.

O formato persistido do mundo está em [contracts/world-file.md](./contracts/world-file.md);
o formato do estado, em [contracts/simulation-api.md](./contracts/simulation-api.md).
Este documento descreve as entidades, as relações e o ciclo de vida.

## Entidades de configuração (imutáveis após `loadWorld`)

```text
World 1──1 Arena
  │  1──1 Floor 1──* FloorRegion (rect | disc | ring | line)
  │  1──* Obstacle (wall | box | disc)
  │  1──* RobotSpec 1──* SensorSpec (laser | sonar | bumper | floor)
  │                 1──1 OdometrySpec
  └─ 0..1 modality (id → Modality no registro)
```

| Entidade | Campos principais | Observações |
|----------|-------------------|-------------|
| `World` | version, name, seed, dt, modality?, modalityOptions?, arena, floor, obstacles, robots | Tipo inferido do esquema Zod, com padrões aplicados. |
| `Arena` | width, height, walls | Bordas viram 4 `wall` internas quando `walls = true`. |
| `FloorRegion` | type, geometria, reflectance, color? | Ordem define prioridade (última vence). |
| `Obstacle` | id, type, geometria, color? | Estático durante toda a simulação. |
| `RobotSpec` | id, name, color, pose, radius, mass, maxLinearSpeed, maxAngularSpeed, controller?, odometry, sensors | `pose` é a pose inicial. |
| `SensorSpec` | id, type, parâmetros por tipo | `position`/`angle` no referencial do robô. |

## Entidades de execução (mutáveis dentro da simulação)

| Entidade | Campos | Regras |
|----------|--------|--------|
| `RobotRuntime` | spec, pose, command, odometry, contactsThisTick[], readings, status, error, logs, onTick, rng | Criado em `createSimulation`/`reset`. |
| `Contact` | direction (rad, referencial do robô), withId | Limpo no início de cada tick. |
| `RandomStream` | nome, estado do mulberry32 | Um por controlador e um por sensor/odometria com ruído (D-08). |
| `SimulationRuntime` | world, tick, robots[], referee?, match | `time` é derivado: `tick · dt`. |

## Snapshots (saída)

`SimulationState` e `RobotState` (ver contrato) são cópias congeladas. São o único dado
que sai do núcleo para CLI, visualização (002) e replay (004).

## Ciclos de vida

### Status do robô

```text
           createSimulation
                 │
     ┌───────────┴────────────┐
     ▼                        ▼
 no-controller               ok ──── exceção em onTick ───► error
 (nunca muda)                 ▲                               │
                              └──────────── reset() ──────────┘
```

### Partida (com modalidade)

```text
running ──(referee.evaluate devolve finished)──► finished ──reset()──► running
```

## Regras de validação

Todas as regras de campo, intervalo e semântica estão no catálogo de
[contracts/world-file.md](./contracts/world-file.md#regras-semânticas-após-o-esquema).
Invariantes mantidos durante a execução:

1. Nenhum robô termina um tick sobreposto (> `CONTACT_EPSILON`) a obstáculo estático.
2. `theta ∈ (−π, π]` em pose e odometria.
3. `|command.v| ≤ maxLinearSpeed`, `|command.w| ≤ maxAngularSpeed`.
4. Leituras de distância ∈ [0, maxRange]; refletâncias ∈ [0, 1].
5. `time = tick · dt` (calculado, nunca acumulado por soma).
