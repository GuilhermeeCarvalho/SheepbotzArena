import { memo } from 'react';
import { ArenaMesh } from './ArenaMesh';
import { FloorRegions } from './FloorRegions';
import { ObstacleMesh } from './ObstacleMesh';
import { RobotMesh } from './RobotMesh';
import type { DynamicScene, StaticScene } from './sceneModel';
import { SensorRays } from './SensorRays';

/** Parte estática da cena, recriada apenas quando o mundo muda. */
export const StaticSceneContent = memo(function StaticSceneContent({
  scene,
}: {
  scene: StaticScene;
}) {
  return (
    <>
      <ArenaMesh arena={scene.arena} />
      <FloorRegions regions={scene.floorRegions} />
      <group name="obstacles">
        {scene.obstacles.map((obstacle) => (
          <ObstacleMesh key={obstacle.id} obstacle={obstacle} />
        ))}
      </group>
    </>
  );
});

/** Robôs e raios, redesenhados a cada tick. */
export function DynamicSceneContent({
  scene,
  onSelectRobot,
  onHoverRobot,
}: {
  scene: DynamicScene;
  onSelectRobot?: (id: string) => void;
  onHoverRobot?: (id: string | null) => void;
}) {
  return (
    <>
      <group name="robots">
        {scene.robots.map((robot) => (
          <RobotMesh
            key={robot.id}
            robot={robot}
            onSelect={onSelectRobot}
            onHoverChange={onHoverRobot}
          />
        ))}
      </group>
      <SensorRays rays={scene.rays} />
    </>
  );
}
