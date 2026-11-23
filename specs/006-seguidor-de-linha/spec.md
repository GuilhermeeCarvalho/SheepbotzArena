# Especificação da feature: Modalidade Seguidor de Linha

**Feature**: `006-seguidor-de-linha` | **Criada em**: 2026-11-22 | **Status**: Rascunho

**Entrada**: "Modalidade Seguidor de Linha da RoboCore (Pro e Júnior): pistas oficiais,
validação do robô e da pista, cronometragem e validação da volta, e estratégia de exemplo."

**Requisitos do briefing atendidos**: RB-23, RB-24, RB-25, RB-26.

**Referência regulamentar**: `docs/references/robocore/seguidor-de-linha.md` (RoboCore,
"Seguidor de Linha — Regras", revisão de 03/09/2024). Artigos citados: 2.2, 3.2, 4.4, 4.7,
4.8, 4.11, 4.12, 4.14, 5.3, 5.6, 5.7.

**Depende de**: feature 001 (regiões de linha no piso, sensor de piso, contrato de
modalidade). O núcleo não é alterado.

## Contexto e motivação

O Seguidor de Linha é a categoria mais procurada por iniciantes da equipe. O ajuste de um
controlador PD consome muitas baterias e pneus na pista real; no simulador a equipe testa
ganhos e velocidades, mede o tempo da volta e vê exatamente onde o robô sai da linha.

## Categorias e parâmetros

| Parâmetro | Pro | Júnior | Fonte |
|-----------|-----|--------|-------|
| Largura da linha branca | 0,019 m (19 ± 1 mm) | 0,019 m | Art. 4.4 |
| Comprimento máximo da linha | 60 m | 20 m | Art. 4.4 |
| Raio mínimo das curvas | 0,10 m | 0,10 m | Art. 4.14 |
| Distância mínima da linha às bordas | 0,20 m | 0,20 m | Art. 4.11 |
| Chegada em relação à partida | 1 m antes, no sentido do percurso | idem | Art. 4.7 |
| Área de partida-chegada | 0,20 m para cada lado da linha | idem | Art. 4.8 |
| Robô (largura × comprimento) | ≤ 0,25 × 0,25 m | ≤ 0,25 × 0,25 m | Art. 3.2 |
| Tempo da tomada de tempo | 5 min | 5 min | Art. 5.3 |
| Parada para validar a volta | ≥ 2 s | ≥ 2 s | Art. 5.7 |

Identificadores: `seguidor-pro`, `seguidor-junior`. A pista é a **primeira região `line`
do piso** do mundo, fechada (primeiro ponto = último ponto); o primeiro ponto é a linha de
partida e o percurso segue a ordem dos pontos.

## Interpretações adotadas (simplificações 2D)

- **H-01 — Saiu da linha**: o robô saiu do percurso (Art. 5.6) quando o disco não toca mais
  a faixa branca: distância do centro à linha > raio do robô + meia largura da linha.
- **H-02 — Tempo da volta**: começa no início da simulação (robô posicionado na linha de
  partida) e termina no tick em que o progresso ao longo da pista atinge a linha de
  chegada (comprimento da pista − 1 m).
- **H-03 — Progresso**: o avanço é medido projetando o centro do robô na pista; voltar no
  sentido contrário reduz o progresso. Só a volta completa no sentido do percurso vale.
- **H-04 — Parada válida**: parado = comando (v, w) = (0, 0); dentro da área = projeção
  entre a chegada e a partida e distância lateral à linha ≤ 0,20 m − raio do robô.
- **H-05 — Marcações laterais**: há marcações à direita da linha na partida e na chegada
  (Art. 4.7); como as cotas só existem nas figuras, adotam-se faixas brancas de
  0,04 × 0,02 m centradas a 0,06 m à direita da linha.
- **H-06 — Uma tentativa por simulação**: as 3 tentativas e a melhor volta entre tomadas
  (Art. 2.2, 5.11) ficam a cargo da equipe.
- **H-07 — Diâmetro**: o robô-disco atende ao limite quando o diâmetro ≤ 0,25 m.

## Cenários de usuário e testes *(obrigatório)*

### História de usuário 1 — Cronometrar e validar a volta (Prioridade: P1) 🎯 MVP

**Cenários de aceitação** (pista oval Júnior: retas de 2,4 m, curvas de raio 0,4 m, partida
no meio da reta inferior; comprimento 7,313 m; chegada em 6,313 m; robô de raio 0,08 m
roteirizado para percorrer a pista a 0,5 m/s, `dt = 0,01 s`):

1. **Dado** o robô percorrendo a pista e parando 0,5 m depois da chegada, **quando**
   simulado, **então** o tempo da volta é 12,63 s (± 0,02 s) e a volta é declarada válida
   2 s depois da parada, com o robô como vencedor e o tempo no resultado.
2. **Dado** o robô que segue reto na primeira curva, **quando** simulado, **então** a
   tentativa termina como inválida com o motivo "saiu da linha" (Art. 5.6).
