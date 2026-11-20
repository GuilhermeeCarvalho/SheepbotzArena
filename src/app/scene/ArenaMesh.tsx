import type { StaticScene } from './sceneModel';
import { SCENE_COLORS } from './palette';

/** Chão da arena e paredes de borda. */
export function ArenaMesh({ arena }: { arena: StaticScene['arena'] }) {
  return (
    <group name="arena">
      <mesh name="arena-floor" rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[arena.width, arena.depth]} />
        <meshStandardMaterial color={arena.color} roughness={0.95} />
      </mesh>
      {arena.walls.map((wall) => (
        <mesh key={wall.id} name={wall.id} position={wall.position} rotation={[0, wall.rotationY, 0]} castShadow receiveShadow>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
