# Catálogo de componentes — Sensores de distância

Levantamento feito em 2026-11 a partir de páginas oficiais de fabricantes/distribuidores
oficiais e datasheets. Valores copiados da fonte; quando a fonte não traz o dado, aparece
"NÃO ENCONTRADO na fonte". Conversões de unidade (polegada → mm, oz → g) estão indicadas.

Unidades do núcleo (ver `specs/001-nucleo-simulacao/contracts/world-file.md`): metros,
radianos; `noise` do laser/sonar é o desvio-padrão σ (em metros) de um ruído gaussiano
**absoluto** somado à distância (`src/core/sensors/rangefinder.ts`).

---

## 1. HC-SR04 — ultrassom (Elecfreaks / genérico)

| Parâmetro | Valor | Fonte |
|---|---|---|
| Alcance mínimo | 2 cm | [Datasheet Elecfreaks (via SparkFun)](https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf) |
| Alcance máximo | 4 m | idem |
| Ângulo de medição | 15° ("Measuring Angle 15 degree"; a fonte não diz se é cone total ou semi-ângulo) | idem; [SparkFun SEN-15569](https://www.sparkfun.com/products/15569) |
| Precisão | "ranging accuracy can reach to 3mm" | idem |
| Frequência acústica | 40 kHz (rajada de 8 ciclos) | idem |
| Taxa de atualização | ciclo de medição recomendado > 60 ms (≈ 16 Hz máx.) | idem |
| Tensão / corrente | 5 V DC / 15 mA | idem |
| Dimensões | 45 × 20 × 15 mm | idem |
| Massa | NÃO ENCONTRADO na fonte | — |
| Saída | Digital (largura de pulso no pino Echo; µs/58 = cm) | idem |
| Observação | alvo deve ter ≥ 0,5 m² e ser liso para medir bem | idem |

## 2. Sharp GP2Y0A21YK0F — IR analógico 10–80 cm

| Parâmetro | Valor | Fonte |
|---|---|---|
| Alcance mínimo / máximo | 10 cm / 80 cm | [Pololu #136](https://www.pololu.com/product/136) |
| Campo de visão | NÃO ENCONTRADO na fonte | — |
| Precisão / resolução | NÃO ENCONTRADO na fonte (saída analógica; ~1,9 V de excursão; d ≈ 27 V·cm / V) | idem |
| Período de atualização | 38 ± 10 ms (≈ 26 Hz) | idem |
| Tensão / corrente | 4,5–5,5 V / 30 mA médio (picos; capacitor ≥ 10 µF recomendado) | idem |
| Dimensões | 44,5 × 18,9 × 13,5 mm | idem |
| Massa | 3,5 g | idem |
| Saída | Analógica | idem |

## 3. Sharp GP2Y0A02YK0F — IR analógico 20–150 cm

| Parâmetro | Valor | Fonte |
|---|---|---|
| Alcance mínimo / máximo | 20 cm / 150 cm | [Pololu #1137](https://www.pololu.com/product/1137) |
| Campo de visão | NÃO ENCONTRADO na fonte | — |
| Precisão / resolução | NÃO ENCONTRADO na fonte (excursão típica 2,05 V) | idem |
| Período de atualização | 38 ± 10 ms | idem |
| Tensão / corrente | 4,5–5,5 V / 33 mA médio | idem |
| Dimensões | 44,5 × 18,9 × 21,6 mm | idem |
| Massa | 5 g | idem |
| Saída | Analógica | idem |

## 4. ST VL53L0X — ToF laser (módulo e placa Pololu #2490)

| Parâmetro | Valor | Fonte |
|---|---|---|
| Alcance mínimo | datasheet não especifica; Pololu: "about 3 cm" efetivo; Adafruit: ~30 mm | [Pololu #2490](https://www.pololu.com/product/2490), [Adafruit #3317](https://www.adafruit.com/product/3317) |
| Alcance máximo (33 ms, interno) | branco 88 %: típ. 200 cm+ (mín. 120 cm); cinza 17 %: típ. 80 cm (mín. 70 cm) | [Datasheet ST DocID029104 Rev 1, Tabela 11](https://www.elecrow.com/download/VL53L0X.pdf) |
| Alcance máximo (externo nublado) | branco: típ. 80 cm (mín. 60 cm); cinza: típ. 50 cm (mín. 40 cm) | idem |
| Campo de visão | 25° (FOV do sistema) — Adafruit cita "35 degrees" para o cone | Datasheet ST §5.1; Adafruit |
| Precisão (desvio-padrão, interno, 33 ms / 66 ms) | branco a 120 cm: 4 % / 3 %; cinza a 70 cm: 7 % / 6 % | Datasheet ST, Tabela 12 |
| Precisão (externo, 33 ms / 66 ms) | branco a 60 cm: 7 % / 6 %; cinza a 40 cm: 12 % / 9 % | idem |
| Perfis (orçamento de tempo) | Default 30 ms (1,2 m); Alta precisão 200 ms (1,2 m, < ±3 %); Longo alcance 33 ms (2 m, só no escuro); Alta velocidade 20 ms (1,2 m, ±5 %) | Datasheet ST, Tabela 13 |
| Orçamento padrão / mínimo | 33 ms / 20 ms (máx. 5 s) | Datasheet ST §2.6.2, §2.10 |
| Resolução | 1 mm | Pololu #2490 |
| Tensão | módulo nu 2,6–3,5 V; placa Pololu 2,6–5,5 V | Datasheet ST Tab. 1; Pololu |
| Corrente | 20 mA típ. medindo, picos de 40 mA | Pololu #2490 |
| Dimensões | módulo 4,4 × 2,4 × 1,0 mm; placa Pololu 13 × 18 × 2 mm; Adafruit 21 × 18 × 2,8 mm | ST; Pololu; Adafruit |
| Massa | placa Pololu 0,5 g (sem pinos); Adafruit 1,3 g | Pololu; Adafruit |
| Saída | Digital I²C | Pololu |

## 5. ST VL53L1X — ToF laser de longo alcance (placa Pololu #3415)

| Parâmetro | Valor | Fonte |
|---|---|---|
| Alcance mínimo | 4 cm (mais perto detecta, mas não mede com precisão) | [Pololu #3415](https://www.pololu.com/product/3415) |
| Alcance máximo | modo longo 400 cm (escuro); médio ≈ 300 cm (escuro); curto ≈ 130 cm | idem; [ST UM2510](https://www.st.com/resource/en/user_manual/um2510-a-guide-to-using-the-vl53l1x-ultra-lite-driver-stmicroelectronics.pdf) |
| Campo de visão | 27° típico (completo); ROI programável de 15° a 27° | Pololu #3415; [SparkFun SEN-14722](https://www.sparkfun.com/products/14722) |
| Precisão / resolução | resolução 1 mm; SparkFun: "precision of 1mm with an accuracy of around ±5mm". Tabelas de erro do datasheet ST: NÃO ENCONTRADO na fonte (PDF não legível) | Pololu; SparkFun |
| Taxa de atualização | até 50 Hz (modo curto); 30 Hz (médio e longo); orçamento mínimo 20 ms só no modo curto | Pololu; ST UM2510 |
| Tensão / corrente | placa 2,6–5,5 V; 20 mA típ., picos 40 mA | Pololu |
| Dimensões | 13 × 18 × 2 mm (placa Pololu) | Pololu |
| Massa | 0,5 g (sem pinos) | Pololu |
| Saída | Digital I²C | Pololu |

## 6. JSumo JS40F — sensor de oponente IR digital (sumô)

| Parâmetro | Valor | Fonte |
|---|---|---|
| Alcance | "detect objects from 40 cm (based on detecting area it can be up to 80cm!)" | [JSumo JS40F](https://www.jsumo.com/js40f-digital-distance-sensor-min-40-cm-range) |
| Alcance mínimo | NÃO ENCONTRADO na fonte | — |
| Campo de visão | NÃO ENCONTRADO na fonte | — |
| Tempo de resposta | NÃO ENCONTRADO na fonte | — |
| Tensão / corrente | 3,3–5 V / 15 mA a 5 V | idem |
| Dimensões | 17,7 × 11,5 × 12,6 mm | idem |
| Massa | 4 g (com cabos). Um revendedor cita "0.05 kg" — conflitante; prevalece a página do fabricante | idem |
| Saída | Digital (0/1), IR reflexivo | idem |

## 7. Sharp GP2Y0D810Z0F — IR digital 10 cm (placa Pololu #1134)

| Parâmetro | Valor | Fonte |
|---|---|---|
| Faixa de detecção | 2 cm a 10 cm | [Pololu #1134](https://www.pololu.com/product/1134) |
| Campo de visão | NÃO ENCONTRADO na fonte | — |
| Período de atualização | 2,56 ms típ. (3,77 ms máx.) ≈ 400 Hz | idem |
| Tensão / corrente | 2,7–6,2 V / 5 mA típ. | idem |
| Dimensões | 21,6 × 8,9 × 10,4 mm (sem pinos) | idem |
| Massa | 1,5 g (sem pinos) | idem |
| Saída | Digital (nível baixo = objeto detectado) | idem |

## 8. Pololu Digital Distance Sensors (família irs16a / v2 / longo alcance)

Fonte da tabela da família: [Pololu #4064](https://www.pololu.com/product/4064); confirmações
em [#4052/specs](https://www.pololu.com/product/4052/specs),
[#4067/specs](https://www.pololu.com/product/4067/specs),
[#4069/specs](https://www.pololu.com/product/4069/specs).
Comuns a todos (páginas de specs): 3,0–5,5 V; ~30 mA ativo (0,4 mA desabilitado via EN);
21,6 × 8,9 × ~3,1–3,5 mm (0,85″ × 0,35″ × 0,122–0,136″); 0,4 g.

### Saída digital (alto/baixo, só detecção)

| Versão | Item # | Alcance máx. | Alcance mín. | Histerese | Atualização mín. |
|---|---|---|---|---|---|
| Original curto (irs16a) | 4050 | 5 cm | < 5 mm | 16 mm | 145 Hz |
| Original curto (irs16a) | 4052 | 10 cm | < 5 mm | 20 mm | 115 Hz |
| Original curto (irs16a) | 4054 | 15 cm | < 5 mm | 24 mm | 95 Hz |
| v2 curto | 5550/5460 | 5 cm | < 1 mm | 35 mm | 142 Hz |
| v2 curto | 5552/5462 | 10 cm | < 1 mm | 35 mm | 142 Hz |
| v2 curto | 5554/5464 | 15 cm | < 1 mm | 35 mm | 142 Hz |
| Longo alcance | 4066/5480 | 25 cm | < 1 mm | 50 mm | 100 Hz |
| Longo alcance | 4067/5481 | 50 cm | < 1 mm | 50 mm | 100 Hz |
| Longo alcance | 4069/5483 | 100 cm | < 1 mm | 50 mm | 100 Hz |
| Longo alcance | 4077/5491 | 200 cm | < 1 mm | 50 mm | 30 Hz |

### Saída por largura de pulso (mede distância)

| Versão | Item # | Alcance máx. | Alcance mín. | Resolução | Atualização mín. |
|---|---|---|---|---|---|
| Original curto | 4064 | ~50 cm | 1 cm (medida); < 5 mm (detecção) | 3 mm | 50 Hz (50–110 Hz) |
| v2 curto | 5562/5472 | ~50 cm | < 0,1 cm | 1 mm | 142 Hz |
| Longo alcance | 4071/5485 | ~130 cm | 4 cm | 1 mm | 100 Hz |
| Longo alcance | 4079/5493 | ~300 cm | 4 cm | 2 mm | 30 Hz |

- Campo de visão (#4064): "15° typical", varia com refletância e luz ambiente. Para as demais
  versões: NÃO ENCONTRADO na fonte.
- Incerteza de temporização do #4064: ≈ ±5 % (d = (3 mm / 4 µs)·(t − 1000 µs)).

---

## Mapeamento para o simulador

Parâmetros disponíveis no núcleo: `laser`/`sonar` com `rays`, `fov` (rad), `maxRange` (m),
`noise` (σ em m, constante). Não há `minRange` nem taxa de atualização por sensor — veja
"Lacunas do núcleo" abaixo.

Regras gerais sugeridas:

- **σ a partir de "precisão ±p"**: σ ≈ p/2 (trata ±p como ~2σ).
- **σ a partir de desvio-padrão percentual s % a uma distância d**: σ ≈ s·d. Como o núcleo
  usa σ constante, escolha d = distância típica de uso (ex.: meia arena).
- **Sensores digitais (só detecção)**: laser de 1 raio com `maxRange` = alcance nominal;
  o controlador interpreta `leitura < maxRange` como "objeto detectado". A histerese
  pode ser usada como σ aproximado (σ ≈ histerese/2) para simular a borda incerta.
- **FOV estreito (≤ 30°)**: 1 a 5 raios bastam; para modelar "cone" use 3–5 raios.

| Componente | Tipo no núcleo | rays | fov (rad) | maxRange (m) | noise σ (m) | Observação |
|---|---|---|---|---|---|---|
| HC-SR04 | `sonar` | 3–5 | 0,2618 (15°) | 4,0 | 0,0015 (3 mm/2) — otimista; considerar 0,01 em arena real | atualização ≤ 16 Hz; mín. 2 cm |
| Sharp GP2Y0A21YK0F | `laser` | 1 | 0,02 (feixe fino; FOV não publicado) | 0,80 | NÃO ENCONTRADO — heurística 0,01–0,02 | mín. 0,10 m; ~26 Hz |
| Sharp GP2Y0A02YK0F | `laser` | 1 | 0,02 (idem) | 1,50 | NÃO ENCONTRADO — heurística 0,02–0,03 | mín. 0,20 m |
| VL53L0X (default 33 ms) | `laser` | 1–5 | 0,4363 (25°) | 1,2 (cinza: 0,8) | 0,04·d → 0,024 a d = 0,6 m (branco) | mín. ~0,03 m; ~30 Hz |
| VL53L0X (alta precisão 200 ms) | `laser` | 1–5 | 0,4363 | 1,2 | 0,03·d/2 → ~0,01 a 0,6 m | 5 Hz |
| VL53L1X (modo curto) | `laser` | 1–5 | 0,2618–0,4712 (15°–27°, ROI) | 1,3 | 0,0025 (±5 mm/2) | 50 Hz; mín. 0,04 m |
| VL53L1X (modo longo) | `laser` | 1–5 | 0,4712 (27°) | 4,0 (escuro) | 0,0025 (idem) | 30 Hz |
| JS40F | `laser` (digital) | 1 | 0,02 (não publicado) | 0,40 (até 0,80) | NÃO ENCONTRADO | ler como booleano |
| GP2Y0D810Z0F | `laser` (digital) | 1 | 0,02 (não publicado) | 0,10 | — | mín. 0,02 m; ~400 Hz |
| Pololu digital 50 cm (#4067) | `laser` (digital) | 1 | 0,2618 (15°, valor do #4064) | 0,50 | 0,025 (histerese 50 mm/2) | 100 Hz |
| Pololu pulso 130 cm (#4071) | `laser` | 1–3 | 0,2618 (15°, valor do #4064) | 1,30 | 0,0005 (resolução 1 mm/2) — otimista | mín. 0,04 m |

Valores de `fov` = 0,02 rad marcados como "não publicado" são uma escolha de modelagem
(feixe estreito de 1 raio), **não** dado de fabricante.

### Lacunas do núcleo

- **Alcance mínimo**: o núcleo não modela zona cega; o controlador pode descartar leituras
  abaixo do mínimo do componente, ou o catálogo pode propor um campo `minRange`.
- **Taxa de atualização**: o núcleo lê todo sensor a cada `dt` (padrão 0,05 s = 20 Hz).
  Sensores mais lentos (HC-SR04, VL53L0X alta precisão) exigiriam retenção da última leitura.
- **Ruído proporcional à distância** (ToF, Sharp): o núcleo só tem σ constante.
- **Refletância do alvo** (ToF e IR dependem de branco/cinza): não modelada.
