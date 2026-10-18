import { test, expect } from '@playwright/test';

test('UI: homepage displays the expected heading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('QA CI Lab');
  await expect(page.getByRole('heading', { name: 'QA CI Lab' })).toBeVisible();
});

test('API: health endpoint returns the expected contract', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(201);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(await response.json()).toEqual({ status: 'ok', service: 'qa-ci-lab' });
});

test('E2E: user checks the real API through the UI', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Check API' }).click();
  await expect(page.getByRole('status')).toHaveText('API connected');
});

test('redirect: validates initial response and final destination', async ({ request, page }) => {
  const initial = await request.get('/legacy', { maxRedirects: 0 });
  expect(initial.status()).toBe(302);
  expect(initial.headers().location).toBe('/');
  const final = await page.goto('/legacy');
  expect(final?.status()).toBe(200);
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { name: 'QA CI Lab' })).toBeVisible();
});

test('CI exercise: intentional failure when explicitly enabled', async ({ page }) => {
  test.skip(process.env.DEMO_FAIL !== 'true', 'Enable DEMO_FAIL to exercise a red pipeline');
  await page.goto('/');
  await expect(page.getByRole('heading')).toHaveText('Intentional wrong heading');
});
