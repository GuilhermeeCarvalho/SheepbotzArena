# Especificação da feature: Modalidade Sumô

**Feature**: `004-modalidade-sumo`

**Criada em**: 2026-11-22

**Status**: Rascunho

**Entrada**: "Modalidade Sumô da RoboCore (Mega Sumô 3 kg, Mini Sumô 500 g e Sumô LEGO®):
arenas oficiais, validação dos robôs pelas regras da categoria, arbitragem do round e
estratégias de exemplo em código."

**Requisitos do briefing atendidos**: RB-20, RB-23, RB-25, RB-26
(ver `docs/briefing/requisitos-extraidos.md`).

**Referência regulamentar**: `docs/references/robocore/sumo.md` (RoboCore, "Sumô de
Robôs — Regras", revisão de 11/08/2025). Artigos citados: 3 (Dohyo, Tawara, Shikiri-sen,
Yochi), 4 (dimensões do robô), 5 (robô autônomo), 10 (posicionamento), 13 (ponto), Nota 11
(regra dos 5 s só no LEGO®) e Nota 18 (perde quem sai primeiro).

**Depende de**: feature 001 (contrato de modalidade, colisão por massa, sensor de piso) e
feature 002 (exibição do resultado e pausa automática). O núcleo não é alterado.

## Contexto e motivação

O Sumô é a categoria em que a equipe SheepBotz compete e é o foco da demo (constitution,
"Escopo e restrições do produto"). Hoje o simulador move robôs, mas não sabe quando um
round termina nem quem venceu. Esta feature transforma o simulador genérico numa arena de
Sumô: monta o Dohyo da categoria, confere se os robôs cabem nas regras, arbitra o round e
traz estratégias prontas para a equipe começar.

## Categorias e parâmetros

| Parâmetro | Mega Sumô (3 kg) | Mini Sumô (500 g) | Sumô LEGO® | Fonte |
|-----------|------------------|-------------------|------------|-------|
| Diâmetro do Dohyo (com Tawara) | 1,54 m | 0,77 m | 0,77 m | Art. 3 |
| Largura da Tawara (borda branca, dentro do Dohyo) | 0,05 m | 0,025 m | 0,025 m | Art. 3 |
| Shikiri-sen: distância ao centro | 0,10 m | 0,05 m | 0,05 m | Art. 3 |
| Shikiri-sen: largura × comprimento | 0,02 × 0,20 m | 0,01 × 0,10 m | 0,01 × 0,10 m | Art. 3 |
| Yochi (área quadrada) | 3,60 m | 1,80 m | 1,80 m | Art. 3 |
| Largura/comprimento máximos do robô | 0,20 m | 0,10 m | 0,152 m | Art. 4 |
| Massa máxima | 3 kg | 0,5 kg | não consta na referência | nome da categoria |
| Espera de 5 s antes de se mover | não | não | sim | Nota 11 |

Identificadores das modalidades no arquivo de mundo: `sumo-mega`, `sumo-mini`, `sumo-lego`.
O Dohyo fica centrado na origem do mundo.

## Interpretações adotadas (simplificações 2D)

Hipóteses de simulação, não regras oficiais (constitution, princípio II):

- **H-01 — Saída do Dohyo**: o regulamento pontua quando o robô "toca qualquer parte fora
  do Dohyo" (Art. 13). No modelo 2D, o robô está fora quando o **centro** do seu disco passa
  da borda externa do Dohyo (distância ao centro > raio do Dohyo). Isso aproxima o momento
  em que o robô real tomba para fora; robôs que só encostam na borda continuam dentro.
- **H-02 — Dimensão do robô**: o robô é um disco (feature 001); ele atende ao limite de
  largura/comprimento quando o **diâmetro** do disco não excede o limite (um disco desse
  diâmetro cabe na caixa de inspeção).
- **H-03 — Um round por simulação**: cada simulação arbitra um round. A partida "composta
  principalmente por 3 rounds" fica a cargo da equipe, que reinicia a simulação para o round
  seguinte.
