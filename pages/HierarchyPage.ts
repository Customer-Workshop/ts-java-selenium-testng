import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, generateUniqueName, waitForSuccessMessage } from '../utils/helpers';

export class HierarchyPage {
  readonly page: Page;
  readonly addCategoryButton: Locator;
  readonly addComponentButton: Locator;
  readonly addAttributeButton: Locator;
  readonly nameInput: Locator;
  readonly saveButton: Locator;
  readonly hierarchyTree: Locator;
  readonly uniqueConstraintCheckbox: Locator;
  readonly requiredConstraintCheckbox: Locator;
  readonly displayRuleButton: Locator;
  readonly ruleInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addCategoryButton = page.getByRole('button', { name: /add category|\+/i }).or(
      page.locator('[data-testid="add-category"]')
    ).first();
    this.addComponentButton = page.getByRole('button', { name: /add component/i }).or(
      page.locator('[data-testid="add-component"]')
    ).first();
    this.addAttributeButton = page.getByRole('button', { name: /add attribute/i }).or(
      page.locator('[data-testid="add-attribute"]')
    ).first();
    this.nameInput = page.getByLabel(/name/i).or(
      page.locator('input[name*="name"], input[placeholder*="name" i]')
    ).first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
    this.hierarchyTree = page.locator('.hierarchy-tree, .tree-view, [class*="hierarchy"]').first();
    this.uniqueConstraintCheckbox = page.getByLabel(/unique/i).or(
      page.locator('input[type="checkbox"][name*="unique"]')
    ).first();
    this.requiredConstraintCheckbox = page.getByLabel(/required/i).or(
      page.locator('input[type="checkbox"][name*="required"]')
    ).first();
    this.displayRuleButton = page.getByRole('button', { name: /display rule/i }).or(
      page.locator('[data-testid="display-rule"]')
    ).first();
    this.ruleInput = page.getByLabel(/rule/i).or(
      page.locator('input[name*="rule"], textarea[name*="rule"]')
    ).first();
  }

  async navigateToHierarchy(): Promise<void> {
    await this.page.getByText('Configuration', { exact: false }).first().click();
    await this.page.getByText('Benefit Hierarchy', { exact: false }).or(
      this.page.locator('a[href*="hierarchy"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async createCategory(categoryName?: string): Promise<string> {
    const name = categoryName || generateUniqueName('Category');
    await this.addCategoryButton.click();
    await this.nameInput.fill(name);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
    return name;
  }

  async createComponent(componentName?: string): Promise<string> {
    const name = componentName || generateUniqueName('Component');
    await this.addComponentButton.click();
    await this.nameInput.fill(name);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
    return name;
  }

  async createAttribute(attributeName?: string): Promise<string> {
    const name = attributeName || generateUniqueName('Attribute');
    await this.addAttributeButton.click();
    await this.nameInput.fill(name);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
    return name;
  }

  async addUniqueConstraint(): Promise<void> {
    await this.uniqueConstraintCheckbox.check();
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async addRequiredConstraint(): Promise<void> {
    await this.requiredConstraintCheckbox.check();
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async addDisplayRule(rule: string): Promise<void> {
    await this.displayRuleButton.click();
    await this.ruleInput.fill(rule);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async verifyHierarchyCreated(): Promise<void> {
    await expect(this.hierarchyTree).toBeVisible();
  }
}