3. **Dado** o robô que cruza a chegada e não para, **quando** sai da área de
   partida-chegada, **então** a volta é inválida (Art. 5.7).
4. **Dado** o robô parado na partida e `timeLimit = 3`, **quando** simulado, **então** a
   tentativa termina sem volta válida no tick 300 (Art. 5.3).
5. **Dado** o resultado em andamento, **quando** consultado, **então** informa o progresso
   na pista (m e %).

### História de usuário 2 — Validar robô e pista (Prioridade: P1)

1. **Dado** um mundo sem robô ou com 2 robôs, **então** erro: exatamente 1 robô.
2. **Dado** robô de raio 0,13 m, **então** erro em `robots[0].radius` (Art. 3.2).
3. **Dado** um mundo sem região `line` no piso, ou com linha aberta, **então** erro em
   `floor.regions` explicando a pista fechada.
4. **Dado** uma linha de largura 0,03 m, **então** erro (Art. 4.4).
5. **Dado** uma curva de raio 0,05 m, **então** erro (Art. 4.14).
6. **Dado** a linha a 0,1 m da borda da arena, **então** erro (Art. 4.11).
7. **Dado** uma pista de 25 m como `seguidor-junior`, **então** erro (Art. 4.4); como
   `seguidor-pro`, é aceita.
8. **Dado** o robô começando a mais de 0,05 m da linha de partida, **então** erro em
   `robots[0].pose`.

### História de usuário 3 — Pistas oficiais prontas (Prioridade: P1)

1. **Dado** o gerador de pistas com retas e arcos, **quando** monta a oval, **então** o
   comprimento é 7,313 m e a pista é fechada.
2. **Dado** os mundos de exemplo (oval Júnior e "retângulo" Pro), **quando** carregados,
   **então** são válidos, com piso preto, linha branca de 19 mm, marcações laterais (H-05)
   e o robô na partida apontando no sentido do percurso.

### História de usuário 4 — Estratégia de exemplo PD (Prioridade: P2)

Controlador proporcional-derivativo com barra de 8 sensores (Pololu QTR-8A) e sensor
lateral de marcação, que conta as marcações e para depois da chegada.

1. **Dado** os dois exemplos, **quando** simulados até o fim, **então** cada um completa
   uma volta válida dentro do tempo limite, de forma repetível.

### Casos de borda

- Robô que dá ré na partida reduz o progresso e não completa a volta.
- Robô que corta caminho entre trechos sem sair da linha não existe com trechos a ≥ 0,20 m
  (Art. 4.12) e robô ≤ 0,25 m; ao perder a linha, H-01 encerra a tentativa.

## Requisitos *(obrigatório)*

- **FR-001**: O sistema DEVE oferecer `seguidor-pro` e `seguidor-junior` com os parâmetros
  da tabela. *(RB-23; Art. 3.2, 4.4)*
- **FR-002**: O sistema DEVE cronometrar a volta (H-02) e validá-la somente com a parada de
  2 s na área de partida-chegada (H-04; Art. 5.7). *(RB-23)*
- **FR-003**: O sistema DEVE encerrar a tentativa como inválida quando o robô sair da linha
  (H-01; Art. 5.6) ou sair da área sem completar a parada. *(RB-23)*
- **FR-004**: O sistema DEVE encerrar a tentativa ao atingir o tempo limite (padrão 300 s,
  `modalityOptions.timeLimit`). *(Art. 5.3)*
- **FR-005**: O resultado DEVE informar vencedor (o robô, se a volta for válida), motivo,
  tempo da volta e progresso. *(RB-23)*
- **FR-006**: O sistema DEVE validar robô (quantidade, diâmetro, posição inicial) e pista
  (fechada, largura, raio mínimo, distância às bordas, comprimento por categoria).
  *(RB-25; Art. 3.2, 4.4, 4.11, 4.14)*
- **FR-007**: O sistema DEVE gerar pistas a partir de retas e arcos, com marcações de
  partida e chegada (H-05). *(Art. 4.7)*
- **FR-008**: O sistema DEVE incluir pistas de exemplo e o controlador PD com sensores
  reais documentados. *(RB-24, RB-26)*
- **FR-009**: A modalidade entra pelo registro, sem alterar o núcleo nem o Sumô.
  *(constitution, princípio IV)*

## Critérios de sucesso *(obrigatório)*

- **SC-001**: O tempo de volta roteirizado é reproduzido com erro ≤ 0,02 s.
- **SC-002**: Toda violação de FR-006 é relatada com caminho e artigo.
- **SC-003**: Os exemplos completam volta válida antes do tempo limite.

## Premissas e limites

- Pistas com cruzamentos (Art. 4.6) e o Perseguidor de Linha ficam fora desta versão.
- O piso é plano; inclinação até 5° (Art. 4.18) não é modelada.
- Velocidades derivadas de motores usam 80% da rotação sem carga (heurística).
