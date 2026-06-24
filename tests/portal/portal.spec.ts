import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Portal Screen - Regression Tests', () => {
  let portalPage: PortalPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    await page.goto('/portal#/');
  });

  test('TC#1 - Portal Admin should be able to add/edit user permissions in User Management', async ({ page }) => {
    // Navigate to User Management
    await portalPage.navigateToUserManagement();

    // Verify User Management page is accessible
    await expect(page.getByText('User Management', { exact: false })).toBeVisible();

    // Verify admin can see user permission controls
    const addEditControls = page.getByRole('button', { name: /add|edit|save/i });
    await expect(addEditControls.first()).toBeVisible();
  });

  test('TC#2 - SRP and M3P instances not to be presented in Portal for Redbird', async ({ page }) => {
    // Verify SRP instance is NOT visible
    await portalPage.verifyNoSRPInstance();

    // Verify M3P instance is NOT visible
    await portalPage.verifyNoM3PInstance();
  });
});
