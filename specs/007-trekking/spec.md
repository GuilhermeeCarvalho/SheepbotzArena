# Especificação da feature: Modalidade Trekking

**Feature**: `007-trekking` | **Criada em**: 2026-11-22 | **Status**: Rascunho

**Entrada**: "Modalidade Trekking da RoboCore: campo com 4 marcos e obstáculos, navegação
autônoma na ordem dos marcos, arbitragem da tomada de tempo e estratégia de exemplo."

**Requisitos do briefing atendidos**: RB-23, RB-24, RB-25, RB-26.

**Referência regulamentar**: `docs/references/robocore/trekking.md` (RoboCore, "Trekking —
Regras", revisão de 20/12/2023). Artigos citados: 2.4, 3.4, 3.7, 4.1, 4.2, 4.3, 4.13, 4.15,
4.17, 4.18, 4.19.

**Depende de**: feature 001. O núcleo passa a **exportar** duas funções já existentes de
geometria (`buildStaticBodies`, `discPenetration`) para o árbitro detectar contato com
obstáculos; nenhum comportamento do núcleo muda.

## Contexto e motivação

No Trekking o robô navega sozinho por um campo amplo até 4 marcos amarelos, desviando de
obstáculos. Testar navegação e odometria no campo real exige espaço e tempo; no simulador a
equipe repete percursos com o mesmo ruído e compara estratégias.

## Parâmetros

| Parâmetro | Valor | Fonte |
|-----------|-------|-------|
| Marcos | 4 chapas amarelas de ≈ 1,0 × 1,0 m | Art. 3.4, 4.1 |
| Ordem | partida no marco 1; depois 2, 3 e 4 | Art. 4.2 |
| Alcançar um marco | alguma parte do robô tocando o marco | Art. 4.3 |
| Obstáculos | a pelo menos 1 m do centro dos marcos | Art. 3.7 |
| Robô | cabe num cubo de 0,5 m | Art. 2.4 |
| Encerramento | colidir com obstáculo ou limite, ou sair do campo | Art. 4.15 |
| Largada | parado por 30 s após o início → *false start* | Art. 4.13 |
| Tempo | partida de 10 min | Art. 4.17 |

## Interpretações adotadas

- **H-01 — Campo**: o regulamento não fixa as dimensões; o campo é a arena do mundo (os
  exemplos usam 14 × 10 m).
- **H-02 — Sinalização luminosa** (Art. 4.3): não modelada; tocar o marco basta.
- **H-03 — Tocar**: o disco do robô sobrepõe ou encosta no quadrado do marco.
- **H-04 — Colisão**: o disco encosta em obstáculo (distância ≤ raio).
- **H-05 — Sair do campo**: qualquer parte do disco fora da arena.
- **H-06 — Uma tomada de tempo por simulação**, com o tempo da partida (600 s, configurável
  por `modalityOptions.timeLimit`) como limite.
- **H-07 — Parado**: deslocamento < 0,02 m desde a pose inicial.
- **H-08 — Resultado** (Art. 4.18 e 4.19): pontuação = marcos alcançados (1 a 4) e tempo
  do último marco; "vencedor" = completou os 4 marcos; elegível a prêmio = marco 2 ou mais.

## Cenários de usuário e testes *(obrigatório)*

### História de usuário 1 — Arbitrar a tomada de tempo (Prioridade: P1) 🎯 MVP

Campo 10 × 6 m, marcos centrados em (−3; 0), (−1,02; 0), (0,98; 0) e (2,98; 0), robô de raio
0,2 m no marco 1 (θ = 0), `dt = 0,05 s`.

1. **Dado** o robô andando a 1 m/s em +x, **quando** simulado, **então** alcança o marco 2
   no tick 26, o 3 no tick 66 e o 4 no tick 106; a tomada termina com vencedor, 4 marcos e
   tempo do último marco 5,30 s.
2. **Dado** marcos 2–4 afastados e uma caixa 0,4 × 0,4 m centrada em (−1,52; 0), **quando** o
   robô anda a 1 m/s em +x, **então** a tomada termina no tick 22 sem vencedor, motivo
   "colidiu com um obstáculo" e 1 marco.
3. **Dado** o robô andando a 0,7 m/s em −x, **quando** sai do campo, **então** a tomada
   termina no tick 52 (Art. 4.15).
4. **Dado** o robô parado, **quando** passam 30 s, **então** a tomada é cancelada no tick 600
   por *false start* (Art. 4.13).
5. **Dado** `timeLimit = 5` e o robô a 0,1 m/s, **quando** simulado, **então** termina no
   tick 100 com 1 marco.
6. **Dado** o robô que passa pelo marco 3 antes do 2, **quando** simulado, **então** o marco 3
   não conta até o 2 ser alcançado (Art. 4.2).

### História de usuário 2 — Validar campo e robô (Prioridade: P1)

1. Exatamente 1 robô. 2. Diâmetro ≤ 0,5 m (Art. 2.4). 3. `modalityOptions.marks` com 4
centros. 4. Marcos inteiramente dentro do campo. 5. Obstáculo a menos de 1 m do centro de um
marco → erro citando o Art. 3.7. 6. Robô começando sem tocar o marco 1 → erro (Art. 4.2).

### História de usuário 3 — Campo de exemplo e estratégia (Prioridade: P2)

1. **Dado** o campo de exemplo (14 × 10 m, obstáculos), **quando** carregado, **então** é
   válido, com marcos amarelos no piso e robô com componentes reais.
2. **Dado** a estratégia "ir ao alvo + desviar" (odometria + laser), **quando** simulada,
   **então** alcança os 4 marcos sem colidir, de forma repetível.

## Requisitos *(obrigatório)*

- **FR-001**: Modalidade `trekking` com os parâmetros da tabela. *(RB-23)*
- **FR-002**: Contar marcos na ordem 1→4 ao tocá-los (H-03; Art. 4.2, 4.3). *(RB-23)*
- **FR-003**: Encerrar ao completar os 4 marcos (vencedor), ao colidir com obstáculo, ao sair
  do campo (Art. 4.15), por *false start* (Art. 4.13) ou por tempo (H-06). *(RB-23)*
- **FR-004**: Resultado com marcos alcançados, tempos de cada marco e elegibilidade (H-08).
- **FR-005**: Validar robô, marcos e distância dos obstáculos (Art. 2.4, 3.7, 4.2). *(RB-25)*
- **FR-006**: Gerar campos com marcos amarelos no piso. *(RB-23)*
- **FR-007**: Campo de exemplo e estratégia em código com componentes reais. *(RB-24, RB-26)*
- **FR-008**: Entrar pelo registro, sem alterar comportamento do núcleo nem de outras
  modalidades. *(constitution, IV)*

## Critérios de sucesso *(obrigatório)*

- **SC-001**: Ticks exatos dos cenários da US1 reproduzidos.
- **SC-002**: O exemplo completa os 4 marcos sem colisão.

## Premissas e limites

- Terreno plano: desníveis, rampas, areia e cones (Art. 3.1, 3.5) não são modelados.
- Passagens opcionais com multiplicador de tempo (Art. 3.8–3.12) ficam fora.
- GPS e bússola não existem na API; a navegação usa odometria (com ruído) e laser.
