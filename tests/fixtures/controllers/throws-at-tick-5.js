let calls = 0;
function onTick(robot) {
  calls += 1;
  robot.setSpeed(0.5, 0);
  if (calls === 5) throw new Error('falha proposital');
}
