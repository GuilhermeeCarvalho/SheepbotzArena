// Futebol VSS — atacante.
// Usa a câmera de visão global (pose própria e posição da bola). Vai a um ponto atrás da
// bola, alinhado com o gol adversário, e então empurra a bola em direção ao gol.
// O lado é deduzido da posição inicial: começou em x < 0 → ataca o gol em x = +0,75.

const GOL = 0.78; // m: um pouco além da linha do gol adversário
const RECUO = 0.07; // m atrás da bola para se alinhar
const ALINHADO = 0.025; // m de tolerância lateral para empurrar
const VELOCIDADE = 1.2; // m/s
const GANHO = 8; // rad/s por rad de erro de rumo

const PERTO_DA_LATERAL = 0.5; // m: bola com |y| acima disto está junto à parede
const LIMITE_X = 0.71; // m: alvos ficam dentro do campo (raio do robô incluso)
const LIMITE_Y = 0.6;

let lado = 0; // +1 ataca para +x, −1 para −x

function limitar(valor, limite) {
  return Math.max(-limite, Math.min(limite, valor));
}

function normalizar(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/** Vai até (x, y) dirigindo de frente; reduz a velocidade quando precisa virar muito. */
function irPara(robot, cam, x, y, velocidade) {
  x = limitar(x, LIMITE_X);
  y = limitar(y, LIMITE_Y);
  const erro = normalizar(Math.atan2(y - cam.y, x - cam.x) - cam.theta);
  const v = velocidade * Math.max(0, Math.cos(erro));
  robot.setSpeed(v, GANHO * erro);
}

function onTick(robot) {
  const cam = robot.readCamera();
  if (lado === 0) lado = cam.x < 0 ? 1 : -1;
  if (!cam.ball) {
    robot.setSpeed(0, 0);
    return;
  }
  const bola = cam.ball;
  // Direção da bola para o gol adversário; junto à lateral, empurra ao longo da parede e
  // um pouco para dentro (o ponto "atrás da bola" não pode ficar fora do campo).
  let gx = lado * GOL - bola.x;
  let gy = -bola.y;
  if (Math.abs(bola.y) > PERTO_DA_LATERAL) {
    gx = lado;
    gy = -Math.sign(bola.y) * 0.35;
  }
  const n = Math.hypot(gx, gy) || 1;
  const ux = gx / n;
  const uy = gy / n;

  // Posição do robô em relação à bola, no eixo bola→gol: atrás (< 0) e desvio lateral.
  const rx = cam.x - bola.x;
  const ry = cam.y - bola.y;
  const atras = rx * ux + ry * uy;
  const lateral = -rx * uy + ry * ux;

  if (atras < -0.02 && Math.abs(lateral) < ALINHADO) {
    // Alinhado atrás da bola: empurra através dela, em direção ao gol.
    irPara(robot, cam, bola.x + ux * 0.2, bola.y + uy * 0.2, VELOCIDADE);
  } else if (atras > -0.02) {
    // Está à frente da bola: contorna pelo lado em que já está, sem empurrá-la para trás.
    const lado2 = lateral >= 0 ? 1 : -1;
    irPara(
      robot,
      cam,
      bola.x - ux * RECUO - uy * 0.09 * lado2,
      bola.y - uy * RECUO + ux * 0.09 * lado2,
      VELOCIDADE,
    );
  } else {
    irPara(robot, cam, bola.x - ux * RECUO, bola.y - uy * RECUO, VELOCIDADE);
  }
}
