// Estratégia de exemplo: segue a parede à direita mantendo uma distância alvo.
// Laser esperado: id "laser", 5 raios com FOV de π (−90°, −45°, 0°, 45°, 90°).

const TARGET = 0.35; // m da parede à direita
const SPEED = 0.4; // m/s
const GAIN = 3; // rad/s por metro de erro

function onTick(robot) {
  const [right, frontRight, front] = robot.readLaser();
  if (front < 0.4 || frontRight < 0.3) {
    robot.setSpeed(0, 2); // canto à frente: gira para a esquerda
    return;
  }
  const error = Math.min(right, frontRight * Math.SQRT1_2) - TARGET;
  robot.setSpeed(SPEED, Math.max(-1.5, Math.min(1.5, -GAIN * error)));
}
