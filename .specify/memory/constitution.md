# Constituição do SheepbotzArena

## Princípios fundamentais

### I. Simulação matemática e física em 2D com visualização em 3D

Toda lógica matemática e física da simulação DEVE operar em duas dimensões.
O estado dos robôs, as interações com a arena, as leituras simuladas dos sensores e
os resultados das partidas DEVEM derivar desse modelo 2D. A visualização DEVE ser
tridimensional e consumir o estado da simulação, sem decidir colisões, leituras de
sensores ou resultados por meio de física 3D.

O núcleo da simulação DEVE ser executável e testável sem renderização. Alterar a
frequência de renderização NÃO DEVE alterar o resultado para as mesmas condições e
entradas simuladas. Essa separação permite validar estratégias sem depender da interface.

### II. Rastreabilidade às regras da RoboCore

Toda especificação que dependa de regras oficiais das partidas, dos robôs ou das arenas
DEVE consultar o documento da categoria em `./docs/references/robocore/`. A especificação
DEVE identificar a categoria abrangida e citar os artigos, notas ou seções que fundamentam
seus requisitos. Parâmetros de categorias diferentes NÃO DEVEM ser combinados implicitamente.
Quando uma modalidade não tiver regulamento da RoboCore, a especificação DEVE indicar a
fonte regulamentar adotada e registrar essa escolha.

Qualquer ambiguidade, conflito ou lacuna relevante DEVE ser registrado na própria
especificação, acompanhado da interpretação adotada, da justificativa e dos efeitos
nos critérios de aceitação. Uma hipótese de simulação NÃO DEVE ser apresentada como
regra oficial. A tradução de eventos físicos para o modelo 2D também DEVE explicitar
as simplificações necessárias quando afetar a aplicação das regras.

Alterações da referência DEVEM motivar revisão das especificações e dos testes afetados
antes da incorporação de novos comportamentos regulamentares.

### III. Testes automatizados dos critérios de aceitação

Todo comportamento novo ou alterado DEVE ser entregue com testes automatizados na mesma
entrega. A ordem entre escrever o teste e o código é livre; uma história de usuário só é
considerada concluída quando seus testes estão aprovados. Correções de defeitos DEVEM
incluir um teste que reproduza o problema.

Os testes DEVEM verificar comportamentos observáveis e critérios de aceitação, incluindo
casos de fronteira pertinentes à física, aos sensores e à aplicação das regras.
Todo critério de aceitação numérico de uma especificação DEVE ter um teste automatizado
correspondente, que cite o identificador do cenário ou requisito. Integrações entre
simulação, estratégias, arbitragem e visualização DEVEM ter testes quando seus contratos
forem introduzidos ou alterados.

Cada entrega DEVE executar a suíte completa. Testes reprovados DEVEM ser resolvidos antes
da integração da entrega.

### IV. Código limpo, baixo acoplamento e extensibilidade

O código DEVE usar nomes que expressem intenção, unidades com responsabilidade definida
e contratos explícitos entre regras de domínio, simulação, estratégias e apresentação.
Regras de negócio NÃO DEVEM ficar acopladas à interface ou ao mecanismo de renderização.

Constantes físicas e parâmetros regulamentares DEVEM ter nomes, unidades e origem
identificáveis. Duplicação de regras DEVE ser eliminada em favor de uma definição
compartilhada. Abstrações e dependências novas DEVEM responder a uma necessidade
demonstrada na especificação ou na implementação, com justificativa na revisão.
Refatorações DEVEM preservar o comportamento verificado pelos testes.

O sistema DEVE manter baixo acoplamento entre o núcleo compartilhado e as modalidades.
Regras, parâmetros de arena, critérios de arbitragem e comportamentos específicos de cada
modalidade DEVEM ser encapsulados em módulos com contratos explícitos. O núcleo
compartilhado DEVE depender desses contratos, sem depender das implementações concretas
de uma modalidade. Módulos de modalidades distintas NÃO DEVEM depender entre si.