- **H-04 — Tempo do round**: a referência não define o tempo do round; adota-se 60 s,
  configurável por `modalityOptions.roundTimeLimit` (s). Ao fim do tempo sem Yuko, o round
  termina sem vencedor (a decisão dos juízes, Yusei, não é modelada).
- **H-05 — Regra dos 5 s (LEGO®)**: um robô que se desloca mais de 0,02 m ou gira mais de
  0,05 rad desde a pose inicial antes de 5 s "queima a largada" e perde o round.
- **H-06 — Saídas simultâneas**: se os dois robôs saem no mesmo tick, o round termina sem
  vencedor (não há como decidir "quem tocou primeiro" dentro do tick).

## Cenários de usuário e testes *(obrigatório)*

### História de usuário 1 — Arbitrar o round (Prioridade: P1) 🎯 MVP

Dois robôs se enfrentam no Dohyo. Quando um deles sai, o round termina e o outro recebe o
Yuko; a simulação mostra o vencedor e o motivo e para de avançar.

**Por que esta prioridade**: é o que faz do simulador uma ferramenta de Sumô (RB-23).

**Teste independente**: rodar mundos Mini Sumô sem interface e conferir o tick e o vencedor.

**Cenários de aceitação** (Mini Sumô, robôs de raio 0,05 m e massa 0,5 kg, `dt = 0,05 s`,
Dohyo de raio 0,385 m):

1. **Dado** o robô A parado em (−0,2; 0) e o robô B em (0,3; 0; 0) andando a 0,5 m/s para
   fora, **quando** simulado, **então** o round termina no tick 4, com vencedor A, placar
   A 1 × B 0 e motivo citando a saída de B do Dohyo.
2. **Dado** A em (−0,1; 0; 0) andando a 0,5 m/s e B parado em (0,1; 0; π), **quando**
   simulado, **então** A empurra B (massas iguais: o par avança a 0,25 m/s após o contato) e
   o round termina no tick 27, com vencedor A.
3. **Dado** os dois robôs parados e `roundTimeLimit = 2`, **quando** simulado, **então** o
   round termina no tick 40, sem vencedor e com motivo "tempo esgotado".
4. **Dado** os dois robôs saindo do Dohyo no mesmo tick, **quando** simulado, **então** o
   round termina sem vencedor.
5. **Dado** o round terminado, **quando** se pedem mais ticks, **então** o estado não avança
   (feature 001) e a interface pausa e mostra o resultado (feature 002, FR-008).

---

### História de usuário 2 — Regra dos 5 segundos no Sumô LEGO® (Prioridade: P2)

No Sumô LEGO®, os robôs só podem se mover 5 s após o início. Quem se move antes perde.

**Teste independente**: robôs LEGO® que se movem antes e depois de 5 s.

**Cenários de aceitação** (`sumo-lego`, `dt = 0,05 s`):

1. **Dado** o robô A andando a 0,3 m/s desde o início, **quando** simulado, **então** o round
   termina no tick 2 com vencedor B e motivo "A se moveu antes de 5 s".
2. **Dado** os dois robôs parados até 5 s e depois avançando, **quando** simulados por 120
   ticks (6 s), **então** nenhuma largada queimada é marcada.
3. **Dado** o mesmo controlador de A no Mini Sumô, **quando** simulado, **então** não há
   regra de 5 s (Nota 11 vale só para o LEGO®).

---

### História de usuário 3 — Validar a montagem pelas regras da categoria (Prioridade: P1)

Ao carregar um mundo de Sumô, o simulador confere as regras que dependem do robô e do
posicionamento e explica cada violação, citando a regra.

**Teste independente**: carregar mundos com violações e conferir os erros.

**Cenários de aceitação** (Mini Sumô):

1. **Dado** um mundo com 1 ou 3 robôs, **quando** carregado, **então** o erro informa que a
   partida exige exatamente 2 robôs.
2. **Dado** um robô de raio 0,06 m (diâmetro 0,12 m > 0,10 m), **quando** carregado, **então**
   o erro aponta `robots[i].radius` citando o Art. 4.
