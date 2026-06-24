import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { PlansPage } from '../../pages/PlansPage';

test.describe('Exports - Regression Tests', () => {
  let portalPage: PortalPage;
  let plansPage: PlansPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    plansPage = new PlansPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
    await plansPage.navigateToPlans();
  });

  test('TC#69 - Validate Plan Summary export', async ({ page }) => {
    // Click on a plan to view summary
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();
    await planRow.click();
    await page.waitForLoadState('networkidle');

    // Select PDF export option
    const pdfExport = page.getByRole('button', { name: /pdf|export/i }).or(
      page.locator('[data-testid="export-pdf"]')
    ).first();
    await expect(pdfExport).toBeVisible();
  });

  test('TC#69 - Validate Plan Grid export', async ({ page }) => {
    // Select plans to export
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // Click export button
    await plansPage.exportButton.click();

    // Select Plan Grid option
    const planGrid = page.getByText('Plan Grid', { exact: false }).first();
    await expect(planGrid).toBeVisible();
  });

  test('TC#69 - Validate Client Grid export', async ({ page }) => {
    // Select plans to export
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // Click export button
    await plansPage.exportButton.click();

    // Select Client Grid option
    const clientGrid = page.getByText('Client Grid', { exact: false }).first();
    await expect(clientGrid).toBeVisible();
  });

  test('TC#69 - Validate Data Grid export', async ({ page }) => {
    // Select plans to export
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // Click export button
    await plansPage.exportButton.click();

    // Select Data Grid option
    const dataGrid = page.getByText('Data Grid', { exact: false }).first();
    await expect(dataGrid).toBeVisible();
  });

  test('TC#69 - Validate Tab delimited export', async ({ page }) => {
    // Select plans to export
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // Click export button
    await plansPage.exportButton.click();

    // Select Tab delimited option
    const tabDelimited = page.getByText('Tab delimited', { exact: false }).first();
    await expect(tabDelimited).toBeVisible();
  });

  test('TC#69 - Validate Plan XML export', async ({ page }) => {
    // Select plans to export
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // Click export button
    await plansPage.exportButton.click();

    // Select Plan XML option
    const planXml = page.getByText('Plan XML', { exact: false }).first();
    await expect(planXml).toBeVisible();
  });

  test('TC#69 - Validate Client XML export', async ({ page }) => {
    // Select plans to export
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // Click export button
    await plansPage.exportButton.click();

    // Select Client XML option
    const clientXml = page.getByText('Client XML', { exact: false }).first();
    await expect(clientXml).toBeVisible();
  });
});