A inclusão de uma modalidade DEVE ocorrer pela implementação dos contratos de extensão
e por seu registro, sem exigir alterações nas modalidades existentes. Caso uma capacidade
nova exija evolução dos contratos ou do núcleo compartilhado, a especificação DEVE
justificar a mudança e definir testes de regressão para as modalidades afetadas.
A composição das implementações DEVE ficar em pontos explícitos, evitando condicionais
por modalidade espalhadas pelo núcleo. A direção das dependências DEVE ser verificada
automaticamente.

### V. Português na comunicação e inglês no código

Toda documentação produzida pelo projeto, incluindo especificações, planos, tarefas,
registros de decisões, instruções e mensagens de commit, DEVE estar em português.
Comentários de código, documentação embutida, mensagens de erro e textos apresentados
pela interface também DEVEM estar em português.

Identificadores de código, incluindo variáveis, funções, classes, módulos, campos do
arquivo de mundo e identificadores de testes, DEVEM estar em inglês. Nomes próprios,
termos regulamentares (por exemplo, Dohyo e Tawara), identificadores de APIs externas e
trechos citados de referências DEVEM preservar sua grafia original.

### VI. Determinismo e física própria

O núcleo de simulação DEVE ser determinístico: o mesmo mundo, a mesma seed, o mesmo
passo de tempo e os mesmos controladores DEVEM produzir a mesma sequência de estados,
tick a tick, no mesmo ambiente de execução. O passo de tempo é fixo durante uma execução
e o tempo simulado avança somente por ticks, nunca pelo relógio do sistema.

Toda fonte de aleatoriedade (ruído de sensores, sorteios de modalidades, aleatoriedade
disponível ao controlador) DEVE derivar da seed da simulação. Controladores NÃO DEVEM
ter acesso ao relógio do sistema nem a geradores aleatórios não semeados.

Cinemática, detecção e resolução de colisões e sensores DEVEM ser implementados pelo
projeto. Bibliotecas de motor de física prontas NÃO DEVEM ser usadas. Bibliotecas de
apoio (validação, renderização, interface) são permitidas desde que não decidam
comportamento físico.

### VII. Rastreabilidade de ponta a ponta e evidência de qualidade

Todo artefato DEVE ser rastreável na cadeia
`requisito do briefing (RB) → requisito funcional (FR) → tarefa (T) → commit`:

- os requisitos extraídos do briefing ficam em `docs/briefing/requisitos-extraidos.md`;
- cada especificação cita os `RB` que atende;
- cada tarefa cita os `FR` que implementa;
- cada commit de implementação cita a tarefa e os requisitos no formato
  `<tipo>(<feature>/<tarefa>): <descrição> [<FR>, ...]`, por exemplo
  `feat(001/T014): calcula leituras do laser por raycast [FR-012, FR-013]`.
  Commits de documentação sem tarefa usam `docs: <descrição>`.

A cobertura de testes automatizados DEVE ser de no mínimo 80% em linhas, funções,
ramificações e instruções, verificada pela própria suíte (que falha abaixo do limite).
O relatório de cobertura DEVE ser versionado no repositório, e o início do `README.md`
DEVE exibir a quantidade de testes e o percentual de cobertura, atualizados a cada entrega.
Somente pontos de entrada de inicialização sem lógica podem ser excluídos da medição,
e cada exclusão DEVE estar listada no plano da feature.

## Escopo e restrições do produto

O SheepbotzArena destina-se à equipe de robótica Univille SheepBotz, que precisa testar
estratégias de robôs autônomos sem desgastar os robôs físicos. É um simulador web genérico
de robôs móveis de tração diferencial, no espírito do Stage (Player/Stage), com lógica em
2D e aparência de um Gazebo leve em 3D. O usuário descreve o mundo num arquivo, escreve o
controlador de cada robô e acompanha a simulação com play, pause, step e reset.

