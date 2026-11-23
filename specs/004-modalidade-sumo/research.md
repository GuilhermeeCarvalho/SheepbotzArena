# Pesquisa e decisões técnicas: Modalidade Sumô

**Feature**: `004-modalidade-sumo` | **Data**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

## D-01 — Uma implementação, três categorias

- **Decisão**: `createSumoModality(category)` produz as três modalidades a partir de uma
  tabela `SUMO_CATEGORIES` (dados da spec, com a fonte de cada número). Registradas em
  `src/modalities/index.ts`.
- **Justificativa**: as categorias diferem só em parâmetros (spec, tabela); princípio IV
  (sem condicionais espalhadas, um ponto de composição).

## D-02 — Árbitro sem estado mutável compartilhado

- **Decisão**: `createReferee(world)` guarda a pose inicial de cada robô (para a regra dos
  5 s) e o tempo limite; `evaluate(state)` é função do snapshot e dessas constantes.
- **Justificativa**: a simulação reinicia o árbitro em `reset()` (feature 001, D-14);
  avaliar só pelo snapshot mantém o determinismo.

## D-03 — Ordem das verificações no tick

1. Largada queimada (LEGO®, `time < 5 s`).
2. Saída do Dohyo (H-01, H-06).
3. Tempo limite (`time ≥ roundTimeLimit`, com tolerância de 1e-9).

Uma saída no mesmo tick em que o tempo acaba conta como saída (o Yuko aconteceu no tempo).

## D-04 — Arena como piso do mundo

- **Decisão**: `createSumoWorld(category, robots, options)` devolve um objeto de mundo
  (JSON) com `floor.regions` = disco preto (refletância 0,05, `#111111`), anel da Tawara
  (0,95, `#f5f5f5`) e duas faixas da Shikiri-sen (0,30, `#7a4a2a`); piso fora do Dohyo 0,55
  (`#c9ccd1`); arena = Yochi, sem paredes; `dt = 0,01 s` (100 Hz, próximo de
  microcontroladores) por padrão.
- **Justificativa**: reaproveita regiões do piso e sensores da feature 001 sem tocar o
  núcleo; a interface já desenha regiões do piso.

## D-05 — Robôs de exemplo a partir de componentes reais

`docs/references/componentes/`; velocidades com 80% da rotação sem carga (heurística).

| Categoria | Motor + roda | v (m/s) | ω (rad/s) | Oponente | Borda |
|-----------|--------------|---------|-----------|----------|-------|
| Mini | Pololu Micro HP 6V 50:1 + JSumo 33 mm (590 rpm, bitola 0,08 m) | 0,8 × 1,02 ≈ 0,82 | 0,8 × 25,5 ≈ 20 | 3 × JS40F → laser 3 raios, FOV 0,6 rad, 0,40 m | 2 × QRE1113 → piso em [0,04; ±0,03], σ 0,03 |
| Mega | JSumo Titan 1000 rpm + roda 55 mm (bitola 0,17 m) | 0,8 × 2,88 ≈ 2,3 | 0,8 × 33,9 ≈ 27 | 3 × JS40F (até 0,80 m) → 0,80 m | piso em [0,08; ±0,06] |
| LEGO® | hipótese (sem datasheet LEGO® nas referências): 0,5 m/s, 6 rad/s | — | — | ultrassom LEGO® modelado como laser de 3 raios, FOV 0,5 rad, 1,0 m (hipótese) | piso em [0,06; ±0,04] |

Raio = metade do limite de largura da categoria (H-02); massa = limite da categoria (Mega
3 kg, Mini 0,5 kg; LEGO® 1 kg, hipótese).

## D-06 — Estratégias de exemplo

- **Busca e ataque**: borda → recua e gira para o lado oposto ao sensor que viu branco
  (temporizado por `robot.time()`); oponente no raio central → avança em velocidade máxima;
  laterais → curva para o lado; nada → gira procurando.
- **Flanco**: anda em arco largo dentro do Dohyo; ao detectar o oponente, ataca; borda →
  mesma fuga.
- Velocidades pedidas acima do máximo são saturadas pelo núcleo; as estratégias não
  conhecem o limite do robô.

## D-07 — Ajustes feitos ao validar os exemplos (2026-11-22)

- **Alinhar girando no lugar** (`ALINHAR = 0`): com velocidade linear ao alinhar, o atacante
  orbitava o oponente colado sem nunca centralizá-lo.
- **Ré curta** (`TEMPO_RE = 0,12 s`): sem sensor traseiro, uma ré longa levava o robô para
  fora de costas quando via a borda em ângulo ruim (US5-AC2).
- **Bumper frontal = empurrar**: contato na frente mantém o ataque em linha reta.
- **Exemplo LEGO®**: dois robôs lentos com a mesma estratégia ficaram se rodeando até o
  tempo limite. O exemplo passou a demonstrar a regra própria da categoria: o rival usa a
  estratégia sem a espera de 5 s e queima a largada (Nota 11). As versões LEGO® das
  estratégias são geradas a partir das bases (`ESPERA_INICIAL = 5`) para não duplicar código.
- **Configurações iniciais simétricas** em relação ao centro, com a mesma estratégia,
  produzem dinâmica espelhada indefinidamente; os exemplos usam orientações assimétricas.
