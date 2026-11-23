Site referencia de regras: https://events.robocore.net/rules

Fonte (PDF oficial): https://robocore-eventos.s3.sa-east-1.amazonaws.com/public/Regras+-+Trekking.pdf

Fonte complementar (labirinto): https://robocore-eventos.s3.sa-east-1.amazonaws.com/public/RoboCore_Micromouse_Regras.pdf

> Escopo: apenas o que um simulador 2D precisa (termos, ambiente, marcos, obstáculos, robô, partida, pontuação e penalidades). Regras de inspeção, failsafe, dispositivos de segurança e logística foram omitidas.
> O índice da RoboCore (consultado em 20/11/2026) **não tem** categoria de resgate. A categoria de labirinto existente é o **Micromouse**, incluída no fim deste documento como referência complementar. Para "arena com obstáculos e alvos", o **Trekking** é a categoria mais próxima (marcos = alvos, obstáculos livres no campo); o Micromouse é um labirinto em grade.

## Robô Trekking (Pro)
# Documento Revisado 20/12/2023

# Resumo (item 1. Introdução)

● Nome da Modalidade: Robô Trekking
● Número de Robôs por Partida: Um
● Duração da Partida: 10 minutos
● Classes Disponíveis: Pro
● Dimensões máximas dos Robôs: 500x500x500mm
● Especificações do Circuito: Verificar item 3 "O Ambiente"
● Especificações de Controle: Autônomo

# Definições / Termos

● Marco: 3.4 Há 04 (quatro) marcos definidos por uma chapa de metal de cor amarela de dimensões aproximadas: 1000mm x 1000mm x 2mm. O robô deverá ser capaz de subir e identificar tais marcos.

● Passagem opcional: 3.8 O campo pode conter passagens opcionais, que conferem uma bonificação de tempo para o robô que as atravessarem. Essa bonificação é fornecida como um multiplicador no tempo final da tomada [...].

● Tomada de tempo oficial: 4.12 É considerada uma tomada de tempo oficial toda vez que o robô partir do marco 01 (um) e o juiz da competição iniciar a contagem do tempo.

● Partida: 4.11 Cada robô terá o direito a três tomadas de tempo oficiais por dia de competição. Estas tomadas de tempo serão consecutivas caracterizando uma PARTIDA.

● False start: 4.13 [...] Se após este tempo o robô permanecer imóvel, será considerado um false start e a tomada de tempo será cancelada.

# Especificação do Ambiente (item 3)

3.1 A competição poderá ser realizada tanto em ambiente fechado quanto em ambiente aberto. O piso pode apresentar desníveis, vãos, buracos e rampas. Obstáculos e variações de terreno podem ainda ser incluídos no ambiente como parte do desafio, como pedras, terra, areia, desníveis e objetos. O robô deverá ser capaz de superar todos os obstáculos (sem qualquer intervenção humana).

3.4 Há 04 (quatro) marcos definidos por uma chapa de metal de cor amarela de dimensões aproximadas: 1000mm x 1000mm x 2mm. O robô deverá ser capaz de subir e identificar tais marcos.

3.5 Poderá ser solicitado à organização a adição de cones de sinalização nas cores laranja e branca com altura de 50 cm, conforme Figura 1, no centro dos marcos descrito no item 3.4.

3.6 No piso em que ocorrerá a competição poderão haver linhas e demarcações diversas.

3.7 Obstáculos podem ser adicionados em todo o campo para dificultar a navegação dos robôs até os marcos. Os obstáculos deverão ficar a uma distância mínima de um metro do centro dos marcos e não possuem um tamanho pré-definido, porém, estes deverão ser contornados, não sendo permitido remover, bater, arrastar ou transpor tais obstáculos.

3.8 [...] o peso de cada passagem será divulgada junto da disposição dos 4 marcos no ambiente. Por exemplo, se uma passagem possui multiplicador 0.5 e um robô que o atingir tiver terminado o percurso em 100 segundos, o tempo final considerado será de 100*0.5 = 50 segundos.

3.9 As bonificações são cumulativas. Por exemplo se o robô passou por uma passagem de multiplicador 0.8 e outra passagem de multiplicador 0.5, a bonificação final será 0.8*0.5 = 0.4.

3.10 Cada passagem opcional concederá no máximo uma única bonificação, independente de quantas vezes o robô passe por ela.

3.12 Para uma passagem opcional será designada uma linha reta de dimensão não inferior a 600 mm. O robô deverá atravessar completamente a linha da passagem para que a bonificação seja considerada. A travessia pode acontecer em qualquer sentido normal a linha da passagem.

Apêndice A (recomendações, **não obrigatórias** — "não precisam ser seguidas como as regras apresentadas anteriormente"):

A.2 O contorno do ambiente deve ser um polígono convexo, podendo conter segmentos que não sejam linhas retas. Preferencialmente, o ambiente deve ser um paralelogramo.

