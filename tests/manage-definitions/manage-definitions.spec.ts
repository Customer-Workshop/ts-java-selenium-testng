import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { ManageDefinitionsPage } from '../../pages/ManageDefinitionsPage';
import { generateUniqueName } from '../../utils/helpers';

test.describe('Manage Definitions - Regression Tests', () => {
  let portalPage: PortalPage;
  let definitionsPage: ManageDefinitionsPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    definitionsPage = new ManageDefinitionsPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
  });

  test('TC#8 - Users to create Definition successfully', async ({ page }) => {
    // Navigate to Configuration > Benefit Definitions
    await definitionsPage.navigateToDefinitions();

    // Click '+' button and create a definition
    const defName = generateUniqueName('TestDefinition');
    await definitionsPage.addNewDefinition(defName);

    // Validate whether Definition gets saved successfully
    await definitionsPage.verifyDefinitionExists(defName);
  });
});
