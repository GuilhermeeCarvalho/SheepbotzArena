# Modelo de dados: Modalidade Sumô

Entidades definidas em [contracts/sumo-modality.md](./contracts/sumo-modality.md):
`SumoCategory` (constantes por categoria), `MatchStatus` do Sumô (resultado do round) e o
mundo gerado por `createSumoWorld` (mesmo formato de `specs/001-nucleo-simulacao/contracts/world-file.md`).

## Ciclo do round

```text
running ──(robô fora do Dohyo | largada queimada | tempo limite)──► finished
   ▲                                                                   │
   └──────────────────────── reset() da simulação ─────────────────────┘
```
