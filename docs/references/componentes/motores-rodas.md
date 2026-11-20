# Catálogo de componentes — Motores e rodas

Levantamento feito em 2026-11 em páginas oficiais (Pololu, JSumo, DFRobot) e distribuidor
oficial JSumo (RobotShop). Valores copiados da fonte; ausências marcadas como
"NÃO ENCONTRADO na fonte". Pololu informa velocidade sem carga com tolerância ±20 % e
torque/corrente de stall como **extrapolação teórica** (o motor aquece e para antes disso).

---

## 1. Pololu Micro Metal Gearmotors (10 × 12 mm, eixo D de 3 mm)

Comuns: massa **9,5 g**; dimensões 10 × 12 × 25 mm (100:1, demais razões ≈ iguais; só a
1000:1 é 3,5 mm mais longa); eixo de saída D Ø 3 mm × 9 mm; tamanho similar ao N20.
Fonte geral: [Pololu — Micro Metal Gearmotors](https://www.pololu.com/category/60/micro-metal-gearmotors).

### HP 6 V (escovas de metal precioso, alta potência) — stall 1,6 A, sem carga 0,10 A

| Razão (exata) | Item # | rpm sem carga @6 V | Torque stall (kg·cm) | Fonte |
|---|---|---|---|---|
| 10:1 (9,96:1) | 999 | 3100 | 0,22 | [#999/specs](https://www.pololu.com/product/999/specs) |
| 30:1 (29,86:1) | 1093 | 1000 | 0,57 | [#1093/specs](https://www.pololu.com/product/1093/specs) |
| 50:1 (51,45:1) | 998 | 590 | 0,86 | [#998/specs](https://www.pololu.com/product/998/specs) |
| 100:1 (100,37:1) | 1101 | 310 | 1,7 | [#1101/specs](https://www.pololu.com/product/1101/specs) |

### HPCB 6 V (escovas de carbono, longa vida) — stall 1,5 A, sem carga 0,15 A

| Razão (exata) | Item # | rpm sem carga @6 V | Torque stall (kg·cm) | Fonte |
|---|---|---|---|---|
| 10:1 (9,96:1) | 3061 | 3300 | 0,17 | [#3061/specs](https://www.pololu.com/product/3061/specs) |
| 30:1 (29,86:1) | 3062 | 1100 | 0,45 | [#3062/specs](https://www.pololu.com/product/3062/specs) |
| 50:1 (51,45:1) | 3063 | 650 | 0,74 | [#3063/specs](https://www.pololu.com/product/3063/specs) |
| 100:1 (100,37:1) | 3065 | 330 | 1,6 | [#3065/specs](https://www.pololu.com/product/3065/specs) |

### HPCB 12 V — stall 0,75 A, sem carga 0,08 A

| Razão (exata) | Item # | rpm sem carga @12 V | Torque stall (kg·cm) | Fonte |
|---|---|---|---|---|
| 10:1 (9,96:1) | 3037 | 3400 | 0,17 | [#3037/specs](https://www.pololu.com/product/3037/specs) |
| 30:1 (29,86:1) | 3038 | 1100 | 0,39 | [#3038/specs](https://www.pololu.com/product/3038/specs) |
| 50:1 (51,45:1) | 3039 | 650 | 0,67 | [#3039/specs](https://www.pololu.com/product/3039/specs) |
| 100:1 (100,37:1) | 3041 | 330 | 1,3 | [#3041/specs](https://www.pololu.com/product/3041/specs) |

- **HP 12 V**: NÃO ENCONTRADO na fonte (a página da categoria lista HP 6 V, HPCB 6 V e
  HPCB 12 V para essas razões).
- Atenção: a tabela-resumo da página da categoria, lida automaticamente, mostrou valores
  diferentes para a linha 100:1; aqui prevalecem as páginas individuais de cada produto.

## 2. Motor N20 genérico

"N20" é um formato (12 × 10 mm de seção), não um produto padronizado: rpm e torque variam
por fabricante e redução. Exemplo com ficha publicada:

| Modelo | Tensão | Redução | rpm sem carga | Torque stall | Corrente stall / sem carga | Dimensões | Massa | Fonte |
|---|---|---|---|---|---|---|---|---|
| DFRobot DFR1114 (N20 com driver integrado) | 6 V | 150:1 | 133 | 1,0 kg·cm | 640 mA / 50 mA | 40 × 12 × 20 mm | 10 g | [DFRobot wiki](https://wiki.dfrobot.com/DFR1114) |

Para um N20 "genérico" sem ficha: NÃO ENCONTRADO na fonte — usar como aproximação a linha do
Micro Metal Gearmotor Pololu de mesma redução (mesmo formato, 9,5 g).

## 3. Motores 25D (Pololu e JSumo) — Mini/Mega Sumô, Trekking

### Pololu 25D HP 12 V — stall 5,0 A; sem carga 250 mA (300 mA c/ encoder); eixo Ø 4 mm

| Razão | Item # | rpm sem carga | Torque stall (kg·cm) | Fonte |
|---|---|---|---|---|
| 9,7:1 | 3202 | 1000 | 3,9 | [Pololu 25D](https://www.pololu.com/category/115/25d-metal-gearmotors) |
| 20,4:1 | 3203 | 500 | 7,4 | idem |
| 34:1 | 3204 | 300 | 11 | idem |
| 47:1 (46,85:1) | 3205 | 220 | 15 | [#3205/specs](https://www.pololu.com/product/3205/specs) |
| 75:1 | 3206 | 130 | 22 | idem categoria |

Massa: **88 g** (#3205, 25D × 52L mm). Demais razões: NÃO ENCONTRADO na fonte (a caixa
cresce com a razão). Limite de carga contínua: 4 kg·cm.

### Pololu 25D HP 6 V — stall 6,0 A; sem carga 420 mA

| Razão | Item # | rpm sem carga | Torque stall (kg·cm) |
|---|---|---|---|
| 9,7:1 | 1571 | 1000 | 2,3 |
| 20,4:1 | 1572 | 480 | 4,8 |
| 34:1 | 1573 | 290 | 6,8 |
| 47:1 | 1574 | 210 | 9,1 |
| 75:1 | 1575 | 130 | 14 |

Fonte: [Pololu 25D](https://www.pololu.com/category/115/25d-metal-gearmotors). Massa:
NÃO ENCONTRADO na fonte.

### JSumo DC Gearhead 25 mm 12 V 500 rpm HP

| Parâmetro | Valor | Fonte |
|---|---|---|
| rpm sem carga | 500 | [JSumo](https://www.jsumo.com/jsumo-dc-gearhead-motor-25mm-12v-500-rpm-hp) |
| Torque stall | 1550 g·cm (1,55 kg·cm; 152 mN·m) | idem |
| Corrente sem carga / stall | 120 mA / 820 mA | idem |
| Dimensões / eixo | Ø 25 × 53,5 mm; eixo D Ø 4 × 12 mm | idem |
| Massa | 90,5 g | idem |

## 4. Motores 37D (Pololu e JSumo Titan) — Mega Sumô

### Pololu 37D 12 V (pinhão helicoidal) — stall 5,5 A; sem carga 0,2 A; Ø 37 mm

| Razão | Item # | rpm sem carga | Torque stall (kg·cm) |
|---|---|---|---|
| 6,3:1 | 4747 | 1600 | 3,0 |
| 10:1 | 4748 | 1000 | 4,9 |
| 19:1 | 4741 | 530 | 8,5 |
| 30:1 | 4742 | 330 | 14 |
| 50:1 | 4743 | 200 | 21 |
| 70:1 | 4744 | 150 | 27 |
| 100:1 | 4745 | 100 | 34 |

Fonte: [Pololu 37D](https://www.pololu.com/category/116/37d-metal-gearmotors). Massa:
**190 g** para o 50:1 (37D × 54L mm, eixo D Ø 6 mm) — [#4743/specs](https://www.pololu.com/product/4743/specs).
Demais razões: NÃO ENCONTRADO na fonte. A Pololu limita a carga recomendada a 10 kg·cm.
Versão 24 V (stall 3 A): mesmas rpm aproximadas (ex.: 30:1 → 330 rpm, 15 kg·cm), mesma fonte.

### JSumo Titan DC Gearhead 12 V 1000 rpm HP

| Parâmetro | Valor | Fonte |
|---|---|---|
| rpm sem carga | 1000 | [JSumo Titan 1000 rpm](https://www.jsumo.com/jsumo-titan-dc-gearhead-motor-12v-1000-rpm-hp) |
| Torque stall | 7,5 kg·cm (outra página JSumo da série Titan cita 4,5 kg·cm — conflitante) | idem |
| Corrente sem carga / stall | 240 mA / 5,9 A | idem |
| Dimensões / eixo | Ø 37 × 75 mm; eixo Ø 6 × 17 mm | idem |
| Massa | 190 g (0,19 kg) | idem |

## 5. Rodas

| Roda | Diâmetro | Largura | Massa | Cubo/eixo | Fonte |
|---|---|---|---|---|---|
| Pololu 32 × 7 mm (#1087) | 32 mm | 7 mm | 0,11 oz ≈ 3,1 g por roda (com pneu) | D 3 mm (pressão) | [#1087](https://www.pololu.com/product/1087), [specs](https://www.pololu.com/product/1087/specs) |
| Pololu 42 × 19 mm (#1090) | 42 mm | 19 mm | 19 g (a fonte não deixa claro se por roda ou par) | D 3 mm | [#1090](https://www.pololu.com/product/1090) |
| Pololu 60 × 8 mm (#1420) | 60 mm | 8 mm | 0,4 oz ≈ 11,3 g por roda (com pneu) | D 3 mm (pressão) | [#1420](https://www.pololu.com/product/1420), [specs](https://www.pololu.com/product/1420/specs) |
| JSumo SLT20 silicone 33 × 20 mm | 33 mm | 20 mm (silicone 18,5 mm; total 21 mm) | 22 g por roda | furo 3 mm + parafuso M4 | [RobotShop (JSumo)](https://www.robotshop.com/products/slt20-aluminum-silicone-wheel-33-x-20-mm-pair) |
| JSumo v2 silicone 43 × 11 mm (JS4311) | 43 mm | 11 mm (silicone 8 mm) | 17,7 g por roda (listagem de revenda; página principal sem massa) | furo 3 mm | [RobotShop (JSumo)](https://www.robotshop.com/products/jsumo-v2-aluminum-soft-silicone-wheel-43x11mm-pair) |
| JSumo JS5230 alumínio + silicone | 52 mm | 30 mm | 48 g por roda | parafuso M4; furo NÃO ENCONTRADO | [RobotShop (JSumo)](https://www.robotshop.com/products/js5230-aluminum-silicone-wheel-52-x-30-mm-pair) |
| JSumo JS2622 silicone | 26,5 mm | 22 mm (silicone 19 mm) | 12 g por roda (outra listagem: 13 g) | NÃO ENCONTRADO | [RobotShop (JSumo)](https://robotshop.com/products/js2622-aluminum-silicone-wheel-pair-26mm-diameter) |

---

## Mapeamento para o simulador

Parâmetros do núcleo (`robots[]` em `world-file.md`): `radius` (m), `mass` (kg),
`maxLinearSpeed` (m/s), `maxAngularSpeed` (rad/s).

### Fórmulas

- Velocidade linear máxima (rpm sem carga do motor **com** redução, diâmetro d da roda em m):

  **v_max = rpm · π · d / 60**

- Velocidade angular máxima do robô diferencial (bitola b = distância entre as rodas, m):

  **ω_max = 2 · v_max / b**

  (rodas girando em sentidos opostos a v_max cada.)
- Para um robô-disco de raio r com rodas na periferia, b ≈ 2·r − largura da roda.
- `rpm` sem carga é um limite superior (tolerância ±20 %). Sugestão de modelagem
  (heurística, **não** dado de fabricante): usar 70–85 % do valor sem carga para
  aproximar a velocidade sob carga.

### Exemplos calculados (sem carga)

| Configuração | rpm | d (m) | v_max (m/s) | b (m) | ω_max (rad/s) |
|---|---|---|---|---|---|
| Seguidor: Micro HP 6V 10:1 + roda 32 mm | 3100 | 0,032 | 5,19 | 0,12 | 86,6 |
| Seguidor: Micro HP 6V 30:1 + roda 32 mm | 1000 | 0,032 | 1,68 | 0,12 | 27,9 |
| Mini sumô: Micro HP 6V 50:1 + JSumo 33 mm | 590 | 0,033 | 1,02 | 0,08 | 25,5 |
| Mini sumô: Micro HP 6V 100:1 + roda 42 mm | 310 | 0,042 | 0,68 | 0,08 | 17,0 |
| Mini sumô: Micro HPCB 12V 30:1 + JSumo 43 mm | 1100 | 0,043 | 2,48 | 0,08 | 61,9 |
| Mega sumô: Pololu 25D HP 12V 47:1 + JS5230 52 mm | 220 | 0,052 | 0,60 | 0,17 | 7,0 |
| Mega sumô: Pololu 37D 12V 50:1 + roda 55 mm | 200 | 0,055 | 0,58 | 0,17 | 6,8 |
| Mega sumô: JSumo Titan 1000 rpm + roda 55 mm | 1000 | 0,055 | 2,88 | 0,17 | 33,9 |
| Trekking: Pololu 37D 12V 30:1 + roda 60 mm | 330 | 0,060 | 1,04 | 0,30 | 6,9 |

(Bitolas b são valores de exemplo, não normativos; 0,055 m para a roda do Mega Sumô é um
diâmetro de exemplo próximo à JSumo 52–55 mm.)

### Massa

Somar ao chassi (ver `chassis-baterias.md`): 2 × massa do motor + 2 × massa da roda.
Ex.: 2 × Micro (9,5 g) + 2 × JSumo SLT20 (22 g) = 63 g; 2 × 37D 50:1 (190 g) + 2 × JS5230
(48 g) = 476 g.

### Lacunas do núcleo

- Torque de stall, corrente e aceleração **não** entram no núcleo (cinemática pura limitada
  por `maxLinearSpeed`/`maxAngularSpeed`). Para empurrões de sumô, a força de empuxo
  F ≈ 2 · τ_stall / (d/2) (τ em N·m: kg·cm × 0,0981) seria o dado a usar se o núcleo
  ganhar dinâmica.
- `odometry.noise` (σ somado a v em m/s e a ω em rad/s a cada passo) não tem fonte de
  fabricante: encoders/escorregamento — NÃO ENCONTRADO na fonte. Sugestão heurística:
  σ ≈ 2–5 % de v_max.
