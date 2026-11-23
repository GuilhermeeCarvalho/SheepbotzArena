# Catálogo de componentes — Chassi e baterias

Levantamento feito em 2026-11. Valores copiados da fonte; ausências marcadas como
"NÃO ENCONTRADO na fonte". Objetivo: estimar a **massa total** do robô (`mass`, kg) e
ajudar a escolher o **raio** do disco (`radius`, m).

---

## 1. Materiais de chassi — densidade

| Material | Densidade (kg/m³) | Uso típico | Fonte |
|---|---|---|---|
| MDF | 600–800 (típico); faixa geral 500–1000 | chassi de protótipo, corte a laser | [Wikipedia — Medium-density fibreboard](https://en.wikipedia.org/wiki/Medium-density_fibreboard) |
| Compensado (plywood) | 540 | chassi leve | [Engineering ToolBox — Densities of solids](https://www.engineeringtoolbox.com/density-solids-d_1265.html) |
| Acrílico (PMMA) | 1190 (ETB "Acrylic"); 1180 (1,18 g/cm³) | chassi de seguidor/VSS, corte a laser | Engineering ToolBox; [Wikipedia — PMMA](https://en.wikipedia.org/wiki/Poly(methyl_methacrylate)) |
| Policarbonato | 1200 | chassi/proteção resistente a impacto | Engineering ToolBox |
| ABS (impressão 3D) | 1060 | suportes, carenagem | Engineering ToolBox |
| PLA (impressão 3D) | NÃO ENCONTRADO na fonte consultada | — | — |
| PEAD (HDPE) | 960 | — | Engineering ToolBox |
| Alumínio | 2700 | chassi de sumô/trekking | Engineering ToolBox |
| Aço | 7820 | **lâmina de sumô**, lastro | Engineering ToolBox |
| Titânio | 4500 | — | Engineering ToolBox |
| Fibra de carbono | NÃO ENCONTRADO na fonte consultada | — | — |

Massa de uma placa: **m = ρ · A · t** (A = área em m², t = espessura em m).

| Peça de exemplo | Cálculo | Massa |
|---|---|---|
| Placa MDF 100 × 100 × 3 mm (ρ = 700) | 0,01 m² · 0,003 m · 700 | 21,0 g |
| Placa acrílico 100 × 100 × 3 mm (ρ = 1190) | 0,01 · 0,003 · 1190 | 35,7 g |
| Placa alumínio 100 × 100 × 2 mm | 0,01 · 0,002 · 2700 | 54,0 g |
| Lâmina de aço 100 × 30 × 1 mm (mini sumô) | 0,003 · 0,001 · 7820 | 23,5 g |
| Lâmina de aço 200 × 50 × 2 mm (mega sumô) | 0,01 · 0,002 · 7820 | 156,4 g |

(Dimensões das peças são exemplos, não norma; ver limites de cada modalidade em
`docs/references/robocore/`.)

## 2. Baterias LiPo 2S / 3S

Tabela oficial da série Gens ace Soaring (Grepow):
[grepow.com — Soaring Series](https://grepow.com/rc-battery/soaring-series-rc-air-battery-pack.html).

| Pack | Tensão nominal | Capacidade | Descarga | Dimensões (mm) | Massa |
|---|---|---|---|---|---|
| 2S1P | 7,4 V | 450 mAh | 30C | 56,5 × 31 × 9 | 33 g |
| 2S1P | 7,4 V | 1000 mAh | 30C | 69,5 × 34 × 11 | 63 g |
| 2S1P | 7,4 V | 1300 mAh | 30C | 69,5 × 34 × 14,5 | 79 g |
| 2S1P | 7,4 V | 2200 mAh | 30C | 104 × 34,5 × 14,5 | 122 g |
| 3S1P | 11,1 V | 450 mAh | 30C | 58 × 31 × 13,5 | 47 g |
| 3S1P | 11,1 V | 1000 mAh | 30C | 71,5 × 35 × 17 | 89 g |
| 3S1P | 11,1 V | 1300 mAh | 30C | 71,5 × 35 × 21 | 107 g |
| 3S1P | 11,1 V | 2200 mAh | 20C | 74 × 33 × 25 | 146 g |

Outras referências encontradas (revendedores, menor confiança):
Gens ace 3S 1300 mAh G-Tech — 73 × 35 × 22,8 mm, 114 g
([Adrenaline RC](https://www.adrenalinercracing.com/es/products/gens-ace-3s-11-1v-1300mah-45c-g-tech-smart-lipo-battery-w-universal-connector)).
Páginas HobbyKing (Zippy/Turnigy): NÃO ENCONTRADO na fonte (acesso bloqueado, HTTP 403).

Observação: 2S casa com motores de 6 V (com PWM limitado) e 3S com motores de 12 V
(Micro HPCB 12V, 25D/37D 12V, JSumo Titan) — ver `motores-rodas.md`.

## 3. Massas de componentes eletrônicos (para o orçamento)

Ver os demais arquivos deste diretório: sensores de distância (0,4–5 g cada),
sensores de piso (0,2–3,1 g), motores (9,5 g micro; 88–90,5 g 25D; 190 g 37D/Titan), rodas
(3–48 g cada). Massa de microcontrolador, ponte H, fios e parafusos: NÃO ENCONTRADO
(não pesquisado nesta rodada).

---

## Mapeamento para o simulador

- **`mass` (kg)** = Σ massas de chassi + lâmina + motores + rodas + bateria + sensores +
  eletrônica. O núcleo hoje usa `mass` apenas como atributo (sem dinâmica); ela já serve
  para validar o limite da modalidade.
- **`radius` (m)**: o robô é um disco. Para um chassi retangular L × W, use o raio do
  círculo circunscrito r = √(L² + W²)/2 (conservador para colisão) ou inscrito r = min(L, W)/2
  (otimista). Ex.: mini sumô 0,10 × 0,10 m → r = 0,0707 m (circunscrito) ou 0,05 m (inscrito).

### Orçamentos de exemplo

| Robô | Itens | Massa estimada |
|---|---|---|
| Mini sumô (limite 500 g) | chassi alumínio 100×100×2 mm (54 g) + lâmina aço 100×30×1 mm (23,5 g) + 2× Micro HP 6V (19 g) + 2× JSumo SLT20 (44 g) + LiPo 2S 450 mAh (33 g) + 2× JS40F (8 g) + 2× ML1 (0,4 g) | ≈ 182 g + eletrônica + lastro até 0,5 kg |
| Seguidor de linha | chassi acrílico 150×100×3 mm (53,6 g) + 2× Micro HPCB 6V (19 g) + 2× Pololu 32 mm (6,2 g) + QTR-8RC (3,1 g) + LiPo 2S 450 mAh (33 g) | ≈ 115 g + eletrônica |
| Mega sumô (limite 3 kg) | chassi alumínio 200×200×3 mm (324 g) + lâmina aço 200×50×2 mm (156,4 g) + 2× Pololu 37D 50:1 (380 g) + 2× JS5230 (96 g) + LiPo 3S 1300 mAh (107 g) | ≈ 1,06 kg + eletrônica + lastro até 3 kg |

(Composições de exemplo; os itens individuais vêm das tabelas com fonte.)
