import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import CityResults from '../../src/components/CityResults';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastList from '../../src/components/ForecastList';
import SearchBar from '../../src/components/SearchBar';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';
import UnitToggle from '../../src/components/UnitToggle';
import { mockWeatherData } from '../../src/fixtures/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { Unit } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

describe('controles acessíveis', () => {
  it('valida limites por pontos de código, sem rejeitar nomes Unicode válidos', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    for (const value of ['', '   ', 'a', 'a'.repeat(101)]) {
      fireEvent.change(input, { target: { value } });
      await user.click(screen.getByRole('button', { name: 'Buscar' }));
    }
    expect(onSearch).not.toHaveBeenCalled();
    const unicode = '𠮷'.repeat(100);
    fireEvent.change(input, { target: { value: unicode } });
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith(unicode);
  });
  it('bloqueia somente o envio idêntico em andamento, não a edição', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} pendingQuery="São Paulo" />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, 'São Paulo');
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'true');
    expect(input).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveAttribute('aria-disabled', 'true');
    await user.clear(input);
    await user.type(input, 'Curitiba');
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
  });
  it('distingue homônimos por coordenadas e seleciona pela identidade', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const first = mockWeatherData.city;
    const second = { ...first, key: 'other', latitude: 38.72, longitude: -9.14 };
    const unnamedRegion = {
      ...first,
      key: 'no-region',
      name: 'Destino',
      region: null,
      country: null,
    };
    render(
      <CityResults
        cities={[first, second, unnamedRegion]}
        selectedKey={first.key}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByText('Localidades encontradas (3)'));
    const group = screen.getByRole('group', { name: 'Localidades encontradas' });
    expect(
      within(group).getByRole('button', { name: 'São Paulo, São Paulo, Brasil (-23.55, -46.63)' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'Destino (-23.55, -46.63)' })).toBeVisible();
    await user.click(
      within(group).getByRole('button', { name: 'São Paulo, São Paulo, Brasil (38.72, -9.14)' }),
    );
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(second);
  });

  it('envia o termo pelo botão Buscar', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it('não envia vazio e envia o nome com trim por Enter', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, '   {Enter}');
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('2 a 100');
    await user.clear(input);
    await user.type(input, '  Lisboa  {Enter}');
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Lisboa');
  });

  it('respeita disabled', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} disabled />);
    expect(screen.getByRole('searchbox')).toBeDisabled();
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('troca unidade por teclado e identifica a opção ativa', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Unidade de temperatura' });
    expect(within(group).getByRole('button', { name: 'Celsius' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    within(group).getByRole('button', { name: 'Fahrenheit' }).focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });

  it('conecta UnitToggle e CurrentWeather: 0 °C passa a 32 °F', async () => {
    const user = userEvent.setup();
    function TemperaturePreview() {
      const [unit, setUnit] = useState<Unit>('celsius');
      return (
        <>
          <UnitToggle unit={unit} onChange={setUnit} />
          <CurrentWeather
            city={mockWeatherData.city}
            current={{ ...mockWeatherData.current!, temperatureC: 0 }}
            unit={unit}
          />
        </>
      );
    }
    render(<TemperaturePreview />);
    expect(screen.getByRole('group', { name: '0,0 °C' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByRole('group', { name: '32,0 °F' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByRole('group', { name: '0,0 °C' })).not.toBeInTheDocument();
  });
});

describe('dados e estados', () => {
  it('mostra métricas e cinco dias sem perder valores zero', () => {
    render(
      <>
        <CurrentWeather
          city={mockWeatherData.city}
          current={mockWeatherData.current}
          unit="celsius"
        />
        <ForecastList days={mockWeatherData.daily} today="2026-10-29" unit="celsius" />
      </>,
    );
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.getByText('64 %')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByLabelText('Probabilidade de chuva: 80 %')).toBeInTheDocument();
  });

  it('não inventa dados atuais ausentes', () => {
    render(<CurrentWeather city={mockWeatherData.city} current={null} unit="celsius" />);
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível').length).toBeGreaterThan(1);
  });

  it('mostra loading, vazio e ação de recuperação', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { rerender } = render(<LoadingState />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    rerender(<EmptyState title="Sem dados" hint="Outro destino" />);
    expect(screen.getByRole('status')).toHaveTextContent('Sem dados');
    rerender(<ErrorState message="Falha simulada" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falha simulada');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('integra consulta, unidade, vazio, erro e retry sem estado mockado no App', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Qual é o seu próximo destino?' }),
    ).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo{Enter}');
    expect(await screen.findByLabelText('24,5 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByLabelText('76,1 °F')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Atualizar previsão' }));
    expect(await screen.findByLabelText('76,1 °F')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenCalledOnce();
    vi.mocked(searchCities).mockResolvedValueOnce([]);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    vi.mocked(searchCities).mockRejectedValueOnce(
      new WeatherServiceError('Falha de rede.', 'network'),
    );
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByLabelText('76,1 °F')).toBeInTheDocument();
  });
});