O núcleo é genérico e independente de modalidade. As modalidades da RoboCore são módulos
de extensão que definem mundos de exemplo, parâmetros regulamentares e arbitragem
(condições de vitória, pontuação e fim de partida):

| Modalidade         | Robôs por arena | Referência regulamentar                         | Papel          |
|--------------------|-----------------|-------------------------------------------------|----------------|
| Sumô (Mega, Mini, LEGO®) | 2         | `docs/references/robocore/sumo.md`              | Foco da demo   |
| Seguidor de Linha  | 1               | `docs/references/robocore/seguidor-de-linha.md` | Adicional      |
| Trekking           | 1               | `docs/references/robocore/trekking.md`          | Adicional      |
| Futebol de robôs   | 2 ou mais       | `docs/references/robocore/futebol.md`           | Adicional      |

Uma simulação sem modalidade (apenas mundo e controladores) DEVE ser sempre possível.
As estratégias DEVEM decidir as ações dos robôs autonomamente a partir das entradas
definidas pela especificação. Cada funcionalidade DEVE declarar os sensores modelados,
suas limitações, as condições iniciais e os parâmetros necessários para reproduzir os
cenários de teste. Aproximações físicas DEVEM ser documentadas com seus limites de uso;
a simulação NÃO DEVE ser descrita como validação de fenômenos que não modela.

O projeto é uma prova de conceito. Escopo reduzido, bem especificado e funcionando tem
prioridade sobre amplitude: modalidades adicionais só começam depois que o escopo
completo do briefing estiver entregue e com cobertura ≥ 80%.

## Stack tecnológica

As escolhas abaixo valem para todas as features. Trocar ou adicionar uma dependência
de execução exige emenda desta seção.

| Área                       | Escolha                                                        |
|----------------------------|----------------------------------------------------------------|
| Linguagem                  | TypeScript (modo `strict`), executado em Node.js 22+ e navegadores modernos |
| Build e servidor de dev    | Vite                                                           |
| Interface                  | React                                                          |
| Visualização 3D            | Three.js via React Three Fiber (`@react-three/fiber`) e utilitários `@react-three/drei` (câmera orbital, grade); geometria procedural, sem modelos externos |
| Biblioteca de componentes  | Própria, em `src/ui/`: tokens de design em variáveis CSS e componentes React estilizados com CSS Modules; ícones `lucide-react` |
| Editor do controlador      | CodeMirror 6 (`codemirror`, linguagens JavaScript e JSON)      |
| Validação do arquivo de mundo | Zod                                                         |
| Testes e cobertura         | Vitest com cobertura V8; Testing Library e jsdom para componentes; `@react-three/test-renderer` para a cena 3D |
| Qualidade                  | ESLint (incluindo regra de direção de dependências) e Prettier |
| Formato do mundo           | JSON                                                           |
| Linguagem do controlador   | JavaScript, executado contra uma API limitada                  |
| Análise sintática do controlador | acorn (apenas para relatar erros com linha e coluna)     |
| Linha de comando           | Node.js com `tsx`                                              |
| Controlador remoto         | `WebSocket` padrão do navegador e do Node.js 22+, sem dependência nova; o exemplo de programa externo usa Python 3.10+ com `websockets`, fora do build |

O núcleo de simulação NÃO DEVE depender de React, Three.js, DOM ou APIs exclusivas do
navegador, para rodar igualmente no Node.js (testes e linha de comando) e no navegador.

A interface DEVE reutilizar os componentes de `src/ui/` em vez de estilizar elementos
avulsos; `src/ui/` é genérica e NÃO DEVE depender do núcleo, das modalidades nem da
aplicação. Estilos usam os tokens de design (cores, espaçamentos, raios, tipografia)
definidos uma única vez. Textos da interface ficam em português.

## Fluxo de desenvolvimento e revisão

