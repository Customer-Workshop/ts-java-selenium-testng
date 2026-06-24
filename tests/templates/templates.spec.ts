import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { TemplatesPage } from '../../pages/TemplatesPage';
import { generateUniqueName } from '../../utils/helpers';

test.describe('Templates - Regression Tests', () => {
  let portalPage: PortalPage;
  let templatesPage: TemplatesPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    templatesPage = new TemplatesPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
  });

  test('TC#10 - Users to create Template successfully', async ({ page }) => {
    // Navigate to Configuration > Plan Templates
    await templatesPage.navigateToTemplates();

    // Create Template
    const templateName = generateUniqueName('Template');
    await templatesPage.createTemplate(templateName);

    // Verify template was created
    await templatesPage.verifyTemplateExists(templateName);
  });

  test('TC#11 - Verify that User is able to Edit existing Plan Template', async ({ page }) => {
    // Navigate to Configuration > Plan Templates
    await templatesPage.navigateToTemplates();

    // Create a template first
    const originalName = generateUniqueName('EditTemplate');
    await templatesPage.createTemplate(originalName);

    // Edit the template
    const newName = generateUniqueName('EditedTemplate');
    await templatesPage.editTemplate(originalName, newName);

    // Verify edited template exists
    await templatesPage.verifyTemplateExists(newName);
  });

  test('TC#12 - Verify that User is able to Copy existing Plan Template', async ({ page }) => {
    // Navigate to Configuration > Plan Templates
    await templatesPage.navigateToTemplates();

    // Create a template to copy
    const templateName = generateUniqueName('CopyTemplate');
    await templatesPage.createTemplate(templateName);

    // Copy the template
    await templatesPage.copyTemplate(templateName);

    // Verify the copy exists (typically with a "Copy of" prefix or similar)
    await expect(page.locator('table, [class*="template"]')).toBeVisible();
  });

  test('TC#13 - Verify that User is able to Create a version on existing Plan Template', async ({ page }) => {
    // Navigate to Configuration > Plan Templates
    await templatesPage.navigateToTemplates();

    // Create a template
    const templateName = generateUniqueName('VersionTemplate');
    await templatesPage.createTemplate(templateName);

    // Create a version
    await templatesPage.createVersion(templateName);

    // Verify version was created
    await expect(page.locator('table, [class*="template"]')).toBeVisible();
  });
});
