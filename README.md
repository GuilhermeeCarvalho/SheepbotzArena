# SheepBotz Arena

<!-- stats:start -->
**241 testes · 93,1% de cobertura** (linhas; relatório em [`coverage/`](coverage/index.html))
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
| [001 — Núcleo de simulação headless](specs/001-nucleo-simulacao/) | ✅ implementada (58/58 tarefas) |
| [002 — Visualização 3D e controles](specs/002-visualizacao-3d/) | ✅ implementada (31/31 tarefas) |
| 003 — Catálogo de componentes reais e montador de robôs | planejada |
| [004 — Modalidade Sumô](specs/004-modalidade-sumo/) (Mega, Mini, LEGO®) | ✅ implementada (15/15 tarefas) |
| 005 — Painel de inspeção e replay | planejada |
| 006 — Seguidor de Linha · 007 — Trekking · 008 — Futebol | planejadas |
| 009 — Controlador remoto via WebSocket (bônus) | planejada |

## Como rodar

Requisitos: Node.js 22 ou superior.

```bash
npm install
npm run dev               # interface 3D em http://localhost:5173
npm run build             # build de produção em dist/
npm test                  # suíte de testes
npm run test:coverage     # cobertura (falha abaixo de 80%), relatório em coverage/
npm run readme:stats      # atualiza a linha de testes e cobertura deste README
npm run test:perf         # desempenho (10 000 ticks, 4 robôs, laser de 30 raios)
npm run lint              # ESLint (inclui direção de dependências) + TypeScript
```

### Simulação sem interface (headless)

```bash
npm run sim -- <mundo.json> --ticks <N> [--controller <robô>=<arquivo.js>]... [--timeout-ms <ms>] [--pretty]

# exemplos
npm run sim -- examples/worlds/corridor.json --ticks 600 --pretty
npm run sim -- tests/fixtures/worlds/laser-wall-3rays.json --ticks 0 --pretty
```

A saída é o estado final em JSON. Códigos de término: `0` sucesso, `1` uso incorreto,
`2` mundo inválido, `3` controlador inválido, `4` tempo limite excedido
([contrato](specs/001-nucleo-simulacao/contracts/cli.md)).

### Escrevendo um controlador

```js
// Chamado uma vez por tick; variáveis de fora de onTick funcionam como memória.
function onTick(robot) {
  const ranges = robot.readLaser(); // da direita para a esquerda
  const front = ranges[Math.floor(ranges.length / 2)];
  robot.setSpeed(front < 0.5 ? 0 : 0.5, front < 0.5 ? 1.5 : 0); // v (m/s), w (rad/s)
}
```

API completa em [`contracts/controller-api.md`](specs/001-nucleo-simulacao/contracts/controller-api.md);
formato do mundo em [`contracts/world-file.md`](specs/001-nucleo-simulacao/contracts/world-file.md).

## Rastreabilidade

`Briefing (RB-xx) → Spec (FR-xxx) → Tarefa (Txxx) → Commit`. Commits de implementação
seguem `<tipo>(<feature>/<tarefa>): <descrição> [<FR>, ...]`, por exemplo
`feat(001/T031): calcula leituras do laser e do sonar [FR-011, FR-012]`.

## Fluxo SpecKit

Os comandos estão disponíveis para Claude Code (`/speckit-specify`, `/speckit-plan`,
`/speckit-tasks`, `/speckit-implement` …, scripts bash) e OpenCode (`/speckit.specify` …,
scripts PowerShell).
