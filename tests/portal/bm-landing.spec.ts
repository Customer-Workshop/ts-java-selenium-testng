import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe('BM Landing Page - Regression Tests', () => {
  let portalPage: PortalPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    dashboardPage = new DashboardPage(page);
    await page.goto('/portal#/');
  });

  test('TC#3 - User should be able to successfully see the dashboard of BM', async ({ page }) => {
    // Click on Benefits Management instance
    await portalPage.clickBenefitsManagement();

    // Verify dashboard loads without errors
    await dashboardPage.verifyDashboardLoaded();

    // Verify no error messages are displayed
    const errors = page.locator('.error, [class*="error"], .alert-danger');
    await expect(errors).not.toBeVisible();
  });
});
