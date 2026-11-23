// @vitest-environment jsdom
// Spec 010 — navegação entre tela inicial e simulador: US1-AC2, US2-AC3, US3.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Example } from 'src/app/examples/examples';
import { Root } from 'src/app/Root';
import { constantSpeed, robotData, worldData } from '../helpers';

// WebGL não existe no jsdom: o Viewport vira um dublê.
vi.mock('src/app/scene/Viewport', () => ({
  Viewport: () => <div data-testid="viewport" />,
}));

const world = (name: string) =>
  JSON.stringify(worldData({ name, robots: [robotData({ id: 'r1' })] }), null, 2);

// A modalidade do exemplo só define o grupo na tela inicial; os mundos são livres.
const examples: Example[] = [
  {
    id: 'corredor',
    name: 'Corredor',
    worldText: world('Corredor'),
    controllers: { r1: constantSpeed(0.5, 0) },
  },
  {
    id: 'mini',
    name: 'Mini Sumô',
    modality: 'sumo-mini',
    worldText: world('Mini Sumô'),
    controllers: { r1: constantSpeed(0.2, 0) },
  },
];

const tickShown = () => screen.getByTestId('tick').textContent;
const worldSelect = () => screen.getByLabelText('Mundo');

describe('Root', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    return () => vi.useRealTimers();
  });

  it('abre na tela inicial, sem o simulador', () => {
    render(<Root examples={examples} />);
    expect(screen.getByRole('heading', { level: 1, name: 'SheepBotz Arena' })).toBeInTheDocument();
    expect(screen.queryByTestId('viewport')).not.toBeInTheDocument();
  });

  it('US1-AC2: "Abrir simulador" abre o primeiro exemplo, pausado no tick 0', async () => {
    render(<Root examples={examples} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir simulador' }));
    expect(screen.getByTestId('viewport')).toBeInTheDocument();
    expect(worldSelect()).toHaveValue('corredor');
    expect(tickShown()).toBe('0');
  });

  it('US2-AC3: escolher modalidade e exemplo abre esse exemplo no tick 0', async () => {
    render(<Root examples={examples} />);
    await userEvent.click(screen.getByRole('button', { name: /^Sumô/ }));
    const list = screen.getByRole('region', { name: 'Exemplos de Sumô' });
    await userEvent.click(within(list).getByRole('button', { name: 'Mini Sumô' }));
    expect(worldSelect()).toHaveValue('mini');
    expect(tickShown()).toBe('0');
  });

  it('US3-AC1/AC2: "Tela inicial" volta ao início e a nova entrada recomeça do tick 0', async () => {
    render(<Root examples={examples} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir simulador' }));
    const step = screen.getByRole('button', { name: 'Avançar um tick' });
    await userEvent.click(step);
    await userEvent.click(step);
    expect(tickShown()).toBe('2');

    await userEvent.click(screen.getByRole('button', { name: 'Tela inicial' }));
    expect(screen.getByRole('heading', { level: 1, name: 'SheepBotz Arena' })).toBeInTheDocument();
    expect(screen.queryByTestId('viewport')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Abrir simulador' }));
    expect(worldSelect()).toHaveValue('corredor');
    expect(tickShown()).toBe('0');
  });

  it('id de exemplo inexistente cai no primeiro exemplo', async () => {
    const { App } = await import('src/app/App');
    render(<App examples={examples} initialExampleId="nao-existe" />);
    expect(worldSelect()).toHaveValue('corredor');
    expect(screen.queryByRole('button', { name: 'Tela inicial' })).not.toBeInTheDocument();
  });
});
