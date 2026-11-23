# Plano de implementação: Modalidade Sumô

**Feature**: `004-modalidade-sumo` | **Data**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

## Resumo

Primeira implementação do contrato `Modality` da feature 001: um módulo
`src/modalities/sumo/` com a tabela das três categorias, o árbitro do round, as regras de
validação e um gerador de arenas oficiais, registrado no ponto de composição
`src/modalities/index.ts`. Mundos e estratégias de exemplo entram em `examples/`, o que os
torna disponíveis automaticamente na interface (feature 002) e na linha de comando.
Nenhuma mudança no núcleo. Decisões em [research.md](./research.md).

## Contexto técnico

**Linguagem**: TypeScript 6 (`strict`). **Dependências novas**: nenhuma.
**Testes**: Vitest; `tests/acceptance/sumo/` (um teste por cenário `USx-ACy`) e
`tests/unit/modalities/sumo/`.
**Restrições**: o módulo depende só de `src/core` (regra de lint existente); textos em
português; parâmetros regulamentares com nome, unidade e fonte (constitution, princípio IV).

## Verificação da constituição

| Princípio | Verificação | Situação |
|-----------|-------------|----------|
| I. 2D/3D | Arbitragem só pelo estado 2D; a UI apenas exibe `match`. | ✅ |
| II. Regras da RoboCore | Spec cita Art. 3, 4, 10, 13 e Notas 11 e 18; hipóteses H-01 a H-06 separadas. | ✅ |
| III. Testes | Um teste por cenário; validações testadas uma a uma. | ✅ |
| IV. Extensibilidade | Entra pelo registro; núcleo e outras modalidades intocados; categorias por dados. | ✅ |
| V. Idioma | Mensagens e motivos em português. | ✅ |
| VI. Determinismo | Árbitro função do snapshot; teste de repetição dos exemplos. | ✅ |
| VII. Rastreabilidade | Tasks citam FR; cobertura ≥ 80%. | ✅ |

## Estrutura

```text
src/modalities/
├── index.ts                 # registro: + sumo-mega, sumo-mini, sumo-lego
└── sumo/
    ├── categories.ts        # SUMO_CATEGORIES (com fonte de cada valor) e constantes H-04/H-05
    ├── referee.ts           # isOutOfDohyo, createSumoReferee
    ├── validation.ts        # validateSumoWorld
    ├── arena.ts             # createSumoWorld (geometria oficial + posicionamento)
    └── index.ts             # createSumoModality, SUMO_MODALITIES
examples/
├── worlds/sumo-mini.json, sumo-mega.json, sumo-lego.json
└── controllers/sumo-search-attack.js, sumo-flank.js
scripts/generate-sumo-examples.ts   # gera os mundos de exemplo com createSumoWorld
tests/
├── acceptance/sumo/us1-referee.test.ts … us5-strategies.test.ts
└── unit/modalities/sumo/*.test.ts
```

## Pontos de integração

- `src/modalities/index.ts`: `createModalityRegistry([...SUMO_MODALITIES])`. A CLI, a
  sessão da interface e os testes já usam esse registro.
- Interface: nenhum código novo obrigatório; `SceneHud` exibe `match` e a sessão pausa no
  fim (feature 002, FR-008). Os exemplos aparecem no seletor de mundos.
- O seletor ordena exemplos por nome de arquivo; os de Sumô ficam após os genéricos.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Estratégias empatam por empurrão frontal simétrico | Posições iniciais assimétricas nos exemplos; tempo limite encerra o round. |
| Robô rápido (Mega 2,3 m/s) atravessa a borda entre leituras | `dt = 0,01 s` nos mundos de Sumô. |
| Exemplos mudarem de resultado com ajustes futuros | Teste de exemplo verifica "há vencedor" e determinismo, não o vencedor específico. |