1. Antes da implementação, elaborar uma especificação em português com objetivo,
   histórias de usuário, critérios de aceitação verificáveis (numéricos quando houver
   cálculo) e limites do modelo, sem detalhes de tecnologia. Citar os `RB` atendidos e,
   quando houver dependência de regras, a referência regulamentar.
2. No planejamento, registrar as decisões técnicas (arquitetura, stack, dados, contratos),
   as unidades físicas e a estratégia de testes, demonstrando a separação entre simulação
   2D e apresentação 3D. Para inclusão de modalidades, documentar os pontos de extensão,
   a direção das dependências e os módulos alterados.
3. Gerar tarefas em fatias verticais por história de usuário, cada uma com caminho de
   arquivo e os `FR` atendidos.
4. Implementar por incrementos, cada um com seus testes, com commits no formato do
   princípio VII.
5. Na revisão, verificar rastreabilidade, critérios de aceitação, cobertura, convenções
   de idioma, documentação das simplificações, isolamento das modalidades e ausência de
   dependências do núcleo em modalidades ou na apresentação.
6. Toda mudança entra por branch e pull request. Integrar somente após aprovação da
   revisão e das verificações exigidas. Desvios desta constituição DEVEM ser resolvidos
   ou submetidos ao procedimento de emenda antes da integração.

## Governança

Esta constituição prevalece sobre decisões técnicas, especificações e práticas locais
que a contradigam. Toda especificação, plano e revisão de entrega DEVE verificar sua
conformidade com os princípios e registrar eventuais impedimentos.

Uma emenda DEVE apresentar motivação, texto proposto, impacto sobre artefatos existentes
e plano de adequação quando necessário. A alteração DEVE ser revisada e aprovada pelos
responsáveis pelo projeto antes de sua integração. A revisão DEVE preservar decisões
vigentes que não tenham sido explicitamente alteradas.

O versionamento DEVE seguir o formato MAJOR.MINOR.PATCH: incrementar MAJOR ao remover ou
redefinir princípios de maneira incompatível; MINOR ao adicionar princípios ou seções,
ou ampliar materialmente suas exigências; PATCH para esclarecimentos e correções sem
mudança semântica. Toda emenda DEVE atualizar a versão e a data da última alteração,
preservando a data da ratificação inicial, e registrar a mudança no histórico abaixo.

### Histórico de emendas

| Versão | Data       | Mudança                                                                                  |
|--------|------------|------------------------------------------------------------------------------------------|
| 1.0.0  | 2026-11-14 | Adoção inicial (princípios I a V).                                                       |
| 1.1.0  | 2026-11-14 | Princípio IV ampliado para baixo acoplamento e extensibilidade de modalidades.           |
| 1.2.0  | 2026-11-20 | Princípios VI (determinismo e física própria) e VII (rastreabilidade e cobertura) adicionados; escopo ampliado para simulador genérico com várias modalidades da RoboCore e foco da demo em Sumô; seção de stack adicionada; referências movidas para `docs/references/robocore/`; mensagens de commit em português. |
| 2.0.0  | 2026-11-20 | Princípio III redefinido: TDD deixa de ser obrigatório; exige-se teste automatizado de todo comportamento e de todo critério de aceitação na mesma entrega, em qualquer ordem. |
| 2.1.0  | 2026-11-20 | Stack ampliada para a interface: React Three Fiber/drei, biblioteca de componentes própria (`src/ui/`, CSS Modules, lucide-react), CodeMirror 6 e ferramentas de teste de componentes; regra de reutilização e independência da biblioteca de componentes. |
| 2.2.0  | 2026-11-23 | Stack ampliada com o controlador remoto (feature 009): `WebSocket` padrão no simulador e exemplo de programa externo em Python com `websockets`. |

**Versão**: 2.2.0 | **Ratificada em**: 2026-11-14 | **Última alteração**: 2026-11-23
