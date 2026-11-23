# Especificação da feature: Tela inicial

Feature: `010-tela-inicial` | Criada em: 2026-11-23 | Status: Planejada

Requisitos do briefing atendidos: RB-27.

Depende de: feature 002 (interface e exemplos) e dos exemplos das modalidades (features 004, 006, 007 e 008). O núcleo não muda.

## Contexto e motivação

Hoje a aplicação abre direto no simulador, já com o primeiro exemplo carregado. Quem chega pela primeira vez (um novo membro da equipe, um avaliador, o público de uma apresentação) não sabe o que é a ferramenta nem quais modalidades ela oferece, e precisa descobrir sozinho a lista de mundos na barra superior. A tela inicial apresenta o simulador em poucas palavras e leva o usuário, em no máximo duas escolhas, ao exemplo da modalidade que lhe interessa.

## Cenários de usuário e testes

### História de usuário 1 - Apresentação e entrada no simulador (P1)

Ao abrir a aplicação, o usuário vê uma tela de boas-vindas com a identidade da SheepBotz e um atalho para começar.

1. Dado que o usuário abre a aplicação, então vê a tela inicial (e não o simulador) com o logo, o nome "SheepBotz Arena", uma frase sobre o propósito do simulador e o botão "Abrir simulador".
2. Dado a tela inicial, quando o usuário aciona "Abrir simulador", então o simulador abre no primeiro exemplo, pausado no tick 0 (como na feature 002, US4-AC1).
3. Dado o tema escolhido pelo usuário (claro ou escuro), então a tela inicial usa o mesmo tema do simulador e permite alterná-lo; a escolha vale para as duas telas.

### História de usuário 2 - Escolher modalidade e exemplo (P1)

O usuário vê as modalidades disponíveis e entra direto num exemplo de uma delas.

1. Dado a tela inicial, então as modalidades aparecem nesta ordem: Sumô, Seguidor de Linha, Trekking, Futebol de robôs e Livre (mundos sem modalidade), cada uma com uma descrição curta e a quantidade de exemplos. O Sumô aparece marcado como foco da equipe.
2. Dado os exemplos do repositório, então as quantidades exibidas são: Sumô 7, Seguidor de Linha 5, Trekking 3, Futebol de robôs 4 e Livre 2.
3. Dado a tela inicial, quando o usuário escolhe uma modalidade, então vê a lista dos exemplos dela pelo nome; quando escolhe um exemplo, o simulador abre nesse exemplo, pausado no tick 0.
4. Dado uma modalidade sem nenhum exemplo, então ela não aparece na tela inicial.

As categorias de cada modalidade são agrupadas sob ela: Mega, Mini e LEGO® em Sumô; Pro e Júnior em Seguidor de Linha; Mini / VSS em Futebol de robôs. Um mundo sem modalidade, ou com uma modalidade que a tela inicial não conhece, entra em Livre.

### História de usuário 3 - Voltar à tela inicial (P2)

1. Dado o simulador aberto, quando o usuário aciona "Tela inicial" na barra superior, então volta à tela inicial.
2. Dado que o usuário voltou à tela inicial, quando escolhe outro exemplo (ou o mesmo), então o simulador abre nesse exemplo a partir do tick 0; a simulação anterior não é mantida.

### Casos de borda

- Recarregar a página sempre volta à tela inicial.
- Selecionar outro mundo pela lista da barra superior continua funcionando dentro do simulador, sem passar pela tela inicial.

## Requisitos

- FR-001: Ao abrir, a aplicação DEVE mostrar a tela inicial com logo, nome, frase de propósito e o botão "Abrir simulador". *(RB-27)*
- FR-002: "Abrir simulador" DEVE abrir o simulador no primeiro exemplo, pausado no tick 0. *(RB-27)*
- FR-003: A tela inicial DEVE listar as modalidades com exemplos, na ordem e com as quantidades da US2, destacando o Sumô como foco da equipe. *(RB-23, RB-27)*
- FR-004: Escolher um exemplo de uma modalidade DEVE abrir o simulador nesse exemplo, pausado no tick 0. *(RB-27)*
- FR-005: O simulador DEVE oferecer a ação "Tela inicial", que volta à tela inicial sem manter a simulação. *(RB-27)*
- FR-006: A tela inicial DEVE compartilhar o tema (claro ou escuro) com o simulador e permitir alterná-lo. *(RB-27)*

## Critérios de sucesso

- SC-001: A partir da tela inicial, qualquer exemplo do repositório é aberto com no máximo duas escolhas (modalidade e exemplo).
- SC-002: 100% dos exemplos do repositório aparecem em exatamente uma modalidade da tela inicial.

## Premissas e limites

- Não há login nem contas de usuário: a ferramenta é de uso interno da equipe e não guarda dados pessoais (decisão Q-16).
- A tela inicial não lembra a última simulação aberta.
