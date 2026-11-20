// @vitest-environment jsdom
// Spec 002 — aplicação completa: US2 (controles), US4 (mundo), US5 (controlador), US6 (robôs).
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from 'src/app/App';
import type { Example } from 'src/app/examples/examples';
import { constantSpeed, robotData, worldData } from '../helpers';

// WebGL não existe no jsdom: o Viewport vira um dublê que expõe o que receberia.
vi.mock('src/app/scene/Viewport', () => ({
  Viewport: (props: {
    state: { tick: number };
    showRays: boolean;
    selectedRobotId: string | null;
    resetViewSignal: number;
  }) => (
    <div data-testid="viewport">
      tick={props.state.tick} raios={String(props.showRays)} selecionado=
      {String(props.selectedRobotId)} vista=
      {props.resetViewSignal}
    </div>
  ),
}));

const twoRobots = JSON.stringify(
  worldData({
    name: 'Dois robôs',
    robots: [
      robotData({ name: 'Alfa' }),
      robotData({ id: 'r2', name: 'Beta', pose: { x: 1, y: 1, theta: Math.PI / 2 } }),
    ],
  }),
  null,
  2,
);
const single = JSON.stringify(
  worldData({ name: 'Um robô', robots: [robotData({ id: 'solo' })] }),
  null,
  2,
);

const examples: Example[] = [
  {
    id: 'dois',
    name: 'Dois robôs',
    worldText: twoRobots,
    controllers: { r1: constantSpeed(0.5, 0), r2: constantSpeed(0.2, 0) },
  },
  { id: 'um', name: 'Um robô', worldText: single, controllers: {} },
];

