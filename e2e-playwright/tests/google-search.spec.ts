import { expect, test } from '@playwright/test';

test('Google search title contains the query', async ({ page }) => {
  await page.goto('https://www.google.co.in/?hl=en');

  const consentButton = page
    .getByRole('button', { name: /accept all|i agree/i })
    .first();
  if (await consentButton.isVisible().catch(() => false)) {
    await consentButton.click();
  }

  const searchInput = page.locator('[name="q"]');
  await searchInput.fill('abc');
  await searchInput.press('Enter');

  await expect(page).toHaveTitle(/abc/i);
});
