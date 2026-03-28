import { PrismaClient } from '@/generated/prisma/client';
import { expect, test } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

test('Prompt Creation via UI (success)', async ({ page }) => {
  const uniqueTitle = `E2E Prompt ${Date.now()}`;
  const content = `Conteúdo gerado via E2E`;

  await page.goto('/new');
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();
  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="content"]', content);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.waitForSelector('text=Prompt criado com sucesso', {
    state: 'visible',
    timeout: 15000,
  });
});

test('Duplicate title validation in Prompt Creation', async ({ page }) => {
  const duplicateTitle = `E2E Prompt Duplicate`;
  const content = 'Content';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  await prisma.prompt.deleteMany({ where: { title: duplicateTitle } });
  await prisma.prompt.create({
    data: {
      title: duplicateTitle,
      content,
    },
  });
  await prisma.$disconnect();

  await page.goto('/new');
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();
  await page.fill('input[name="title"]', duplicateTitle);
  await page.fill('textarea[name="content"]', content);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.waitForSelector('text=Este prompt já existe', {
    state: 'visible',
    timeout: 15000,
  });

  await expect(page.getByRole('heading', { name: duplicateTitle })).toHaveCount(
    1
  );
});
