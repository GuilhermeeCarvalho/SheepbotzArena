# Pesquisa e decisões técnicas: Núcleo de simulação headless

**Feature**: `001-nucleo-simulacao` | **Data**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

Cada decisão segue o formato: Decisão / Justificativa / Alternativas consideradas.

## D-01 — Integração cinemática em arco exato

- **Decisão**: para (v, w) constantes num intervalo `h`:
  - se `|w| < 1e-12`: `x += v·cos θ·h`, `y += v·sin θ·h`;
  - senão: `x += (v/w)·(sin(θ + w·h) − sin θ)`, `y −= (v/w)·(cos(θ + w·h) − cos θ)`,
    `θ += w·h`, seguido de normalização para (−π, π].
- **Justificativa**: é a solução analítica do modelo de tração diferencial; dividir um
  tick em subpassos produz exatamente o mesmo arco, o que permite subpassos de colisão
  (D-04) sem mudar a pose final. Os critérios de aceitação da spec (US2) dependem disso.
- **Alternativas**: Euler explícito (erro acumulado depende de `dt`; a posição "esperada"
  ficaria ambígua para quem regenera o código); Runge-Kutta 4 (desnecessário para uma
  solução fechada).

## D-02 — Normalização angular

- **Decisão**: `normalizeAngle(a)` devolve um valor em (−π, π] usando
  `a − 2π·floor((a + π) / (2π))` e trocando −π por +π.
- **Justificativa**: intervalo único e documentado na spec; testável nas fronteiras.

## D-03 — Robôs como discos

- **Decisão**: colisão e raycast tratam robôs como discos de raio `radius`.
- **Justificativa**: interseções disco × segmento, disco × caixa orientada e disco × disco
  são fechadas, baratas e sem casos degenerados de rotação; atende ao "colisão simples"
  do briefing. A limitação está registrada na spec (Premissas).
- **Alternativas**: caixa orientada com SAT (mais fiel para Sumô, mas multiplica casos de
  contato e de resolução; adiada).

## D-04 — Subpassos contra atravessamento (tunneling)

- **Decisão**: em cada tick, `n = max(1, ceil(dmax / (rmin / 2)))` subpassos, onde `dmax` é
  o maior deslocamento possível de um robô no tick (`|v|·dt` após saturação) e `rmin` o
  menor raio entre os robôs. Em cada subpasso todos os robôs avançam `dt/n` e as colisões
  são resolvidas.
- **Justificativa**: com deslocamento ≤ r/2 por subpasso, o centro de um robô não cruza
  uma parede de espessura zero sem antes ficar sobreposto do lado de origem, e a resolução
  o devolve para esse lado. Por D-01, os subpassos não alteram a trajetória livre.
- **Alternativas**: detecção contínua por varredura (*swept circle*) — exata, porém mais
  código e casos especiais; limitar velocidade máxima — restringe o usuário.

## D-05 — Resolução de colisões por posição

- **Decisão**: em cada subpasso, nesta ordem:
  1. robô × obstáculos estáticos (na ordem do mundo): mover o robô pelo vetor mínimo de
     separação até a distância `r`;
  2. robô × robô, pares `(i, j)` com `i < j` na ordem do mundo, até 4 iterações ou até
     não haver sobreposição: o robô `i` recua `sobreposição · mj / (mi + mj)` e o `j`
     `sobreposição · mi / (mi + mj)` ao longo da linha dos centros;
  3. repetir o passo 1 (estáticos sempre vencem).
  Centros coincidentes (distância 0) usam a direção +x do mundo para separar. Centro de
  robô exatamente sobre uma parede usa a posição anterior ao subpasso para escolher o lado.
- **Justificativa**: determinístico, sem velocidades nem impulsos, e produz o empurrão
  proporcional à massa exigido pela spec (US4, cenários 5 a 7).
- **Alternativas**: impulsos com restituição (exige dinâmica, fora do modelo cinemático);
  motores de física prontos (proibidos pela constituição, princípio VI).

## D-06 — Contato e bumpers

- **Decisão**: um contato é registrado quando a distância entre o robô e o elemento é
  `≤ r + CONTACT_EPSILON` (`1e-6 m`) ao final de qualquer subpasso. A direção do contato
  é o vetor do centro do robô ao ponto mais próximo do elemento (ou ao centro do outro
  robô), convertida para o referencial do robô. O bumper fica acionado se algum contato
  do tick cair no seu setor `[from, to]` (inclusivo, tolerância `1e-9 rad`).
- **Justificativa**: um robô parado encostado (distância exatamente `r`) precisa ser
  detectado como em contato (US4, cenário 1).

## D-07 — Raycast analítico

- **Decisão**: interseção raio × segmento (paramétrica), raio × disco (equação quadrática,
  menor raiz ≥ 0) e raio × caixa orientada (raio transformado para o referencial da caixa
  e método das placas, *slab*). A leitura é o menor `t` em [0, alcance]. Origem dentro de
  um disco ou caixa → 0. O próprio robô é ignorado.
- **Justificativa**: exato, sem discretização da grade; atende às leituras com três casas
  decimais da US3.

## D-08 — Aleatoriedade semeada e fluxos independentes

- **Decisão**: gerador `mulberry32`; cada consumidor recebe um fluxo próprio com semente
  `splitmix32(seed ⊕ hash(nome do fluxo))`, com nomes como `robot:<id>:controller` e
  `robot:<id>:sensor:<sensorId>`. Ruído gaussiano por Box-Muller.
