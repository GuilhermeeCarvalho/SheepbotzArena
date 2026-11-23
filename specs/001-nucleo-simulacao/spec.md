# Especificação da feature: Núcleo de simulação headless

**Feature**: `001-nucleo-simulacao`

**Criada em**: 2026-11-20

**Status**: Rascunho

**Entrada**: "Núcleo de simulação headless e determinístico do SheepBotz Arena: mundo
descrito em arquivo, robôs de tração diferencial com colisão simples, sensores laser,
sonar, odometria, bumper e piso, e controladores em JavaScript executados a cada tick."

**Requisitos do briefing atendidos**: RB-01, RB-02, RB-04, RB-10, RB-11, RB-12, RB-13,
RB-14, RB-15, RB-16, RB-17, RB-20, RB-45
(ver `docs/briefing/requisitos-extraidos.md`).

## Contexto e motivação

A equipe SheepBotz precisa testar estratégias de controle sem desgastar os robôs físicos.
Esta feature entrega o "motor" do simulador: tudo o que acontece numa simulação, sem
nenhuma tela. Ela é a base de todas as outras features (visualização, modalidades,
replay) e é o que os testes de aceitação do trabalho verificam diretamente: posição do
robô após N ticks, leituras do laser e erros de arquivos de mundo inválidos.

Por ser determinística, a mesma estratégia no mesmo mundo produz sempre o mesmo resultado.
Assim, uma melhoria de estratégia pode ser comparada com a anterior de forma justa.

## Convenções do modelo

Estas convenções valem para toda a especificação e para os arquivos de mundo.

- **Unidades**: comprimentos em metros (m), tempo em segundos (s), ângulos em radianos
  (rad), velocidade linear em m/s, velocidade angular em rad/s, massa em kg.
- **Sistema de coordenadas**: plano 2D; eixo x para a direita e eixo y para cima. A origem
  (0, 0) é o centro da arena.
- **Orientação (θ)**: ângulo 0 aponta para +x; cresce no sentido anti-horário. Toda
  orientação informada pelo sistema é normalizada para o intervalo (−π, π].
- **Pose**: posição (x, y) e orientação θ de um robô.
- **Referencial do robô**: posições de sensores são dadas em relação ao centro do robô,
  com o eixo x apontando para a frente do robô e o eixo y para a sua esquerda.
- **Tick**: um passo de simulação de duração fixa `dt`. O tempo simulado após k ticks é
  `k × dt`.
- **Tolerância de aceitação**: 0,001 m para posições e distâncias e 0,001 rad para ângulos,
  salvo indicação contrária.

## Cenários de usuário e testes *(obrigatório)*

### História de usuário 1 — Descrever um mundo e receber erros claros (Prioridade: P1)

Um membro da equipe descreve uma arena num arquivo de mundo (dimensões, piso, obstáculos,
robôs e sensores) e o carrega no simulador. Se o arquivo tiver problemas, ele recebe, de
uma só vez, a lista de todos os erros, cada um com o local exato do problema e o motivo
em português.

**Por que esta prioridade**: sem um mundo válido não existe simulação. Erros claros
evitam que a equipe perca tempo procurando o problema num arquivo extenso.

**Teste independente**: carregar arquivos de mundo válidos e inválidos e verificar o
resultado da validação, sem executar nenhum tick.

**Cenários de aceitação**:

1. **Dado** um arquivo de mundo válido com uma arena, um obstáculo e um robô com laser,
   **quando** o arquivo é carregado, **então** o mundo é aceito e o robô aparece na pose
   inicial declarada.
2. **Dado** um arquivo com texto que não é JSON válido, **quando** é carregado, **então**
   o sistema rejeita o arquivo informando linha e coluna do erro de sintaxe.
3. **Dado** um mundo em que `robots[0].radius` vale `0`, **quando** é carregado, **então**
   o erro aponta o caminho `robots[0].radius` e informa que o valor deve ser maior que 0.
4. **Dado** um mundo com três problemas independentes (raio negativo, tipo de sensor
   desconhecido `lidar3d` e dois robôs com o mesmo identificador), **quando** é carregado,
   **então** os três erros são informados juntos, cada um com seu caminho.
