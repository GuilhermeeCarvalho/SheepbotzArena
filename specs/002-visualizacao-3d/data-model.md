# Modelo de dados: Visualização 3D e controles

Esta feature não persiste dados. Entidades em memória:

| Entidade | Definição | Contrato |
|----------|-----------|----------|
| Sessão de simulação | `SessionState` | [playback.md](./contracts/playback.md) |
| Modelo de cena | `SceneModel` e descritores | [scene-model.md](./contracts/scene-model.md) |
| Exemplo | `{ id, name, worldText, controllers: Record<robotId, código> }` | `src/app/examples/examples.ts` |
| Rascunho | texto do editor de mundo / controlador antes de aplicar (estado local do painel) | — |

## Ciclo da sessão

```text
pausado ──play──► executando ──pause / fim da partida──► pausado
   │  ▲                │
   │  └──── reset ─────┘ (volta ao tick 0, mantém modo pausado)
   └── step (somente pausado)
aplicar mundo/controlador válido → nova simulação, tick 0, pausado
aplicar inválido → sessão anterior mantida + lista de erros
```
