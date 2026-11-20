# Especificação da feature: Visualização 3D e controles

**Feature**: `002-visualizacao-3d`

**Criada em**: 2026-11-20

**Status**: Rascunho

**Entrada**: "Interface web do SheepBotz Arena: visualização 3D da simulação com câmera
orbital e raios dos sensores visíveis, controles de play, pause, step e reset, edição do
mundo e dos controladores, com uma biblioteca de componentes visuais reutilizável."

**Requisitos do briefing atendidos**: RB-03, RB-05, RB-17, RB-18, RB-19
(ver `docs/briefing/requisitos-extraidos.md`).

**Depende de**: feature 001 (núcleo de simulação). Esta feature não altera o
comportamento do núcleo.

## Contexto e motivação

O núcleo (feature 001) simula sem tela. A equipe precisa **ver** a estratégia
funcionando: onde o robô está, para onde aponta, o que os sensores enxergam e em que
momento algo dá errado. A visualização tem aparência de um "Gazebo leve": cena 3D com
câmera livre, mas toda a física continua no modelo 2D do núcleo; a tela apenas desenha o
estado (RB-03).

A interface também é onde o membro da equipe escreve e ajusta o controlador e o mundo,
sem precisar da linha de comando.

## Convenções de visualização

- O plano 2D da simulação é o chão da cena 3D. O ponto (x, y) da simulação aparece no
  chão na mesma posição vista de cima, com o eixo y da simulação apontando para o fundo
  da cena; θ = 0 aponta para +x.
- Alturas são apenas visuais: robôs, obstáculos e paredes ganham altura para serem
  vistos em 3D, sem efeito na simulação.
- Robôs são desenhados com corpo, rodas e um indicador de frente; o corpo tem o
  diâmetro de colisão do robô (feature 001).
- Cores vêm do arquivo de mundo (`color`); sem cor, usa-se a paleta padrão da interface.

## Cenários de usuário e testes *(obrigatório)*

### História de usuário 1 — Ver a arena e os robôs em 3D (Prioridade: P1)

Um membro da equipe abre o simulador e vê a arena do mundo carregado em 3D: o piso com
as regiões pintadas, os obstáculos, as paredes de borda e os robôs, cada um em sua pose.
Ele gira, aproxima e desloca a câmera livremente e pode voltar à vista inicial.

**Por que esta prioridade**: é o objetivo da feature e requisito mínimo do briefing (RB-19).

**Teste independente**: carregar um mundo e conferir que cada elemento aparece na
posição, tamanho e orientação correspondentes ao estado, sem executar ticks.

**Cenários de aceitação**:

1. **Dado** um mundo com arena 4 × 3 m com paredes, um disco de raio 0,2 em (1; 0,5) e
   uma caixa 0,3 × 0,6 rotacionada em 0,5 rad em (−1; 0), **quando** o mundo é exibido,
   **então** cada obstáculo aparece no chão na posição e com as dimensões declaradas, e
   as quatro paredes de borda contornam a arena.
2. **Dado** um robô de raio 0,1 em (1; 2; π/2), **quando** é exibido, **então** seu corpo
   tem 0,2 m de diâmetro, está centrado em (1; 2) do chão e o indicador de frente aponta
   para o sentido +y da simulação.
3. **Dado** um piso com um disco preto (refletância 0,1) e um anel branco, **quando** é
   exibido, **então** as regiões aparecem pintadas na ordem declarada (a última por cima).
4. **Dado** a cena exibida, **quando** o usuário arrasta com o mouse, usa a roda ou arrasta
   com o botão direito, **então** a câmera gira em torno da arena, aproxima/afasta e se
   desloca; **quando** aciona "Centralizar vista", **então** a câmera volta à posição
   inicial, enquadrando a arena inteira.

---

### História de usuário 2 — Controlar a execução (Prioridade: P1)

O usuário inicia, pausa, avança um tick por vez e reinicia a simulação, e escolhe a
velocidade de reprodução. O tick e o tempo simulado ficam sempre visíveis.

**Por que esta prioridade**: controles exigidos pelo briefing (RB-18); sem eles não há
como acompanhar uma estratégia.