3. **Dado** um robô de 0,6 kg, **quando** carregado, **então** o erro aponta `robots[i].mass`
   e o limite de 0,5 kg.
4. **Dado** um robô cujo disco ultrapassa a Shikiri-sen em direção ao centro (ex.: centro em
   x = −0,03), **quando** carregado, **então** o erro aponta `robots[i].pose` citando o Art. 10.
5. **Dado** um robô fora da extensão da Shikiri-sen (|y| − raio > 0,05 m), **quando**
   carregado, **então** o erro aponta `robots[i].pose`.
6. **Dado** os dois robôs do mesmo lado da Shikiri-sen, **quando** carregado, **então** o erro
   informa que cada robô deve ficar de um lado.
7. **Dado** `modalityOptions.roundTimeLimit` menor ou igual a 0, **quando** carregado,
   **então** o erro aponta `modalityOptions.roundTimeLimit`.
8. **Dado** um robô LEGO® de diâmetro 0,15 m, **quando** carregado como `sumo-lego`,
   **então** é aceito (limite 0,152 m); a massa não é verificada no LEGO®.

---

### História de usuário 4 — Arenas oficiais prontas (Prioridade: P1)

A equipe escolhe "Mini Sumô", "Mega Sumô" ou "Sumô LEGO®" na lista de mundos e recebe o
Dohyo na escala oficial (piso preto, Tawara branca, Shikiri-sen marrom), sem paredes, com
dois robôs posicionados atrás das linhas e equipados com componentes reais.

**Teste independente**: gerar os mundos e conferir geometria e validade.

**Cenários de aceitação**:

1. **Dado** o gerador de arenas, **quando** pede o Mini Sumô, **então** o piso tem um disco
   de raio 0,385 m (refletância baixa), um anel entre 0,36 m e 0,385 m (refletância alta) e
   duas faixas 0,01 × 0,10 m centradas em x = ±0,05 m; a arena é 1,80 × 1,80 m sem paredes.
2. **Dado** o Mega Sumô, **então** o disco tem raio 0,77 m, a Tawara vai de 0,72 m a 0,77 m,
   as faixas são 0,02 × 0,20 m em x = ±0,10 m e a arena tem 3,60 m.
3. **Dado** os mundos de exemplo das três categorias, **quando** carregados com o registro
   de modalidades, **então** são válidos, e seus robôs usam parâmetros derivados de
   componentes reais com fonte em `docs/references/componentes/` (motor e roda → velocidade;
   sensores de oponente e de borda → laser e piso).
4. **Dado** um sensor de piso sobre a Tawara, **quando** lido, **então** a refletância é maior
   que 0,5; sobre o Dohyo preto, menor que 0,5.

---

### História de usuário 5 — Estratégias de exemplo em código (Prioridade: P2)

A equipe recebe estratégias de Sumô em JavaScript para estudar e modificar: "busca e ataque"
(gira procurando o oponente, avança ao detectar, recua ao ver a borda branca) e "flanco"
(contorna o Dohyo por dentro e ataca de lado).

**Teste independente**: rodar os exemplos e conferir que as estratégias produzem um vencedor
e respeitam a borda.

**Cenários de aceitação**:

1. **Dado** o exemplo do Mini Sumô com "busca e ataque" contra "flanco", **quando** simulado
   até o fim, **então** o round termina com um vencedor antes do tempo limite, e o resultado
   é idêntico em execuções repetidas.
2. **Dado** um robô com "busca e ataque" sozinho diante de um oponente parado fora do alcance
   dos sensores, **quando** simulado por 10 s, **então** ele não sai do Dohyo por conta própria
   (a fuga de borda funciona).
3. **Dado** os exemplos das três categorias, **quando** simulados, **então** nenhum controlador
   termina em estado "erro".

---

### Casos de borda

- Robô com erro no controlador fica parado no Dohyo; o round continua (o oponente pode
  empurrá-lo para fora).
- Robô empurrado para fora continua sendo simulado e desenhado; o round já terminou.
- Mundo de Sumô com paredes de borda declaradas: aceito, mas sem efeito na arbitragem
  (a equipe pode usá-lo para treino); a validação não proíbe.
