import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { ManageContextPage } from '../../pages/ManageContextPage';
import { generateUniqueName } from '../../utils/helpers';

test.describe('Manage Context - Regression Tests', () => {
  let portalPage: PortalPage;
  let contextPage: ManageContextPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    contextPage = new ManageContextPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
  });

  test('TC#6 - Users to create Context successfully', async ({ page }) => {
    // Navigate to Admin > Manage Context
    await contextPage.navigateToManageContext();

    // Click '+' button and create a context
    const contextName = generateUniqueName('TestContext');
    await contextPage.addNewContext(contextName);

    // Validate whether context gets saved successfully
    await contextPage.verifyContextExists(contextName);
  });

  test('TC#7 - Verify that user is able to Edit existing Contexts', async ({ page }) => {
    // Navigate to Manage Context
    await contextPage.navigateToManageContext();

    // First create a context to edit
    const originalName = generateUniqueName('EditContext');
    await contextPage.addNewContext(originalName);

    // Edit the context
    const newName = generateUniqueName('EditedContext');
    await contextPage.editContext(originalName, newName);

    // Verify edit was saved
    await contextPage.verifyContextExists(newName);
  });
});
