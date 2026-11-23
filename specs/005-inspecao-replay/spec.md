# Especificação da feature: Painel de inspeção e replay

**Feature**: `005-inspecao-replay` | **Criada em**: 2026-11-23 | **Status**: Implementada

**Entrada**: "Painel de inspeção com as leituras dos sensores e gravação e replay de
simulações" (escopo completo da Trilha 4).

**Requisitos do briefing atendidos**: RB-21, RB-22 (e RB-02: o replay reproduz exatamente
o que foi simulado).

**Depende de**: features 001 (estado e leituras) e 002 (interface). O núcleo não muda.

## Contexto e motivação

Quando uma estratégia falha, a equipe precisa saber **o que o robô estava lendo** naquele
instante e **voltar no tempo** para ver o lance de novo, quadro a quadro. Também quer
guardar uma simulação e mostrá-la depois (por exemplo, na apresentação ou para o colega
que vai revisar a estratégia), sem precisar rodar de novo.

## Cenários de usuário e testes *(obrigatório)*

### História de usuário 1 — Painel de inspeção dos sensores (Prioridade: P1) 🎯 MVP

O usuário escolhe um robô e vê, a cada tick, todas as leituras: cada raio do laser, o
sonar, cada sensor de piso, os bumpers, a odometria, a câmera, o comando atual (v, w) e as
últimas mensagens registradas pelo controlador.

1. **Dado** um robô com laser de 3 raios diante de uma parede a 1 m (feature 001, US3-AC1),
   **quando** o painel é aberto, **então** mostra os três raios com 2,00 m, 1,00 m e 2,00 m,
   indicando qual detectou algo (1,00 m) e o alcance máximo (2,00 m).
2. **Dado** sensores de piso, **quando** exibidos, **então** cada um mostra a refletância
   (0 a 1) e se está sobre branco (> 0,5).
3. **Dado** um bumper acionado, **então** aparece como "acionado"; caso contrário,
   "livre".
4. **Dado** a odometria e o comando, **então** aparecem x, y (m, 2 casas), θ (graus
   inteiros), distância (m) e v (m/s), w (rad/s).
5. **Dado** uma câmera de visão global, **então** mostra a pose do robô e a posição da bola
   (ou "sem bola").
6. **Dado** a simulação em execução, **quando** os ticks avançam, **então** os valores do
   painel são os do tick exibido.
7. **Dado** o controlador que chama `robot.log`, **então** as 5 mensagens mais recentes
   aparecem com o tick.

### História de usuário 2 — Gravação e replay (Prioridade: P1)

Toda simulação é gravada automaticamente, tick a tick, desde o tick 0 (o reinício ou a
troca de mundo/controlador começam uma gravação nova). Uma linha do tempo permite voltar a
qualquer tick gravado; o replay mostra exatamente os estados simulados.

1. **Dado** 120 ticks simulados (por execução ou passos), **quando** o usuário arrasta a
   linha do tempo para o tick 40, **então** a cena, a barra de estado e o painel mostram o
   estado do tick 40, idêntico ao que o núcleo produziu naquele tick.
2. **Dado** o modo replay, **quando** o usuário aciona "Executar", **então** os quadros
   gravados são reproduzidos na velocidade escolhida até o fim da gravação, sem simular de
   novo.
3. **Dado** o modo replay, **quando** o usuário aciona "Ao vivo", **então** volta ao último
   estado simulado e pode continuar a simulação de onde parou.
4. **Dado** o modo replay, **quando** usa "Avançar um tick", **então** vai ao quadro seguinte;
   "Reiniciar" leva ao quadro 0.
5. **Dado** a simulação ao vivo, **quando** um tick é simulado com vários ticks por quadro
   (velocidade 4×), **então** todos os ticks intermediários também são gravados.
6. **Dado** a gravação no limite de 30 000 quadros, **quando** a simulação continua, **então**
   a gravação para de crescer e a interface avisa que o limite foi atingido.

### História de usuário 3 — Exportar e abrir gravações (Prioridade: P2)

1. **Dado** uma gravação, **quando** o usuário aciona "Exportar gravação", **então** baixa um
   arquivo `.json` com o mundo, os controladores e todos os quadros.
2. **Dado** esse arquivo, **quando** o usuário o abre ("Abrir gravação"), **então** a
   interface carrega o mundo e entra em replay no quadro 0, sem executar controladores.
3. **Dado** um arquivo que não é uma gravação válida (formato, versão ou mundo inválido),
   **quando** aberto, **então** a mensagem de erro explica o problema e nada muda.

### Casos de borda

- Gravação com um único quadro (tick 0): a linha do tempo fica desabilitada.
- Partida encerrada pela modalidade: a gravação termina no quadro final; o replay mostra o
  resultado.
- Reposição pedida pelo árbitro (feature 008) aparece no replay como no ao vivo.

## Requisitos *(obrigatório)*

- **FR-001**: Painel com todas as leituras do robô selecionado no tick exibido (US1). *(RB-21)*
- **FR-002**: Gravação automática de todos os ticks desde o tick 0, reiniciada com a
  simulação, limitada a 30 000 quadros com aviso. *(RB-22)*
- **FR-003**: Linha do tempo, reprodução, avanço quadro a quadro, ir ao início e voltar ao
  vivo, sem simular de novo. *(RB-22)*
- **FR-004**: Os quadros do replay são idênticos aos estados do núcleo. *(RB-02, RB-22)*
- **FR-005**: Exportar e abrir gravações (JSON com versão, mundo, controladores e quadros),
  com validação e mensagens de erro. *(RB-22)*

## Critérios de sucesso *(obrigatório)*

- **SC-001**: Em 100% dos testes, o quadro N do replay é igual ao `step(N)` do núcleo.
- **SC-002**: Uma gravação de 60 s de Sumô (6 000 quadros) abre e é reproduzida sem simular.

## Premissas e limites

- A gravação fica em memória; arquivos exportados podem ter alguns MB.
- O replay não executa controladores: editar o controlador durante o replay só vale ao
  voltar ao vivo e aplicar (que inicia uma simulação nova).