- Robôs com o mesmo identificador de equipe não existem: o vencedor é identificado pelo `id`
  do robô.

## Requisitos *(obrigatório)*

### Requisitos funcionais

- **FR-001**: O sistema DEVE oferecer as modalidades `sumo-mega`, `sumo-mini` e `sumo-lego`
  com os parâmetros da tabela "Categorias e parâmetros". *(RB-23; Art. 3, Art. 4)*
- **FR-002**: O sistema DEVE encerrar o round quando um robô sair do Dohyo (H-01), dando o
  Yuko ao oponente, ou sem vencedor quando ambos saírem no mesmo tick (H-06). *(RB-23;
  Art. 13, Nota 18)*
- **FR-003**: O sistema DEVE encerrar o round sem vencedor ao atingir o tempo limite (H-04),
  configurável por `modalityOptions.roundTimeLimit`. *(RB-23)*
- **FR-004**: No Sumô LEGO®, o sistema DEVE declarar perdedor o robô que se mover antes de
  5 s (H-05); nas demais categorias, não. *(Nota 11)*
- **FR-005**: O resultado DEVE informar fase, vencedor, motivo em português, placar do round
  e detalhes (categoria, tempo decorrido, tempo limite). *(RB-23)*
- **FR-006**: O sistema DEVE validar: exatamente 2 robôs; diâmetro ≤ limite da categoria
  (H-02); massa ≤ limite (exceto LEGO®); posição inicial atrás da Shikiri-sen e dentro da sua
  extensão; um robô de cada lado; `roundTimeLimit` > 0. Cada erro cita a regra. *(RB-25;
  Art. 4, Art. 10)*
- **FR-007**: O sistema DEVE gerar a arena oficial de cada categoria (Dohyo, Tawara,
  Shikiri-sen e Yochi, sem paredes) e posicionar os robôs atrás das linhas. *(RB-23; Art. 3)*
- **FR-008**: O sistema DEVE incluir mundos de exemplo das três categorias com robôs cujos
  parâmetros derivam de componentes reais documentados. *(RB-24, RB-26)*
- **FR-009**: O sistema DEVE incluir as estratégias "busca e ataque" e "flanco" em
  JavaScript, usando apenas a API do controlador. *(RB-26)*
- **FR-010**: A modalidade DEVE ser incluída pelo registro de modalidades, sem alterar o
  núcleo nem outras modalidades. *(constitution, princípio IV)*

### Entidades-chave

- **Categoria de Sumô**: identificador, nome, parâmetros do Dohyo, limites do robô e regra
  de largada.
- **Round**: tempo decorrido, tempo limite, resultado (vencedor, motivo, placar).
- **Arena de Sumô**: Dohyo, Tawara, Shikiri-sen e Yochi descritos como piso do mundo.

## Critérios de sucesso *(obrigatório)*

- **SC-001**: 100% dos cenários numéricos de arbitragem são reproduzidos no tick exato.
- **SC-002**: Toda violação de FR-006 é relatada com caminho e regra citada.
- **SC-003**: Os exemplos das três categorias rodam até o fim sem erro de controlador, e o
  exemplo do Mini Sumô produz um vencedor antes do tempo limite.
- **SC-004**: Um membro da equipe troca a estratégia de um robô no exemplo e vê o novo
  resultado do round em menos de 1 minuto.

## Premissas e limites

- O modelo de empurrão é o da feature 001 (divisão da sobreposição pela massa): não modela
  rampas, levantamento do oponente, tração dos pneus nem torque dos motores.
- Velocidades derivadas de motores usam 80% da rotação sem carga (heurística documentada
  em `docs/references/componentes/motores-rodas.md`, não dado de fabricante).
- Massa máxima do Sumô LEGO® não consta na referência regulamentar; não é verificada.
- Partida de 3 rounds, Fusensho, Shinitai e decisão dos juízes (Yusei) ficam fora (H-03, H-04).
- Montagem livre de robôs a partir do catálogo de componentes é a feature 003.
