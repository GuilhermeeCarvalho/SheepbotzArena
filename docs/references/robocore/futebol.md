Site referencia de regras: https://events.robocore.net/rules

Fonte (PDF oficial): https://robocore-eventos.s3.sa-east-1.amazonaws.com/public/RoboCore_Futebol_Mini_VSS_Regras.pdf

> **Fonte é RoboCore.** A RoboCore tem categoria de futebol de robôs autônomos: **Futebol Mini / VSSS** (Very Small Size Soccer, robôs físicos com visão global). Por isso **não** foi usada a regra IEEE VSSS da CBR/LARC.
> Outras categorias da RoboCore relacionadas, não usadas como base:
> - **Hockey de Robôs** (`Regras+-+Hockey.pdf`, revisado 15/01/2024): "Especificações de Controle: Rádio-Controlados" — **não é autônomo**. Resumo no fim deste documento.
> - **Futebol Simulation Mini** (`RoboCore_Futebol_Simulation_Mini_Regras.pdf`, revisado 01/12/2023): mesma base de regras do Mini, porém no simulador FIRASim, com "no máximo, 5 robôs" por time.
> - **Futebol Simulation 2D** (`Regras+-+Futebol+Simulation+2D.pdf`, revisado 01/12/2023): RoboCup Soccer 2D (RCSSServer 18.0.0); só regras de torneio, sem geometria de campo.
>
> Escopo: apenas o que um simulador 2D precisa. Regras de visão/câmera física, transmissão de dados, uniforme e logística do torneio foram omitidas ou reduzidas.

## Futebol de Robôs | Mini (VSSS)
# Documento Revisado 27/05/2025 - Versão 3.0 - Português Brasil

# Definições / Termos

● Goleiro: 3.2.3 Um robô dentro da área do próprio gol (item 2.4) é considerado como "goleiro". O papel de goleiro pode ser trocado dinamicamente durante a disputa, assim um robô dentro da sua própria área sempre é considerado como goleiro.

● Situação de ataque: 9.2 Define-se ataque com a presença de um jogador atacante e a bola simultaneamente dentro da área. Para tal, 100% da bola deve ocupar a área, bem como qualquer parte do jogador, considerando também a linha que a define e o jogador deve estar próximo a bola, a distância de 8 cm. Além disso, toda vez que a bola sair e entrar na área, é iniciado um novo ataque.

● Saída falsa: 10 Será considerada uma saída falsa quando o robô iniciar uma jogada antes do aviso do árbitro. A saída falsa pode ocorrer em todos os momentos de bola parada. [...] Apenas no caso da bola "livre" não existe um time com posse.

● Walkover (WO): 8.3 Caso uma equipe não compareça ao campo ou não tenha robôs em condições de jogo, será denominado WO. [...]

● Bola livre (Free Ball / FB), Tiro livre (TL), Pênalti (PK), Tiro de meta: ver itens 12 a 15.

# Especificação do Campo e da Bola (item 2)

2.1 É composto por uma chapa plana e rígida de madeira, nas medidas 150x130 cm, em fórmica preta fosca (não reflexiva) com laterais medindo 5cm de altura por 2,5cm de largura. A parte superior das laterais deve ser na cor preta (a mesma cor do campo) e as paredes na cor branca. Quatro triângulos isósceles sólidos com 7x7cm são fixados nos cantos do campo, para evitar que a bola fique presa nestas regiões. A textura do campo é similar à uma mesa de ping-pong.

2.2 O campo tem marcações como podem ser vistas na Figura 1. O círculo central tem 20cm de raio. O arco, que faz parte da área do gol, tem 20cm junto à linha do gol e 5cm na direção perpendicular. As linhas centrais (centro e bordas da área do gol e do círculo de meio campo) devem ser de 3mm de espessura.

2.3 O gol tem 40 x 10cm, esses 10cm estão além dos 150cm do campo.

2.4 A área do gol compreende a área de um retângulo (medindo 70x15cm, na frente do gol) e um arco associado ao centro da linha (20cm junto à linha do gol e 5cm na direção perpendicular). Deve ter ainda uma linha exatamente na entrada do gol, com 40cm de largura.

2.5 A bola utilizada no simulador deve ser configurada e definida como laranja, com aproximadamente 42.7mm de diâmetro e 46g de massa (bola de golfe utilizada na neve), para evitar problemas de visão entre as equipes.

Lacunas da fonte (campo):
- Coordenadas das marcas de **tiro livre (TL)**, **pênalti (PK)**, **tiro de meta** e **bola livre (FB)**: NÃO ENCONTRADO na fonte em texto (aparecem apenas nas Figuras 1 a 5, sem cotas extraíveis).
- Orientação do retângulo 70x15 cm (qual lado é paralelo à linha de fundo): o texto não explicita; interpretação usual é 70 cm ao longo da linha do gol e 15 cm para dentro do campo — confirmar na Figura 1.
- Cor das linhas de marcação: NÃO ENCONTRADO na fonte (presumivelmente brancas, não declarado).

