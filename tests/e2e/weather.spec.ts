import { expect, test } from '@playwright/test';
import { forecastResponse, geocodingResponse, mockWeatherApi } from '../fixtures/weatherApi';

test.beforeEach(async ({ page }) => {
  await mockWeatherApi(page);
});

test('429 bloqueia retry até o prazo sem repetir automaticamente', async ({ page }) => {
  await page.clock.install({ time: new Date(forecastResponse.current.time * 1000) });
  let calls = 0;
  await page.route('https://api.open-meteo.com/**', (route) => {
    calls += 1;
    return calls === 1
      ? route.fulfill({
          status: 429,
          headers: {
            'Retry-After': '2',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'Retry-After',
          },
          json: {},
        })
      : route.fulfill({ json: forecastResponse });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const retry = page.getByRole('button', { name: 'Tentar novamente' });
  await expect(page.getByRole('alert')).toContainText('Limite de consultas');
  await expect(retry).toBeDisabled();
  await page.clock.fastForward(2000);
  await expect(retry).toBeEnabled();
  expect(calls).toBe(1);
  await retry.click();
  await expect(page.getByRole('heading', { name: 'São Paulo', exact: true })).toBeVisible();
  expect(calls).toBe(2);
});

test('busca → cidade → cinco dias → Fahrenheit sem novo request', async ({ page }) => {
  const calls = { geocoding: 0, forecast: 0 };
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('request', (request) => {
    if (new URL(request.url()).hostname === 'geocoding-api.open-meteo.com') calls.geocoding += 1;
    if (new URL(request.url()).hostname === 'api.open-meteo.com') calls.forecast += 1;
  });
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        ...forecastResponse,
        current: { ...forecastResponse.current, temperature_2m: 0 },
      },
    }),
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'São Paulo', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'São Paulo', exact: true })).toBeFocused();
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveCount(5);
  await expect(page.getByRole('group', { name: '0,0 °C', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(page.getByRole('group', { name: '32,0 °F', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(forecast.getByRole('listitem').first()).toContainText('80,8 °F');
  expect(calls).toEqual({ geocoding: 1, forecast: 1 });
  expect(runtimeErrors).toEqual([]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Qual é o seu próximo destino?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Celsius' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('geocoding sem results mostra vazio e não consulta forecast', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: {} }),
  );
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecastRequests += 1;
    return route.fulfill({ json: forecastResponse });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Sem correspondências');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toHaveCount(0);
  expect(forecastRequests).toBe(0);
});

test('busca e conversão no viewport mobile 375×812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'São Paulo', exact: true })).toBeVisible();
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast.getByRole('listitem')).toHaveCount(5);
  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(page.getByRole('group', { name: '76,1 °F', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
});

test('falha HTTP no forecast → retry sem repetir geocoding', async ({ page }) => {
  let searches = 0;
  let forecasts = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    searches += 1;
    return route.fulfill({ json: geocodingResponse });
  });
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecasts += 1;
    return forecasts === 1
      ? route.fulfill({ status: 503, json: { reason: 'Falha controlada' } })
      : route.fulfill({ json: forecastResponse });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('HTTP 503');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'São Paulo', exact: true })).toBeVisible();
  expect(searches).toBe(1);
  expect(forecasts).toBe(2);
});

test('resposta parcial exibe indisponível e pode ser atualizada', async ({ page }) => {
  const partial = structuredClone(forecastResponse);
  partial.daily.temperature_2m_max[0] = null;
  let forecasts = 0;
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecasts += 1;
    return route.fulfill({ json: forecasts === 1 ? partial : forecastResponse });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const firstDay = page
    .getByRole('region', { name: 'Previsão de 5 dias' })
    .getByRole('listitem')
    .first();
  await expect(firstDay).toContainText('Indisponível');
  await expect(page.getByText('Alguns dados estão indisponíveis.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Atualizar previsão' }).click();
  await expect(firstDay).toContainText('27,1 °C');
  await expect(firstDay).not.toContainText('Indisponível');
  await expect(page.getByText('Alguns dados estão indisponíveis.', { exact: false })).toHaveCount(
    0,
  );
});

