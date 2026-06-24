import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, generateUniqueName, waitForSuccessMessage } from '../utils/helpers';

export class ManageDefinitionsPage {
  readonly page: Page;
  readonly addDefinitionButton: Locator;
  readonly definitionNameInput: Locator;
  readonly saveButton: Locator;
  readonly definitionList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addDefinitionButton = page.getByRole('button', { name: /\+|add/i }).or(
      page.locator('[data-testid="add-definition"], button[title*="add" i]')
    ).first();
    this.definitionNameInput = page.getByLabel(/definition name|name/i).or(
      page.locator('input[name*="definition"], input[placeholder*="definition" i]')
    ).first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
    this.definitionList = page.locator('.definition-list, table, [class*="definition"]').first();
  }

  async navigateToDefinitions(): Promise<void> {
    await this.page.getByText('Configuration', { exact: false }).first().click();
    await this.page.getByText('Benefit Definitions', { exact: false }).or(
      this.page.locator('a[href*="definition"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async addNewDefinition(definitionName?: string): Promise<string> {
    const name = definitionName || generateUniqueName('Definition');
    await this.addDefinitionButton.click();
    await this.definitionNameInput.fill(name);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
    return name;
  }

  async verifyDefinitionExists(name: string): Promise<void> {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