# Jogadores / Robôs (item 3)

3.1 Uma partida deve ser disputada por dois times, cada qual constituído de no mínimo 1 robô e, no máximo, 3 robôs. Um dos robôs pode ser o goleiro. [...]

3.2.1 O tamanho de cada robô deve ser limitado a 7,5 x 7,5 x 7,5cm. A altura da antena de radiofrequência não deve ser considerada neste limite. Os robôs podem vestir uniformes, desde que o tamanho final com o uniforme seja limitado a 8 x 8 x 8cm. [...]

3.2.2 A parte superior dos robôs não deve conter as cores laranja, branco ou cinza [...]. Uma cor, que pode ser azul ou amarelo, a ser definido pelos organizadores, identifica times distintos e deve ser posicionada em uma região do topo do robô. [...]

3.3 [...] Cada time tem direito a 2 tempos técnicos por partida, cada um com duração máxima de 2 minutos.

4 [...] Não é permitido o controle direto de seus robôs através de teclados ou joysticks, sob quaisquer circunstâncias. Enquanto o jogo estiver em progresso, o computador "host" pode mandar qualquer informação autonomamente.

- Massa máxima do robô: NÃO ENCONTRADO na fonte (a regra não impõe limite de massa).

# Duração e Início do Jogo (itens 6 e 7)

6 Cada partida terá 2 períodos iguais, cada qual com 5 minutos, com um intervalo de meio tempo de 5 minutos. [...] Se um time não estiver pronto para voltar ao jogo depois do meio tempo, minutos adicionais deverão ser permitidos, sendo no máximo 5 minutos. Se depois do tempo adicional um time ainda não estiver pronto para começar o jogo, esse time será desqualificado do jogo.

7 Antes de se começar o jogo, a cor do time ou a posse inicial de bola serão decididos utilizando-se uma moeda (cara ou coroa) ou pelo consenso entre as equipes. [...] No começo, ou em qualquer reinício de jogo, é permitido ao time atacante (i.e., aquele que tem a posse de bola) posicionar os robôs livremente em sua própria área e dentro do círculo central. O time defensor pode posicionar livremente seus robôs em sua própria área, exceto dentro do círculo central. A bola deverá ser posicionada dentro do círculo central e, com um sinal do árbitro, os robôs podem se mover livremente.

# Pontuação e Vitória (item 8)

8.1 Vencedor: Um gol deverá ser computado quando a bola passar inteira por cima da linha do gol. O vencedor de um jogo deverá ser escolhido com base no número de gols computados (saldo).

8.2 Desempate: No caso de um empate após o segundo tempo e, se as regras da competição não permitirem um empate neste momento da disputa, o ganhador será decidido no esquema de prorrogação. Após um intervalo de 5 minutos (se for necessário), o jogo será continuado por dois períodos de 3 minutos. Se o empate persistir após a prorrogação, o vencedor será decidido no gol de ouro, ou seja, até o primeiro jogador fazer um gol, com o tempo rodando livremente.

8.3 Walkover (WO): [...] a equipe adversária deve entrar em campo durante três minutos e será considerado o placar que a equipe conseguir alcançar até o final do tempo. [...] Não é permitida a permanência de jogadores parados em campo. A equipe que declara WO recebe a pontuação de 0 e o saldo negativo de acordo com o placar final do jogo.
Obs. 1: Caso ambas as equipes declarem WO, ambas vão receber a pontuação -1 e saldo de 10 gols sofridos. [...]
Obs. 2: Se uma equipe entrar em campo após o adversário declarar WO e não conseguir nenhum gol nos 3 minutos, o juiz deve declarar WO duplo.

1.3 (Fase eliminatória) [...] Caso permaneça um empate no placar agregado, terá uma prorrogação e caso persistir, pênaltis.

- Pontos por vitória/empate/derrota na fase de grupos: NÃO ENCONTRADO na fonte (o Futebol Simulation Mini usa 3/1/0, item 1.2 daquele documento).

# Faltas (item 9)

9.1 Faltas Pessoais — [...] o juiz anotará apenas quando perceber que as colisões atrapalham o andamento da partida. [...] um freeball deve ser anunciado no mesmo quadrante em que ocorreu o acidente, com a vantagem para o time que teve o robô tombado. É permitido empurrar bola e o robô adversário, contanto que a bola esteja entre ambos. Quando um goleiro tem a posse de bola sem disputar, ele deve chutar para fora de sua área de gol dentro de, no máximo, 5 segundos. Se não o fizer, será penalizado com um pênalti dado para o time adversário. Se um atacante disputar a bola com o goleiro durante este tempo, a contagem é reiniciada. Porém, se o atacante bloquear o goleiro, será considerado tiro de meta.

