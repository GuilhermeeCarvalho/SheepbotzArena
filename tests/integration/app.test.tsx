// @vitest-environment jsdom
// Spec 002 — aplicação completa: US2 (controles), US4 (mundo), US5 (controlador), US6 (robôs), US7 (câmera).
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from 'src/app/App';
import type { Example } from 'src/app/examples/examples';
import { constantSpeed, robotData, worldData } from '../helpers';

// WebGL não existe no jsdom: o Viewport vira um dublê que expõe o que receberia e
// permite simular o clique num robô da cena.
vi.mock('src/app/scene/Viewport', () => ({
  Viewport: (props: {
    state: { tick: number };
    showRays: boolean;
    selectedRobotId: string | null;
    cameraMode: string;
    resetViewSignal: number;
    onSelectRobot?: (id: string | null) => void;
  }) => (
    <div data-testid="viewport">
      raios={String(props.showRays)} selecionado={String(props.selectedRobotId)} câmera=
      {props.cameraMode} vista={props.resetViewSignal}
      <button type="button" onClick={() => props.onSelectRobot?.('r2')}>
        clicar-robo-r2
      </button>
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

const hud = () => screen.getByRole('region', { name: 'Estado da simulação' });
const tickShown = () => screen.getByTestId('tick').textContent;
const viewport = () => screen.getByTestId('viewport');

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
  });
  afterEach(() => vi.useRealTimers());

  it('US4-AC1: inicia no primeiro exemplo, pausado no tick 0', () => {
    render(<App examples={examples} />);
    expect(screen.getByLabelText('Mundo')).toHaveValue('dois');
    expect(tickShown()).toBe('0');
    expect(within(hud()).getByText('Pausado')).toBeInTheDocument();
    expect(within(hud()).getByText('2 robôs')).toBeInTheDocument();
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
    expect(screen.getByTestId('time')).toHaveTextContent('0,15');

    await user.click(screen.getByRole('button', { name: 'Executar' }));
    expect(within(hud()).getByText('Executando')).toBeInTheDocument();
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

  it('atalhos de teclado, velocidade e raios', async () => {
    render(<App examples={examples} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(tickShown()).toBe('1');
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(within(hud()).getByText('Executando')).toBeInTheDocument();
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(within(hud()).getByText('Pausado')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'r' });
    expect(tickShown()).toBe('0');
    fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true });
    expect(tickShown()).toBe('0');

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar raios' }));
    expect(viewport()).toHaveTextContent('raios=false');
    expect(screen.getByRole('button', { name: 'Mostrar raios' })).toBeInTheDocument();

    const speed = screen.getByRole('radiogroup', { name: 'Velocidade' });
    await userEvent.click(within(speed).getByRole('radio', { name: '4×' }));
    expect(within(speed).getByRole('radio', { name: '4×' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('US7: modos de câmera e centralizar vista', async () => {
    render(<App examples={examples} />);
    const camera = screen.getByRole('radiogroup', { name: 'Câmera' });
    expect(viewport()).toHaveTextContent('câmera=perspective');
    await userEvent.click(within(camera).getByRole('radio', { name: 'Topo' }));
    expect(viewport()).toHaveTextContent('câmera=top');
    await userEvent.click(within(camera).getByRole('radio', { name: 'Seguir robô selecionado' }));
    expect(viewport()).toHaveTextContent('câmera=follow');
    await userEvent.click(within(camera).getByRole('radio', { name: 'Perspectiva' }));
    expect(viewport()).toHaveTextContent('câmera=perspective');
    await userEvent.click(screen.getByRole('button', { name: 'Centralizar vista' }));
    expect(viewport()).toHaveTextContent('vista=1');
  });

  it('US7-AC3: "Seguir" fica indisponível sem robôs', () => {
    const empty: Example = {
      id: 'vazio',
      name: 'Vazio',
      worldText: JSON.stringify(worldData()),
      controllers: {},
    };
    render(<App examples={[empty]} />);
    const camera = screen.getByRole('radiogroup', { name: 'Câmera' });
    expect(within(camera).getByRole('radio', { name: 'Seguir robô selecionado' })).toBeDisabled();
  });

  it('US7-AC4: clicar no robô da cena seleciona e abre o controlador dele', async () => {
    render(<App examples={examples} />);
    await userEvent.click(screen.getByRole('tab', { name: /Mundo/ }));
    await userEvent.click(screen.getByRole('button', { name: 'clicar-robo-r2' }));
    expect(viewport()).toHaveTextContent('selecionado=r2');
    expect(screen.getByRole('tab', { name: /Controlador/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText('Controlador do robô r2')).toBeInTheDocument();
  });

  it('painel lateral recolhível', async () => {
    render(<App examples={examples} />);
    await userEvent.click(screen.getByRole('button', { name: 'Recolher painel' }));
    expect(screen.queryByRole('tablist', { name: 'Painéis' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar painel' }));
    expect(screen.getByRole('tablist', { name: 'Painéis' })).toBeInTheDocument();
  });

  it('US4-AC2: trocar de exemplo carrega mundo e controladores', async () => {
    render(<App examples={examples} />);
    await userEvent.selectOptions(screen.getByLabelText('Mundo'), 'um');
    expect(within(hud()).getByText('1 robô')).toBeInTheDocument();
    expect(screen.getByLabelText('Controlador do robô solo')).toBeInTheDocument();
  });

  it('US4-AC3/AC4: mundo inválido lista erros; arquivo válido substitui', async () => {
    render(<App examples={examples} />);
    await userEvent.click(screen.getByRole('tab', { name: /Mundo/ }));
    const invalid = new File(
      [JSON.stringify(worldData({ robots: [robotData({ radius: 0 })] }))],
      'mundo.json',
      { type: 'application/json' },
    );
    await userEvent.upload(screen.getByTestId('world-file-input'), invalid);
    expect(await screen.findByRole('alert')).toHaveTextContent('robots[0].radius');
    expect(screen.getByText('deve ser maior que 0')).toBeInTheDocument();
    expect(within(hud()).getByText('2 robôs')).toBeInTheDocument();

    const valid = new File([single], 'outro.json', { type: 'application/json' });
    await userEvent.upload(screen.getByTestId('world-file-input'), valid);
    await vi.waitFor(() => expect(within(hud()).getByText('1 robô')).toBeInTheDocument());
    expect(screen.getByLabelText('Mundo')).toHaveValue('__custom__');
  });

  it('US5: selecionar robô, aplicar controlador inválido e descartar', async () => {
    render(<App examples={examples} />);
    await userEvent.selectOptions(screen.getByLabelText('Robô'), 'r2');
    expect(screen.getByLabelText('Controlador do robô r2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled();

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
    expect(viewport()).toHaveTextContent('selecionado=r2');
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
