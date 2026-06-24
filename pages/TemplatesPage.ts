import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, generateUniqueName, waitForSuccessMessage } from '../utils/helpers';

export class TemplatesPage {
  readonly page: Page;
  readonly addTemplateButton: Locator;
  readonly templateNameInput: Locator;
  readonly saveButton: Locator;
  readonly templateList: Locator;
  readonly editButton: Locator;
  readonly copyButton: Locator;
  readonly versionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addTemplateButton = page.getByRole('button', { name: /\+|add|create/i }).or(
      page.locator('[data-testid="add-template"]')
    ).first();
    this.templateNameInput = page.getByLabel(/template name|name/i).or(
      page.locator('input[name*="template"], input[placeholder*="template" i]')
    ).first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
    this.templateList = page.locator('.template-list, table, [class*="template"]').first();
    this.editButton = page.locator('[title*="edit" i], .edit-icon, button:has-text("Edit")').first();
    this.copyButton = page.locator('[title*="copy" i], .copy-icon, button:has-text("Copy")').first();
    this.versionButton = page.locator('[title*="version" i], .version-icon, button:has-text("Version")').first();
  }

  async navigateToTemplates(): Promise<void> {
    await this.page.getByText('Configuration', { exact: false }).first().click();
    await this.page.getByText('Plan Templates', { exact: false }).or(
      this.page.locator('a[href*="template"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async createTemplate(templateName?: string): Promise<string> {
    const name = templateName || generateUniqueName('Template');
    await this.addTemplateButton.click();
    await this.templateNameInput.fill(name);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
    return name;
  }

  async editTemplate(templateName: string, newName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${templateName}"), [class*="row"]:has-text("${templateName}")`).first();
    await row.locator('[title*="edit" i], .edit-icon, button:has-text("Edit")').first().click();
    await this.templateNameInput.clear();
    await this.templateNameInput.fill(newName);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async copyTemplate(templateName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${templateName}"), [class*="row"]:has-text("${templateName}")`).first();
    await row.locator('[title*="copy" i], .copy-icon, button:has-text("Copy")').first().click();
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async createVersion(templateName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${templateName}"), [class*="row"]:has-text("${templateName}")`).first();
    await row.locator('[title*="version" i], .version-icon, button:has-text("Version")').first().click();
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async verifyTemplateExists(name: string): Promise<void> {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