**Teste independente**: acionar os controles e verificar o tick exibido e as poses
desenhadas contra o estado do núcleo.

**Regras de reprodução**:

- Em "play", a simulação avança em tempo real multiplicado pela velocidade escolhida
  (0,25×, 0,5×, 1×, 2× ou 4×): a cada quadro exibido, executam-se tantos ticks quantos
  couberem no tempo real decorrido × velocidade.
- Para não travar a interface, no máximo 20 ticks são executados por quadro; o tempo
  excedente é descartado (a reprodução fica mais lenta, nunca diferente).
- A frequência de exibição não altera o resultado: após N ticks, o estado é idêntico ao
  da execução sem interface com as mesmas entradas.
- Se a modalidade declarar o fim da partida, a reprodução pausa automaticamente.

**Cenários de aceitação**:

1. **Dado** a simulação pausada no tick 0, **quando** o usuário aciona "Avançar um tick"
   três vezes, **então** o tick exibido é 3 e o tempo é `3 × dt`.
2. **Dado** `dt = 0,05` e velocidade 1×, **quando** 100 ms de tempo real se passam em
   "play", **então** 2 ticks são executados; com velocidade 2×, 4 ticks; com 0,25×,
   meio tick acumula e o tick só avança no quadro seguinte em que completar 0,05 s.
3. **Dado** "play" com um quadro que demora 2 s, **quando** o quadro seguinte é desenhado,
   **então** no máximo 20 ticks foram executados.
4. **Dado** a simulação em "play", **quando** o usuário pausa, **então** o tick para de
   avançar e o botão passa a oferecer "Executar"; "Avançar um tick" só fica disponível
   pausado.
5. **Dado** uma simulação avançada, **quando** o usuário aciona "Reiniciar", **então** o
   tick volta a 0 e os robôs voltam às poses iniciais.
6. **Dado** um mundo e controladores, **quando** a interface executa 200 ticks (por
   qualquer combinação de play e step), **então** o estado é igual ao de `step(200)` no
   núcleo com as mesmas entradas.

---

### História de usuário 3 — Ver os raios dos sensores (Prioridade: P1)

Os raios de lasers e sonares são desenhados a partir do sensor até o ponto lido. O
usuário entende de relance o que o robô "enxerga" e pode ocultar os raios.

**Por que esta prioridade**: requisito explícito do briefing (RB-19) e principal
ferramenta para entender por que uma estratégia falha.

**Teste independente**: um robô diante de uma parede; conferir origem e fim de cada raio
desenhado contra as leituras do estado.

**Cenários de aceitação**:

1. **Dado** um robô em (0; 0; 0) com laser de 3 raios, FOV π, alcance 2 e parede em x = 1,
   **quando** a cena é exibida, **então** são desenhados 3 raios: o central termina em
   (1; 0) e os laterais em (0; −2) e (0; 2).
2. **Dado** os mesmos raios, **quando** exibidos, **então** os que atingiram algo (leitura
   menor que o alcance) usam a cor de "detecção" e os que chegaram ao alcance máximo
   usam a cor "livre", mais discreta.
3. **Dado** um sonar, **quando** exibido, **então** todos os raios do seu cone são
   desenhados com o comprimento da leitura do sonar.
4. **Dado** os raios visíveis, **quando** o usuário desativa "Mostrar raios", **então**
   nenhum raio é desenhado, e a simulação não é afetada.
5. **Dado** a simulação em "play", **quando** as leituras mudam, **então** os raios são
   redesenhados a cada quadro com as leituras do tick atual.

---

### História de usuário 4 — Escolher e editar o mundo (Prioridade: P2)

O usuário escolhe um mundo de exemplo, abre um arquivo JSON do computador ou edita o JSON
do mundo atual num editor com destaque de sintaxe. Erros aparecem listados com caminho e
motivo, sem perder o mundo que estava funcionando.

**Por que esta prioridade**: sem isso, a interface só mostra os exemplos embutidos.

**Teste independente**: aplicar mundos válidos e inválidos pela interface e conferir a
cena e a lista de erros.

**Cenários de aceitação**:

1. **Dado** a interface aberta, **quando** ela inicia, **então** o primeiro mundo de
   exemplo está carregado, pausado no tick 0, com seus controladores.
