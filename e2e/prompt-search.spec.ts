import { PrismaClient } from '@/generated/prisma/client';
import test, { expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

test.describe('Prompt Search in Sidebar', () => {
  test('real-time filter search based on typed term', async ({ page }) => {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    const prisma = new PrismaClient({ adapter });

    const uniqueAlpha = `E2E search Alpha ${Date.now()}`;
    const uniqueBeta = `E2E search Beta ${Date.now()}`;

    await prisma.prompt.createMany({
      data: [
        { title: uniqueAlpha, content: 'Alpha content' },
        { title: uniqueBeta, content: 'Beta content' },
      ],
    });
    await prisma.$disconnect();

    await page.goto('/');

    const searchInput = page.getByPlaceholder('Buscar prompts...');
    await expect(searchInput).toBeVisible();

    await searchInput.fill(uniqueAlpha);
    await expect(page.getByText(uniqueAlpha)).toHaveCount(1);

    await searchInput.fill(uniqueBeta);
    await expect(page.getByText(uniqueBeta)).toHaveCount(1);

    const notExist = `E2E Search Not Exist ${Date.now()}`;
    await searchInput.fill(notExist);
    await expect(page.getByText(notExist)).toHaveCount(0);
  });
});
