import { test, expect } from '@playwright/test';
import { GooglePage } from '../pages/google.page.js';

/**
 * Google search test.
 *
 * Selenium equivalent: GoogleSearchTest.java
 * - TestNG @Test → Playwright test()
 * - Assert.assertTrue(driver.getTitle().contains("abc")) → expect(page).toHaveTitle(/abc/)
 * - driver.get(url) → page.goto(url)
 * - PageinstancesFactory.getInstance() → new GooglePage(page)
 */
test.describe('Google Search', () => {
  test('should display search results for a query', async ({ page }) => {
    const googlePage = new GooglePage(page);
    await googlePage.navigate('https://www.google.com/');
    await googlePage.searchText('abc');
    await expect(page).toHaveTitle(/abc/i);
  });
});
