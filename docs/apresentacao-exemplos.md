# Roteiro de exemplos para a apresentação

Todos os mundos estão em `examples/worlds/` e aparecem no seletor de mundos da interface
(`npm run dev`). Cada linha abaixo diz o que mostrar e o resultado esperado (determinístico:
o mesmo resultado em toda execução). Os testes em `tests/acceptance/all-examples.test.ts`
garantem que todos rodam sem erro.

## Sumô (RoboCore — `docs/references/robocore/sumo.md`)

| Mundo no seletor | O que mostrar | Resultado |
|------------------|---------------|-----------|
| Mini Sumô — busca e ataque × flanco | estratégias em código, Yuko | Sheep vence em ~1 s |
| Mini Sumô — estratégias invertidas | **trocar a estratégia** muda o vencedor | Rival vence em ~1 s |
| Mini Sumô — mesmo duelo com o Sheep de 300 g | empurrão depende da **massa** | Rival vence (4,4 s) |
| Mini Sumô — mesmo duelo com o Sheep de 500 g | só a massa mudou | **Sheep vence** (1,5 s) |
| Mega Sumô — busca e ataque × flanco | arena oficial de 1,54 m | vencedor em ~2 s |
| Mega Sumô — motor rápido × motor lento | **escolha do motor** (Titan × Pololu 37D) | Titan vence em 0,7 s |
| Sumô LEGO® — regra dos 5 segundos | regra própria da categoria | Rival queima a largada |

## Seguidor de Linha (`docs/references/robocore/seguidor-de-linha.md`)

| Mundo no seletor | O que mostrar | Resultado |
|------------------|---------------|-----------|
| Júnior — pista oval | controlador PD com barra QTR-8A | volta válida em 7,40 s |
| Pro — retângulo com chicane | curvas para os dois lados | volta válida em 7,25 s |
| Júnior — zigue-zague | curvas em S seguidas | volta válida em 10,98 s |
| Pro — curvas fechadas (0,12 m) | perto do raio mínimo (Art. 4.14) | volta válida em 5,61 s |
| Júnior — PD agressivo | **ajuste do PD importa**: rápido demais | não para na chegada → volta inválida |

## Trekking (`docs/references/robocore/trekking.md`)

| Mundo no seletor | O que mostrar | Resultado |
|------------------|---------------|-----------|
| Trekking — campo com obstáculos | odometria + lidar, marcos em ordem | 4 marcos em 35 s |
| Trekking — campo livre | percurso em quadrado | 4 marcos em 33 s |
| Trekking — campo denso | desvio entre todos os marcos | 4 marcos em 35 s |

Dica: use a câmera **Seguir** para acompanhar o robô e a vista de **Topo** para ver o mapa.

## Futebol Mini / VSS (`docs/references/robocore/futebol.md`)

| Mundo no seletor | O que mostrar | Resultado (2 min) |
|------------------|---------------|-------------------|
| Verde (goleiro + atacante) × Azul (atacante) | **motor diferente** (30:1 × 50:1) | Verde 10 × 1 |
| 1 × 1 (só atacantes) | duelo equilibrado | 3 × 3 |
| 2 × 2 (goleiro + atacante) | goleiros em ação | Verde 1 × 3 Azul |
| 3 × 3 (goleiro + 2 atacantes) | formação máxima (Art. 3.1) | Verde 2 × 4 Azul |

## Sugestão de roteiro (≈ 4 min de demo)

1. Mini Sumô busca × flanco → trocar para "estratégias invertidas" (o vencedor muda).
2. Mini Sumô 300 g → 500 g (o resultado inverte só pela massa).
3. Seguidor oval → PD agressivo (mesmo robô, ganhos diferentes).
4. Trekking campo denso com câmera **Seguir**.
5. Futebol 2 × 1 em velocidade 2×; mostrar o placar no canto da cena.
6. Editar ao vivo uma constante do controlador (aba Controlador) e aplicar.
