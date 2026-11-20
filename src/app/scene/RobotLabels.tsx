import { useFrame } from '@react-three/fiber';
import type { MutableRefObject } from 'react';
import { Vector3 } from 'three';
import type { RobotMesh } from './sceneModel';

export type LabelElements = MutableRefObject<Map<string, HTMLElement>>;

/**
 * Projeta, a cada quadro, a posição de cada robô rotulado para a tela e move o elemento
 * DOM correspondente (camada sobre o canvas). Evita recriar React a cada quadro.
 */
export function RobotLabelProjector({
  robots,
  elements,
}: {
  robots: MutableRefObject<RobotMesh[]>;
  elements: LabelElements;
}) {
  const point = new Vector3();
  useFrame(({ camera, size }) => {
    for (const [id, element] of elements.current) {
      const robot = robots.current.find((r) => r.id === id);
      if (!robot) continue;
      point.set(robot.position[0], robot.position[1] + robot.bodyHeight * 1.4, robot.position[2]);
      point.project(camera);
      const x = ((point.x + 1) / 2) * size.width;
      const y = ((1 - point.y) / 2) * size.height;
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
      element.style.visibility = point.z < 1 ? 'visible' : 'hidden';
    }
  });
  return null;
}
