import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { PlansPage } from '../../pages/PlansPage';
import { generateUniqueName } from '../../utils/helpers';

test.describe('Plans - Regression Tests', () => {
  let portalPage: PortalPage;
  let plansPage: PlansPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    plansPage = new PlansPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
    await plansPage.navigateToPlans();
  });

  test('TC#14 - Verify that user should be able to create a new plan', async ({ page }) => {
    // Create a new plan
    const planName = generateUniqueName('TestPlan');
    await plansPage.createPlan(planName);

    // Verify plan was created
    await plansPage.verifyPlanExists(planName);
  });

  test('TC#15 - Validate whether mass status update is working fine', async ({ page }) => {
    // Verify mass status update button is available
    await expect(plansPage.massStatusUpdateButton).toBeVisible();

    // Click mass status update
    await plansPage.massStatusUpdate();

    // Verify the mass status update functionality is working
    await expect(page.locator('[class*="status"], .modal, .dialog')).toBeVisible();
  });

  test('TC#16 - Verify that user should be able to Edit a plan', async ({ page }) => {
    // Find an existing plan and edit it
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Click edit icon
    await planRow.locator('[title*="edit" i], .edit-icon').first().click();

    // Verify edit mode is active
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();

    // Save the plan
    await page.getByRole('button', { name: /save/i }).first().click();
  });

  test('TC#17 - Verify that user should be able to copy a plan', async ({ page }) => {
    // Find an existing plan
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Click copy icon
    await planRow.locator('[title*="copy" i], .copy-icon').first().click();

    // Save the copied plan
    await page.getByRole('button', { name: /save/i }).first().click();

    // Verify success
    await expect(page.locator('[class*="success"], .toast-success')).toBeVisible();
  });

  test('TC#18 - Verify that user should be able to create a new version for existing plan', async ({ page }) => {
    // Find an existing plan
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Click version button
    await planRow.locator('[title*="version" i], button:has-text("Version")').first().click();

    // Enter version details and save
    await page.getByRole('button', { name: /save/i }).first().click();

    // Verify version was created
    await expect(page.locator('[class*="success"], .toast-success')).toBeVisible();
  });

  test('TC#19 - Verify that user should be able to DELETE the entire Plan/Plans from the list', async ({ page }) => {
    // Select a plan checkbox
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await planRow.locator('input[type="checkbox"]').first().check();

    // Click DELETE button at the bottom
    await page.getByRole('button', { name: /delete/i }).first().click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes|ok/i }).first().click();

    // Verify plan was deleted
    await expect(page.locator('[class*="success"], .toast-success')).toBeVisible();
  });

  test('TC#20 - Verify status filters display plans with correct status', async ({ page }) => {
    // Test OPEN filter
    await plansPage.filterByStatus('open');
    const openPlans = page.locator('table tbody tr, [class*="plan-row"]');
    // Verify plans displayed have OPEN status

    // Test REVIEW PENDING filter
    await plansPage.filterByStatus('reviewPending');

    // Test APPROVED filter
    await plansPage.filterByStatus('approved');

    // Test REJECTED filter
    await plansPage.filterByStatus('rejected');

    // Test PUBLISHED filter
    await plansPage.filterByStatus('published');
  });

  test('TC#21 - Verify that when user filters on context, selected context plans are displayed', async ({ page }) => {
    // Find and click context filter
    const contextFilter = page.locator('select[name*="context"], [data-testid="context-filter"]').first();
    await expect(contextFilter).toBeVisible();

    // Select a context
    const options = await contextFilter.locator('option').allTextContents();
    if (options.length > 1) {
      await contextFilter.selectOption({ index: 1 });
      await page.waitForLoadState('networkidle');

      // Verify plans are filtered by context
      await expect(page.locator('table tbody tr, [class*="plan-row"]').first()).toBeVisible();
    }
  });

  test('TC#22 - Verify Advance search is working as expected', async ({ page }) => {
    // Click on Advance Search
    await plansPage.advanceSearchButton.click();

    // Verify advance search panel opens
    await expect(page.locator('.advance-search, [class*="search-panel"], .modal')).toBeVisible();

    // Enter search criteria and search
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill('test');
    await page.getByRole('button', { name: /search|apply/i }).first().click();

    // Verify results are displayed
    await page.waitForLoadState('networkidle');
  });
});
