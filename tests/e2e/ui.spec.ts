import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { geocodingResponse, mockWeatherApi } from '../fixtures/weatherApi';

test.beforeEach(async ({ page }) => {
  await mockWeatherApi(page);
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    const city = geocodingResponse.results[0];
    return route.fulfill({
      json: {
        results: [
          city,
          {
            ...city,
            id: 2,
            admin1: 'Outra região',
            country: 'Portugal',
            latitude: 38.72,
            longitude: -9.14,
          },
        ],
      },
    });
  });
});

test('audita estados de loading, vazio e erro com status persistente', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let searches = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    searches += 1;
    if (searches === 1) {
      await pending;
      await route.fulfill({ json: {} });
    } else await route.fulfill({ status: 503, json: {} });
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const status = page.getByRole('status');
    await expect(status).toHaveCount(1);
    await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    await expect(status).toContainText('Carregando');
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    release();
    await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
    await expect(status).toHaveCount(1);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('HTTP 503');
    await expect(page.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  } finally {
    release();
  }
});

for (const width of [320, 375, 768, 1440]) {
  test(`layout ${width}px e acessibilidade`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveCSS(
      'clip-path',
      'inset(50%)',
    );
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveCSS(
      'clip-path',
      'none',
    );
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(
      page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('listitem'),
    ).toHaveCount(5);
    await page.getByText('Localidades encontradas (2)', { exact: true }).click();
    await expect(page.getByRole('group', { name: 'Localidades encontradas' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.screenshot({
      path: testInfo.outputPath(`layout-${width}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}