5. **Dado** um mundo com um campo que o sistema não conhece (por exemplo `raio` no lugar de
   `radius`), **quando** é carregado, **então** o campo desconhecido é apontado como erro.
6. **Dado** um mundo em que um robô começa sobreposto a um obstáculo ou a outro robô,
   **quando** é carregado, **então** o erro identifica o robô e o elemento sobreposto.
7. **Dado** um mundo sem `dt` e sem `seed`, **quando** é carregado, **então** os valores
   padrão `dt = 0,05 s` e `seed = 1` são adotados.

---

### História de usuário 2 — Mover um robô de tração diferencial de forma previsível (Prioridade: P1)

Um membro da equipe escreve um controlador que comanda velocidades linear (v) e angular
(w) e executa a simulação por N ticks sem interface. Ele obtém a pose final do robô e
sabe que ela coincide com a prevista pela cinemática, em qualquer execução.

**Por que esta prioridade**: é o comportamento central do simulador e um dos três
critérios dos testes de aceitação do trabalho.

**Teste independente**: executar mundos sem obstáculos com controladores de velocidade
constante e comparar a pose final com os valores abaixo.

**Modelo de movimento**: durante um tick, (v, w) permanecem constantes. Se w = 0, o robô
anda em linha reta v × dt na direção θ. Se w ≠ 0, o robô percorre um arco de circunferência
de raio v / w e gira w × dt. Os comandos são limitados (saturados) às velocidades máximas
do robô antes de serem aplicados; o robô atinge a velocidade comandada instantaneamente
(não há inércia nem atrito no modelo).

**Cenários de aceitação** (todos com robô iniciando em (0, 0, 0), sem obstáculos, salvo
indicação):

1. **Dado** `dt = 0,05` e comando v = 1,0, w = 0, **quando** 20 ticks são executados,
   **então** a pose final é (1,000; 0,000; 0,000).
2. **Dado** `dt = 0,05` e comando v = 0,5, w = π/2, **quando** 20 ticks são executados,
   **então** a pose final é (0,318; 0,318; 1,571). (Arco de raio 1/π ≈ 0,3183 m
   percorrido por um quarto de volta.)
3. **Dado** `dt = 0,1` e comando v = 0, w = 1,0, **quando** 10 ticks são executados,
   **então** a pose final é (0,000; 0,000; 1,000).
4. **Dado** `dt = 0,05` e comando v = 0, w = π/2, **quando** 60 ticks são executados
   (3 s, três quartos de volta), **então** a orientação final é −1,571 (normalizada para
   (−π, π]).
5. **Dado** um robô com velocidade linear máxima de 0,5 m/s, `dt = 0,05` e comando v = 2,0,
   w = 0, **quando** 20 ticks são executados, **então** a pose final é (0,500; 0,000; 0,000).
6. **Dado** um robô iniciando em (1,0; 2,0; π) com `dt = 0,05` e comando v = 1,0, w = 0,
   **quando** 10 ticks são executados, **então** a pose final é (0,500; 2,000; 3,142).
7. **Dado** um controlador que não comanda nenhuma velocidade, **quando** 100 ticks são
   executados, **então** o robô permanece na pose inicial.
8. **Dado** o mesmo mundo, a mesma seed e os mesmos controladores, **quando** a simulação
   é executada duas vezes por 1000 ticks, **então** o estado de cada tick é idêntico nas
   duas execuções.

---

### História de usuário 3 — Enxergar o mundo com laser e sonar (Prioridade: P1)

O controlador de um robô lê um laser (vários raios em leque) ou um sonar (um cone que
devolve a menor distância) para detectar paredes, obstáculos e outros robôs.

**Por que esta prioridade**: é o sensor principal de quase todas as estratégias e um dos
três critérios dos testes de aceitação do trabalho.

**Teste independente**: posicionar um robô em mundos simples, executar um único tick e
comparar as leituras com os valores abaixo.

**Regras de leitura**:

