// Estratégia de Sumô "busca e ataque".
// Gira procurando o oponente; ao detectá-lo, avança na velocidade máxima.
// Ao ver a borda branca (Tawara), dá ré e gira para o lado oposto.
//
// Sensores esperados no robô:
//   laser "oponente": 3 raios (índice 0 = direita, 1 = centro, 2 = esquerda)
//   piso "piso-esq" e "piso-dir": refletância alta = borda branca
//   bumper "frente": encostou no oponente → empurra
// Velocidades acima do máximo do robô são limitadas pelo simulador.

const ESPERA_INICIAL = 0; // s — use 5 no Sumô LEGO® (regra dos 5 segundos)
const BORDA = 0.5; // refletância acima disto = Tawara
const TEMPO_RE = 0.12; // s de ré ao ver a borda (curta: não há sensor traseiro)
const TEMPO_GIRO = 0.3; // s girando depois da ré
const MAXIMO = 10; // pede o máximo; o simulador satura
const ALINHAR = 0; // fração da velocidade linear ao alinhar (0 = gira no lugar)

let reAte = -1;
let giroAte = -1;
let sentidoGiro = 1;
let alcance = 0; // maior leitura já vista = alcance do sensor

function detectou(leitura) {
  return leitura < alcance * 0.98;
}

function onTick(robot) {
  const t = robot.time();
  if (t < ESPERA_INICIAL) {
    robot.setSpeed(0, 0);
    return;
  }

  const esquerdaBranca = robot.readFloor('piso-esq') > BORDA;
  const direitaBranca = robot.readFloor('piso-dir') > BORDA;
  if (esquerdaBranca || direitaBranca) {
    reAte = t + TEMPO_RE;
    giroAte = reAte + TEMPO_GIRO;
    sentidoGiro = esquerdaBranca ? -1 : 1; // borda à esquerda → gira para a direita
  }
  if (t < reAte) {
    robot.setSpeed(-MAXIMO, 0);
    return;
  }
  if (t < giroAte) {
    robot.setSpeed(0, MAXIMO * sentidoGiro);
    return;
  }

  const [direita, centro, esquerda] = robot.readLaser('oponente');
  alcance = Math.max(alcance, direita, centro, esquerda);

  if (robot.readBumper('frente') || detectou(centro)) {
    robot.setSpeed(MAXIMO, 0); // ataque: empurra em linha reta
  } else if (detectou(esquerda)) {
    robot.setSpeed(MAXIMO * ALINHAR, MAXIMO); // alinha quase no lugar, para a esquerda
  } else if (detectou(direita)) {
    robot.setSpeed(MAXIMO * ALINHAR, -MAXIMO); // alinha para a direita
  } else {
    robot.setSpeed(0, MAXIMO * sentidoGiro); // procura girando
  }
}
