// @vitest-environment jsdom
// Biblioteca de componentes (tasks 002 T009; FR-013).
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Badge,
  Button,
  ButtonGroup,
  CodeEditor,
  EmptyState,
  Field,
  IconButton,
  IssueList,
  Kbd,
  Panel,
  SegmentedControl,
  Select,
  Slider,
  SplitLayout,
  Stat,
  StatusDot,
  Tabs,
  Toggle,
  Toolbar,
  ToolbarSeparator,
  ToolbarSpacer,
  cx,
} from 'src/ui';

describe('Button e IconButton', () => {
  it('dispara clique, aplica variante e respeita disabled/loading', async () => {
    const onClick = vi.fn();
    render(
      <>
        <Button variant="primary" icon={<Play />} onClick={onClick}>
          Executar
        </Button>
        <Button disabled onClick={onClick}>
          Desativado
        </Button>
        <Button loading>Carregando</Button>
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Executar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Desativado' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Executar' })).toHaveClass('primary');
    expect(screen.getByRole('button', { name: 'Carregando' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Carregando' })).toHaveAttribute('aria-busy', 'true');
  });

  it('IconButton tem rótulo acessível e estado ativo', async () => {
    const onClick = vi.fn();
    render(<IconButton label="Centralizar vista" icon={<Play />} active onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Centralizar vista' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('title', 'Centralizar vista');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});

describe('estrutura', () => {
  it('Toolbar, ButtonGroup, Panel, SplitLayout e EmptyState renderizam conteúdo', () => {
    render(
      <SplitLayout
        asideWidth={300}
        main={
          <Toolbar label="Controles">
            <ButtonGroup label="Grupo">
              <Button>A</Button>
            </ButtonGroup>
            <ToolbarSeparator />
            <ToolbarSpacer />
            <Kbd>Espaço</Kbd>
          </Toolbar>
        }
        aside={
          <Panel title="Robôs" icon={<Play />} actions={<Button size="sm">Ação</Button>}>
            <EmptyState title="Nada aqui" description="Carregue um mundo" icon={<Play />} />
          </Panel>
        }
      />,
    );
    expect(screen.getByRole('toolbar', { name: 'Controles' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Grupo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Robôs' })).toBeInTheDocument();
    expect(screen.getByText('Nada aqui')).toBeInTheDocument();
    expect(screen.getByText('Espaço').tagName).toBe('KBD');
  });

  it('Panel sem cabeçalho', () => {
    render(<Panel padded={false}>conteúdo</Panel>);
    expect(screen.queryByRole('heading')).toBeNull();
  });
});

describe('Tabs', () => {
  function Harness() {
    const [value, setValue] = useState('a');
    return (
      <Tabs
        label="Abas"
        value={value}
        onChange={setValue}
        tabs={[
          { id: 'a', label: 'Mundo', icon: <Play /> },
          { id: 'b', label: 'Controlador', badge: 2 },
        ]}
      />
    );
  }

  it('troca por clique e por setas', async () => {
    render(<Harness />);
    const [first, second] = screen.getAllByRole('tab');
    expect(first).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(second!);
    expect(second).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(first).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowLeft}');
    expect(second).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('a');
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

describe('formulário e estado', () => {
  it('Select emite o valor escolhido', async () => {
    const onChange = vi.fn();
    render(
      <Select
        label="Velocidade"
        hideLabel
        value="1"
        onChange={onChange}
        options={[
          { value: '1', label: '1×' },
          { value: '2', label: '2×' },
        ]}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Velocidade'), '2');
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('Toggle alterna', async () => {
    const onChange = vi.fn();
    render(<Toggle label="Mostrar raios" checked onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: 'Mostrar raios' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('Field, Badge, StatusDot e Stat', () => {
    render(
      <Field label="Robô" hint="dica">
        <Badge tone="danger">erro</Badge>
        <StatusDot tone="success" label="ok" pulse />
        <Stat label="Tick" value={42} unit="s" />
      </Field>,
    );
    expect(screen.getByText('Robô')).toBeInTheDocument();
    expect(screen.getByText('dica')).toBeInTheDocument();
    expect(screen.getByText('erro')).toHaveClass('danger');
    expect(screen.getByText('ok')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('IssueList lista local e mensagem e some quando vazia', () => {
    const { rerender } = render(
      <IssueList
        issues={[
          { location: 'robots[0].radius', message: 'deve ser maior que 0' },
          { message: 'geral' },
        ]}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Erros encontrados (2)');
    expect(screen.getByText('robots[0].radius')).toBeInTheDocument();
    rerender(<IssueList issues={[]} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('cx ignora valores falsos', () => {
    expect(cx('a', false, null, undefined, 'b')).toBe('a b');
  });
});

describe('CodeEditor', () => {
  it('mostra o valor, sincroniza mudanças externas e emite edições', async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <CodeEditor
        value="function onTick(robot) {}"
        onChange={onChange}
        language="javascript"
        ariaLabel="Código"
      />,
    );
    expect(container.textContent).toContain('function onTick(robot) {}');
    rerender(
      <CodeEditor
        value='{ "version": 1 }'
        onChange={onChange}
        language="javascript"
        ariaLabel="Código"
      />,
    );
    expect(container.textContent).toContain('"version"');
    const content = screen.getByLabelText('Código');
    await userEvent.click(content);
    await userEvent.keyboard('x');
    expect(onChange).toHaveBeenCalled();
    rerender(<CodeEditor value="{}" onChange={onChange} language="json" ariaLabel="Mundo" />);
    expect(screen.getByLabelText('Mundo')).toBeInTheDocument();
  });
});

describe('SegmentedControl', () => {
  it('seleciona por clique, respeita desabilitado e usa o título como nome', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="Câmera"
        value="a"
        onChange={onChange}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: <Play />, title: 'Topo' },
          { value: 'c', label: 'C', disabled: true },
        ]}
      />,
    );
    const group = screen.getByRole('radiogroup', { name: 'Câmera' });
    expect(within(group).getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(within(group).getByRole('radio', { name: 'Topo' }));
    expect(onChange).toHaveBeenCalledWith('b');
    await userEvent.click(within(group).getByRole('radio', { name: 'C' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('CodeEditor no tema escuro', () => {
  it('renderiza com o tema escuro', () => {
    const { container } = render(
      <CodeEditor
        value="let a = 1;"
        onChange={() => {}}
        language="javascript"
        ariaLabel="Escuro"
        theme="dark"
      />,
    );
    expect(container.querySelector('.cm-editor')).not.toBeNull();
    expect(container.textContent).toContain('let a = 1;');
  });
});

describe('Slider', () => {
  it('emite o valor numérico e respeita desabilitado', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Slider label="Linha do tempo" min={0} max={10} value={3} onChange={onChange} />,
    );
    fireEvent.change(screen.getByLabelText('Linha do tempo'), { target: { value: '7' } });
    expect(onChange).toHaveBeenCalledWith(7);
    rerender(
      <Slider
        label="Linha do tempo"
        hideLabel
        min={0}
        max={0}
        value={0}
        onChange={onChange}
        disabled
      />,
    );
    expect(screen.getByLabelText('Linha do tempo')).toBeDisabled();
  });
});
