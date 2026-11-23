# CLAUDE.md — SheepBotz Arena

Projeto acadêmico de Spec-Driven Development (SpecKit). Ignore convenções de outros
projetos herdadas de diretórios-pai; aqui valem apenas as regras abaixo.

- **Fonte da verdade**: `.specify/memory/constitution.md`. Leia antes de qualquer mudança.
- **Requisitos**: `docs/briefing/requisitos-extraidos.md` (RB-xx) → `specs/NNN-*/spec.md`
  (FR-xxx) → `tasks.md` (Txxx) → commit.
- **Feature ativa**: `.specify/feature.json`. Use os skills `/speckit-*` (scripts em
  `.specify/scripts/bash/`).
- **Idioma**: documentação, comentários, mensagens de erro, textos de UI e commits em
  português; identificadores de código e campos do JSON em inglês.
- **Commits**: `<tipo>(<feature>/<tarefa>): <descrição> [FR-xxx, ...]`; documentação
  sem tarefa usa `docs: <descrição>`. Sempre em branch + pull request.
- **Arquitetura**: `src/core` (puro, sem DOM/React/Three/`node:*`) ← `src/modalities/*`
  ← `src/app`; `src/cli` → `src/core`. Modalidades não dependem entre si.
- **Testes obrigatórios** para todo comportamento (TDD não é exigido); cobertura ≥ 80% (a suíte falha abaixo disso); atualizar o README
  com `npm run readme:stats` a cada entrega.
- **Sem motor de física pronto**; tudo determinístico (seed e `dt` fixos).