A.3 A linha de visão entre o marco 03 e o marco 04 deve conter obstáculos que impossibilitem a navegação em linha reta entre eles.

A.4 A primeira passagem opcional deve ser posicionada de forma a oferecer um pequeno desvio do melhor caminho que liga os marcos. A bonificação dessa passagem deve estar entre 0.8 e 0.9.

A.5 A segunda passagem opcional deve ser posicionada de forma a oferecer um desvio significativo do melhor caminho que liga os marcos a bonificação dessa passagem deve estar entre 0.5 e 0.7.

A.6 A terceira passagem opcional deve ser posicionada de forma a oferecer um desafio de navegação e detecção de obstáculos. A bonificação dessa passagem deve estar entre 0.1 e 0.2.

Lacunas da fonte (ambiente):
- Dimensões da área do Trekking (largura x comprimento do campo): NÃO ENCONTRADO na fonte.
- Distância mínima entre marcos / posições dos marcos: NÃO ENCONTRADO na fonte (4.1: "posicionados aleatoriamente no ambiente").
- Tamanho dos obstáculos: NÃO ENCONTRADO na fonte (3.7: "não possuem um tamanho pré-definido").
- Número de passagens opcionais: não fixado em regra; o Apêndice A recomenda três.

# Especificações dos Robôs (item 2)

2.1 O robô deve ser totalmente autônomo, terrestre e com todos os componentes embarcados, não podendo ser controlado externamente por fio, rádio ou qualquer outro dispositivo de comunicação.

2.4 O robô não pode exceder as dimensões de um cubo de aresta de 500 mm durante toda a partida.

2.6 Não é permitido o uso de guias ou qualquer conexão física entre robô e competidor durante a partida.

2.7 O robô deverá possuir um dispositivo de indicação luminosa, facilmente visível a longa distância, para sinalizar a chegada aos marcos. [...]

- Massa máxima do robô: NÃO ENCONTRADO na fonte (a regra não impõe limite de massa).

# Partida (item 4)

4.1 Há 4 marcos (conforme definido no item 3.4) posicionados aleatoriamente no ambiente. Uma vez iniciada a competição, as posições dos marcos serão mantidas;

4.2 O robô parte do marco 1 e deverá ser capaz de chegar até os demais marcos de forma autônoma e na ordem definida (marco 1 para marco 2, marco 2 para marco 3 e marco 3 para marco 4);

4.3 O robô, ao chegar em um marco com pelo menos uma parte de sua estrutura tocando o marco, deverá sinalizar por meio de um dispositivo luminoso, visível e aparente, antes de prosseguir para o próximo marco;

4.4 O robô não precisará parar sobre os marcos, ele deverá apenas ativar seu dispositivo luminoso ao passar por eles;

4.5 O dispositivo luminoso poderá ficar ativado por até 2 segundos após o robô sair completamente do marco;

4.6 Caso o dispositivo luminoso seja ativado antes do robô chegar ao próximo marco (passagens opcionais não são consideradas como marcos), a tomada de tempo atual será encerrada e apenas o tempo até a chegada do marco anterior, caso haja, será contabilizada;

4.7 Bonificações obtidas após o último marco válido serão desconsideradas.

4.8 Caso a equipe tenha solicitado a utilização de cones de sinalização conforme regra 3.5, não haverá problemas caso o robô arraste ou arremesse o cone para fora do marco;

4.9 Será anotado o tempo que o robô leva para chegar em cada marco. Quando o robô chegar no último marco e sinalizar, o tempo será parado;

4.11 Cada robô terá o direito a três tomadas de tempo oficiais por dia de competição. Estas tomadas de tempo serão consecutivas caracterizando uma PARTIDA. [...]

4.13 Caso seja solicitada uma tomada de tempo oficial e o robô não se movimente após a sinalização do juiz, será fornecido uma tolerância de 30 segundos para que o robô inicie o movimento. Se após este tempo o robô permanecer imóvel, será considerado um false start e a tomada de tempo será cancelada. No primeiro false start a equipe será advertida, a partir do segundo false start a equipe será penalizada com a perda de uma tomada de tempo. As advertências são contabilizadas durante toda a competição.

4.14 Durante a partida, caso o robô fique preso, tombe de tal maneira que não consiga se desvirar sozinho ou haja alguma intervenção manual, a tomada de tempo será encerrada e apenas o progresso até o marco anterior, caso haja, será contabilizado. O robô poderá tentar uma nova tomada de tempo, caso ainda lhe reste tentativas e tempo.

4.15 Durante as tomadas de tempo, o robô deve permanecer completamente dentro da área do Trekking. Caso qualquer parte do robô saia do campo ou o robô colida contra o delimitador da área (como uma cerca, parede, muro ou outro), ou com qualquer obstáculo, a tomada de tempo será encerrada.

