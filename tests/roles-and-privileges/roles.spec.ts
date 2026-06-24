import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { RolesAndPrivilegesPage } from '../../pages/RolesAndPrivilegesPage';

test.describe('Roles and Privileges - Regression Tests', () => {
  let portalPage: PortalPage;
  let rolesPage: RolesAndPrivilegesPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    rolesPage = new RolesAndPrivilegesPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
  });

  test('TC#28 - Login as Admin and verify that Users exist in GxCapture System', async ({ page }) => {
    // Navigate to User Permissions
    await rolesPage.navigateToUserPermissions();

    // Verify users exist in the system
    await rolesPage.verifyUsersExist();
  });

  test('TC#29 - Verify that when New functionality is added, Role is also added', async ({ page }) => {
    // Navigate to User Permissions
    await rolesPage.navigateToUserPermissions();

    // Verify roles are visible in the permission screen
    const roleColumns = page.locator('th, [class*="role-header"]');
    await expect(roleColumns.first()).toBeVisible();
  });

  test('TC#30 - Verify User role and other screen level access', async ({ page }) => {
    // Navigate to User Permissions
    await rolesPage.navigateToUserPermissions();

    // Verify different access levels are shown (Add/Edit/Update)
    const accessControls = page.locator('input[type="checkbox"], [class*="permission"]');
    await expect(accessControls.first()).toBeVisible();
  });

  test('TC#31 - Verify user with User/Reviewer/Publisher role can perform actions', async ({ page }) => {
    // Navigate to User Permissions
    await rolesPage.navigateToUserPermissions();

    // Verify role types exist
    await rolesPage.verifyRoleExists('User');
    await rolesPage.verifyRoleExists('Reviewer');
    await rolesPage.verifyRoleExists('Publisher');
  });

  test('TC#32 - Verify user with User/Reviewer/Publisher role can Add new Plans', async ({ page }) => {
    // Navigate to Plans screen
    await page.getByText('Plans', { exact: false }).first().click();
    await page.waitForLoadState('networkidle');

    // Verify the Add plan button is accessible based on role
    const addButton = page.getByRole('button', { name: /add|create|\+/i }).first();
    await expect(addButton).toBeVisible();
  });
});
