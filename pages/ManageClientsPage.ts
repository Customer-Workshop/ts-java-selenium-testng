import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, generateUniqueName, waitForSuccessMessage } from '../utils/helpers';

export class ManageClientsPage {
  readonly page: Page;
  readonly addClientButton: Locator;
  readonly clientList: Locator;
  readonly clientNameInput: Locator;
  readonly saveButton: Locator;
  readonly editButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addClientButton = page.getByRole('button', { name: /add client|add new|\+/i }).or(
      page.locator('[data-testid="add-client"]')
    ).first();
    this.clientList = page.locator('.client-list, table, [class*="client"]').first();
    this.clientNameInput = page.getByLabel(/client name|name/i).or(
      page.locator('input[name*="client"], input[placeholder*="client" i]')
    ).first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
    this.editButton = page.locator('[data-testid="edit-client"], button[title*="edit" i], .edit-icon').first();
    this.cancelButton = page.getByRole('button', { name: /cancel/i }).first();
  }

  async navigateToManageClients(): Promise<void> {
    await this.page.getByText('Manage Clients', { exact: false }).or(
      this.page.locator('a[href*="clients"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async addNewClient(clientName?: string): Promise<string> {
    const name = clientName || generateUniqueName('Client');
    await this.addClientButton.click();
    await this.clientNameInput.fill(name);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
    return name;
  }

  async editClient(clientName: string, newDetails: { name?: string }): Promise<void> {
    const row = this.page.locator(`tr:has-text("${clientName}"), [class*="row"]:has-text("${clientName}")`).first();
    await row.locator('[title*="edit" i], .edit-icon, button:has-text("Edit")').first().click();
    if (newDetails.name) {
      await this.clientNameInput.clear();
      await this.clientNameInput.fill(newDetails.name);
    }
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async verifyClientExists(clientName: string): Promise<void> {
    await expect(this.page.getByText(clientName)).toBeVisible();
  }
}
