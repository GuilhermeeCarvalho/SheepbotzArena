// @vitest-environment jsdom
// Spec 009 — US2: controle remoto no painel do controlador (FR-001, FR-004).
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from 'src/app/App';
import type { Example } from 'src/app/examples/examples';
import { createMemoryTransport } from 'src/remote/memoryTransport';
import { constantSpeed, robotData, worldData } from '../helpers';

vi.mock('src/app/scene/Viewport', () => ({
  Viewport: () => <div data-testid="viewport" />,
}));

const examples: Example[] = [
  {
    id: 'um',
    name: 'Um robô',
    worldText: JSON.stringify(worldData({ robots: [robotData()] })),
    controllers: { r1: constantSpeed(0.2, 0) },
  },
];

/** Programa que responde até o tick `until`. */
const program = (until = Infinity) =>
  createMemoryTransport((text) => {
    const message = JSON.parse(text) as { type: string; tick: number };
    if (message.type !== 'tick') return null;
    return message.tick <= until ? '{"v": 1, "w": 0}' : null;
  });

const remoteSection = () => screen.getByRole('region', { name: 'Controle remoto' });
const tickShown = () => screen.getByTestId('tick').textContent;

describe('Controle remoto na interface', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    return () => vi.useRealTimers();
  });

  it('US2-AC1/AC2/AC4: conecta, avança esperando a resposta e desconecta', async () => {
    const urls: string[] = [];
    render(
      <App
        examples={examples}
        connectRemote={(url) => {
          urls.push(url);
          return Promise.resolve(program());
        }}
      />,
    );
    const input = within(remoteSection()).getByLabelText('Endereço do controlador remoto');
    expect(input).toHaveValue('ws://localhost:8765');
    await userEvent.clear(input);
    await userEvent.type(input, 'ws://robo:9000');
    await userEvent.click(within(remoteSection()).getByRole('button', { name: 'Conectar' }));
    expect(urls).toEqual(['ws://robo:9000']);
    expect(within(remoteSection()).getByText('remoto')).toBeInTheDocument();
    expect(within(remoteSection()).getByText('ws://robo:9000')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Avançar um tick' }));
    await waitFor(() => expect(tickShown()).toBe('1'));

    await userEvent.click(within(remoteSection()).getByRole('button', { name: 'Desconectar' }));
    expect(tickShown()).toBe('0');
    expect(within(remoteSection()).queryByText('remoto')).not.toBeInTheDocument();
  });

  it('US2-AC3: sem resposta, a interface mostra o erro', async () => {
    render(<App examples={examples} connectRemote={() => Promise.resolve(program(0))} />);
    await userEvent.click(within(remoteSection()).getByRole('button', { name: 'Conectar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Avançar um tick' }));
    expect(await within(remoteSection()).findByRole('alert')).toHaveTextContent(
      'controlador remoto não respondeu em 2000 ms (tick 1)',
    );
  });

  it('falha ao conectar aparece no painel', async () => {
    render(
      <App
        examples={examples}
        connectRemote={(url) =>
          Promise.reject(new Error(`não foi possível conectar ao controlador remoto em ${url}`))
        }
      />,
    );
    await userEvent.click(within(remoteSection()).getByRole('button', { name: 'Conectar' }));
    expect(within(remoteSection()).getByRole('alert')).toHaveTextContent(
      'não foi possível conectar ao controlador remoto em ws://localhost:8765',
    );
  });
});
