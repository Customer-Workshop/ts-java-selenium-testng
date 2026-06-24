import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { MyWorkQueuePage } from '../../pages/MyWorkQueuePage';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe('My Work Queue - Regression Tests', () => {
  let portalPage: PortalPage;
  let workQueuePage: MyWorkQueuePage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    workQueuePage = new MyWorkQueuePage(page);
    dashboardPage = new DashboardPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
    await workQueuePage.navigateToMyWorkQueue();
  });

  test('TC#23 - Verify that user should be able to Edit a plan from My Work Queue', async ({ page }) => {
    // Find an existing plan in work queue
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Click edit
    await planRow.locator('[title*="edit" i], .edit-icon').first().click();

    // Verify edit mode is active
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();

    // Save changes
    await page.getByRole('button', { name: /save/i }).first().click();
  });

  test('TC#24 - Verify that user should be able to copy a plan from My Work Queue', async ({ page }) => {
    // Find an existing plan in work queue
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Click copy
    await planRow.locator('[title*="copy" i], .copy-icon').first().click();

    // Save the copied plan
    await page.getByRole('button', { name: /save/i }).first().click();

    // Verify success
    await expect(page.locator('[class*="success"], .toast-success')).toBeVisible();
  });

  test('TC#25 - Verify that user should be able to create a new version from My Work Queue', async ({ page }) => {
    // Find an existing plan
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Click version button
    await planRow.locator('[title*="version" i], button:has-text("Version")').first().click();

    // Save
    await page.getByRole('button', { name: /save/i }).first().click();

    // Verify success
    await expect(page.locator('[class*="success"], .toast-success')).toBeVisible();
  });

  test('TC#26 - Verify that User should be able to change the status (workflow) of a Plan', async ({ page }) => {
    // Find a plan in work queue
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Edit the plan
    await planRow.locator('[title*="edit" i], .edit-icon').first().click();

    // Verify status change buttons are available
    const statusButtons = page.getByRole('button', { name: /submit for review|approve|publish/i });
    await expect(statusButtons.first()).toBeVisible();
  });

  test('TC#27 - Verify that published plans are not available in My Work Queue', async ({ page }) => {
    // Verify that any published plans should NOT be in the work queue
    // Check that plans in the queue do not have "PUBLISHED" status
    const publishedIndicator = page.locator('[data-status="published"], .status-published');
    await expect(publishedIndicator).not.toBeVisible();
  });
});