- Um laser tem N raios distribuídos uniformemente num campo de visão (FOV) centrado na
  direção do sensor. Com N ≥ 2, o raio i (i = 0 … N−1) aponta para
  `direção do sensor − FOV/2 + i × FOV/(N−1)`. Com N = 1, o único raio aponta na
  direção do sensor. As leituras são devolvidas nessa ordem: do raio mais à direita para o
  mais à esquerda.
- Cada leitura é a distância da origem do sensor até o ponto mais próximo atingido pelo
  raio entre paredes, obstáculos e **outros** robôs. O raio nunca atinge o próprio robô.
- Se nada for atingido até o alcance máximo, a leitura é igual ao alcance máximo.
- Um sonar usa as mesmas regras de raios, mas devolve um único valor: a menor leitura
  entre os raios do seu cone.
- As leituras entregues ao controlador num tick refletem o estado do mundo ao final do
  tick anterior (no primeiro tick, o estado inicial).

**Cenários de aceitação** (robô em (0, 0, 0), sensor no centro do robô apontando para a
frente, alcance máximo 2,0 m, sem ruído, salvo indicação):

1. **Dado** um laser de 3 raios com FOV = π e uma parede vertical em x = 1,0 (de y = −5 a
   y = 5), **quando** o laser é lido, **então** as leituras são [2,000; 1,000; 2,000].
2. **Dado** um laser de 5 raios com FOV = π/2 e a mesma parede, **quando** o laser é lido,
   **então** as leituras são [1,414; 1,082; 1,000; 1,082; 1,414].
3. **Dado** um laser de 1 raio montado a 0,05 m à frente do centro do robô e a mesma
   parede, **quando** o laser é lido, **então** a leitura é [0,950].
4. **Dado** um robô em (0, 0, π/2), um laser de 1 raio e uma parede horizontal em y = 1,5,
   **quando** o laser é lido, **então** a leitura é [1,500].
5. **Dado** um laser de 1 raio e um obstáculo circular de raio 0,5 centrado em (2,0; 0),
   com alcance máximo 3,0, **quando** o laser é lido, **então** a leitura é [1,500].
6. **Dado** um laser de 1 raio e outro robô de raio 0,1 centrado em (1,0; 0), **quando**
   o laser é lido, **então** a leitura é [0,900].
7. **Dado** um laser de 1 raio e uma parede em x = 3,0 (além do alcance de 2,0), **quando**
   o laser é lido, **então** a leitura é [2,000].
8. **Dado** um sonar de 3 raios com FOV = π/3 e a parede em x = 1,0, **quando** o sonar é
   lido, **então** a leitura é 1,000.
9. **Dado** um laser com ruído configurado e a mesma seed, **quando** a simulação é
   executada duas vezes, **então** as leituras são idênticas; com seeds diferentes, ao
   menos uma leitura difere. Leituras com ruído ficam sempre entre 0 e o alcance máximo.

---

### História de usuário 4 — Colidir sem atravessar e sentir o contato (Prioridade: P2)

Robôs não atravessam paredes, obstáculos nem outros robôs. Quando um robô encosta em algo,
o bumper correspondente é acionado e o controlador pode reagir. Um robô que empurra outro
desloca-o de acordo com as massas de ambos.

**Por que esta prioridade**: sem colisão, a simulação não serve para testar estratégias
de desvio ou de empurrar (Sumô). Depende das histórias 1 e 2.

**Teste independente**: executar mundos com uma parede ou um segundo robô à frente e
verificar poses finais e estado do bumper.

**Modelo de colisão**:

- Para fins de colisão, cada robô é um disco com o raio declarado.
- Obstáculos podem ser caixas (retângulos com rotação), discos e paredes (segmentos de
  espessura zero). Se a arena declarar paredes de borda, elas se comportam como paredes.
- Ao final de cada tick, nenhum robô fica sobreposto a um obstáculo: ele é afastado até
  ficar apenas encostado. Isso vale em qualquer velocidade permitida, inclusive contra
  paredes finas (o robô nunca "pula" para o outro lado).
- Entre dois robôs sobrepostos, a separação é dividida na proporção inversa das massas:
  cada robô recua uma fração da sobreposição igual à massa do **outro** dividida pela
  soma das massas. Assim, um robô que empurra outro parado de mesma massa avança a
  metade da sua velocidade comandada.
