# Especificação da feature: Controlador remoto via WebSocket

**Feature**: `009-controle-remoto` | **Criada em**: 2026-11-23 | **Status**: Implementada

**Entrada**: "Controlador remoto via WebSocket, no estilo Player/ROS, para comandar o robô a
partir de um programa externo" (bônus da Trilha 4).

**Requisitos do briefing atendidos**: RB-31 (e RB-02: a simulação continua determinística com
o controlador remoto).

**Depende de**: features 001 (núcleo e API do controlador) e 002 (interface). O núcleo passa a
aceitar um controlador já pronto (uma função), além do código-fonte; nenhuma regra de física,
sensor ou arbitragem muda.

## Contexto e motivação

Hoje a estratégia do robô só pode ser escrita em JavaScript, dentro do simulador. Na equipe,
o código que vai para o robô físico é escrito em outras linguagens, e no Player/Stage e no ROS
o programa do robô roda separado do simulador e conversa com ele pela rede. Com o controlador
remoto, qualquer programa que fale WebSocket (Python, Portugol compilado pelo meuPiá, C, …)
pode comandar um robô da arena, e a mesma lógica pode ser reaproveitada fora do simulador.

## Cenários de usuário e testes *(obrigatório)*

### História de usuário 1 — Comandar um robô por um programa externo, sem interface (Prioridade: P1) 🎯 MVP

O membro da equipe deixa o programa do robô escutando num endereço e roda a simulação pela
linha de comando, indicando que um dos robôs é controlado por esse endereço. A cada tick o
programa recebe as leituras do robô e responde com as velocidades.

Cenários com `dt = 0,05 s`, robô de raio 0,1 iniciando em (0, 0, 0) e sem obstáculos, salvo
indicação:

1. **Dado** um programa externo que sempre responde v = 1,0 e w = 0, **quando** a simulação
   roda 20 ticks com o robô controlado por ele, **então** a pose final é (1,000; 0,000; 0,000),
   a mesma do controlador em JavaScript equivalente (feature 001, US2-AC1).
2. **Dado** um laser de 3 raios com FOV = π e alcance 2,0 diante de uma parede em x = 1,0,
   **quando** o primeiro tick acontece, **então** o programa recebe o tick 1, o tempo 0 e as
   leituras [2,000; 1,000; 2,000], as mesmas que um controlador em JavaScript veria nesse
   tick; recebe também a odometria e os demais sensores do robô.
3. **Dado** o mesmo mundo e o mesmo programa, **quando** a simulação é executada duas vezes,
   **então** os estados são idênticos em todos os ticks: a simulação só avança depois de
   receber a resposta do tick.
4. **Dado** um programa que não responde em 2 s, **quando** o tick espera a resposta, **então**
   o robô fica no estado "erro", com comando (0, 0) e a mensagem "controlador remoto não
   respondeu em 2000 ms (tick N)"; os demais robôs continuam.
5. **Dado** uma resposta fora do formato (texto que não é JSON, ou `v`/`w` ausentes ou não
   numéricos), **quando** é recebida, **então** o robô fica no estado "erro" com uma mensagem
   que explica o formato esperado.
6. **Dado** um endereço em que nenhum programa está escutando, **quando** a simulação é
   pedida, **então** ela não inicia e a mensagem informa o endereço que falhou.
7. **Dado** o fim da execução (ticks pedidos ou partida encerrada pela modalidade), **então**
   o programa recebe uma mensagem de fim com o tick final e o resultado da partida, se houver.

### História de usuário 2 — Conectar um robô remoto na interface (Prioridade: P1)

1. **Dado** o simulador aberto e um programa externo escutando, **quando** o usuário escolhe
   um robô, informa o endereço e aciona "Conectar", **então** o robô passa a ser comandado
   pelo programa, aparece como "remoto" e a simulação recomeça no tick 0.
2. **Dado** um robô remoto, **quando** o usuário aciona "Executar" ou "Avançar um tick",
   **então** cada tick espera a resposta do programa antes de ser desenhado.
3. **Dado** um robô remoto, **quando** a conexão cai ou o programa não responde, **então** a
   simulação pausa e a interface mostra o erro.
4. **Dado** um robô remoto, **quando** o usuário aciona "Desconectar", **então** o robô volta
   ao controlador em JavaScript e a simulação recomeça no tick 0.

### História de usuário 3 — Programa de exemplo (Prioridade: P2)

1. **Dado** o exemplo de Sumô Mini, **quando** o robô "sheep" é ligado ao programa de exemplo
   em Python, **então** ele procura o oponente com o laser, avança quando o encontra e recua ao
   ver a borda branca, como a estratégia "busca e ataque" em JavaScript.

### Casos de borda

- Reiniciar a simulação com robô remoto reenvia o início ao programa (ele pode zerar a própria
  memória).
- Comandos acima da velocidade máxima do robô são saturados, como no controlador em
  JavaScript.
- Um robô remoto e outro em JavaScript podem disputar a mesma partida.

## Requisitos *(obrigatório)*

- **FR-001**: O sistema DEVE permitir que um robô seja controlado por um programa externo num
  endereço WebSocket, na linha de comando e na interface. *(RB-31)*
- **FR-002**: A cada tick, o programa externo DEVE receber o tick, o tempo, as leituras de
  todos os sensores e a odometria do robô, iguais às que a API em JavaScript entregaria
  naquele tick. *(RB-31)*
- **FR-003**: A simulação DEVE avançar um tick somente após a resposta do programa (v, w),
  mantendo o resultado determinístico. *(RB-02, RB-31)*
- **FR-004**: Falta de resposta em 2 s, resposta inválida ou queda da conexão DEVEM colocar
  somente aquele robô em "erro", com comando (0, 0) e mensagem clara; endereço inacessível
  DEVE impedir o início. *(RB-31)*
- **FR-005**: O programa externo DEVE receber o início (robô, sensores e `dt`) e o fim (tick
  final e resultado da partida). *(RB-31)*
- **FR-006**: O repositório DEVE trazer um programa de exemplo em Python e a descrição das
  mensagens. *(RB-31)*

## Critérios de sucesso *(obrigatório)*

- **SC-001**: Os cenários numéricos da US1 são reproduzidos com tolerância de 0,001.
- **SC-002**: Um membro da equipe liga um programa próprio a um robô em até 10 minutos,
  usando só a descrição das mensagens.

## Premissas e limites

- O simulador conecta-se ao programa (o programa é quem escuta), porque o navegador não pode
  abrir uma porta.
- A velocidade da simulação fica limitada pela rede: cada tick espera uma ida e volta.
- Sem autenticação: uso em rede local da equipe.
