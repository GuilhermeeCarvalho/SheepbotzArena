// Arquivo gerado por scripts/generate-line-follower-examples.ts a partir de line-follower-pd.js — não edite.
// Seguidor de Linha — controlador proporcional-derivativo (PD).
// Barra de 8 sensores de piso (Pololu QTR-8A): "linha-0" (direita) … "linha-7" (esquerda),
// espaçados 9,525 mm. Sensor lateral "marca" (à direita) conta as marcações de
// partida e de chegada; depois da chegada o robô para dentro da área (Art. 5.7).

const VELOCIDADE = 1.3; // m/s — rápido demais para as curvas
const KP = 25; // ganho baixo: corrige devagar
const KD = 2.2; // rad/s por (m/s) de variação do erro
const REDUCAO_EM_CURVA = 0; // não reduz nas curvas
const ESPACAMENTO = 0.009525; // m entre sensores (QTR-8A)
const PARAR_APOS = 0.45; // m percorridos depois da marcação de chegada

let erroAnterior = 0;
let tempoAnterior = 0;
let ultimoLado = 0;
let marcaAnterior = false;
let marcas = 0;
let distanciaNaChegada = null;

function posicaoDaLinha(robot) {
  let soma = 0;
  let pesos = 0;
  for (let k = 0; k < 8; k++) {
    const branco = robot.readFloor('linha-' + k);
    if (branco > 0.5) {
      soma += (k - 3.5) * ESPACAMENTO * branco;
      pesos += branco;
    }
  }
  return pesos > 0 ? soma / pesos : null;
}

function onTick(robot) {
  // Conta marcações laterais (borda de subida).
  const marca = robot.readFloor('marca') > 0.5;
  if (marca && !marcaAnterior) {
    marcas += 1;
    if (marcas === 2) distanciaNaChegada = robot.readOdometry().distance;
  }
  marcaAnterior = marca;

  if (
    distanciaNaChegada !== null &&
    robot.readOdometry().distance - distanciaNaChegada >= PARAR_APOS
  ) {
    robot.setSpeed(0, 0); // parada final na área de partida-chegada
    return;
  }

  const t = robot.time();
  const posicao = posicaoDaLinha(robot);
  if (posicao === null) {
    // Perdeu a linha: gira para o lado em que ela foi vista por último.
    robot.setSpeed(VELOCIDADE * 0.2, 8 * (ultimoLado || 1));
    return;
  }
  ultimoLado = Math.sign(posicao) || ultimoLado;

  const dt = Math.max(t - tempoAnterior, 1e-3);
  const derivada = (posicao - erroAnterior) / dt;
  erroAnterior = posicao;
  tempoAnterior = t;

  const w = KP * posicao + KD * derivada;
  const v = VELOCIDADE * Math.max(0.3, 1 - (REDUCAO_EM_CURVA * Math.abs(w)) / 10);
  robot.setSpeed(v, w);
}