- **Justificativa**: adicionar um sensor a um robô não altera a sequência de
  `robot.random()` de outro robô; resultados reproduzíveis por seed (princípio VI).
- **Alternativas**: um gerador global único (qualquer mudança no mundo embaralha todas
  as sequências); `crypto` (não semeável).

## D-09 — Execução do controlador

- **Decisão**: o código do usuário é verificado sintaticamente com `acorn` (para obter
  linha e coluna) e então avaliado uma única vez com `new Function`, num escopo que
  sombreia identificadores globais: `Math` é uma cópia congelada cujo `random` lança erro
  orientando o uso de `robot.random()`; `Date`, `performance`, `setTimeout`,
  `setInterval`, `queueMicrotask`, `fetch`, `globalThis`, `window`, `self`, `global`,
  `process` e `require` são substituídos por valores que lançam erro em português.
  A avaliação devolve a função `onTick`. O objeto `robot` é criado pelo núcleo e expõe
  somente a API da spec.
- **Justificativa**: síncrono (um tick = uma chamada), igual no Node e no navegador,
  simples de testar; garante o determinismo da API.
- **Limitação aceita**: não é uma *sandbox* de segurança (usuários confiáveis, conforme
  spec), e um laço infinito trava a execução. A linha de comando executa a simulação numa
  *worker thread* do Node com tempo limite (D-12).
- **Alternativas**: Web Worker/iframe (assíncrono, quebra o modelo "uma chamada por tick"
  e complica testes); interpretador JS isolado como QuickJS-WASM (pesado, depuração
  difícil); `node:vm` (não existe no navegador).

## D-10 — Validação do mundo com Zod

- **Decisão**: esquema Zod 4 com objetos estritos (`z.strictObject`) e mensagens em
  português; os problemas do Zod são convertidos em `ValidationIssue { path, code,
  message }`. Validações semânticas (identificadores repetidos, sobreposição inicial,
  robô fora da arena, modalidade desconhecida) rodam depois do esquema, apenas se o
  esquema passar, e todos os problemas são acumulados. Erro de sintaxe JSON: a posição
  informada por `JSON.parse` é convertida em linha e coluna.
- **Justificativa**: tipos TypeScript inferidos do mesmo esquema (sem duplicação), erros
  acumulados com caminho, campos desconhecidos rejeitados.
- **Alternativas**: JSON Schema + Ajv (tipos duplicados à mão); validador próprio (mais
  código para o mesmo resultado).

## D-11 — Formato apenas JSON

- **Decisão**: somente JSON (decisão Q-01 do briefing).
- **Justificativa**: o briefing aceita YAML **ou** JSON; um formato reduz dependências e
  casos de erro.

## D-12 — Linha de comando

- **Decisão**: `npm run sim -- <mundo.json> --ticks <N> [--controller <robô>=<arquivo.js>]…
  [--timeout-ms <ms>]`, executada com `tsx`. A lógica fica em `src/cli/run.ts` (testada);
  `src/cli/main.ts` apenas lê `process.argv` e chama `run`. A simulação roda numa
  `worker_thread` encerrada ao exceder o tempo limite (padrão 10 000 ms).
  Códigos de término: 0 sucesso, 1 uso incorreto ou arquivo não encontrado, 2 mundo
  inválido, 3 controlador inválido, 4 tempo limite excedido.
- **Justificativa**: interface estável e independente de linguagem para os testes de
  aceitação (RB-45) e para a equipe.

## D-13 — Snapshots de estado

- **Decisão**: o estado interno é mutável por desempenho; `getState()` devolve uma cópia
  profunda e congelada, serializável em JSON. As leituras de sensores no estado são as
  calculadas ao final do tick (as mesmas que o controlador recebe no tick seguinte).
  Registros (`robot.log`) mantêm as últimas 100 mensagens por robô.
- **Justificativa**: consumidores (visualização, replay, testes) não conseguem corromper a
  simulação; o mesmo formato serve à linha de comando e à feature 004 (replay).

## D-14 — Contrato de modalidade no núcleo

- **Decisão**: o núcleo define as interfaces `Modality` e `Referee` e recebe um
  `ModalityRegistry` por injeção (`loadWorld` e `createSimulation`). Não existe lista de
  modalidades no núcleo; o registro concreto fica em `src/modalities/index.ts` (feature 003).
  Quando o árbitro declara `finished`, novos passos não avançam o tick.
- **Justificativa**: princípio IV (núcleo depende do contrato, nunca das implementações).

## D-15 — Direção das dependências verificada automaticamente

- **Decisão**: regra ESLint `no-restricted-imports` por diretório: `src/core/**` não importa
  `src/modalities`, `src/app`, `src/cli`, `react`, `three` nem módulos `node:*`;
  `src/modalities/<x>/**` não importa outra modalidade nem `src/app`.
- **Justificativa**: princípio IV exige verificação automática.

## D-16 — Cobertura e relatório

- **Decisão**: Vitest com `@vitest/coverage-v8`, reporters `text`, `html`,
  `json-summary`; limites de 80% para linhas, funções, ramificações e instruções
  (a suíte falha abaixo disso). O relatório vai para `coverage/` e é versionado.
  `scripts/update-readme-stats.mjs` lê `coverage/coverage-summary.json` e o relatório JSON
  de testes e reescreve a linha entre `<!-- stats:start -->` e `<!-- stats:end -->` do
  README. Exclusão de cobertura: apenas `src/cli/main.ts` (bootstrap sem lógica).
- **Justificativa**: princípio VII e RB-41/RB-42.
