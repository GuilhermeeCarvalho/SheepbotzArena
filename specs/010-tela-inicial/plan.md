# Plano de implementação: Tela inicial

**Feature**: `010-tela-inicial` | **Data**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

## Resumo

Uma função pura de agrupamento, uma tela nova e um componente raiz que alterna entre a
tela inicial e o simulador:

1. `examples/examples.ts` — cada exemplo passa a informar sua modalidade.
2. `home/modalityGroups.ts` — agrupa os exemplos por modalidade, na ordem da spec (US2).
3. `home/HomeScreen.tsx` — tela inicial (US1, US2).
4. `Root.tsx` — escolhe a tela; `App` recebe o exemplo inicial e a ação de voltar (US3).

## Verificação da constituição

| Princípio | Verificação | Situação |
|-----------|-------------|----------|
| I | Nada no núcleo; a tela inicial não simula. | ✅ |
| IV | Agrupamento puro e testável fora do React; `src/ui` reaproveitado sem mudanças. | ✅ |
| V | Textos da tela em português; identificadores em inglês. | ✅ |
| VII | Tarefas citam FR; testes por cenário. | ✅ |

## Decisões

- **D-01 — Sem biblioteca de rotas**: o `Root` guarda em estado qual tela está aberta
  (`home` ou `simulator` com o id do exemplo). Uma biblioteca de rotas seria uma dependência
  nova na stack (constitution) para duas telas; recarregar a página volta ao início (spec,
  casos de borda).
- **D-02 — Modalidade do exemplo**: `buildExamples` lê o campo `modality` do mundo e o expõe
  como `modality` (opcional). `groupExamples` mapeia prefixos para grupos: `sumo-` → Sumô,
  `seguidor-` → Seguidor de Linha, `trekking` → Trekking, `futebol-` → Futebol de robôs;
  o resto vai para Livre. Grupos vazios são omitidos (US2-AC4).
- **D-03 — Simulador remontado a cada entrada**: o `Root` monta o `App` com
  `key = exemplo + contador de entradas`, então cada entrada começa uma sessão nova (US3-AC2).
  O `App` ganha `initialExampleId` e `onGoHome`; a `TopBar` ganha o botão "Tela inicial".
- **D-04 — Tema**: a tela inicial usa o mesmo `useTheme`, que já persiste a escolha; como só
  uma tela fica montada por vez, as duas leem a mesma preferência (FR-006).

## Estrutura

```text
src/app/Root.tsx · src/app/main.tsx
src/app/examples/examples.ts
src/app/home/{modalityGroups.ts, HomeScreen.tsx, HomeScreen.module.css}
src/app/App.tsx · src/app/layout/TopBar.tsx
tests/unit/app/modalityGroups.test.ts · tests/integration/home.test.tsx
```
