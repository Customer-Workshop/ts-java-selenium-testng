import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, generateUniqueName, waitForSuccessMessage } from '../utils/helpers';

export class ManageContextPage {
  readonly page: Page;
  readonly addContextButton: Locator;
  readonly contextNameInput: Locator;
  readonly saveButton: Locator;
  readonly contextList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addContextButton = page.getByRole('button', { name: /\+|add/i }).or(
      page.locator('[data-testid="add-context"], button[title*="add" i]')
    ).first();
    this.contextNameInput = page.getByLabel(/context name|name/i).or(
      page.locator('input[name*="context"], input[placeholder*="context" i]')
    ).first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
    this.contextList = page.locator('.context-list, table, [class*="context"]').first();
  }

  async navigateToManageContext(): Promise<void> {
    await this.page.getByText('Admin', { exact: false }).first().click();
    await this.page.getByText('Manage context', { exact: false }).or(
      this.page.locator('a[href*="context"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async addNewContext(contextName?: string): Promise<string> {
    const name = contextName || generateUniqueName('Context');
    await this.addContextButton.click();
    await this.contextNameInput.fill(name);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
    return name;
  }

  async editContext(contextName: string, newName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${contextName}"), [class*="row"]:has-text("${contextName}")`).first();
    await row.locator('[title*="edit" i], .edit-icon, button:has-text("Edit")').first().click();
    await this.contextNameInput.clear();
    await this.contextNameInput.fill(newName);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async verifyContextExists(contextName: string): Promise<void> {
    await expect(this.page.getByText(contextName)).toBeVisible();
  }
}