- Colisões não alteram a orientação dos robôs.
- Um bumper cobre um setor angular do contorno do robô (por padrão, a metade frontal:
  de −π/2 a +π/2 em relação à frente). Ele fica acionado no tick em que houve contato
  dentro do seu setor, incluindo as bordas do setor, e desacionado caso contrário.

**Cenários de aceitação** (`dt = 0,05`):

1. **Dado** um robô de raio 0,1 em (0, 0, 0) e uma parede vertical em x = 0,5, **quando**
   o robô é comandado com v = 1,0 por 20 ticks, **então** a pose final é
   (0,400; 0,000; 0,000) e o bumper frontal está acionado.
2. **Dado** o cenário anterior, **quando** a mesma parede é uma caixa de 0,2 × 2,0
   centrada em (0,6; 0), **então** a pose final também é (0,400; 0,000; 0,000).
3. **Dado** um robô de raio 0,1 em (0, 0, 0) e uma parede em x = 0,5, **quando** o robô é
   comandado com a velocidade máxima de 2,0 m/s por 20 ticks, **então** a pose final é
   (0,400; 0,000; 0,000) (não atravessa).
4. **Dado** um robô de raio 0,1 encostado na parede pela frente, **quando** ele é
   comandado com v = −0,5 por 1 tick, **então** o bumper frontal fica desacionado.
5. **Dado** os robôs A (raio 0,1, massa 1,0) em (0, 0, 0) e B (raio 0,1, massa 1,0) em
   (0,3; 0; π), **quando** A é comandado com v = 0,5 e B fica parado por 20 ticks,
   **então** A termina em (0,300; 0,000) e B em (0,500; 0,000), e o bumper frontal de
   ambos está acionado.
6. **Dado** o cenário anterior com A de massa 3,0, **quando** executado por 20 ticks,
   **então** A termina em (0,400; 0,000) e B em (0,600; 0,000).
7. **Dado** os robôs A (raio 0,1, massa 1,0) em (0, 0, 0) e B (raio 0,1, massa 1,0) em
   (0,3; 0; π), **quando** ambos são comandados com v = 0,5 um contra o outro, **então** eles
   se encostam no tick 2 com A em (0,050; 0,000) e B em (0,250; 0,000), e após mais 20 ticks
   continuam nessas posições (nenhum dos dois avança).
8. **Dado** um robô sem obstáculos ao redor, **quando** executa qualquer comando, **então**
   seus bumpers permanecem desacionados.

---

### História de usuário 5 — Saber quanto andou e o que há no piso (Prioridade: P2)

O controlador consulta a odometria (estimativa de deslocamento a partir das velocidades
comandadas, como faria um encoder) e sensores de piso (refletância do chão sob o sensor),
usados por exemplo para detectar a borda branca do Dohyo ou seguir uma linha.

**Por que esta prioridade**: a odometria é exigida pelo briefing; o sensor de piso é
pré-requisito das modalidades Sumô e Seguidor de Linha.

**Teste independente**: executar movimentos simples e posicionar sensores de piso sobre
regiões conhecidas.

**Regras da odometria**:

- A odometria começa em (0, 0, 0) no referencial da pose inicial do robô (x para a frente
  inicial, y para a esquerda inicial) e acumula a distância percorrida.
- Ela integra as velocidades **comandadas** (após a saturação), com o mesmo modelo de
  movimento da história 2, e não sabe de colisões. Por isso diverge da pose real quando o
  robô está bloqueado, como acontece com encoders cujas rodas patinam.
- Opcionalmente, pode ter ruído semeado.

**Regras do piso**:

- O piso tem uma refletância padrão (de 0 = preto a 1 = branco) e uma lista ordenada de
  regiões pintadas: retângulos, discos, anéis e linhas com espessura (traço sobre uma
  sequência de pontos). Cada região tem refletância e cor de exibição.
- Um sensor de piso devolve a refletância do ponto sob ele. Se várias regiões contêm o
  ponto, vale a última declarada. Pontos sobre a borda da região contam como dentro.

**Cenários de aceitação** (`dt = 0,05`):

