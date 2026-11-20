# Passagem de trabalho — SheepBotz Arena

**Para**: o próximo agente (Antigravity ou outro).
**De**: sessão do Claude Code em 2026-11-20.
**Branch**: `feat/sdd-base` (sem push). Árvore limpa no último commit.

Leia este arquivo inteiro antes de mudar qualquer coisa. Depois leia, nesta ordem:

1. `.specify/memory/constitution.md` (v2.1.0): regras do projeto. Prevalece sobre tudo.
2. `docs/briefing/requisitos-extraidos.md`: requisitos do briefing (RB-xx), perguntas e decisões (Q-xx) e mapa de features.
3. `specs/001-nucleo-simulacao/` e `specs/002-visualizacao-3d/`: exemplos do padrão de spec, plan, tasks e contracts a seguir.

---

## 1. Estado atual

| Feature | Situação |
|---------|----------|
| 001 — Núcleo de simulação headless | ✅ 58/58 tarefas |
| 002 — Visualização 3D e controles | ✅ 36/36 tarefas, incluindo a revisão visual (T032–T036) |
| 003 — Catálogo de componentes reais e montador de robôs | ⏳ **próxima**; referências prontas em `docs/references/componentes/` |
| 004 — Modalidade Sumô (Mega, Mini, LEGO) | planejada; regras em `docs/references/robocore/sumo.md` |
| 005 — Painel de inspeção e replay | planejada (escopo completo do briefing: RB-21, RB-22) |
| 006 Seguidor de Linha · 007 Trekking · 008 Futebol | planejadas; regras em `docs/references/robocore/` |
| 009 — Controlador remoto via WebSocket | bônus |

Testes e cobertura: **204 testes · 92,4% de cobertura de linhas**. Lint e TypeScript passam sem erros.

### Comandos

```bash
npm install
npm run dev            # interface em http://localhost:5173
npm test               # suíte completa
npm run test:coverage  # falha abaixo de 80%; gera coverage/ (versionado)
npm run readme:stats   # atualiza a linha "N testes · X% de cobertura" do README
npm run lint           # ESLint (direção de dependências) + tsc
npm run test:perf      # desempenho do núcleo (fora da suíte padrão)
npm run sim -- examples/worlds/corridor.json --ticks 600 --pretty   # CLI headless
```

> **Atenção**: neste Mac há um proxy `rtk` que reescreve comandos do terminal e às vezes
> esconde a saída do Vitest. Se a saída sumir, rode `rtk proxy npx vitest run`. Não
> passe `--reporter` na linha de comando ao gerar cobertura: isso desliga o reporter JSON
> de que o `readme:stats` precisa.

---

## 2. Regras que não podem ser quebradas

- **SDD com SpecKit**: para cada feature, `spec.md` → `plan.md` (+ `research.md`, `data-model.md`, `contracts/`, `quickstart.md`) → `tasks.md` → implementação. Scripts em `.specify/scripts/bash/`:
  - `create-new-feature.sh --json --short-name <nome> "<descrição>"`
  - `setup-plan.sh --json`
  - `setup-tasks.sh --json`
- **Separação**: a spec traz o quê e o porquê, sem tecnologia, mas com critérios numéricos. O plan traz a tecnologia e a arquitetura. As tasks são fatias verticais por história e citam os FR.
- **Rastreabilidade**: RB → FR → T → commit. Formato do commit: `feat(003/T012): <descrição em pt-BR> [FR-004, FR-005]`. Documentação sem tarefa usa `docs: ...`. Termine o commit com a linha de coautoria.
- **Idioma**: documentação, comentários, mensagens de erro, textos da UI e commits em **português**. Identificadores e campos JSON em **inglês**.
- **Testes**: TDD não é obrigatório (constituição v2.0.0), mas todo comportamento sai com testes e todo critério numérico da spec tem um teste que cita `USx-ACy`. Cobertura ≥ 80%.
- **Arquitetura**, verificada por lint:
  - `src/core`: puro; sem React, Three, DOM ou `node:*`.
  - `src/modalities/*`: dependem só do núcleo e não dependem umas das outras.
  - `src/ui`: biblioteca genérica; não importa `core`, `modalities` nem `app`.
  - `src/app`: compõe tudo.
  - `src/cli`: usa o núcleo.
  - Dentro de `src/`, use **imports relativos** (o alias `src/*` serve só nos testes).
- **Determinismo**: seed e `dt` fixos. Sem motor de física pronto. O núcleo não muda sem justificativa na spec e testes de regressão.
- **Regras oficiais**: toda regra de modalidade cita o artigo do documento em `docs/references/robocore/`. Hipóteses de simulação são marcadas como hipóteses.
- **Novas dependências de execução** exigem emenda na seção "Stack" da constituição (MINOR), com uma linha no histórico.

---

## 3. Mapa do código

```text
src/core/            núcleo headless (API pública em src/core/index.ts)
  world/             esquema Zod + regras semânticas + erros pt-BR (contracts/world-file.md)
  kinematics/        integração em arco exato
  collision/         corpos estáticos, resolução por posição com subpassos, contatos
  sensors/           raycast, laser/sonar, piso, bumper, odometria
  controller/        compilação (acorn + escopo sombreado) e API robot.*
  simulation/        pipeline do tick, createSimulation/step/reset/getState
  modality/          contrato Modality/Referee/MatchStatus + registro
src/modalities/index.ts   ponto de composição (registro VAZIO hoje; o Sumô entra aqui)
src/cli/             linha de comando (worker thread com tempo limite)
src/ui/              biblioteca de componentes (tokens.css + components/*)
src/app/             interface: session/ (redutor puro + relógio), scene/ (modelo de cena puro + R3F),
                     layout/ (TopBar, TransportBar, CameraControls, SceneHud), panels/
examples/            mundos e controladores de exemplo (embutidos na UI via import.meta.glob)
tests/               acceptance/ (USx-ACy do 001), unit/, ui/, scene/, integration/, perf/
```

