import { test, expect, Page } from '@playwright/test';

test('should load initial page', async ({ page }: { page: Page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Selecione um prompt' })
  ).toBeVisible();
  await expect(
    page.getByText('Escolha um prompt da lista ao lado para gerenciar')
  ).toBeVisible();
});
