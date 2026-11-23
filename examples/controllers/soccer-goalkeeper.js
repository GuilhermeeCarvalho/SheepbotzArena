// Futebol VSS — goleiro.
// Fica sobre uma linha à frente do próprio gol e acompanha a coordenada y da bola,
// limitada à boca do gol. Anda para a frente ou de ré, o que for mais curto.

const LINHA = 0.68; // m do centro: um pouco à frente da linha do gol (0,75)
const LIMITE = 0.17; // m: metade da boca do gol (0,20) menos uma margem
const VELOCIDADE = 1.2;
const GANHO = 10;

let lado = 0; // −1 defende o gol esquerdo, +1 o direito

function normalizar(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

function onTick(robot) {
  const cam = robot.readCamera();
  if (lado === 0) lado = cam.x < 0 ? -1 : 1;
  const alvoY = cam.ball ? Math.max(-LIMITE, Math.min(LIMITE, cam.ball.y)) : 0;
  const alvoX = lado * LINHA;
  const dx = alvoX - cam.x;
  const dy = alvoY - cam.y;
  const distancia = Math.hypot(dx, dy);
  if (distancia < 0.01) {
    // Na posição: vira de lado (paralelo à linha do gol) para reagir rápido.
    robot.setSpeed(0, GANHO * normalizar(Math.PI / 2 - cam.theta));
    return;
  }
  let erro = normalizar(Math.atan2(dy, dx) - cam.theta);
  let sentido = 1;
  if (Math.abs(erro) > Math.PI / 2) {
    // Mais curto andar de ré.
    erro = normalizar(erro + Math.PI);
    sentido = -1;
  }
  robot.setSpeed(
    sentido * VELOCIDADE * Math.max(0, Math.cos(erro)) * Math.min(1, distancia / 0.05),
    GANHO * erro,
  );
}