Contratos que valem como referência: `specs/001-nucleo-simulacao/contracts/*.md` e `specs/002-visualizacao-3d/contracts/*.md`.

---

## 4. Próximo passo: feature 003 (catálogo de componentes e montador de robôs)

**Pedido da equipe (RB-24 a RB-26)**: em cada modalidade, o usuário monta o próprio robô (chassi, rodas, motores, sensores e itens) a partir de **componentes reais**, para aproximar o simulador do robô físico. A montagem respeita os limites da categoria, e cada modalidade traz estratégias de exemplo em código.

**Decisão já tomada (Q-14)**: o **núcleo não muda**. Um catálogo à parte converte dados de datasheet em parâmetros do núcleo e gera o JSON do robô (`RobotSpec` em `contracts/world-file.md`).

### Conversões sugeridas

Os detalhes e as fontes estão em `docs/references/componentes/*.md`, na seção "Mapeamento para o simulador".

| Componente | Vira no núcleo |
|-----------|----------------|
| Motor (rpm sem carga) + roda (diâmetro) | `maxLinearSpeed = rpm·π·d/60` × fator de carga (0,7–0,85, hipótese) |
| Bitola (distância entre rodas) | `maxAngularSpeed = 2·v_max / bitola` |
| Chassi (comprimento × largura) | `radius` = metade da diagonal (círculo circunscrito; documentar a hipótese) |
| Soma das massas (chassi pela densidade × volume, motores, rodas, bateria, sensores) | `mass` |
| Sensor de distância (VL53L0X, Sharp, HC-SR04, JS40F…) | `laser`/`sonar` com `fov`, `maxRange`, `rays` e `noise` da tabela |
| Sensor de piso (TCRT5000, QTR-8A…) | um sensor `floor` por canal, posições a partir do espaçamento do array |
| Chave de contato | `bumper` com setor |

### Como fazer

1. Rodar `create-new-feature.sh --short-name catalogo-componentes` e escrever `spec.md` com histórias como:
   - montar um robô escolhendo peças;
   - ver massa, dimensões e velocidade calculadas;
   - validar contra os limites da categoria (ex.: Mini Sumô ≤ 10 × 10 cm e ≤ 500 g; ver `robocore/sumo.md`, Artigo 4);
   - exportar o robô para o JSON do mundo.

   Use critérios numéricos, por exemplo: "motor de 1000 rpm com roda de 32 mm → 1,676 m/s × fator".
2. No plan, o catálogo fica em `src/catalog/` como dados tipados (um arquivo por família, com URL da fonte) mais funções puras `buildRobotSpec(build)` e `validateBuild(build, limits)`. Os limites da categoria vêm da modalidade (feature 004) por um contrato. A UI vira uma nova aba "Montagem" no painel lateral, usando `src/ui`.
3. Atualizar a constituição se `src/catalog` precisar de regra de dependência (sugestão: o catálogo depende só do núcleo, e as modalidades podem depender do catálogo).

### Lacunas conhecidas nas referências

- Não há FOV da maioria dos Sharp, do JS40F nem dos digitais Pololu.
- Faltam algumas massas.
- Há fontes conflitantes (JS40F, torque do Titan).

Valores estimados estão marcados como hipótese nos arquivos. Não invente números: marque como hipótese na spec.

---

## 5. Depois: feature 004 (Sumô)

- Implementar `Modality` em `src/modalities/sumo/` e registrar em `src/modalities/index.ts`.
- Presets de mundo Mega, Mini e LEGO:
  - Dohyo como região `disc` preta mais `ring` branco (Tawara) no piso;
  - arena sem paredes;
  - robôs atrás das linhas Shikiri-sen.
- Árbitro:
  - robô "fora" quando o disco sai do Dohyo (hipótese 2D a documentar);
  - Yuko;
  - rounds;
  - tempo limite;
  - regra dos 5 s só no LEGO (Nota 11).
- Estratégias de exemplo em JS: busca e ataque com laser/sonar, fuga de borda com sensor de piso.
- O empurrão por massa já existe no núcleo (US4-AC5/AC6 da 001).
- A UI já mostra `match` no `SceneHud` e pausa no fim da partida (FR-008 da 002).

## 6. Pendências e observações

- O escopo completo do briefing ainda pede a **feature 005** (inspeção de sensores e gravação/replay). Não deixe para o fim: ela vale nota.
- O README precisa de "N testes · X% de cobertura" atualizado a cada entrega: rode `npm run test:coverage && npm run readme:stats` e versione `coverage/`.
- Viewport e Canvas não são testáveis em jsdom. Mantenha a lógica em funções puras (`sceneModel.ts`) e componentes testáveis com `@react-three/test-renderer`.
- Os PDFs do pitch não fazem parte do repositório; slides sem código, demo ao vivo com `npm run dev`.
- `~/Desktop/CLAUDE.md` pertence a outro projeto (Tex4) e não vale aqui.
