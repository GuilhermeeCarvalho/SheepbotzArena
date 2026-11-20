# Plano de implementação: Visualização 3D e controles

**Feature**: `002-visualizacao-3d` | **Data**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

## Resumo

Aplicação React (Vite) que consome o núcleo da feature 001 sem alterá-lo. A cena 3D é
declarada com React Three Fiber a partir de um **modelo de cena puro** (mundo + estado →
descritores 3D). A reprodução usa um **relógio** que converte tempo real × velocidade em
ticks inteiros. Toda a interface é montada com a **biblioteca de componentes** própria em
`src/ui/`. Decisões em [research.md](./research.md).

## Contexto técnico

**Linguagem/Versão**: TypeScript 6 (`strict`), React 19, alvo navegadores modernos.

**Dependências principais**: `react`, `react-dom`, `three`, `@react-three/fiber`,
`@react-three/drei`, `codemirror` + `@codemirror/lang-javascript`/`lang-json`/`theme-one-dark`,
`lucide-react`. Desenvolvimento: `vite`, `@vitejs/plugin-react`, `jsdom`,
`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`,
`@react-three/test-renderer`.

**Armazenamento**: nenhum (estado em memória; exemplos embutidos no build).

**Testes**: Vitest; ambiente `jsdom` para arquivos `*.test.tsx`.

**Plataforma alvo**: Chrome, Edge e Firefox atuais, telas ≥ 1280 × 720.

**Tipo de projeto**: aplicação web de página única servida pelo Vite.

**Metas de desempenho**: SC-001 (≥ 30 fps com 4 robôs × 30 raios); SC-002 (< 100 ms).

**Restrições**: núcleo intocado; `src/ui/` não depende de `src/core`, `src/modalities` nem
`src/app` (regra de lint); textos em português.

## Verificação da constituição

| Princípio | Verificação | Situação |
|-----------|-------------|----------|
| I. 2D com visualização 3D | A cena só lê mundo e estado via `buildSceneModel`; nenhuma decisão física na interface. | ✅ |
| II. Regras da RoboCore | Não se aplica (sem regras de modalidade). | ✅ |
| III. Testes | Cada história com testes; funções puras com casos numéricos da spec. | ✅ |
| IV. Baixo acoplamento | `ui` ← `app` → `core`; `ui` independente; modalidades acessadas só pelo registro. | ✅ |
| V. Idioma | Textos da interface em português; identificadores em inglês. | ✅ |
| VI. Determinismo | O relógio só chama `step(n)` inteiro; FR-007 testado contra o núcleo. | ✅ |
| VII. Rastreabilidade | Tarefas citam FR; cobertura ≥ 80% mantida com os testes de UI. | ✅ |
| Stack (v2.1.0) | Dependências conforme a emenda 2.1.0. | ✅ |

## Arquitetura

```text
 examples/*.json, *.js ──► app/examples ──┐
                                          ▼
                     app/session (redutor puro) ◄──── ações da UI (play, step, aplicar…)
                          │  usa createSimulation/loadWorld (src/core)
                          ▼
                 useSimulationSession (hook + requestAnimationFrame + playbackClock)
                          │ estado atual
          ┌───────────────┼──────────────────────────┐
          ▼               ▼                          ▼
   app/scene          app/panels                app/layout
   sceneModel.ts      WorldPanel, ControllerPanel,  AppShell, TopBar, StatusBar
   (puro) ──► R3F     RobotList
   Viewport, Arena,
   RobotMesh, SensorRays
          │               │                          │
          └──────── todos usam src/ui (componentes + tokens) ─┘
```

## Estrutura do projeto

### Documentação

```text
specs/002-visualizacao-3d/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md
├── contracts/
│   ├── scene-model.md     # descritores 3D e mapeamento de coordenadas
│   ├── playback.md        # relógio de reprodução e sessão
│   └── ui-components.md   # API da biblioteca de componentes
└── checklists/requirements.md
```