1. **Dado** um robô em (1,0; 1,0; π/2) comandado com v = 1,0 por 20 ticks, **quando** a
   odometria é lida, **então** ela informa (1,000; 0,000; 0,000) e distância 1,000,
   enquanto a pose real é (1,000; 2,000; 1,571).
2. **Dado** o cenário 1 da história 4 (robô bloqueado na parede), **quando** a odometria
   é lida ao final, **então** ela informa x = 1,000, embora a pose real seja x = 0,400.
3. **Dado** um piso de refletância padrão 0,5, com um disco de raio 0,5 e refletância 0,1
   centrado na origem e, por cima, um anel entre os raios 0,45 e 0,5 com refletância 0,9,
   e um sensor de piso montado a 0,1 m à frente do centro do robô:
   - robô em (0, 0, 0) → leitura 0,1;
   - robô em (0,37; 0; 0) → sensor em x = 0,47 → leitura 0,9;
   - robô em (0,45; 0; 0) → sensor em x = 0,55 → leitura 0,5.
4. **Dado** uma linha de (−1, 0) a (1, 0) com espessura 0,02 e refletância 0,9 sobre piso
   0,5, **quando** o sensor está em (0; 0,005), **então** a leitura é 0,9; em (0; 0,02),
   a leitura é 0,5.

---

### História de usuário 6 — Escrever o controlador contra uma API limitada (Prioridade: P2)

Um membro da equipe escreve, em JavaScript, a estratégia do robô usando apenas as
operações documentadas. O controlador é chamado uma vez por tick. Erros na estratégia são
relatados de forma clara e não derrubam a simulação dos demais robôs.

**Por que esta prioridade**: o controlador já é usado pelas histórias 2 a 5; esta história
completa as garantias de isolamento, determinismo e diagnóstico de erros.

**Teste independente**: executar controladores corretos, com erro de sintaxe, com erro em
tempo de execução e que tentam usar recursos não permitidos.

**API do controlador**: o código do controlador define uma função `onTick(robot)`,
chamada uma vez a cada tick. O objeto `robot` oferece somente:

| Operação                    | Retorno / efeito                                                                 |
|-----------------------------|----------------------------------------------------------------------------------|
| `robot.readLaser(id?)`      | Lista de distâncias do laser (o primeiro laser do robô, se `id` for omitido).    |
| `robot.readSonar(id?)`      | Distância do sonar.                                                              |
| `robot.readBumper(id?)`     | `true` se o bumper está acionado.                                                |
| `robot.readFloor(id?)`      | Refletância sob o sensor de piso.                                                |
| `robot.readOdometry()`      | `{ x, y, theta, distance }` da odometria.                                        |
| `robot.setSpeed(v, w)`      | Define o comando (saturado). O último comando vale até ser trocado; começa em (0, 0). |
| `robot.random()`            | Número em [0, 1) derivado da seed da simulação.                                  |
| `robot.time()`              | Tempo simulado em segundos.                                                      |
| `robot.log(mensagem)`       | Registra uma mensagem associada ao robô e ao tick.                               |

Variáveis declaradas fora de `onTick` preservam valor entre ticks (memória da estratégia).
A ordem de execução de cada tick é: (1) leituras dos sensores; (2) controladores, na
ordem em que os robôs aparecem no mundo; (3) movimento; (4) colisões e bumpers;
(5) avaliação da modalidade, se houver.

**Cenários de aceitação**:

1. **Dado** um controlador que lê o laser e para quando a leitura central é menor que
   0,5, num mundo com parede em x = 2,0 e robô de raio 0,1 andando a 1,0 m/s, **quando**
   executado por 100 ticks, **então** o robô para antes de encostar na parede e o bumper
   nunca é acionado.
2. **Dado** um controlador com erro de sintaxe, **quando** a simulação é criada, **então**
   ela não inicia e o erro informa o robô e a linha do problema.
3. **Dado** um controlador sem a função `onTick`, **quando** a simulação é criada,
   **então** ela não inicia e o erro informa que `onTick` é obrigatória.
4. **Dado** dois robôs, em que o controlador do robô A lança um erro no tick 5, **quando**
   a simulação roda por 20 ticks, **então** A fica com estado "erro", comando (0, 0) desde
   o tick 5 e a mensagem do erro com o número do tick; B continua normalmente.
