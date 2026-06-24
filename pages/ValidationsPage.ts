import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, waitForSuccessMessage } from '../utils/helpers';

export class ValidationsPage {
  readonly page: Page;
  readonly addValidationButton: Locator;
  readonly conditionInput: Locator;
  readonly messageInput: Locator;
  readonly saveButton: Locator;
  readonly validationList: Locator;
  readonly editButton: Locator;
  readonly definitionDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addValidationButton = page.getByRole('button', { name: /add validation|\+/i }).or(
      page.locator('[data-testid="add-validation"]')
    ).first();
    this.conditionInput = page.getByLabel(/condition|rule/i).or(
      page.locator('input[name*="condition"], textarea[name*="condition"]')
    ).first();
    this.messageInput = page.getByLabel(/message/i).or(
      page.locator('input[name*="message"], textarea[name*="message"]')
    ).first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
    this.validationList = page.locator('.validation-list, table, [class*="validation"]').first();
    this.editButton = page.locator('[title*="edit" i], .edit-icon, button:has-text("Edit")').first();
    this.definitionDropdown = page.getByLabel(/definition/i).or(
      page.locator('select[name*="definition"]')
    ).first();
  }

  async navigateToValidations(): Promise<void> {
    await this.page.getByText('Configuration', { exact: false }).first().click();
    await this.page.getByText('Validations', { exact: false }).or(
      this.page.locator('a[href*="validation"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async addValidationRule(condition: string, message: string): Promise<void> {
    await this.addValidationButton.click();
    await this.conditionInput.fill(condition);
    await this.messageInput.fill(message);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async editValidationRule(index: number, newCondition: string, newMessage: string): Promise<void> {
    const rows = this.page.locator('table tbody tr, .validation-row');
    await rows.nth(index).locator('[title*="edit" i], .edit-icon, button:has-text("Edit")').first().click();
    await this.conditionInput.clear();
    await this.conditionInput.fill(newCondition);
    await this.messageInput.clear();
    await this.messageInput.fill(newMessage);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async verifyValidationExists(condition: string): Promise<void> {
    await expect(this.page.getByText(condition, { exact: false })).toBeVisible();
  }

  async verifyValidationMessage(message: string): Promise<void> {
    await expect(this.page.getByText(message, { exact: false })).toBeVisible();
  }
}
