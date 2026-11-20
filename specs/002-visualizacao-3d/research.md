# Pesquisa e decisões técnicas: Visualização 3D e controles

**Feature**: `002-visualizacao-3d` | **Data**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

## D-01 — React Three Fiber sobre Three.js

- **Decisão**: cena declarada com `@react-three/fiber` (R3F); `OrbitControls` e `Grid` do
  `@react-three/drei`. Sem modelos externos: geometrias `Box`, `Cylinder`, `Circle`,
  `Ring`, `Plane` e linhas.
- **Justificativa**: elementos 3D viram componentes React reutilizáveis (`RobotMesh`,
  `ObstacleMesh`, `SensorRays`), coerentes com a biblioteca de componentes; a cena é
  testável sem WebGL com `@react-three/test-renderer`.
- **Alternativas**: Three.js imperativo (mais código de ciclo de vida, difícil de testar);
  Babylon.js (fora da stack do briefing).

## D-02 — Modelo de cena puro

- **Decisão**: `buildSceneModel(world, state, options)` (em `src/app/scene/sceneModel.ts`)
  converte mundo + estado em descritores 3D (posições, rotações, dimensões, cores, raios).
  Os componentes R3F apenas renderizam descritores.
- **Justificativa**: toda a conversão 2D → 3D fica numa função pura testada com números
  exatos (spec US1 e US3); o renderizador "apenas desenha o estado" (RB-03).

## D-03 — Mapeamento de coordenadas

- **Decisão**: ponto (x, y) da simulação → `(x, h, −y)` no Three.js (eixo Y para cima);
  orientação θ → rotação `θ` em torno do eixo Y. Alturas visuais: robô 0,08 m de corpo
  (ou 0,6 × raio, o maior), obstáculos 0,15 m, paredes 0,2 m; regiões do piso em camadas
  separadas por 0,001 m.
- **Justificativa**: com a câmera acima e o eixo −Z "para o fundo", a vista de cima
  coincide com o plano da spec 001 (y para cima na tela). Uma rotação positiva em torno de
  Y no Three.js gira +X para −Z, ou seja, para +y da simulação, preservando o sentido
  anti-horário.

## D-04 — Relógio de reprodução

- **Decisão**: `createPlaybackClock({ dt, maxTicksPerFrame: 20 })` com `advance(elapsedMs,
  speed)` → número de ticks a executar, acumulando a sobra; o tempo excedente acima do
  limite é descartado. O laço usa `requestAnimationFrame` num hook (`useSimulationSession`).
- **Justificativa**: lógica de tempo isolada e testável (US2, cenários 2 e 3); o núcleo só
  recebe `step(n)` inteiros, garantindo FR-007.

## D-05 — Sessão de simulação como redutor

- **Decisão**: `useSimulationSession` mantém mundo, controladores, simulação e estado; as
  ações (`loadWorld`, `applyController`, `play`, `pause`, `step`, `reset`, `setSpeed`) são
  funções puras de transição em `src/app/session/session.ts`, testadas sem React.
- **Justificativa**: comportamento da US2, US4 e US5 testável sem DOM.

## D-06 — Biblioteca de componentes própria

- **Decisão**: `src/ui/` com tokens em `tokens.css` (variáveis CSS: cores, espaçamentos,
  raios, sombras, tipografia), componentes React + CSS Modules: `Button`, `IconButton`,
  `ButtonGroup`, `Panel`, `Tabs`, `Select`, `Toggle`, `Badge`, `StatusDot`, `Field`,
  `Stat`, `IssueList`, `CodeEditor`, `Toolbar`, `Kbd`, `EmptyState`, `SplitLayout`.
  Ícones `lucide-react`. Tema escuro único inspirado em ferramentas de robótica.
- **Justificativa**: requisito do usuário e FR-013; CSS Modules evitam dependência de
  biblioteca de estilos e funcionam no Vite e no Vitest.
- **Alternativas**: MUI/Chakra (identidade genérica, peso); Tailwind (fora da stack).

## D-07 — Editor de código

- **Decisão**: `CodeEditor` encapsula CodeMirror 6 (`EditorView`), com linguagem
  `javascript` ou `json` e tema escuro `oneDark`; valor controlado por `value`/`onChange`.
- **Justificativa**: destaque de sintaxe leve; o componente fica em `src/ui/` e é genérico.

## D-08 — Exemplos embutidos

- **Decisão**: `import.meta.glob('/examples/worlds/*.json', { query: '?raw' })` e o mesmo
  para `examples/controllers/*.js`; o campo `controller` do mundo é resolvido pelo nome
  do arquivo.
- **Justificativa**: os exemplos da feature 001 viram a vitrine da interface sem
  duplicação.

## D-09 — Estratégia de testes

- Funções puras (`sceneModel`, `playbackClock`, `session`, `examples`): testes unitários
  numéricos.
- Componentes de `src/ui/`: Testing Library + jsdom (renderização, estados, eventos).
- Cena R3F: `@react-three/test-renderer` (contagem e posição de malhas e raios).
- Aplicação: teste de integração com `App` em jsdom, com o `Viewport` 3D substituído por
  um dublê (WebGL indisponível no jsdom).
- Exclusões de cobertura: `src/app/main.tsx` (bootstrap).
