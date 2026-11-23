# Especificação da feature: Modalidade Futebol (Futebol Mini / VSS)

**Feature**: `008-futebol` | **Criada em**: 2026-11-22 | **Status**: Implementada

**Entrada**: "Futebol de robôs autônomos da RoboCore (Futebol Mini / VSS): bola, campo
oficial com gols, times de 1 a 3 robôs, gols, bola livre, tempo de jogo e estratégias de
exemplo (atacante e goleiro)."

**Requisitos do briefing atendidos**: RB-20, RB-23, RB-24, RB-25, RB-26.

**Referência regulamentar**: `docs/references/robocore/futebol.md` (RoboCore, "Futebol Mini
/ VSS — Regras", versão 3.0, 27/05/2025). Artigos: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2.1, 6,
8.1, 15.

**Extensão do núcleo (constitution, princípio IV)**: o Futebol precisa de três capacidades
que nenhuma modalidade anterior usava. Elas entram no núcleo como recursos genéricos, sem
condicionais por modalidade, com testes próprios e com a suíte das features 001 a 007 como
regressão:

1. **Bola** (corpo passivo): objeto com posição e velocidade próprias, desaceleração por
   atrito de rolamento, que quica em paredes e obstáculos e é impulsionado pelos robôs.
2. **Câmera de visão global**: sensor que informa a pose do próprio robô e a posição da
   bola no referencial do campo, como a câmera sobre o campo do VSS.
3. **Reposição pedida pelo árbitro**: o árbitro pode pedir que robôs e bola voltem às
   posições iniciais (após gol ou bola livre), sem mover corpos ele mesmo.

## Cenários de usuário e testes *(obrigatório)*

### História de usuário 1 — Bola no núcleo (Prioridade: P1) 🎯 MVP

**Modelo**: entre ticks a bola desacelera a uma taxa constante (atrito) até parar; ao
encostar numa parede ou obstáculo, a componente normal da velocidade é invertida e
multiplicada pela restituição; ao ser atingida por um robô, a bola é afastada até encostar
e sua velocidade normal relativa ao robô é invertida com a mesma restituição (o robô, muito
mais pesado, não é desacelerado).

1. **Dado** uma bola em (0; 0) com velocidade 1 m/s em +x e desaceleração 0,5 m/s², **quando**
   passa 1 s, **então** está em (0,75; 0) com 0,5 m/s; após 2 s, para em (1,0; 0).
2. **Dado** uma bola a 0,8 m/s em +x, sem atrito, restituição 0,6, contra uma parede em
   x = 0,5, **quando** quica, **então** volta com 0,48 m/s em −x e nunca atravessa a parede.
3. **Dado** um robô a 1 m/s em +x atingindo de frente uma bola parada, restituição 0,5,
   **quando** colidem, **então** a bola sai a 1,5 m/s em +x.
4. **Dado** um laser apontado para a bola, **quando** lido, **então** a bola é detectada como
   um disco.
5. **Dado** mundos sem bola, **quando** simulados, **então** todos os cenários das features 001
   a 007 continuam passando (regressão).

### História de usuário 2 — Câmera de visão global (Prioridade: P1)

1. **Dado** um robô em (0,2; −0,1; 0,5) e a bola em (0,4; 0,3), **quando** a câmera é lida,
   **então** devolve exatamente essa pose e essa posição (sem ruído).
2. **Dado** um mundo sem bola, **quando** a câmera é lida, **então** a posição da bola é nula.

### História de usuário 3 — Arbitragem da partida (Prioridade: P1)

Campo oficial centrado na origem: gol esquerdo na linha x = −0,75 m, gol direito em
x = +0,75 m, boca do gol |y| ≤ 0,20 m.

1. **Dado** a bola chutada para o gol direito, **quando** passa inteira da linha
   (x > 0,75 + raio, |y| ≤ 0,20), **então** é gol do time que ataca para a direita, o placar
   soma 1 e robôs e bola voltam às posições iniciais no tick seguinte (Art. 8.1).
2. **Dado** a bola parada por 5 s fora das áreas de gol, **quando** o tempo passa, **então** é
   marcada bola livre e as posições são repostas (Art. 15; H-03).
3. **Dado** `timeLimit = 2` s, **quando** o tempo acaba, **então** a partida termina com o time
   de mais gols como vencedor, ou empate (Art. 6, 8.1; H-01).
4. **Dado** a bola tocando a trave sem cruzar a linha inteira, **então** não é gol.

### História de usuário 4 — Validação (Prioridade: P1)

1. Dois times, cada um com 1 a 3 robôs (Art. 3.1); todo robô em exatamente um time.
2. Robô de diâmetro > 0,08 m → erro (Art. 3.2.1).
3. Exatamente 1 bola, de diâmetro 42,7 mm (± 1 mm) (Art. 2.5).
4. Cada time começa no próprio campo (H-04).

### História de usuário 5 — Campo, exemplo e estratégias (Prioridade: P2)

1. **Dado** o gerador de campo, **então** cria laterais com aberturas dos gols, gols de
   40 × 10 cm, triângulos de 7 cm nos cantos, piso preto com linhas brancas (centro, círculo
   de raio 0,20 m) e a bola no centro (Art. 2.1–2.4).
2. **Dado** o exemplo 2 × 1 (Verde: goleiro + atacante; Azul: atacante), **quando** simulado, **então** sai
   pelo menos um gol dentro do tempo, de forma repetível, sem erro de controlador.

## Interpretações adotadas

- **H-01 — Tempo de jogo**: um período por simulação (padrão 300 s, `timeLimit`); intervalo
  e prorrogação ficam fora.
- **H-02 — Reinício**: após gol ou bola livre, todos voltam às posições iniciais do mundo
  (o posicionamento livre do time atacante, Art. 7, não é modelado).
- **H-03 — Bola livre**: a bola se desloca menos de 1 cm durante 5 s (parada ou presa entre
  robôs), com o centro fora das duas áreas de gol (retângulos de 15 × 70 cm à frente dos
  gols; o arco não é modelado).
- **H-04 — Lados**: o primeiro time defende o gol esquerdo; cada robô começa em x < 0
  (esquerdo) ou x > 0 (direito).
- **H-05 — Faltas** (Art. 9) e pênaltis não são arbitrados.
- **H-06 — Robôs como discos** de diâmetro ≤ 0,08 m (com uniforme).
- **H-07 — Bola fora do campo**: salvaguarda do simulador; se a bola sair do campo sem ser
  gol, as posições são repostas (no campo real as laterais impedem).
- **H-09 — Bola presa na área**: bola parada 5 s dentro da área do gol também gera reposição,
  modelando de forma simplificada o prazo de 5 s do goleiro para tirar a bola (Art. 9.1);
  as faltas e o pênalti decorrentes não são marcados (H-05).
- **H-08 — Bola presa**: quando a bola está contida por uma parede e um robô ainda a
  sobrepõe, o robô é que recua (a bola presa age como obstáculo).

## Requisitos *(obrigatório)*

- **FR-001**: Bolas no mundo (posição, raio, massa, desaceleração, restituição, cor) com o
  modelo da US1. *(RB-23; núcleo)*
- **FR-002**: Lasers e sonares detectam a bola. *(núcleo)*
- **FR-003**: Sensor `camera` e `robot.readCamera()` com a pose do robô e a posição da bola.
  *(núcleo)*
- **FR-004**: O estado inclui posição e velocidade das bolas. *(núcleo)*
- **FR-005**: O árbitro pode pedir reposição; o núcleo recoloca robôs (pose, comando,
  odometria) e bolas nas posições iniciais, preservando tempo, placar e memória dos
  controladores. *(núcleo; contrato de modalidade)*
- **FR-006**: Modalidade `futebol-vss` com gol (Art. 8.1), bola livre (Art. 15), tempo
  (Art. 6) e resultado com placar por time. *(RB-23)*
- **FR-007**: Validação de times, robôs e bola (Art. 2.5, 3.1, 3.2.1). *(RB-25)*
- **FR-008**: Gerador do campo oficial e exemplo 2 × 1 com estratégias em código.
  *(RB-24, RB-26)*
- **FR-009**: A interface desenha as bolas. *(feature 002)*

## Critérios de sucesso *(obrigatório)*

- **SC-001**: Cenários numéricos da US1 com erro ≤ 0,001.
- **SC-002**: As suítes das features 001 a 007 continuam verdes.
- **SC-003**: O exemplo 2 × 1 produz gol, de forma repetível.

## Premissas e limites

- Bola sem rotação e sem efeito; robôs não são desacelerados pela bola.
- A câmera é perfeita por padrão (ruído opcional); atraso de visão não é modelado.
