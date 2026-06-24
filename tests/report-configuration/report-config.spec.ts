import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { ReportConfigurationPage } from '../../pages/ReportConfigurationPage';

test.describe('Report Configuration - Regression Tests', () => {
  let portalPage: PortalPage;
  let reportPage: ReportConfigurationPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    reportPage = new ReportConfigurationPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
  });

  test('TC#67 - Verify user can add report configuration with specific attributes', async ({ page }) => {
    // Navigate to Report Configuration
    await reportPage.navigateToReportConfiguration();

    // Click on Manage Consumers
    await reportPage.manageConsumersButton.click();

    // Add Consumer
    await reportPage.addConsumerButton.click();

    // Select Report type
    await expect(reportPage.reportTypeDropdown).toBeVisible();

    // Select Format
    await expect(reportPage.formatDropdown).toBeVisible();

    // Add Attributes
    await expect(reportPage.addAttributeButton).toBeVisible();

    // Save
    await reportPage.saveButton.click();
  });

  test('TC#68 - Verify user can add/remove attributes for existing report configuration', async ({ page }) => {
    // Navigate to Report Configuration
    await reportPage.navigateToReportConfiguration();

    // Select an existing report type
    await expect(reportPage.reportTypeDropdown).toBeVisible();

    // Verify Add attribute button is available
    await expect(reportPage.addAttributeButton).toBeVisible();

    // Verify Remove attribute button is available
    await expect(reportPage.removeAttributeButton).toBeVisible();
  });
});