9.2.1 Falta de Ataque — Um time atacante com mais de um robô na área do gol do time adversário, deve ser penalizado com um tiro de meta, durante uma situação de ataque. O segundo robô atacante na área do gol deve efetivamente participar da jogada para que seja considerada a falta. Ou seja, será marcada a falta no caso do 2º jogador atacante:
● Tocar em qualquer jogador em situação de ataque;
● Tocar, em qualquer momento, na bola.
Bloquear o goleiro do time adversário, com um segundo jogador, na sua respectiva área, acarretará tiro de meta e será cobrado pelo time do goleiro.

9.2.2 Falta de Defesa — Um time defendendo com mais de um robô na área do gol deve ser penalizado com um pênalti, exceto se o time atacante marcar um gol. É permitido empurrar o robô goleiro na área do gol, exclusivamente para caso a bola estiver entre o goleiro e o robô atacante. O segundo robô na área do gol deve efetivamente participar da jogada para que seja considerada a falta. [...]
Obs.2: Caso o segundo jogador esteja disputando a bola e for empurrado para dentro da área, o time não será penalizado com o pênalti.

(Nota: o sumário do PDF lista "9.2 Falta de Ataque" e "9.3 Falta de Defesa", mas o corpo do texto numera como 9.2 Situação de Ataque, 9.2.1 e 9.2.2. Aqui segue o corpo do texto.)

# Saída Falsa (item 10) — penalidade na reincidência

Em todos os casos, na primeira vez em que a infração ocorre o time recebe uma advertência, os jogadores são reposicionados e a partida é reiniciada.

10.1 Início e reinício de jogo (kick off)
● Time atacante: primeiramente, troca-se a posse de bola e em uma nova reincidência, é marcado um tiro livre.
● Time defensor: primeiramente o time é posicionado na beira da sua área e, em uma nova reincidência, é marcado um tiro livre.

10.2 Pênalti
● Time atacante: é marcado Bola livre e o time perde o pênalti
● Time defensor: o goleiro é advertido com um cartão amarelo e, em uma nova reincidência, é excluído de jogo. Ele não será substituído e será mantido fora por 30 segundos de jogo corrido ou até que o adversário faça um gol.

10.3 Tiro Livre
● Time atacante: inverte-se a posse de bola e o time atacante deve ser completamente posicionado em seu campo de defesa.
● Time defensor: é marcado um pênalti para o outro time.

10.4 Bola Livre (Free Ball)
● Marcado um tiro livre para o outro time

# Interrupções e Reinícios (itens 11 a 15)

11 O jogo deverá ser interrompido e os robôs devem ser reposicionados quando:
● Um robô caiu de maneira a bloquear o gol;
● Foi marcado um gol ou uma falta;
● O juiz ordena chute livre, pênalti, tiro de meta ou bola livre.

12 Tiro Livre — [...] A bola será posicionada na posição relevante para o tiro livre (TL) no campo. O robô que irá chutar deverá ser posicionado atrás da bola. O time com posse de bola pode posicionar os seus robôs livremente no seu lado do campo. Depois, o time sem a posse pode se posicionar em contato com a área do gol ou em qualquer lado do arco. Caso não se posicione corretamente, o time será advertido. Reincidindo o erro, será marcado um pênalti a favor do time com a posse de bola.

13 Pênalti — [...] a bola será posicionada na posição relevante para a cobrança de pênalti (PK) no campo. O robô que cobrar o pênalti deverá ser colocado atrás da bola. Durante a cobrança, um dos lados do goleiro deve estar inteiramente em contato com a linha do gol. O goleiro pode ser orientado em qualquer direção. Outros robôs deverão ser posicionados livremente dentro do outro lado a partir da linha do meio, mas o time que está defendendo o pênalti deve ser o último a se posicionar. [...] No caso de uma disputa de pênaltis após uma prorrogação, apenas um jogador de cada equipe será colocado na arena [...].

14 Tiro de meta — O tiro de meta deverá ser declarado sob as seguintes situações:
● Quando um robô atacante empurrar o goleiro dentro da área de defesa, sem a disputa de bola;
● Atacar com mais de 1 robô dentro da área de gol do time adversário;
● Quando um impasse ocorre na área do gol durante, pelo menos, 5 segundos, em que goleiro e algum outro jogador disputam ativamente pela bola.
É permitido apenas ao goleiro permanecer dentro da área do gol, e a bola deve ser alinhada ao centro do gol, dentro da área, na posição relevante ao tiro de meta. Outros robôs do time devem ser posicionados fora da área do gol e os jogadores adversários devem permanecer atrás da linha do meio de campo. No entanto, um deles pode ser posicionado após a linha, desde que esteja em contato com esta e fora do círculo central. O outro jogador pode ser posicionado dentro do círculo central. Somente o goleiro bate o tiro de meta, respeitando a Regra 9. [...]

