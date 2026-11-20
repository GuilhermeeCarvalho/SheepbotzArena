import { useEffect, useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { RayMesh } from './sceneModel';
import { SCENE_COLORS } from './palette';

function segmentsGeometry(rays: RayMesh[]): BufferGeometry {
  const positions = new Float32Array(rays.length * 6);
  rays.forEach((ray, i) => positions.set([...ray.from, ...ray.to], i * 6));
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

function endpointsGeometry(rays: RayMesh[]): BufferGeometry {
  const positions = new Float32Array(rays.length * 3);
  rays.forEach((ray, i) => positions.set(ray.to, i * 3));
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

/** Raios de laser/sonar: detecção em destaque, alcance máximo discreto (FR-004). */
export function SensorRays({ rays }: { rays: RayMesh[] }) {
  const hits = useMemo(() => rays.filter((r) => r.hit), [rays]);
  const free = useMemo(() => rays.filter((r) => !r.hit), [rays]);
  const hitLines = useMemo(() => segmentsGeometry(hits), [hits]);
  const freeLines = useMemo(() => segmentsGeometry(free), [free]);
  const hitPoints = useMemo(() => endpointsGeometry(hits), [hits]);

  useEffect(
    () => () => {
      hitLines.dispose();
      freeLines.dispose();
      hitPoints.dispose();
    },
    [hitLines, freeLines, hitPoints],
  );

  return (
    <group name="sensor-rays">
      <lineSegments name="rays-hit" geometry={hitLines}>
        <lineBasicMaterial color={SCENE_COLORS.rayHit} transparent opacity={0.9} />
      </lineSegments>
      <lineSegments name="rays-free" geometry={freeLines}>
        <lineBasicMaterial color={SCENE_COLORS.rayFree} transparent opacity={0.35} />
      </lineSegments>
      <points name="rays-hit-points" geometry={hitPoints}>
        <pointsMaterial color={SCENE_COLORS.rayHit} size={0.035} sizeAttenuation />
      </points>
    </group>
  );
}
