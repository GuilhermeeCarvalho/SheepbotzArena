# Plano de implementação: Modalidade Futebol

**Feature**: `008-futebol` | **Data**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

## Resumo

Extensão genérica do núcleo (bola, câmera, reposição pedida pelo árbitro) e a modalidade
`src/modalities/soccer/`. A interface ganha `BallMesh`.

## Verificação da constituição

| Princípio | Verificação | Situação |
|-----------|-------------|----------|
| IV | Capacidades novas são genéricas (qualquer modalidade pode usar bolas/câmera/reposição); justificadas na spec; regressão = suítes 001–007. | ✅ (emenda de contrato justificada) |
| VI | Bola determinística (sem aleatoriedade); câmera com ruído semeado opcional. | ✅ |
| I | A interface só desenha a bola a partir do estado. | ✅ |

## Decisões

- **D-01 — Esquema**: `balls?: { id, position, radius, mass?=0.046, friction?=0.3 (m/s²),
  restitution?=0.6, color?='#ff7a1a' }[]`; sensor `{ type: 'camera', id, noise?=0 }`.
- **D-02 — Integração**: por subpasso `h`: se `|v| ≤ a·h`, a bola para após `|v|²/(2a)`;
  senão `p += v·h − ½·a·h²·v̂` e `|v| −= a·h` (desaceleração constante exata).
- **D-03 — Colisão da bola**: depois dos robôs em cada subpasso: contra corpos estáticos
  (afasta até encostar; `v_n ← −e·v_n` se aproximando) e contra robôs (afasta a bola;
  `v ← v − (1+e)·((v − v_robô)·n)·n` se aproximando; `v_robô = v·(cos θ, sen θ)`).
  Os subpassos usam também o deslocamento da bola (≤ metade do menor raio entre robôs e bolas).
- **D-04 — Câmera**: leitura `[x, y, θ, bolaX, bolaY]` (NaN sem bola) no estado;
  `robot.readCamera()` devolve `{ x, y, theta, ball: { x, y } | null }`.
- **D-05 — Reposição**: `MatchStatus.restart?: boolean`; após `evaluate`, se `restart`, o
  núcleo recoloca robôs e bolas e recalcula leituras. O tick e o tempo continuam.
- **D-06 — Campo** (`createSoccerWorld`): paredes como segmentos; aberturas de 40 cm; gols com
  fundo a 0,10 m da linha; triângulos de 7 cm como segmentos diagonais; piso preto
  (refletância 0,05) com linhas brancas de 3 mm; arena 1,70 × 1,30 m sem paredes próprias.
- **D-07 — Robôs de exemplo**: disco de 0,075 m (7,5 cm), 0,18 kg (hipótese); Pololu Micro
  HP 6V 30:1 + roda 32 mm, bitola 0,06 m → 80% de 1,68 m/s ≈ 1,34 m/s e 44,8 rad/s;
  câmera global.
- **D-08 — Estratégias**: atacante vai a um ponto atrás da bola alinhado com o gol adversário
  e empurra; goleiro acompanha o y da bola sobre a própria linha. O lado é deduzido da pose
  inicial (x < 0 = esquerdo).

## Estrutura

```text
src/core/world/schema.ts (+balls, +camera) · src/core/ball/ball.ts (integração e colisões)
src/core/simulation/{state.ts, tick.ts, simulation.ts} · src/core/controller/robotApi.ts
src/core/modality/contract.ts (+restart)
src/modalities/soccer/{field.ts, referee.ts, validation.ts, index.ts}
src/app/scene/{sceneModel.ts, BallMesh.tsx, SceneContent.tsx}
examples/worlds/futebol-2x1.json · examples/controllers/soccer-{striker,goalkeeper}.js
```

## D-09 — Ajustes feitos ao validar o exemplo (2026-11-22)

- **Bola presa contra a parede** atravessava a lateral sob empurrão contínuo: o robô que
  ainda sobrepõe a bola contida pela parede passa a recuar (spec H-08).
- **Bola livre por deslocamento** (< 1 cm em 5 s) em vez de velocidade: a bola presa entre
  robôs "vibra" sem sair do lugar (spec H-03); dentro da área, a reposição modela o prazo
  de 5 s do goleiro (spec H-09).
- **Atacante junto à lateral**: o ponto atrás da bola caía fora do campo; a estratégia
  empurra ao longo da parede e limita os alvos ao interior do campo.
- **Exemplo 2 × 1 com montagens diferentes**: dois atacantes iguais se anulam. O Azul usa a
  redução 50:1 (0,79 m/s), mostrando como a escolha de motor muda o jogo (RB-24). A câmera
  tem ruído semeado de 2 mm para que os lances variem após cada reposição, mantendo o
  determinismo.
- **Desempenho**: testes longos com limites de tempo folgados (máquina com indexação pesada
  chegou a load 33 durante a cobertura).
