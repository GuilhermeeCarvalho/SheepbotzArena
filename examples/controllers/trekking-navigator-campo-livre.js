// Arquivo gerado por scripts/generate-trekking-example.ts a partir de trekking-navigator.js — não edite.
// Trekking — navegação "ir ao alvo + contornar obstáculos".
// Os centros dos marcos foram medidos no campo (coordenadas do arquivo de mundo) e são
// convertidos para o referencial da largada, que é o referencial da odometria.
// Sensores: laser "lidar" (9 raios a cada 22,5°, da direita −90° para a esquerda +90°).

const LARGADA = { x: -5, y: -3.5, theta: 0 }; // pose no marco 1
const MARCOS = [
  [5, -3.5], // marco 2
  [5, 3.5], // marco 3
  [-5, 3.5], // marco 4
];
const CHEGOU = 0.3; // m do centro do marco
const VELOCIDADE = 0.8; // m/s
const DESVIO = 1.0; // m: obstáculo à frente mais perto que isto → contornar
const LATERAL = 0.6; // m: algo mais perto que isto nas laterais → afastar
const GANHO = 2.5; // rad/s por rad de erro de rumo
const REPULSAO = 4; // rad/s por metro de aproximação lateral

let alvo = 0;
let sentidoDesvio = 0;

function paraLargada([x, y]) {
  const dx = x - LARGADA.x;
  const dy = y - LARGADA.y;
  const c = Math.cos(-LARGADA.theta);
  const s = Math.sin(-LARGADA.theta);
  return [dx * c - dy * s, dx * s + dy * c];
}

function normalizar(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

function onTick(robot) {
  if (alvo >= MARCOS.length) {
    robot.setSpeed(0, 0);
    return;
  }
  const odo = robot.readOdometry();
  const [tx, ty] = paraLargada(MARCOS[alvo]);
  const dx = tx - odo.x;
  const dy = ty - odo.y;
  if (Math.hypot(dx, dy) < CHEGOU) {
    alvo += 1;
    sentidoDesvio = 0;
    return;
  }

  const raios = robot.readLaser('lidar');
  const direita = Math.min(raios[0], raios[1], raios[2]); // −90° a −45°
  const frente = Math.min(raios[3], raios[4], raios[5]); // −22,5° a +22,5°
  const esquerda = Math.min(raios[6], raios[7], raios[8]); // +45° a +90°
  const erro = normalizar(Math.atan2(dy, dx) - odo.theta);

  if (frente < DESVIO) {
    // Contorna para o lado mais livre e mantém o lado até a frente liberar.
    if (sentidoDesvio === 0) sentidoDesvio = esquerda >= direita ? 1 : -1;
    robot.setSpeed(VELOCIDADE * 0.2, 2 * sentidoDesvio);
    return;
  }
  sentidoDesvio = 0;

  let w = GANHO * erro;
  // Algo perto de um lado: nunca gira para esse lado; afasta mais quanto mais perto.
  if (esquerda < LATERAL) w = Math.min(w, 0) - REPULSAO * (LATERAL - esquerda);
  if (direita < LATERAL) w = Math.max(w, 0) + REPULSAO * (LATERAL - direita);
  const v = VELOCIDADE * Math.max(0.2, Math.cos(Math.min(Math.abs(erro), Math.PI / 2)));
  robot.setSpeed(v, w);
}
