# Catálogo de componentes — Sensores de piso (refletância)

Levantamento feito em 2026-11 em datasheets e páginas oficiais. Valores copiados da fonte;
ausências marcadas como "NÃO ENCONTRADO na fonte".

No núcleo, o sensor `floor` devolve a refletância (0–1) do piso **em um ponto**
(`position` no referencial do robô) mais ruído gaussiano absoluto σ = `noise`, limitado a
[0, 1] (`src/core/sensors/floor.ts`).

---

## 1. Vishay TCRT5000 / TCRT5000L — sensor reflexivo discreto

| Parâmetro | Valor | Fonte |
|---|---|---|
| Tipo de detector | fototransistor, com filtro de luz do dia | [Datasheet Vishay 83760 Rev 1.7](https://www.vishay.com/docs/83760/tcrt5000.pdf) |
| Distância de pico (CTR máx.) | 2,5 mm | idem |
| Faixa de operação (> 20 % da corrente relativa) | 0,2 mm a 15 mm | idem |
| Comprimento de onda do emissor | 950 nm | idem |
| Corrente de saída típica em teste | IC = 1 mA | idem |
| Corrente direta máx. do LED | IF = 60 mA (abs. máx.) | idem |
| Dimensões (C × L × A) | 10,2 × 5,8 × 7 mm | idem |
| Massa | NÃO ENCONTRADO na fonte | — |
| Saída | Analógica (fototransistor; depende do circuito do usuário) | idem |

## 2. QRE1113 — SparkFun (analógico) e Pololu QTR-1A / QTR-1RC

| Parâmetro | SparkFun QRE1113 Analog (ROB-09453) | Pololu QTR-1A (#2458) | Pololu QTR-1RC (#2459) |
|---|---|---|---|
| Elemento | QRE1113GR | par LED IR/fototransistor (peça NÃO ENCONTRADA na fonte) | idem |
| Distância ótima | 3 mm | 3 mm | 3 mm |
| Distância máx. recomendada | NÃO ENCONTRADO na fonte | 6 mm | 9,5 mm |
| Saída | analógica (menor tensão = mais reflexo) | analógica 0 V–VCC | digital (pulso temporizado RC) |
| Tensão | 5 V (funciona em 3,3 V) | 5,0 V | 5,0 V |
| Corrente | 25 mA | 17 mA | 17 mA |
| Dimensões | 7,62 × 13,97 mm | 7,6 × 12,7 × 2,5 mm (0,3″ × 0,5″ × 0,1″) | idem |
| Massa | NÃO ENCONTRADO na fonte | 0,2 g | 0,2 g |
| Fonte | [SparkFun](https://www.sparkfun.com/products/9453) | [Pololu #2458](https://www.pololu.com/product/2458) | [Pololu #2459](https://www.pololu.com/product/2459) |

## 3. Pololu QTR-8A e QTR-8RC — barras de 8 sensores

| Parâmetro | QTR-8A (#960) | QTR-8RC (#961) |
|---|---|---|
| Canais | 8 | 8 |
| Espaçamento (pitch) | 9,525 mm (0,375″) | 9,525 mm |
| Distância ótima ao piso | 3 mm | 3 mm |
| Distância máx. recomendada | 6 mm | 9,5 mm |
| Saída | 8 tensões analógicas 0 V–VCC | 8 sinais digitais (pulso RC) |
| Tempo de leitura | NÃO ENCONTRADO na fonte (depende do ADC) | tipicamente < 1 ms → até 1 kHz para os 8 |
| Tensão / corrente | 3,3–5,0 V / 100 mA | 3,3–5,0 V / 100 mA |
| Dimensões | 74,9 × 12,7 × 3,2 mm (2,95″ × 0,5″ × 0,125″) | idem |
| Massa | 3,09 g (sem pinos) | 3,09 g |
| Fonte | [Pololu #960](https://www.pololu.com/product/960) | [Pololu #961](https://www.pololu.com/product/961) |

## 4. Pololu QTR-MD-08A — barra de 8 canais, pitch 8 mm

| Parâmetro | Valor | Fonte |
|---|---|---|
| Canais | 8 | [Pololu #4248](https://www.pololu.com/product/4248) |
| Espaçamento | 8 mm | idem |
| Distância ótima / máx. | 5 mm / 40 mm | idem |
| Saída | analógica 0 V–VCC (existe variante RC) | idem |
| Tensão / corrente | 2,9–5,5 V / 30 mA por LED em brilho máx.; 125 mA máx. na placa | idem |
| Dimensões | 61,0 × 20,0 × 2,5 mm | idem |
| Massa | 3,1 g | idem |
| Família relacionada | QTR-HD: pitch 4 mm (ex.: QTR-HD-07A, 7 canais) | idem |

## 5. Sensores de borda usados em sumô

Em sumô o sensor de piso detecta a **Tawara** (borda branca) sobre o Dohyo preto
(ver `docs/references/robocore/sumo.md`). Usam-se tipicamente sensores unitários como
QTR-1A/QTR-1RC, QRE1113 ou o JSumo ML1, montados nos cantos frontais (e às vezes traseiros).

### JSumo Micro Line Sensor ML1 (JS16249)

| Parâmetro | Valor | Fonte |
|---|---|---|
| Altura ideal ao piso | 2–3 mm ("clean analog output ... from 2-3mm height") | [JSumo ML1](https://www.jsumo.com/micro-line-sensor-ml1) |
| Saída | analógica (pode ir em entrada digital: diferença preto/branco é grande) | idem |
| Tensão | 5 V; funciona em 3,3 V | idem |
| Corrente | NÃO ENCONTRADO na fonte | — |
| Dimensões | 8,60 × 6,00 × 3,15 mm | idem |
| Massa | 0,2 g | idem |
| Observação | muito sensível: riscos brancos finos no Dohyo podem gerar falso positivo | [Blog JSumo XS1](https://blog.jsumo.com/xs1-micro-sumo-arduino-code-explanation-of-the-robot-code/) |

---

## Mapeamento para o simulador

O núcleo modela cada canal como **um sensor `floor` pontual** que lê a refletância da região
de piso sob `position`. Não modela altura, área de visão (spot) nem tempo de leitura.

- **Sensor unitário** (TCRT5000, QRE1113, QTR-1A/1RC, ML1): um `floor` com
  `position = [x, y]` no ponto onde o sensor está montado (m, referencial do robô).
- **Barra QTR-8A/8RC**: 8 sensores `floor` na linha x = x₀ (à frente do centro), com
  y_k = (k − 3,5) · 0,009525 m, k = 0…7 → y ∈ {±0,00476; ±0,01429; ±0,02381; ±0,03334} m.
  Largura total coberta ≈ 0,0667 m.
- **Barra QTR-MD-08A**: idem com pitch 0,008 m → y_k = (k − 3,5) · 0,008
  (y ∈ {±0,004; ±0,012; ±0,020; ±0,028} m).
- **Sumô (borda)**: 2 sensores `floor` nos cantos frontais, ex. `[0.8·r, ±0.6·r]` com r =
  raio do disco do robô; opcionalmente 2 traseiros. O controlador compara a leitura com um
  limiar (ex.: > 0,5 = branco/Tawara).
- **Ruído σ**: nenhum fabricante publica ruído de refletância normalizada
  (NÃO ENCONTRADO na fonte). Sugestão de modelagem: `noise` 0,02–0,05; para o ML1, que a
  JSumo descreve como muito sensível, usar o valor mais alto.
- **Altura**: a distância ótima (3 mm para QTR/QRE, 2,5 mm de pico no TCRT5000, 5 mm no
  QTR-MD) serve apenas como documentação; o simulador 2D supõe sensor sempre na altura certa.
- **Tempo de leitura**: QTR-8RC ≤ 1 ms, bem abaixo do `dt` padrão (50 ms), então ler a cada
  passo é fiel.
