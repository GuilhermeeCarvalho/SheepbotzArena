<!--
Relatório de impacto da sincronização — material temporário para revisão humana.
Remover este comentário antes de confirmar a constituição no controle de versão.
Versão: modelo sem versão → 1.0.0 (adoção inicial).
Princípios preenchidos a partir dos cinco espaços do modelo:
- I. Simulação matemática e física em 2D com visualização em 3D.
- II. Rastreabilidade às regras da RoboCore.
- III. Desenvolvimento orientado por testes.
- IV. Código limpo e responsabilidades explícitas.
- V. Português na comunicação e inglês no código.
Seções adicionadas: Escopo e restrições do produto; Fluxo de desenvolvimento e revisão;
Governança (preenchimento das seções do modelo).
Seções removidas: nenhuma.
Pendências de preenchimento: nenhuma.
Intenção adiada: especificar e desenvolver o simulador web de sumô autônomo.
-->
# Constituição do SheepbotzArena

## Princípios fundamentais

### I. Simulação matemática e física em 2D com visualização em 3D

Toda lógica matemática e física da simulação DEVE operar em duas dimensões.
O estado dos robôs, as interações com a arena, as leituras simuladas dos sensores e
os resultados das partidas DEVEM derivar desse modelo 2D. A visualização das batalhas
DEVE ser tridimensional e consumir o estado da simulação, sem decidir colisões,
leituras de sensores ou resultados por meio de física 3D.

O núcleo da simulação DEVE ser executável e testável sem renderização. Alterar a
frequência de renderização NÃO DEVE alterar o resultado para as mesmas condições e
entradas simuladas. Essa separação permite validar estratégias sem depender da interface.

### II. Rastreabilidade às regras da RoboCore

Toda especificação que dependa de regras oficiais das partidas, dos robôs ou das arenas
DEVE consultar `./docs/references/RobocoreRules.Md`. A especificação DEVE identificar a
categoria abrangida e citar os artigos, notas ou seções que fundamentam seus requisitos.
Parâmetros de categorias diferentes NÃO DEVEM ser combinados implicitamente.

Qualquer ambiguidade, conflito ou lacuna relevante DEVE ser registrado na própria
especificação, acompanhado da interpretação adotada, da justificativa e dos efeitos
nos critérios de aceitação. Uma hipótese de simulação NÃO DEVE ser apresentada como
regra oficial. A tradução de eventos físicos para o modelo 2D também DEVE explicitar
as simplificações necessárias quando afetar a aplicação das regras.

Alterações da referência DEVEM motivar revisão das especificações e dos testes afetados
antes da incorporação de novos comportamentos regulamentares.

### III. Desenvolvimento orientado por testes

Todo comportamento novo ou alterado DEVE seguir TDD: escrever um teste que expresse o
comportamento esperado, executá-lo e observar sua falha pelo motivo esperado, implementar
o mínimo para fazê-lo passar e refatorar mantendo os testes aprovados.
Correções de defeitos DEVEM começar por um teste que reproduza o problema.

Os testes DEVEM verificar comportamentos observáveis e critérios de aceitação, incluindo
casos de fronteira pertinentes à física, aos sensores e à aplicação das regras.
Integrações entre simulação, estratégias, arbitragem e visualização DEVEM ter testes
quando seus contratos forem introduzidos ou alterados. O tempo simulado e eventuais
fontes de aleatoriedade DEVEM ser controláveis nos testes para permitir reprodução.

Cada entrega DEVE registrar evidências do ciclo de falha e sucesso e executar os testes
afetados, além das verificações automatizadas exigidas pelo projeto. Testes reprovados
DEVEM ser resolvidos antes da integração da entrega.

### IV. Código limpo e responsabilidades explícitas

O código DEVE usar nomes que expressem intenção, unidades com responsabilidade definida
e contratos explícitos entre regras de domínio, simulação, estratégias e apresentação.
Regras de negócio NÃO DEVEM ficar acopladas à interface ou ao mecanismo de renderização.

Constantes físicas e parâmetros regulamentares DEVEM ter nomes, unidades e origem
identificáveis. Duplicação de regras DEVE ser eliminada em favor de uma definição
compartilhada. Abstrações e dependências novas DEVEM responder a uma necessidade
demonstrada na especificação ou na implementação, com justificativa na revisão.
Refatorações DEVEM preservar o comportamento verificado pelos testes.

### V. Português na comunicação e inglês no código

Toda documentação produzida pelo projeto, incluindo especificações, planos, registros
de decisões e instruções, DEVE estar em português. Comentários de código, documentação
embutida e textos apresentados pela interface também DEVEM estar em português.

Identificadores de código, incluindo variáveis, funções, classes, módulos e identificadores
de testes, DEVEM estar em inglês. Textos de interface permanecem em português mesmo quando
armazenados no código. Nomes próprios, identificadores de APIs externas e trechos citados
de referências DEVEM preservar sua grafia original, com explicação em português quando
necessária. A revisão DEVE verificar essas convenções nos artefatos alterados.

## Escopo e restrições do produto

O SheepbotzArena destina-se a uma equipe de robótica que precisa testar estratégias de
sumô autônomo, reduzindo testes manuais e desgaste dos robôs físicos. Seu escopo de produto
é um sistema web que simula a arena, os sensores e partidas individuais entre dois robôs,
com lógica matemática e física em 2D e visualização das batalhas em 3D.

As estratégias DEVEM decidir as ações dos robôs autonomamente a partir das entradas
definidas pela especificação. Cada funcionalidade DEVE declarar os sensores modelados,
suas limitações, as condições iniciais e os parâmetros necessários para reproduzir os
cenários de teste. Aproximações físicas DEVEM ser documentadas com seus limites de uso;
a simulação NÃO DEVE ser descrita como validação de fenômenos que não modela.

A categoria de sumô, os parâmetros da arena e os critérios de arbitragem DEVEM ser
definidos nas especificações correspondentes com base na referência regulamentar.
Esta constituição não seleciona uma categoria nem uma tecnologia de implementação.

## Fluxo de desenvolvimento e revisão

1. Antes da implementação, elaborar uma especificação em português com objetivo,
   cenários, critérios de aceitação e limites do modelo. Consultar e citar a referência
   da RoboCore sempre que houver dependência de regras; registrar interpretações adotadas.
2. No planejamento, identificar responsabilidades, contratos, unidades físicas e a
   estratégia de testes, demonstrando a separação entre simulação 2D e apresentação 3D.
3. Implementar por incrementos usando o ciclo de TDD e registrar as verificações realizadas.
4. Na revisão, verificar rastreabilidade regulamentar, critérios de aceitação, testes,
   responsabilidades do código, convenções de idioma e documentação das simplificações.
5. Integrar somente após aprovação da revisão e das verificações exigidas. Desvios desta
   constituição DEVEM ser resolvidos ou submetidos ao procedimento de emenda antes da integração.

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
preservando a data da ratificação inicial.

As revisões DEVEM identificar especificações e demais artefatos afetados por emendas e
registrar as adequações necessárias. O relatório de impacto no início do arquivo é
material temporário de revisão e DEVE ser removido antes de confirmar a emenda no
controle de versão.

**Versão**: 1.0.0 | **Ratificada em**: 2026-11-14 | **Última alteração**: 2026-11-14
