import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, generateUniqueName, waitForSuccessMessage } from '../utils/helpers';

export class LoadDefinitionsPage {
  readonly page: Page;
  readonly addLoadDefinitionButton: Locator;
  readonly loadDefinitionNameInput: Locator;
  readonly sourceTypeDropdown: Locator;
  readonly saveButton: Locator;
  readonly runLoadButton: Locator;
  readonly chooseFileButton: Locator;
  readonly contextDropdown: Locator;
  readonly templateDropdown: Locator;
  readonly modeDropdown: Locator;
  readonly versionNameInput: Locator;
  readonly versionNotesInput: Locator;
  readonly loadDefinitionCheckbox: Locator;
  readonly planLoadStatusLink: Locator;
  readonly batchIdColumn: Locator;
  readonly statusColumn: Locator;
  readonly errorDescription: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addLoadDefinitionButton = page.getByRole('button', { name: /\+|add|create/i }).or(
      page.locator('[data-testid="add-load-definition"]')
    ).first();
    this.loadDefinitionNameInput = page.getByLabel(/name/i).or(
      page.locator('input[name*="name"], input[placeholder*="name" i]')
    ).first();
    this.sourceTypeDropdown = page.getByLabel(/source type/i).or(
      page.locator('select[name*="source"]')
    ).first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
    this.runLoadButton = page.getByRole('button', { name: /run load/i }).first();
    this.chooseFileButton = page.getByRole('button', { name: /choose file|browse/i }).or(
      page.locator('input[type="file"]')
    ).first();
    this.contextDropdown = page.getByLabel(/context/i).or(
      page.locator('select[name*="context"]')
    ).first();
    this.templateDropdown = page.getByLabel(/template/i).or(
      page.locator('select[name*="template"]')
    ).first();
    this.modeDropdown = page.getByLabel(/mode|select mode/i).or(
      page.locator('select[name*="mode"]')
    ).first();
    this.versionNameInput = page.getByLabel(/version name/i).or(
      page.locator('input[name*="version"]')
    ).first();
    this.versionNotesInput = page.getByLabel(/version notes|notes/i).or(
      page.locator('textarea[name*="notes"]')
    ).first();
    this.loadDefinitionCheckbox = page.locator('input[type="checkbox"]').first();
    this.planLoadStatusLink = page.getByText('Plan load status', { exact: false }).or(
      page.locator('a[href*="load-status"]')
    ).first();
    this.batchIdColumn = page.locator('td:nth-child(1), [data-field="batchId"]');
    this.statusColumn = page.locator('[data-field="status"], td:has-text("Success"), td:has-text("Failed")');
    this.errorDescription = page.locator('[data-field="error"], .error-description, td:has-text("Invalid")');
  }

  async navigateToLoadDefinitions(): Promise<void> {
    await this.page.getByText('Configuration', { exact: false }).first().click();
    await this.page.getByText('Load definition', { exact: false }).or(
      this.page.locator('a[href*="load-definition"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async createLoadDefinition(name?: string): Promise<string> {
    const defName = name || generateUniqueName('LoadDef');
    await this.addLoadDefinitionButton.click();
    await this.loadDefinitionNameInput.fill(defName);
    await this.sourceTypeDropdown.selectOption('Excel');
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
    return defName;
  }

  async runLoad(options: {
    filePath: string;
    context: string;
    template: string;
    mode: 'Add/replace' | 'Update';
    versionName?: string;
    versionNotes?: string;
  }): Promise<void> {
    await this.loadDefinitionCheckbox.check();
    await this.runLoadButton.click();
    await this.chooseFileButton.setInputFiles(options.filePath);
    await this.contextDropdown.selectOption(options.context);
    await this.templateDropdown.selectOption(options.template);
    await this.modeDropdown.selectOption(options.mode);
    if (options.versionName) {
      await this.versionNameInput.fill(options.versionName);
    }
    if (options.versionNotes) {
      await this.versionNotesInput.fill(options.versionNotes);
    }
    await this.saveButton.click();
    await waitForPageLoad(this.page);
  }

  async navigateToPlanLoadStatus(): Promise<void> {
    await this.planLoadStatusLink.click();
    await waitForPageLoad(this.page);
  }

  async verifyBatchIdPresent(): Promise<void> {
    await expect(this.batchIdColumn.first()).toBeVisible();
    const text = await this.batchIdColumn.first().textContent();
    expect(text).toBeTruthy();
  }

  async verifyLoadStatus(expectedStatus: 'Success' | 'Failed'): Promise<void> {
    await expect(this.page.getByText(expectedStatus, { exact: false }).first()).toBeVisible();
  }

  async verifyErrorMessage(expectedError: string): Promise<void> {
    await expect(this.page.getByText(expectedError, { exact: false }).first()).toBeVisible();
  }
}
