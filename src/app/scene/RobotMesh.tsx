import { useEffect, useState } from 'react';
import { useScenePalette } from './ScenePaletteContext';
import type { RobotMesh as RobotDescriptor } from './sceneModel';

/**
 * Robô de tração diferencial: chassi com o diâmetro de colisão, duas rodas laterais,
 * indicador de frente (+x local) e anel de destaque quando selecionado.
 */
export function RobotMesh({
  robot,
  onSelect,
  onHoverChange,
}: {
  robot: RobotDescriptor;
  onSelect?: (id: string) => void;
  /** Informa quando o mouse entra (id) ou sai (null) do robô (FR-016). */
  onHoverChange?: (id: string | null) => void;
}) {
  const { radius: r, bodyHeight: h } = robot;
  const palette = useScenePalette();
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    onHoverChange?.(hovered ? robot.id : null);
  }, [hovered, onHoverChange, robot.id]);
  const wheelRadius = h * 0.45;
  const wheelWidth = r * 0.22;
  const chassisColor = robot.status === 'error' ? palette.error : robot.color;
  return (
    <group
      name={`robot-${robot.id}`}
      position={robot.position}
      rotation={[0, robot.rotationY, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(robot.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Chassi */}
      <mesh name="chassis" position={[0, h * 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.96, r, h * 0.7, 48]} />
        <meshStandardMaterial color={chassisColor} roughness={0.45} metalness={0.15} />
      </mesh>
      {/* Tampa */}
      <mesh position={[0, h * 0.42, 0]} castShadow>
        <cylinderGeometry args={[r * 0.78, r * 0.9, h * 0.08, 48]} />
        <meshStandardMaterial color="#2b2d31" roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Rodas (eixo lateral: y da simulação = −z local) */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          name="wheel"
          position={[0, -h / 2 + wheelRadius, side * (r - wheelWidth / 2)]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 24]} />
          <meshStandardMaterial color={palette.wheel} roughness={0.9} />
        </mesh>
      ))}
      {/* Indicador de frente */}
      <mesh name="front-marker" position={[r * 0.62, h * 0.48, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[r * 0.18, r * 0.42, 3]} />
        <meshStandardMaterial
          color={palette.frontMarker}
          emissive={palette.frontMarker}
          emissiveIntensity={0.35}
        />
      </mesh>
      {robot.selected && (
        <mesh
          name="selection-ring"
          position={[0, -h / 2 + 0.003, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[r * 1.25, r * 1.42, 64]} />
          <meshBasicMaterial color={palette.selection} transparent opacity={0.95} />
        </mesh>
      )}
    </group>
  );
}