5. **Dado** um controlador que tenta ler o relógio do sistema ou usar o gerador aleatório
   não semeado, **quando** executado, **então** esses recursos não estão disponíveis
   (erro relatado como no cenário 4), e `robot.random()` produz a mesma sequência em
   execuções com a mesma seed.
6. **Dado** um controlador que chama `robot.readLaser('inexistente')`, **quando**
   executado, **então** o erro informa que o robô não tem sensor com esse identificador.

---

### História de usuário 7 — Executar simulações sem interface e obter o resultado (Prioridade: P1)

A equipe (ou um avaliador automatizado) executa uma simulação a partir de um arquivo de
mundo e de arquivos de controlador, por um número de ticks, sem nenhuma tela, e obtém o
estado final num formato estruturado e legível por máquina. A mesma operação está
disponível programaticamente, com passos individuais e reinício.

**Por que esta prioridade**: é a forma como os testes de aceitação do trabalho verificam
o sistema e como as demais features (visualização, replay) consomem o núcleo.

**Teste independente**: executar a linha de comando com mundos de exemplo e verificar a
saída e o código de término.

**Cenários de aceitação**:

1. **Dado** um mundo válido e um controlador para cada robô, **quando** a execução sem
   interface é pedida para 20 ticks, **então** a saída contém o tick final, o tempo
   simulado e, para cada robô, pose, comando atual, odometria, estado dos bumpers e
   estado ("ok" ou "erro"), e o término indica sucesso.
2. **Dado** um mundo inválido, **quando** a execução é pedida, **então** nenhum tick é
   executado, a lista de erros é exibida e o término indica falha de validação, distinta
   de falha de execução.
3. **Dado** uma simulação criada, **quando** são pedidos 1 passo e depois mais 9,
   **então** o estado é idêntico ao de pedir 10 passos de uma vez.
4. **Dado** uma simulação já avançada, **quando** é reiniciada, **então** o estado volta
   exatamente ao inicial, incluindo odometria, memória dos controladores e sequência
   aleatória.
5. **Dado** um robô cujo controlador não foi informado, **quando** a simulação roda,
   **então** o robô permanece parado e é sinalizado como "sem controlador".

---

### Casos de borda

- Mundo com zero robôs: é válido (útil para inspecionar arenas); a simulação avança o
  tempo sem movimento.
- Robô que sai dos limites da arena quando ela não tem paredes de borda: permitido; o
  núcleo não decide se isso é derrota (isso é papel da modalidade).
- Raio do laser passando exatamente pela quina de uma caixa ou tangente a um disco: conta
  como atingido, com a distância até o ponto de contato.
- Laser com origem dentro de um obstáculo: leitura 0.
- Comando com valores não numéricos (`NaN`, infinito) em `setSpeed`: tratado como erro do
  controlador (história 6, cenário 4).
- Dois robôs empurrando um terceiro em direções opostas no mesmo tick: a resolução segue
  a ordem dos robôs no mundo e é repetível.
- Pedido de 0 ticks: devolve o estado inicial.
- Quando a modalidade declara o fim da partida, a simulação não avança mais ticks até ser
  reiniciada; pedidos de novos passos devolvem o estado final.
- Robô encurralado entre parede e outro robô: ele nunca termina sobreposto à parede; a
  sobreposição residual com o outro robô, se houver, é resolvida empurrando o robô livre.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Mundo e validação**

- **FR-001**: O sistema DEVE carregar mundos descritos num arquivo JSON contendo versão do
  formato, nome, seed, passo de tempo, arena, piso, obstáculos e robôs com seus sensores
  e controladores. *(RB-10)*
- **FR-002**: O sistema DEVE validar o arquivo antes de qualquer simulação e informar
  **todos** os erros encontrados, cada um com o caminho do campo (ex.:
  `robots[0].sensors[1].rays`) e o motivo em português. *(RB-11)*