### Código-fonte

```text
index.html                       # ponto de montagem do Vite
vite.config.ts
src/
├── ui/                          # biblioteca de componentes (genérica)
│   ├── tokens.css               # variáveis de design + reset + tipografia
│   ├── index.ts                 # barrel
│   └── components/<Nome>/<Nome>.tsx + <Nome>.module.css
└── app/
    ├── main.tsx                 # bootstrap (excluído da cobertura)
    ├── App.tsx                  # composição da tela
    ├── examples/examples.ts     # exemplos embutidos
    ├── session/
    │   ├── session.ts           # transições puras da sessão
    │   ├── playbackClock.ts     # tempo real → ticks
    │   └── useSimulationSession.ts
    ├── scene/
    │   ├── sceneModel.ts        # mundo + estado → descritores 3D (puro)
    │   ├── Viewport.tsx         # Canvas, câmera, luzes, controles orbitais
    │   ├── ArenaMesh.tsx, FloorRegions.tsx, ObstacleMesh.tsx
    │   ├── RobotMesh.tsx, SensorRays.tsx
    │   └── SceneContent.tsx     # compõe a cena a partir do modelo
    ├── layout/AppShell.tsx, TopBar.tsx, StatusBar.tsx
    └── panels/WorldPanel.tsx, ControllerPanel.tsx, RobotList.tsx
tests/
├── unit/app/                    # sceneModel, playbackClock, session, examples
├── ui/                          # componentes da biblioteca (jsdom)
├── scene/                       # cena R3F (test-renderer)
└── integration/app.test.tsx     # App completo com Viewport dublê
```

**Decisão de estrutura**: `src/ui` é uma biblioteca interna reutilizável por qualquer tela
futura (features 003 e 004); `src/app` organiza por responsabilidade (sessão, cena,
painéis, layout). Componentes exportados por nome; CSS Modules ao lado de cada componente.

## Identidade visual

- Tema escuro "oficina de robótica": fundo `#0f1419`, superfícies `#161c24`/`#1d2530`,
  bordas `#2a3441`, texto `#e6edf3`/`#9aa7b4`.
- Destaque (marca SheepBotz): verde-limão `#a3e635`; secundária ciano `#22d3ee`;
  perigo `#f87171`; aviso `#fbbf24`; sucesso `#4ade80`.
- Raios: detecção `#f43f5e` (vermelho-rosado), livre `#38bdf8` com 35% de opacidade.
- Tipografia: pilha do sistema (`Inter`, `system-ui`); números em `JetBrains Mono`/monoespaçada.
- Espaçamento base 4 px (`--space-1` … `--space-8`); raios 6/10 px.
- Cena: céu em gradiente escuro, grade de 0,5 m, sombras suaves, piso da arena com
  a cor do mundo.

## Constantes nomeadas

| Constante | Valor | Origem |
|-----------|-------|--------|
| `MAX_TICKS_PER_FRAME` | 20 | spec US2 |
| `PLAYBACK_SPEEDS` | 0,25; 0,5; 1; 2; 4 | spec FR-006 |
| `ROBOT_BODY_HEIGHT` | máx(0,08; 0,6 × raio) m | research D-03 |
| `OBSTACLE_HEIGHT` | 0,15 m | research D-03 |
| `WALL_HEIGHT` | 0,2 m; espessura visual 0,04 m | research D-03 |
| `RAY_HEIGHT` | altura do sensor = metade do corpo | research D-03 |

## Riscos

| Risco | Mitigação |
|-------|-----------|
| WebGL indisponível no jsdom | Cena testada com test-renderer; `App` testado com Viewport dublê. |
| Cobertura cair com UI | Lógica em funções puras; componentes testados com Testing Library. |
| Recriar geometria a cada quadro | Malhas estáticas memorizadas por mundo; só poses e raios mudam por quadro. |
