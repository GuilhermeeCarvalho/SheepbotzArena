# Plano de implementação: Modalidade Trekking

**Feature**: `007-trekking` | **Data**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

## Resumo

`src/modalities/trekking/` com parâmetros, árbitro com estado (marco atual e tempos), validação
e gerador de campo. O núcleo exporta `buildStaticBodies` e `discPenetration` em
`src/core/index.ts` (já existiam e são testados na feature 001). Exemplo e estratégia em
`examples/`.

## Verificação da constituição

| Princípio | Verificação | Situação |
|-----------|-------------|----------|
| II | Artigos citados; hipóteses H-01 a H-08. | ✅ |
| IV | Módulo novo + registro; o núcleo só exporta funções existentes (sem mudança de comportamento; a suíte da 001 continua verde como regressão). | ✅ |
| VI | Árbitro com estado recriado em `reset()`. | ✅ |

## Decisões

- **D-01 — Marcos em `modalityOptions.marks`**: o piso pode ter outras demarcações (Art. 3.6);
  os marcos são declarados explicitamente e desenhados no piso pelo gerador.
- **D-02 — Tocar**: `discPenetration` contra um corpo `box` 1 × 1 m ≥ −1e-6.
- **D-03 — Colisão**: `discPenetration` contra cada obstáculo ≥ −1e-6 (o núcleo mantém o robô
  encostado após resolver a colisão, então o contato é detectado no tick do impacto).
- **D-04 — Robô de exemplo** (`docs/references/componentes/`): Pololu 37D 12V 30:1 + roda
  60 mm, bitola 0,30 m → 80% de 1,04 m/s ≈ 0,83 m/s e 5,5 rad/s; raio 0,2 m; massa 3 kg
  (hipótese); 9 sensores VL53L1X (modo longo, 4 m, σ 2,5 mm) como laser de 9 raios em
  2,4 rad; odometria com σ 0,01; sensor de piso no centro.
- **D-05 — Estratégia**: alvos no referencial da largada (como coordenadas medidas no
  campo); vai ao alvo pela odometria; se o laser frontal vê obstáculo a < 0,9 m, contorna
  pelo lado mais livre; troca de alvo a < 0,35 m do centro do marco.

## Estrutura

```text
src/modalities/trekking/{parameters.ts, referee.ts, validation.ts, arena.ts, index.ts}
examples/worlds/trekking.json · examples/controllers/trekking-navigator.js
scripts/generate-trekking-example.ts
tests/acceptance/trekking/*.test.ts
```
