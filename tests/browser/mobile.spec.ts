import { test, expect } from '@playwright/test';

test('real server rejects unsigned access and renders mobile error states', async ({ page, request }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  expect((await request.get('/api/workspace')).status()).toBe(401);
  expect((await request.post('/api/operations', { data: { operation: 'payment', values: {} } })).status()).toBe(403);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ['/dashboard', '/clients', '/services', '/staff', '/appointments', '/finance', '/analytics', '/settings']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: 'Данные недоступны' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 390) await page.screenshot({ path: `artifacts/mvp-continuation/${path.slice(1)}-390.png`, fullPage: true });
    }
  }
  expect(errors).toEqual([]);
});

test('onboarding outside Telegram does not fabricate successful identity', async ({ page }) => {
  await page.goto('/onboarding');
  await expect(page.getByRole('heading', { name: 'Создадим ваш салон' })).toBeVisible();
  await page.getByLabel('Название салона').fill('Проверка входа');
  await page.getByRole('button', { name: 'Создать пространство' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Откройте приложение внутри Telegram' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/mvp-continuation/onboarding-390.png', fullPage: true });
});

// Contract-only UI fixture; NOT proof of database persistence or Telegram authorization.
test('UI contract: client sheet focus, submission, error and mobile finance rendering', async ({ page }) => {
  const workspace = { organization: { id: 'org', name: 'Тестовый салон · UI fixture', timezone: 'Asia/Almaty', currency: 'KZT' }, user: { id: 'owner', telegram_user_id: 123 }, role: 'owner', clients: [], staff: [], services: [], appointments: [], payments: [], schedules: [], assignments: [], branches: [], members: [] };
  await page.route('**/api/workspace', async route => {
    if (route.request().method() === 'POST') return route.fulfill({ status: 409, json: { error: 'Тестовая ошибка сохранения' } });
    return route.fulfill({ json: workspace });
  });
  await page.goto('/clients');
  const trigger = page.getByRole('button', { name: 'Добавить клиента' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Имя клиента').fill('Проверка интерфейса');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Тестовая ошибка сохранения');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  for (const path of ['/dashboard', '/finance', '/analytics', '/settings', '/services', '/staff', '/appointments']) {
    await page.goto(path);
    await expect(page.getByText('Загружаем ваш салон…')).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/mvp-continuation/ui-contract-${path.slice(1)}-390.png`, fullPage: true });
  }
});
