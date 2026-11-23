// Estratégia de exemplo: anda para a frente e desvia de obstáculos com o laser.
// Laser esperado: id "laser", raios distribuídos da direita (índice 0) para a esquerda.

const CRUISE_SPEED = 0.5; // m/s
const TURN_SPEED = 2.5; // rad/s
const SAFE_DISTANCE = 0.45; // m

function average(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function onTick(robot) {
  const ranges = robot.readLaser();
  const third = Math.floor(ranges.length / 3);
  const right = average(ranges.slice(0, third));
  const front = Math.min(...ranges.slice(third, ranges.length - third));
  const left = average(ranges.slice(ranges.length - third));

  if (robot.readBumper() || front < SAFE_DISTANCE) {
    // Perto demais: gira no lugar para o lado mais livre.
    robot.setSpeed(0, left >= right ? TURN_SPEED : -TURN_SPEED);
    return;
  }
  // Caminho livre: anda e corrige suavemente em direção ao lado mais aberto.
  const steer = Math.max(-1, Math.min(1, (left - right) * 1.5));
  robot.setSpeed(CRUISE_SPEED, steer);
}