2. **Dado** a lista de exemplos, **quando** o usuário escolhe outro, **então** a cena, os
   controladores e o editor de mundo passam a ser os do exemplo escolhido.
3. **Dado** o editor de mundo, **quando** o usuário aplica um JSON inválido, **então** a
   lista mostra cada erro no formato `caminho: motivo` (as mesmas mensagens da feature
   001) e a cena continua mostrando o mundo anterior.
4. **Dado** o usuário abre um arquivo `.json` do computador, **quando** o arquivo é válido,
   **então** ele substitui o mundo atual; robôs sem controlador ficam parados e
   sinalizados.

---

### História de usuário 5 — Editar o controlador de cada robô (Prioridade: P2)

O usuário seleciona um robô, edita seu controlador JavaScript num editor com destaque de
sintaxe e aplica. Erros de compilação mostram a linha; erros durante a execução aparecem
ligados ao robô.

**Por que esta prioridade**: escrever estratégias é o uso principal do simulador (RB-17).

**Teste independente**: aplicar controladores válidos e inválidos e conferir mensagens e
estado dos robôs.

**Cenários de aceitação**:

1. **Dado** um mundo com dois robôs, **quando** o usuário seleciona o segundo, **então** o
   editor mostra o controlador desse robô.
2. **Dado** um controlador editado, **quando** o usuário aplica, **então** a simulação é
   reiniciada no tick 0 com o novo controlador.
3. **Dado** um controlador com erro de sintaxe, **quando** o usuário aplica, **então** a
   mensagem com robô, linha e coluna é exibida, e a simulação anterior continua ativa.
4. **Dado** um controlador que lança erro em execução, **quando** a simulação roda,
   **então** o robô aparece com estado "erro" e a mensagem com o tick fica visível.
5. **Dado** edições não aplicadas, **quando** o usuário troca de robô ou de mundo,
   **então** as edições são descartadas e o editor mostra o controlador vigente.

---

### História de usuário 6 — Acompanhar o estado dos robôs (Prioridade: P3)

Uma lista mostra cada robô com nome, cor, estado (ok, erro, sem controlador) e pose
atual, atualizada durante a reprodução. Selecionar um robô na lista o destaca na cena.

**Por que esta prioridade**: ajuda a acompanhar vários robôs; o painel completo de
leituras é escopo da feature 004.

**Teste independente**: rodar um mundo com dois robôs e conferir a lista.

**Cenários de aceitação**:

1. **Dado** dois robôs, **quando** a simulação roda, **então** a lista mostra pose (x, y em
   metros com 2 casas e θ em graus inteiros) e estado de cada robô no tick atual.
2. **Dado** um robô selecionado, **quando** a cena é exibida, **então** ele recebe um anel
   de destaque no chão.

---

### Casos de borda

- Mundo sem robôs: a cena mostra a arena; os controles funcionam e o tempo avança.
- Mundo grande (ex.: 20 × 20 m): "Centralizar vista" enquadra a arena inteira.
- Controlador em laço infinito: a aba do navegador trava (limitação conhecida da
  feature 001); a interface avisa sobre isso na ajuda do editor.
- Robô fora da arena sem paredes (empurrado no Sumô): continua desenhado onde estiver.
- Janela redimensionada: a cena se ajusta sem distorção.
- Partida encerrada pela modalidade: o resultado aparece na barra de status e a
  reprodução pausa.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Cena 3D**

- **FR-001**: O sistema DEVE desenhar em 3D a arena (chão, paredes de borda quando
  declaradas), as regiões do piso na ordem declarada, os obstáculos e os robôs, a partir
  exclusivamente do mundo e do estado do núcleo. *(RB-03, RB-05, RB-19)*
- **FR-002**: Cada robô DEVE ser desenhado com o diâmetro de colisão, na pose do estado, com
  indicador de frente e sua cor. *(RB-19)*
- **FR-003**: O sistema DEVE oferecer câmera orbital (girar, aproximar, deslocar) e um
  comando para voltar à vista inicial que enquadra a arena. *(RB-19)*