test('unidade escolhida durante loading vale para a resposta pendente', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    await pending;
    await route.fulfill({ json: forecastResponse });
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Carregando');
    await expect(page.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    await page.getByRole('button', { name: 'Fahrenheit' }).click();
    release();
    await expect(page.getByRole('group', { name: '76,1 °F', exact: true })).toBeVisible();
    await expect(page.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    await expect(page.getByRole('button', { name: 'Fahrenheit' })).toBeFocused();
  } finally {
    release();
  }
});

test('input vazio e espaços não iniciam consulta', async ({ page }) => {
  let requests = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).hostname.endsWith('open-meteo.com')) requests += 1;
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('2 a 100');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('   ');
  await page.getByRole('searchbox', { name: 'Cidade' }).press('Enter');
  await expect(page.getByRole('alert')).toContainText('2 a 100');
  expect(requests).toBe(0);
});

test('caracteres especiais são codificados e markup externo é texto seguro', async ({ page }) => {
  const query = "D'Oeste & São Tomé";
  const name = '<img src=x onerror="document.body.dataset.executed=1">';
  let received = '';
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    received = new URL(route.request().url()).searchParams.get('name') ?? '';
    return route.fulfill({ json: { results: [{ ...geocodingResponse.results[0], name }] } });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox', { name: 'Cidade' }).fill(query);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  expect(received).toBe(query);
  expect(await page.evaluate(() => document.body.dataset.executed)).toBeUndefined();
});

for (const missing of ['current', 'daily']) {
  test(`forecast sem ${missing} mostra erro recuperável`, async ({ page }) => {
    const incomplete: Record<string, unknown> = structuredClone(forecastResponse);
    delete incomplete[missing];
    await page.route('https://api.open-meteo.com/**', (route) =>
      route.fulfill({ json: incomplete }),
    );
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Resposta incompleta');
    await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
    await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toHaveCount(0);
    await expect(page.getByRole('main')).toHaveAttribute('aria-busy', 'false');
  });
}

test('rede offline → mensagem amigável → retry após reconectar', async ({ page, context }) => {
  let offline = true;
  let searches = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    searches += 1;
    return offline
      ? route.abort('internetdisconnected')
      : route.fulfill({ json: geocodingResponse });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await context.setOffline(true);
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Falha de rede.');
  offline = false;
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'São Paulo', exact: true })).toBeVisible();
  expect(searches).toBe(2);
});

test('falha de nova busca preserva a última consulta sem trocar sua identidade', async ({
  page,
}) => {
  let searches = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    searches += 1;
    return searches === 1
      ? route.fulfill({ json: geocodingResponse })
      : route.abort('internetdisconnected');
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const input = page.getByRole('searchbox', { name: 'Cidade' });
  await input.fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'São Paulo', exact: true })).toBeVisible();
  await input.fill('Outra cidade');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Falha de rede.');
  await expect(page.getByText('Última consulta concluída', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'São Paulo', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Outra cidade', exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('listitem'),
  ).toHaveCount(5);
});

test('resposta parcial não mostra NaN, undefined nem condição inventada', async ({ page }) => {
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        ...forecastResponse,
        current: {
          ...forecastResponse.current,
          temperature_2m: null,
          relative_humidity_2m: null,
          wind_speed_10m: -1,
          surface_pressure: -2,
          weather_code: 999,
          precipitation: null,
        },
      },
    }),
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const current = page.getByRole('region', { name: 'Clima atual' });
  await expect(current.getByText('Indisponível', { exact: true })).toHaveCount(4);
  await expect(current.getByText('Condição indisponível')).toBeVisible();
  await expect(current.getByText('0 mm', { exact: true })).toBeVisible();
  await expect(page.getByRole('main')).not.toContainText(/NaN|undefined|Infinity/);
});

test('resultado não interrompe um novo termo ainda em edição', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    await pending;
    await route.fulfill({ json: forecastResponse });
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const input = page.getByRole('searchbox', { name: 'Cidade' });
    await input.fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Carregando');
    await input.fill('Curitiba');
    release();
    await expect(page.getByRole('heading', { name: 'São Paulo', exact: true })).toBeVisible();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Curitiba');
  } finally {
    release();
  }
});
