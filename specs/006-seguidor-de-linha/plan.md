# Plano de implementação: Modalidade Seguidor de Linha

**Feature**: `006-seguidor-de-linha` | **Data**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

## Resumo

Segunda implementação do contrato `Modality`: `src/modalities/line-follower/` com a
geometria da pista (construção por retas e arcos, projeção e progresso), o árbitro da
tomada de tempo, a validação e o gerador de mundos. Exemplos e o controlador PD entram em
`examples/`. Núcleo e Sumô intocados.

## Contexto técnico

TypeScript 6; sem dependências novas. Testes em `tests/acceptance/line-follower/`.

## Verificação da constituição

| Princípio | Verificação | Situação |
|-----------|-------------|----------|
| II. Regras | Artigos citados; hipóteses H-01 a H-07 separadas. | ✅ |
| IV. Extensibilidade | Novo módulo + registro; não importa o Sumô; núcleo intocado. | ✅ |
| VI. Determinismo | O árbitro guarda estado (progresso, cronômetro de parada) e é recriado em `reset()`; a avaliação é sequencial por tick. | ✅ |
| Demais | Iguais às features anteriores. | ✅ |

## Decisões

- **D-01 — Pista no piso**: a pista é a primeira região `line` com refletância > 0,5; sem
  duplicar pontos em `modalityOptions`.
- **D-02 — Progresso desenrolado**: a cada tick, projeção global no polígono fechado
  (arco-comprimento `s ∈ [0, L)`); a variação é desenrolada (`|Δs| ≤ L/2`) e acumulada.
- **D-03 — Árbitro com estado**: `createReferee` cria um objeto com progresso acumulado,
  instante do cruzamento da chegada e início da parada. Permitido pelo contrato (o árbitro
  é recriado a cada `reset`), avaliado uma vez por tick em ordem.
- **D-04 — Raio mínimo**: verificado pelo raio da circunferência por três pontos
  consecutivos amostrados (pontos com distância < 1 mm são ignorados).
- **D-05 — Gerador**: `buildTrack(start, segments)` com `{ straight: m }` e
  `{ arc: { radius, angle } }` (ângulo positivo = esquerda), arcos amostrados a cada 5°.
- **D-06 — Robô de exemplo** (`docs/references/componentes/`): Pololu Micro HP 6V 30:1 +
  roda 32 mm, bitola 0,12 m → 80% de 1,68 m/s ≈ 1,34 m/s e 22 rad/s; barra QTR-8A
  (8 sensores `floor` a x = 0,07 m, y = (k − 3,5)·0,009525 m); sensor de marcação `floor`
  em [0; −0,06]; raio 0,08 m; massa 0,25 kg (hipótese).

## Estrutura

```text
src/modalities/line-follower/
├── categories.ts   # LINE_FOLLOWER_CATEGORIES, constantes (Art. citados)
├── track.ts        # buildTrack, trackFromWorld, projectOnTrack, minTurnRadius
├── referee.ts      # createLineFollowerReferee
├── validation.ts   # validateLineFollowerWorld
├── arena.ts        # createLineFollowerWorld (piso preto, linha, marcações)
└── index.ts        # LINE_FOLLOWER_MODALITIES
examples/worlds/seguidor-oval.json, seguidor-retangulo.json
examples/controllers/line-follower-pd.js
scripts/generate-line-follower-examples.ts
```

## Contrato

`MatchStatus.details`: `{ category, elapsed, timeLimit, trackLength, progress,
progressPercent, lapTime | null, stoppedFor }`; `score: { [robotId]: lapTime ou 0 }`.
Erros de validação com código `MODALITY_RULE` e caminho (`robots`, `robots[0].radius`,
`robots[0].pose`, `floor.regions[i]`, `modalityOptions.timeLimit`).
