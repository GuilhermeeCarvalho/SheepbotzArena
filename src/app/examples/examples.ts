/**
 * Mundos de exemplo embutidos a partir de `examples/` (research D-08; FR-009).
 * O campo `controller` de cada robô é resolvido pelo nome do arquivo.
 */
export type Example = {
  id: string;
  name: string;
  /** Modalidade declarada no mundo (spec 010, plan D-02). */
  modality?: string;
  worldText: string;
  controllers: Record<string, string>;
};

type RawFiles = Record<string, string>;

const fileName = (path: string): string => path.split('/').pop() ?? path;

/** Monta os exemplos a partir dos textos dos mundos e dos controladores. */
export function buildExamples(worldFiles: RawFiles, controllerFiles: RawFiles): Example[] {
  const controllersByName = new Map(
    Object.entries(controllerFiles).map(([path, text]) => [fileName(path), text]),
  );
  return Object.entries(worldFiles)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, worldText]) => {
      const data = JSON.parse(worldText) as {
        name?: string;
        modality?: string;
        robots?: { id: string; controller?: string }[];
      };
      const controllers: Record<string, string> = {};
      for (const robot of data.robots ?? []) {
        const source = robot.controller
          ? controllersByName.get(fileName(robot.controller))
          : undefined;
        if (source !== undefined) controllers[robot.id] = source;
      }
      const id = fileName(path).replace(/\.json$/, '');
      return {
        id,
        name: data.name ?? id,
        ...(data.modality !== undefined && { modality: data.modality }),
        worldText,
        controllers,
      };
    });
}

/** Exemplos do repositório, incorporados no build pelo Vite. */
export function loadBundledExamples(): Example[] {
  const worlds = import.meta.glob<string>('/examples/worlds/*.json', {
    query: '?raw',
    import: 'default',
    eager: true,
  });
  const controllers = import.meta.glob<string>('/examples/controllers/*.js', {
    query: '?raw',
    import: 'default',
    eager: true,
  });
  return buildExamples(worlds, controllers);
}