- **FR-003**: O sistema DEVE rejeitar: JSON sintaticamente inválido (com linha e coluna),
  campos obrigatórios ausentes, campos desconhecidos, tipos errados, valores fora do
  intervalo permitido, identificadores repetidos (de robôs, de sensores dentro de um robô
  e de obstáculos), versão de formato não suportada, modalidade desconhecida e robôs que
  começam sobrepostos a obstáculos, a outros robôs ou fora da arena. *(RB-11)*
- **FR-004**: O sistema DEVE adotar `dt = 0,05 s` e `seed = 1` quando omitidos e aceitar
  `dt` no intervalo (0; 0,1] s. *(RB-02)*

**Cinemática e tempo**

- **FR-005**: O sistema DEVE simular robôs de tração diferencial comandados por velocidade
  linear e angular, com o modelo de movimento em arco descrito na história 2. *(RB-12)*
- **FR-006**: O sistema DEVE saturar os comandos às velocidades máximas linear e angular
  declaradas para cada robô (padrões: 1,0 m/s e 2π rad/s). *(RB-12)*
- **FR-007**: O sistema DEVE avançar o tempo apenas por ticks de duração fixa e normalizar
  orientações para (−π, π]. *(RB-02)*
- **FR-008**: O sistema DEVE produzir sequências de estados idênticas para as mesmas
  entradas (mundo, seed, `dt`, controladores), independentemente de interface ou de
  frequência de exibição. *(RB-01, RB-02)*

**Colisão**

- **FR-009**: O sistema DEVE impedir que robôs terminem um tick sobrepostos a obstáculos
  (caixas, discos, paredes e bordas da arena quando declaradas) e que os atravessem em
  qualquer velocidade permitida. *(RB-04, RB-13)*
- **FR-010**: O sistema DEVE separar robôs sobrepostos na proporção inversa de suas massas,
  sem alterar suas orientações, com resolução em ordem fixa (a ordem dos robôs no mundo).
  *(RB-13, RB-20)*

**Sensores**

- **FR-011**: O sistema DEVE oferecer sensores laser com número de raios, campo de visão,
  alcance máximo, posição e orientação no robô configuráveis, e leituras conforme as regras
  da história 3. *(RB-14)*
- **FR-012**: O sistema DEVE oferecer sensores sonar que devolvem a menor distância do seu
  cone de raios. *(RB-14)*
- **FR-013**: Os raios DEVEM detectar paredes, obstáculos e outros robôs, nunca o próprio
  robô, e devolver o alcance máximo quando nada for atingido. *(RB-14, RB-20)*
- **FR-014**: O sistema DEVE oferecer odometria por robô conforme as regras da história 5.
  *(RB-15)*
- **FR-015**: O sistema DEVE oferecer bumpers definidos por setor angular, acionados no
  tick em que houve contato no setor. *(RB-16)*
- **FR-016**: O sistema DEVE oferecer sensores de piso que devolvem a refletância do ponto
  sob o sensor, segundo as regiões pintadas do piso. *(RB-10)*
- **FR-017**: Laser, sonar, odometria e piso DEVEM aceitar ruído opcional (desvio padrão,
  padrão 0) derivado da seed; leituras de distância com ruído ficam entre 0 e o alcance
  máximo, e refletâncias entre 0 e 1. *(RB-02)*

**Controladores**

- **FR-018**: O sistema DEVE executar, a cada tick, o controlador JavaScript de cada robô,
  na ordem dos robôs no mundo, expondo somente a API da história 6. *(RB-17)*
- **FR-019**: O controlador NÃO DEVE ter acesso ao relógio do sistema nem a aleatoriedade
  não semeada. *(RB-02)*
- **FR-020**: Erros de sintaxe ou a ausência de `onTick` DEVEM impedir o início da
  simulação com mensagem identificando o robô; erros em tempo de execução DEVEM colocar
  apenas aquele robô no estado "erro", com comando (0, 0), registrando tick e mensagem.
  *(RB-17)*

**Execução**

- **FR-021**: O sistema DEVE permitir criar uma simulação, avançar um ou vários ticks,
  consultar o estado e reiniciar ao estado inicial, sem interface gráfica. *(RB-01, RB-18)*
- **FR-022**: O sistema DEVE oferecer uma execução por linha de comando que recebe o
  mundo, os controladores e o número de ticks e imprime o estado final em formato
  estruturado, com códigos de término distintos para sucesso, mundo inválido e falha de
  execução. *(RB-01, RB-45)*
