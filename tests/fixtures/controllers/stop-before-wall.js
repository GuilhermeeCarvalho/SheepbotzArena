// Anda até a leitura central do laser ficar abaixo de 0,48 m.
function onTick(robot) {
  const ranges = robot.readLaser();
  const front = ranges[Math.floor(ranges.length / 2)];
  robot.setSpeed(front < 0.48 ? 0 : 1, 0);
}