const statusBar = () => screen.getByRole('contentinfo', { name: 'Estado da simulação' });
const tickShown = () => within(statusBar()).getByText('Tick').nextSibling?.textContent;

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
  });
  afterEach(() => vi.useRealTimers());

  it('US4-AC1: inicia no primeiro exemplo, pausado no tick 0', () => {
    render(<App examples={examples} />);
    expect(screen.getByLabelText('Mundo')).toHaveValue('dois');
    expect(tickShown()).toBe('0');
    expect(screen.getByText('Pausado')).toBeInTheDocument();
    expect(screen.getByLabelText('Controlador do robô r1')).toBeInTheDocument();
  });

  it('US2-AC1/AC4/AC5: avançar, executar, pausar e reiniciar', async () => {
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    render(<App examples={examples} />);
    const step = screen.getByRole('button', { name: 'Avançar um tick' });
    await user.click(step);
    await user.click(step);
    await user.click(step);
    expect(tickShown()).toBe('3');
    expect(within(statusBar()).getByText('Tempo').nextSibling?.textContent).toContain('0,15');

    await user.click(screen.getByRole('button', { name: 'Executar' }));
    expect(screen.getByText('Executando')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Avançar um tick' })).toBeDisabled();
    act(() => vi.advanceTimersByTime(200));
    expect(Number(tickShown())).toBeGreaterThan(3);

    await user.click(screen.getByRole('button', { name: 'Pausar' }));
    const paused = tickShown();
    act(() => vi.advanceTimersByTime(200));
    expect(tickShown()).toBe(paused);

    await user.click(screen.getByRole('button', { name: 'Reiniciar' }));
    expect(tickShown()).toBe('0');
  });

  it('atalhos de teclado e controles de visualização', async () => {
    render(<App examples={examples} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(tickShown()).toBe('1');
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(screen.getByText('Executando')).toBeInTheDocument();
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(screen.getByText('Pausado')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'r' });
    expect(tickShown()).toBe('0');
    fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true });
    expect(tickShown()).toBe('0');

    await userEvent.click(screen.getByRole('switch', { name: 'Mostrar raios' }));
    expect(screen.getByTestId('viewport')).toHaveTextContent('raios=false');
    await userEvent.click(screen.getByRole('button', { name: 'Centralizar vista' }));
    expect(screen.getByTestId('viewport')).toHaveTextContent('vista=1');
    await userEvent.selectOptions(screen.getByLabelText('Velocidade'), '4');
    expect(screen.getByLabelText('Velocidade')).toHaveValue('4');
  });

  it('US4-AC2: trocar de exemplo carrega mundo e controladores', async () => {
    render(<App examples={examples} />);
    await userEvent.selectOptions(screen.getByLabelText('Mundo'), 'um');
    expect(within(statusBar()).getByText('Robôs').nextSibling?.textContent).toBe('1');
    expect(screen.getByLabelText('Controlador do robô solo')).toBeInTheDocument();
  });

  it('US4-AC3/AC4: mundo inválido lista erros; arquivo válido substitui', async () => {
    render(<App examples={examples} />);
    await userEvent.click(screen.getByRole('tab', { name: /Mundo/ }));
    // Aplica um mundo inválido pelo arquivo: o editor recebe o texto e os erros aparecem.
    const invalid = new File(
      [JSON.stringify(worldData({ robots: [robotData({ radius: 0 })] }))],
      'mundo.json',
      {
        type: 'application/json',
      },
    );
    await userEvent.upload(screen.getByTestId('world-file-input'), invalid);
    expect(await screen.findByRole('alert')).toHaveTextContent('robots[0].radius');
    expect(screen.getByText('deve ser maior que 0')).toBeInTheDocument();
    expect(within(statusBar()).getByText('Robôs').nextSibling?.textContent).toBe('2');

    const valid = new File([single], 'outro.json', { type: 'application/json' });
    await userEvent.upload(screen.getByTestId('world-file-input'), valid);
    await vi.waitFor(() =>
      expect(within(statusBar()).getByText('Robôs').nextSibling?.textContent).toBe('1'),
    );
    expect(screen.getByLabelText('Mundo')).toHaveValue('__custom__');
  });

  it('US5: selecionar robô, aplicar controlador válido e inválido', async () => {
    render(<App examples={examples} />);
    await userEvent.selectOptions(screen.getByLabelText('Robô'), 'r2');
    expect(screen.getByLabelText('Controlador do robô r2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled();

    // Edita o código através do CodeMirror: o rascunho habilita Aplicar e Descartar.
    const editor = screen.getByLabelText('Controlador do robô r2');
    await userEvent.click(editor);
    await userEvent.keyboard('{Control>}a{/Control}');
    await userEvent.keyboard('function onTick(robot) {{} robot.setSpeed(1,; }');
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/linha 1, coluna/);
    expect(screen.getByRole('tab', { name: /Controlador/ })).toHaveTextContent('1');

    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled();
  });

  it('US6: lista de robôs com pose, estado e seleção', async () => {
    const withError: Example = {
      id: 'erro',
      name: 'Com erro',
      worldText: twoRobots,
      controllers: { r1: 'function onTick() { throw new Error("pane"); }' },
    };
    render(<App examples={[withError]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Avançar um tick' }));
    await userEvent.click(screen.getByRole('tab', { name: /Robôs/ }));
    const list = screen.getByRole('list', { name: 'Robôs' });
    expect(within(list).getByText('Alfa')).toBeInTheDocument();
    expect(within(list).getByText('erro')).toBeInTheDocument();
    expect(within(list).getByText('Tick 1: pane')).toBeInTheDocument();
    expect(within(list).getByText('sem controlador')).toBeInTheDocument();
    expect(within(list).getByText(/x 1,00 · y 1,00 · θ 90°/)).toBeInTheDocument();
    await userEvent.click(within(list).getByRole('button', { name: /Beta/ }));
    expect(screen.getByTestId('viewport')).toHaveTextContent('selecionado=r2');
  });

  it('mundo sem robôs mostra estado vazio nos painéis', async () => {
    const empty: Example = {
      id: 'vazio',
      name: 'Vazio',
      worldText: JSON.stringify(worldData()),
      controllers: {},
    };
    render(<App examples={[empty]} />);
    expect(screen.getByText('Nenhum robô para programar')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Robôs/ }));
    expect(screen.getByText('Nenhum robô neste mundo')).toBeInTheDocument();
  });
});