15 Bola livre — O árbitro declarará bola livre quando a bola ficar parada por 5 segundos fora de qualquer uma das duas áreas de gol. Quando uma bola livre é declarada, os robôs devem parar e a bola será posicionada pelo árbitro em posição relevante para a cobrança de bola livre (FB), respeitando o quadrante do campo em que o impasse ocorreu, inicialmente, e, caso haja um robô obstruindo a posição da bola, este deverá se posicionar no ponto de freeball, com seu centroide alinhado com a marcação, perpendicularmente em relação ao campo. Em caso de reincidência para o mesmo quadrante, sem que a bola tenha se movimentado na jogada, esta será posicionada no ponto central do campo, sem a movimentação dos jogadores. No caso de uma terceira ocorrência de bola livre, os jogadores deverão ser reposicionados livremente, exceto dentro da área do círculo central, respeitando a Figura 5.

- Distância exata de posicionamento dos robôs em relação à marca de bola livre (Futebol Mini): NÃO ENCONTRADO na fonte. (O Futebol Simulation Mini, item 15, usa: "Todos os robôs que estão a menos de 25 cm de distância da marca de bola livre devem ser movidos para o quadrante de seu campo [...]".)

# Desclassificação

9.1 [...] Caso seja constatado o envio [de mensagem direta do operador ao robô sem autorização] em qualquer outro momento o jogo será imediatamente parado para análise e a penalidade pode ser um pênalti para o time adversário até a desclassificação do time que cometeu a infração.

10 Obs.: Se o juiz perceber que uma equipe abusa deliberadamente das saídas falsas, a punição pode ser mais severa, chegando à declaração de derrota da equipe por W.O.

---

## Referência: Hockey de Robôs (RoboCore, rádio-controlado — NÃO autônomo)
# Documento Revisado 15/01/2024

Fonte: https://robocore-eventos.s3.sa-east-1.amazonaws.com/public/Regras+-+Hockey.pdf

● Número de Robôs por Partida: Seis (três em cada time)
● Duração da Partida: 5 minutos
● Especificações de Controle: Rádio-Controlados

2.2 Classe / Dimensões / Peso:
- Micro: 20cm (8") máx. largura/comprimento — 454g (1 lb)
- Mini: 45cm (18") máx. largura/comprimento — 3,4 kg (7,5 lb)
- Pro: 45cm (18") máx. largura/comprimento — 6,8 kg (15 lb)

3.1.1 (Pro e Mini) O ringue tem 7,3 m (24 pés) de comprimento por 3,7 m (12 pés) de largura, com curvas de 1,2 m (4 pés) de diâmetro nos cantos.
3.1.2 Os gols têm 1,3 m (4.2 pés) x 0,6 m (2 pés), situados nas paredes do fundo, centrados na largura e de frente para o centro do ringue.
3.1.5 O disco ou puck segue o padrão internacional de 3" x 1", ou 7,6 cm por 2,5 cm.
3.2.1 (Micro) [...] no mínimo 2,93 m (9,6 pés) e no máximo 3,66 m (12 pés) de comprimento por no mínimo 1,46 m (4,8 pés) e no máximo 1,83 m (6 pés) de largura, com curvas de 0,24 a 0,3 m de diâmetro nos cantos.
3.2.2 Os gols têm 0,52 m (1.7 pés) x 0,18 m (0,6 pés) [...].
3.2.5 O disco ou puck com o tamanho de 1 ¼" x ½", ou 3,17 cm por 1,27 cm.

4.2.1 A partida começa com todos os robôs de cada time em sua metade do ringue fora do círculo central. O juiz joga o disco aproximadamente no centro e a partida começa.
4.2.5 O disco deve ultrapassar completamente a linha do gol, por dentro das traves, para que um gol seja marcado.
4.2.6 Discos arremessados ou revirados para fora do ringue geram um gol de penalidade a ser computado contra o time que arremessou ou que levou o disco a sair do ringue. [...]
4.2.8 O vencedor da partida é o time com o maior número de gols.
4.4 Não há empates no hockey de robôs. Se a pontuação terminar empatada, a partida entra em tempo adicional com morte súbita. [...] O primeiro time a marcar um gol será considerado o vencedor.
4.5.2 Se todos os robôs de um dos times que estiverem dentro da arena ficarem incapacitados, a partida será finalizada e esta equipe será declarada perdedora, não importando o número de gols. Caso a equipe declarada vencedora esteja perdendo no placar, será concedido o placar fixo de 3 x 0.

- Raio do círculo central do ringue de Hockey: NÃO ENCONTRADO na fonte.
