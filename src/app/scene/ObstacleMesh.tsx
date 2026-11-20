import type { ObstacleMesh as ObstacleDescriptor } from './sceneModel';

/** Obstáculo estático: caixa, cilindro ou parede. */
export function ObstacleMesh({ obstacle }: { obstacle: ObstacleDescriptor }) {
  const material = <meshStandardMaterial color={obstacle.color} roughness={0.6} metalness={0.05} />;
  if (obstacle.kind === 'cylinder') {
    return (
      <mesh name={obstacle.id} position={obstacle.position} castShadow receiveShadow>
        <cylinderGeometry args={[obstacle.radius, obstacle.radius, obstacle.height, 48]} />
        {material}
      </mesh>
    );
  }
  return (
    <mesh
      name={obstacle.id}
      position={obstacle.position}
      rotation={[0, obstacle.rotationY, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={obstacle.size} />
      {material}
    </mesh>
  );
}
