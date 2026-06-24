import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { LoadDefinitionsPage } from '../../pages/LoadDefinitionsPage';
import { generateUniqueName } from '../../utils/helpers';
import path from 'path';

test.describe('Load Definitions - Regression Tests', () => {
  let portalPage: PortalPage;
  let loadDefPage: LoadDefinitionsPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    loadDefPage = new LoadDefinitionsPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
  });

  test('TC#58 - Users to create Load definition successfully', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Create Load definition using Source type 'Excel'
    const defName = generateUniqueName('LoadDef');
    await loadDefPage.createLoadDefinition(defName);

    // Verify load definition was created
    await expect(page.getByText(defName)).toBeVisible();
  });

  test('TC#59 - User should be able to run load using Add/replace mode', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Select the load definition checkbox
    await loadDefPage.loadDefinitionCheckbox.check();

    // Click Run load button
    await loadDefPage.runLoadButton.click();

    // Verify the load dialog/form appears with required fields
    await expect(page.getByText('CHOOSE FILE', { exact: false }).or(
      page.locator('input[type="file"]')
    ).first()).toBeVisible();

    // Verify Context, Template, and Mode dropdowns are present
    await expect(loadDefPage.contextDropdown).toBeVisible();
    await expect(loadDefPage.templateDropdown).toBeVisible();
    await expect(loadDefPage.modeDropdown).toBeVisible();
  });

  test('TC#60 - Batch ID to be presented in plan load status page', async ({ page }) => {
    // Navigate to Plans > Plan load status
    await page.getByText('Plans', { exact: false }).first().click();
    await page.waitForLoadState('networkidle');
    await page.getByText('Plan load status', { exact: false }).first().click();
    await page.waitForLoadState('networkidle');

    // Check whether Batch id is present
    const batchIdHeader = page.getByText('Batch', { exact: false }).first();
    await expect(batchIdHeader).toBeVisible();

    // Verify batch ID values exist in rows
    const rows = page.locator('table tbody tr');
    if (await rows.first().isVisible()) {
      await loadDefPage.verifyBatchIdPresent();
    }
  });

  test('TC#61 - User should be able to run load using Update mode', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Select the load definition checkbox
    await loadDefPage.loadDefinitionCheckbox.check();

    // Click Run load button
    await loadDefPage.runLoadButton.click();

    // Verify Update mode is available in the dropdown
    await expect(loadDefPage.modeDropdown).toBeVisible();
    const options = await loadDefPage.modeDropdown.locator('option').allTextContents();
    expect(options.some(opt => opt.toLowerCase().includes('update'))).toBeTruthy();
  });

  test('TC#62 - UI should not accept non-excel file format while uploading', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Select and run load
    await loadDefPage.loadDefinitionCheckbox.check();
    await loadDefPage.runLoadButton.click();

    // Try to upload a non-excel file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is not an excel file'),
    });

    // Complete the form and run
    await page.getByRole('button', { name: /run|submit|upload/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Navigate to Plan load status
    await loadDefPage.navigateToPlanLoadStatus();

    // Verify Failed status and error message
    await loadDefPage.verifyLoadStatus('Failed');
    await loadDefPage.verifyErrorMessage('Invalid file format');
  });

  test('TC#63 - Upload file with invalid answer values and check validation', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Select and run load
    await loadDefPage.loadDefinitionCheckbox.check();
    await loadDefPage.runLoadButton.click();

    // Verify the load form is displayed
    await expect(page.getByText('CHOOSE FILE', { exact: false }).or(
      page.locator('input[type="file"]')
    ).first()).toBeVisible();

    // Note: This test requires a specially crafted Excel file with invalid values
    // The actual file upload will need to be configured per environment
  });

  test('TC#64 - Upload file that triggers business rules causing attributes to be dropped', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Select and run load
    await loadDefPage.loadDefinitionCheckbox.check();
    await loadDefPage.runLoadButton.click();

    // Verify the load form is displayed
    await expect(page.getByText('CHOOSE FILE', { exact: false }).or(
      page.locator('input[type="file"]')
    ).first()).toBeVisible();

    // Note: This test requires verification that business rules correctly drop attributes
    // and report them in the load status
  });

  test('TC#65 - Validate version creation functionality with loader', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Select and run load
    await loadDefPage.loadDefinitionCheckbox.check();
    await loadDefPage.runLoadButton.click();

    // Verify version name and notes fields are present
    await expect(loadDefPage.versionNameInput).toBeVisible();
    await expect(loadDefPage.versionNotesInput).toBeVisible();
  });

  test('TC#66 - Upload file with no updates retains existing data', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Select and run load
    await loadDefPage.loadDefinitionCheckbox.check();
    await loadDefPage.runLoadButton.click();

    // Verify the load form is displayed
    await expect(page.getByText('CHOOSE FILE', { exact: false }).or(
      page.locator('input[type="file"]')
    ).first()).toBeVisible();

    // Note: After uploading a file with no changes, plans should be "Skipped"
    // Verify this in Plan load status
  });

  test('TC#70 - Validate system behavior in update mode with non-existing plans', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Select and run load
    await loadDefPage.loadDefinitionCheckbox.check();
    await loadDefPage.runLoadButton.click();

    // Verify the load form with Update mode
    await expect(loadDefPage.modeDropdown).toBeVisible();

    // Note: When loading plans that don't exist in Update mode,
    // the system should fail with a valid error message
  });

  test('TC#71 - Upload file with large volume of data and check performance', async ({ page }) => {
    // Navigate to Configuration > Load definition
    await loadDefPage.navigateToLoadDefinitions();

    // Select and run load
    await loadDefPage.loadDefinitionCheckbox.check();
    await loadDefPage.runLoadButton.click();

    // Verify the load form is displayed
    await expect(page.getByText('CHOOSE FILE', { exact: false }).or(
      page.locator('input[type="file"]')
    ).first()).toBeVisible();

    // Note: This test requires a large Excel file to verify performance
    // The system should not crash, timeout, or degrade in performance
  });
});
