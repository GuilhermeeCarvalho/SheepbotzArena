// Spec 002 — US4: exemplos embutidos (FR-009).
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildExamples } from 'src/app/examples/examples';
import { createSession } from 'src/app/session/session';

const dir = (sub: string) => fileURLToPath(new URL(`../../../examples/${sub}/`, import.meta.url));
const readAll = (sub: string) =>
  Object.fromEntries(readdirSync(dir(sub)).map((name) => [`/examples/${sub}/${name}`, readFileSync(dir(sub) + name, 'utf8')]));

describe('exemplos', () => {
  const examples = buildExamples(readAll('worlds'), readAll('controllers'));

  it('carrega todos os mundos com nome e controladores resolvidos por arquivo', () => {
    expect(examples.map((e) => e.id)).toEqual(['corridor', 'obstacle-field']);
    expect(examples[0]!.name).toBe('Corredor com obstáculos');
    expect(Object.keys(examples[1]!.controllers)).toEqual(['explorador', 'seguidor']);
    expect(examples[1]!.controllers.seguidor).toContain('segue a parede');
  });

  it('US4-AC1: cada exemplo abre uma sessão válida, pausada no tick 0', () => {
    for (const example of examples) {
      const session = createSession(example.worldText, example.controllers, example.id);
      expect(session.state.tick).toBe(0);
      expect(session.running).toBe(false);
      expect(session.exampleId).toBe(example.id);
    }
  });

  it('robô com controlador inexistente fica sem controlador; nome padrão é o id', () => {
    const [example] = buildExamples(
      { '/w/sem-nome.json': JSON.stringify({ version: 1, arena: { width: 1, height: 1 }, robots: [{ id: 'a', controller: 'x.js' }] }) },
      {},
    );
    expect(example).toMatchObject({ id: 'sem-nome', name: 'sem-nome', controllers: {} });
  });
});
