import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { HierarchyPage } from '../../pages/HierarchyPage';
import { generateUniqueName } from '../../utils/helpers';

test.describe('Hierarchy - Regression Tests', () => {
  let portalPage: PortalPage;
  let hierarchyPage: HierarchyPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    hierarchyPage = new HierarchyPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
  });

  test('TC#9 - Users to create Hierarchy successfully', async ({ page }) => {
    // Navigate to Configuration > Benefit Hierarchy
    await hierarchyPage.navigateToHierarchy();

    // Create Categories
    const categoryName = generateUniqueName('Category');
    await hierarchyPage.createCategory(categoryName);

    // Create Components
    const componentName = generateUniqueName('Component');
    await hierarchyPage.createComponent(componentName);

    // Create Attributes
    const attributeName = generateUniqueName('Attribute');
    await hierarchyPage.createAttribute(attributeName);

    // Verify hierarchical setup was created
    await hierarchyPage.verifyHierarchyCreated();
  });
});