- **FR-023**: O sistema DEVE suportar vários robôs na mesma arena. *(RB-20)*
- **FR-024**: O núcleo DEVE aceitar, opcionalmente, uma modalidade que observa o estado a
  cada tick e informa o andamento da partida (em andamento, vitória, empate, fim por
  tempo), sem que o núcleo conheça modalidades específicas. Sem modalidade, a simulação
  apenas avança. *(RB-23)*

### Entidades-chave

- **Mundo**: descrição completa de um cenário: versão, nome, seed, `dt`, modalidade
  opcional, arena, piso, obstáculos e robôs.
- **Arena**: retângulo centrado na origem com largura, altura e indicação de paredes de
  borda.
- **Piso**: refletância padrão e lista ordenada de regiões pintadas (retângulo, disco,
  anel, linha), cada uma com refletância e cor.
- **Obstáculo**: caixa, disco ou parede, com identificador e geometria.
- **Robô**: identificador, nome, cor, pose inicial, raio, massa, velocidades máximas,
  sensores e controlador.
- **Sensor**: laser, sonar, bumper ou piso, com identificador único no robô, posição e
  parâmetros. A odometria existe em todo robô.
- **Controlador**: código JavaScript que define `onTick(robot)`.
- **Estado da simulação**: tick, tempo e, por robô, pose, comando, odometria, leituras,
  bumpers, estado e registros; e o andamento da partida quando houver modalidade.
- **Erro de validação**: caminho do campo, código do erro e mensagem em português.
- **Modalidade**: participante opcional que avalia o estado a cada tick e declara o
  andamento da partida.

## Critérios de sucesso *(obrigatório)*

### Resultados mensuráveis

- **SC-001**: 100% dos cenários de aceitação numéricos desta especificação são reproduzidos
  dentro da tolerância de 0,001 m e 0,001 rad.
- **SC-002**: Duas execuções com as mesmas entradas produzem estados idênticos em 100% dos
  ticks, em mundos de até 4 robôs e 10.000 ticks.
- **SC-003**: Todos os tipos de erro listados em FR-003 são relatados com caminho e motivo,
  e um arquivo com vários erros os apresenta em uma única validação.
- **SC-004**: Uma simulação de 10.000 ticks com 4 robôs, cada um com um laser de 30 raios,
  em uma arena com 20 obstáculos, termina sem interface em menos de 5 segundos num
  notebook típico da equipe.
- **SC-005**: Um membro da equipe que não participou do desenvolvimento escreve um
  controlador que anda e desvia de uma parede usando apenas a documentação da API em até
  15 minutos.

## Premissas e limites do modelo

- **Modelo cinemático, não dinâmico**: não há inércia, atrito, deslizamento lateral nem
  limites de aceleração; o robô atinge a velocidade comandada instantaneamente.
  Estratégias que dependem de aceleração ou tração não são validadas por este modelo.
- **Robôs são discos para colisão e para o raycast**; na visualização podem ser desenhados
  com outra forma. Robôs quadrados reais (como no Sumô) têm alcance de contato
  ligeiramente diferente nas quinas.
- **Empurrão simplificado**: a divisão da sobreposição pela massa é uma aproximação; não
  modela torque de motores, rampas nem levantamento do oponente.
- **Sem terceira dimensão**: obstáculos não têm altura para a simulação; o laser vê tudo
  que estiver no plano.
- **Determinismo garantido no mesmo ambiente de execução**: funções matemáticas podem
  diferir no último dígito entre motores JavaScript diferentes; por isso os critérios
  de aceitação usam tolerância.
- **Usuários confiáveis**: o isolamento do controlador garante determinismo e uma API
  limitada, não segurança contra código malicioso. Um controlador em laço infinito trava
  a execução; a linha de comando oferece tempo limite.
- **Escopo fora desta feature**: visualização 3D e controles de play/pause (feature 002),
  regras de modalidades (features 004, 006 a 008), painel de inspeção e replay
  (feature 005), controle remoto (feature 009). (Numeração revisada em 2026-11-20.)