4.17 A partida terá duração máxima de 10 minutos. Isso quer dizer que as três tomadas de tempo consecutivas deverão ocorrer dentro deste período. Caso o tempo da partida acabe no meio de uma tomada de tempo, a tomada de tempo será encerrada e apenas o progresso até o marco anterior, caso haja, será contabilizado.

# Pontuação / Classificação

4.18 A classificação será determinada segundo os seguintes critérios em ordem decrescente:
1. Menor tempo gasto para completar a sequência até o marco 4;
2. Menor tempo gasto para completar a sequência até o marco 3;
3. Menor tempo gasto para atingir o marco 2.

4.19 Apenas será elegível à premiação os robôs que atingirem ao menos o marco 2 (dois).

(Tempo final com bonificação: ver 3.8 a 3.10 — tempo × produto dos multiplicadores das passagens atravessadas antes do último marco válido, 4.7.)

- Critério para combinar as tomadas de tempo (melhor tomada vs. soma): NÃO ENCONTRADO na fonte de forma explícita; 4.18 fala apenas em "menor tempo".

# Penalidades / Encerramento de tentativa (resumo das regras acima)

- Sair do campo, colidir com o delimitador ou com qualquer obstáculo → tomada encerrada (4.15).
- Ficar preso, tombar sem se desvirar ou intervenção manual → tomada encerrada, vale progresso até o marco anterior (4.14).
- Sinal luminoso fora de um marco → tomada encerrada, vale tempo até o marco anterior (4.6).
- Não se mover em 30 s → false start; 1º advertência, a partir do 2º perde uma tomada (4.13).

---

## Micromouse (Classic) — categoria de labirinto, referência complementar
# Documento Revisado 06/08/2024

● Nome da Modalidade: Micromouse
● Número de Robôs por Partida: Um
● Classes Disponíveis: Classic
● Dimensões máximas dos Robôs: 250 mm x 250 mm x ilimitado
● Especificações de Controle: Autônomo

2.2 Vencerá o robô que realizar a corrida mais rápida dentre todas as tomadas de tempo.

3.4 O robô não pode pular, escalar, arranhar, danificar ou destruir as paredes do labirinto.

3.5 O tamanho do robô deve ser tal que sua projeção no chão caiba em um quadrado de 250 mm de lado. Este limite deve ser sempre respeitado mesmo que a forma mude durante a tomada de tempo. No entanto, não há limite de altura.

Labirinto:
4.1 O labirinto é composto de quadrados de unidades de 180 x 180 mm. Sendo no máximo 16 x 16 quadrados. A altura das paredes é de 50 mm e sua espessura é de 12 mm (veja a Fig. 1 para detalhes).

4.2 A lateral das paredes é branca e o topo vermelho. O chão do labirinto é feito de MDF preto texturizado. No entanto, o topo das paredes para a zona de chegada e o ponto de partida são pintados de branco.

4.3 O ponto de partida está localizado em um dos quatro cantos do labirinto. O robô começa em sentido horário. A zona de chegada está localizada em uma seção central de 4 quadrados.

4.4 Existem pequenas zonas quadradas, cada uma de 12 x 12 mm, nos quatro cantos de cada quadrado unitário. Chamadas de postes, e o labirinto é construído de modo que haja pelo menos uma parede para um poste, exceto pelo interior da zona de chegada (veja a Figura 1 para detalhes). Todo o labirinto será completamente cercado por paredes exteriores (veja as Figuras 1 e 2).

Tomada de tempo:
5.2 Cada tomada de tempo terá uma duração máxima de 7 minutos e será iniciada no instante em que o robô adentrar no labirinto pela primeira vez. O robô tem permissão para fazer até 5 corridas por tomada de tempo.

5.3 O robô deverá iniciar parado dentro do ponto de partida para, em seguida, iniciar sua corrida pelo labirinto. A corrida é finalizada quando o robô adentrar a zona de chegada. Sendo a corrida mais rápida registrada como seu tempo oficial.

5.4 O robô é considerado como tendo completado a corrida quando entrar por completo na zona de chegada e permanecer parado por 2 segundos. [...] o tempo decorrido é medido a partir do momento em que os sensores localizados no ponto de partida detectam o robô e até o momento em que o sensor presente na entrada da zona de chegada detecta o mesmo robô.

5.6 Ao finalizar uma corrida, o robô pode voltar de forma autônoma para o ponto de início, sendo obrigado a parar por pelo menos 2 segundos antes de iniciar uma nova corrida. [...]

5.7 Se o robô retornar ao ponto de partida e começar outra corrida antes dos decorridos 2 segundos, presume-se que a próxima corrida tenha começado. No entanto, esta corrida será considerada inválida.

5.8 Durante a corrida, caso o robô pare por mais de 10 segundos ou o operador peça para interromper, o tempo não será pausado e a corrida será considerada inválida.

- Massa máxima do robô: NÃO ENCONTRADO na fonte.
