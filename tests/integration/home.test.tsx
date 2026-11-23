// @vitest-environment jsdom
// Spec 010 — tela inicial: US1 (apresentação), US2 (modalidades e exemplos).
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Example } from 'src/app/examples/examples';
import { HomeScreen } from 'src/app/home/HomeScreen';
import { THEME_STORAGE_KEY } from 'src/app/theme/useTheme';

const example = (id: string, name: string, modality?: string): Example => ({
  id,
  name,
  ...(modality !== undefined && { modality }),
  worldText: '{}',
  controllers: {},
});

const examples: Example[] = [
  example('corredor', 'Corredor'),
  example('mini', 'Mini Sumô', 'sumo-mini'),
  example('mega', 'Mega Sumô', 'sumo-mega'),
  example('oval', 'Pista oval', 'seguidor-junior'),
];

const renderHome = () => {
  const onOpenSimulator = vi.fn();
  const onOpenExample = vi.fn();
  render(
    <HomeScreen
      examples={examples}
      onOpenSimulator={onOpenSimulator}
      onOpenExample={onOpenExample}
    />,
  );
  return { onOpenSimulator, onOpenExample };
};

describe('HomeScreen', () => {
  afterEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('US1-AC1: logo, nome, propósito e "Abrir simulador"', async () => {
    const { onOpenSimulator } = renderHome();
    expect(screen.getByRole('heading', { level: 1, name: 'SheepBotz Arena' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'SheepBotz' })).toHaveAttribute(
      'src',
      '/brand/sheepbotz-mark.png',
    );
    expect(screen.getByText(/sem desgastar os robôs físicos/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir simulador' }));
    expect(onOpenSimulator).toHaveBeenCalledOnce();
  });

  it('US2-AC1/AC4: modalidades na ordem, com quantidade e sem destaque', () => {
    renderHome();
    const cards = screen
      .getAllByRole('button', { pressed: false })
      .map((card) => card.textContent ?? '');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toMatch(/^Sumô.*2 exemplos$/);
    expect(screen.queryByText('Foco da equipe')).not.toBeInTheDocument();
    expect(cards[1]).toMatch(/^Seguidor de Linha.*1 exemplo$/);
    expect(cards[2]).toMatch(/^Livre.*1 exemplo$/);
    expect(screen.queryByText('Trekking')).not.toBeInTheDocument();
  });

  it('US2-AC3: escolher modalidade lista os exemplos; escolher um exemplo o abre', async () => {
    const { onOpenExample } = renderHome();
    expect(screen.queryByRole('region', { name: /Exemplos de/ })).not.toBeInTheDocument();
    const sumo = screen.getByRole('button', { name: /^Sumô/ });
    await userEvent.click(sumo);
    expect(sumo).toHaveAttribute('aria-pressed', 'true');
    const list = screen.getByRole('region', { name: 'Exemplos de Sumô' });
    expect(
      within(list)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Mini Sumô', 'Mega Sumô']);
    await userEvent.click(within(list).getByRole('button', { name: 'Mega Sumô' }));
    expect(onOpenExample).toHaveBeenCalledWith('mega');
  });

  it('US1-AC3: alterna o tema e lembra a escolha', async () => {
    renderHome();
    expect(document.documentElement.dataset.theme).toBe('light');
    await userEvent.click(screen.getByRole('button', { name: 'Tema escuro' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(screen.getByRole('button', { name: 'Tema claro' })).toBeInTheDocument();
  });
});
