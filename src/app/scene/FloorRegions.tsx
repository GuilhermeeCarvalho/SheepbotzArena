import type { FloorRegionMesh } from './sceneModel';

const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0];

function Region({ region }: { region: FloorRegionMesh }) {
  const material = <meshStandardMaterial color={region.color} roughness={0.9} />;
  switch (region.kind) {
    case 'rect':
      return (
        <group position={region.position} rotation={[0, region.rotationY, 0]}>
          <mesh rotation={FLAT} receiveShadow>
            <planeGeometry args={[region.width, region.depth]} />
            {material}
          </mesh>
        </group>
      );
    case 'disc':
      return (
        <mesh position={region.position} rotation={FLAT} receiveShadow>
          <circleGeometry args={[region.radius, 96]} />
          {material}
        </mesh>
      );
    case 'ring':
      return (
        <mesh position={region.position} rotation={FLAT} receiveShadow>
          <ringGeometry args={[region.innerRadius, region.outerRadius, 128]} />
          {material}
        </mesh>
      );
    case 'line':
      return (
        <group>
          {region.segments.map((segment, i) => (
            <group key={i} position={segment.position} rotation={[0, segment.rotationY, 0]}>
              {/* Segmento + junta circular para curvas sem frestas. */}
              <mesh rotation={FLAT} receiveShadow>
                <planeGeometry args={[segment.length, segment.width]} />
                {material}
              </mesh>
              <mesh position={[segment.length / 2, 0, 0]} rotation={FLAT}>
                <circleGeometry args={[segment.width / 2, 16]} />
                {material}
              </mesh>
            </group>
          ))}
        </group>
      );
  }
}

/** Regiões pintadas do piso, na ordem declarada. */
export function FloorRegions({ regions }: { regions: FloorRegionMesh[] }) {
  return (
    <group name="floor-regions">
      {regions.map((region, i) => (
        <Region key={i} region={region} />
      ))}
    </group>
  );
}