- **FR-004**: O sistema DEVE desenhar os raios de lasers e sonares da origem do sensor até
  a distância lida, distinguindo raios que detectaram algo dos que atingiram o alcance
  máximo, com opção de ocultá-los. *(RB-19)*

**Execução**

- **FR-005**: O sistema DEVE oferecer executar, pausar, avançar um tick (somente pausado)
  e reiniciar, e exibir tick e tempo simulado. *(RB-18)*
- **FR-006**: O sistema DEVE reproduzir em tempo real × velocidade (0,25× a 4×), com no
  máximo 20 ticks por quadro, avançando o núcleo apenas por ticks inteiros. *(RB-02, RB-18)*
- **FR-007**: O estado exibido DEVE ser idêntico ao do núcleo após o mesmo número de
  ticks, independentemente da combinação de play, step e velocidade. *(RB-02, RB-03)*
- **FR-008**: O sistema DEVE pausar automaticamente quando a modalidade encerrar a partida
  e exibir o resultado. *(RB-23)*

**Mundo e controladores**

- **FR-009**: O sistema DEVE oferecer os mundos de exemplo do repositório com seus
  controladores, iniciando no primeiro. *(RB-10)*
- **FR-010**: O sistema DEVE permitir abrir um arquivo JSON e editar o JSON do mundo,
  exibindo os erros da validação do núcleo no formato `caminho: motivo` e mantendo o
  mundo anterior quando houver erro. *(RB-10, RB-11)*
- **FR-011**: O sistema DEVE permitir editar e aplicar o controlador de cada robô, com
  destaque de sintaxe, exibindo erros de compilação com linha e coluna e reiniciando a
  simulação ao aplicar. *(RB-17)*
- **FR-012**: O sistema DEVE exibir, para cada robô, nome, cor, estado, pose atual e a
  mensagem de erro em execução, quando houver, e permitir destacá-lo na cena. *(RB-17)*

**Interface**

- **FR-013**: Toda a interface DEVE estar em português e ser construída com uma
  biblioteca de componentes própria e reutilizável (botões, painéis, abas, seletores,
  campos, indicadores de estado, lista de erros, editor de código), com identidade
  visual única e tema escuro. *(constitution, Stack e princípio V)*
- **FR-014**: A interface DEVE funcionar em telas a partir de 1280 × 720 com a cena
  ocupando a maior parte da área. *(RB-19)*

### Entidades-chave

- **Sessão de simulação**: mundo vigente, controladores vigentes, simulação do núcleo,
  estado atual, modo (executando/pausado) e velocidade.
- **Modelo de cena**: descrição visual derivada do mundo e do estado (chão, regiões,
  obstáculos, paredes, robôs, raios), sem lógica de simulação.
- **Exemplo**: nome, texto do mundo e textos dos controladores referenciados.
- **Rascunho**: texto em edição do mundo ou de um controlador, ainda não aplicado.

## Critérios de sucesso *(obrigatório)*

### Resultados mensuráveis

- **SC-001**: Com 4 robôs, laser de 30 raios cada e 20 obstáculos, a reprodução a 1× mantém
  ao menos 30 quadros por segundo num notebook típico da equipe.
- **SC-002**: Play, pause, step e reset respondem visivelmente em menos de 100 ms.
- **SC-003**: Em 100% dos testes de equivalência, o estado exibido após N ticks é idêntico
  ao do núcleo sem interface.
- **SC-004**: Um membro da equipe abre o simulador, troca a velocidade de um robô no
  controlador de exemplo e vê o efeito na cena em menos de 2 minutos, sem instruções.
- **SC-005**: Todos os elementos visuais da interface vêm da biblioteca de componentes
  (nenhum estilo avulso fora de `src/ui/` além do layout da aplicação).

## Premissas e limites

- A interface roda o núcleo no mesmo fluxo da página; controladores em laço infinito
  travam a aba (limitação herdada da feature 001).
- Não há persistência: recarregar a página volta ao primeiro exemplo. Salvar o mundo é
  feito copiando o JSON do editor (exportar arquivo fica para a feature 004).
- Geometria procedural (sem modelos 3D externos); modelos realistas dos robôs podem ser
  adicionados depois sem mudar a simulação.
- Painel completo de leituras, gravação e replay: feature 004. Modalidades: features 003+.
