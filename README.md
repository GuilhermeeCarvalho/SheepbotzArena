# SheepBotz Arena

<!-- stats:start -->
**0 testes · 0% de cobertura** — implementação ainda não iniciada
<!-- stats:end -->

Simulador web de robôs móveis para a equipe Univille SheepBotz, no espírito do
Stage (Player/Stage): lógica e física em 2D, visualização 3D leve. O usuário descreve o
mundo num arquivo JSON, escreve o controlador do robô em JavaScript e acompanha a
simulação com play, pause, step e reset. As modalidades da RoboCore (Sumô, Seguidor de
Linha, Trekking e Futebol) são módulos de extensão sobre um núcleo genérico, headless e
determinístico.

Projeto desenvolvido com **Spec-Driven Development** (GitHub SpecKit).

## Documentação

| Artefato | Onde |
|----------|------|
| Constituição (princípios, stack, fluxo) | [`.specify/memory/constitution.md`](.specify/memory/constitution.md) |
| Requisitos extraídos do briefing, perguntas e decisões | [`docs/briefing/requisitos-extraidos.md`](docs/briefing/requisitos-extraidos.md) |
| Regras oficiais por modalidade | [`docs/references/robocore/`](docs/references/robocore/) |
| Especificações, planos e tarefas por feature | [`specs/`](specs/) |

### Features

| Feature | Situação |
|---------|----------|
| [001 — Núcleo de simulação headless](specs/001-nucleo-simulacao/) | spec, plano e tarefas prontos |
| 002 — Visualização 3D e controles | planejada |
| 003 — Modalidade Sumô | planejada |
| 004 — Painel de inspeção e replay | planejada |
| 005 — Seguidor de Linha · 006 — Trekking · 007 — Futebol | planejadas |
| 008 — Controlador remoto via WebSocket (bônus) | planejada |

## Como rodar

> Disponível a partir da implementação da feature 001.

```bash
npm install
npm test                  # suíte de testes
npm run test:coverage     # cobertura (mínimo 80%), relatório em coverage/
npm run sim -- <mundo.json> --ticks <N> --controller <robô>=<controlador.js>
```

## Rastreabilidade

`Briefing (RB-xx) → Spec (FR-xxx) → Tarefa (Txxx) → Commit`. Commits de implementação
seguem `<tipo>(<feature>/<tarefa>): <descrição> [<FR>, ...]`, por exemplo
`feat(001/T031): calcula leituras do laser e do sonar [FR-011, FR-012]`.

## Fluxo SpecKit

Os comandos estão disponíveis para Claude Code (`/speckit-specify`, `/speckit-plan`,
`/speckit-tasks`, `/speckit-implement` …, scripts bash) e OpenCode (`/speckit.specify` …,
scripts PowerShell).
