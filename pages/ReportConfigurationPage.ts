import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, waitForSuccessMessage } from '../utils/helpers';

export class ReportConfigurationPage {
  readonly page: Page;
  readonly manageConsumersButton: Locator;
  readonly addConsumerButton: Locator;
  readonly reportTypeDropdown: Locator;
  readonly formatDropdown: Locator;
  readonly addAttributeButton: Locator;
  readonly removeAttributeButton: Locator;
  readonly saveButton: Locator;
  readonly attributeList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.manageConsumersButton = page.getByText('Manage Consumers', { exact: false }).or(
      page.locator('[data-testid="manage-consumers"]')
    ).first();
    this.addConsumerButton = page.getByRole('button', { name: /add consumer|\+/i }).first();
    this.reportTypeDropdown = page.getByLabel(/report type/i).or(
      page.locator('select[name*="report"]')
    ).first();
    this.formatDropdown = page.getByLabel(/format/i).or(
      page.locator('select[name*="format"]')
    ).first();
    this.addAttributeButton = page.getByRole('button', { name: /add attribute/i }).or(
      page.locator('[data-testid="add-attribute"]')
    ).first();
    this.removeAttributeButton = page.getByRole('button', { name: /remove/i }).or(
      page.locator('[data-testid="remove-attribute"]')
    ).first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
    this.attributeList = page.locator('.attribute-list, [class*="attribute"]').first();
  }

  async navigateToReportConfiguration(): Promise<void> {
    await this.page.getByText('Configuration', { exact: false }).first().click();
    await this.page.getByText('Report', { exact: false }).or(
      this.page.locator('a[href*="report"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async addReportConfiguration(options: {
    reportType: string;
    format: string;
  }): Promise<void> {
    await this.manageConsumersButton.click();
    await this.addConsumerButton.click();
    await this.reportTypeDropdown.selectOption(options.reportType);
    await this.formatDropdown.selectOption(options.format);
    await this.addAttributeButton.click();
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async editReportAttributes(reportType: string): Promise<void> {
    await this.reportTypeDropdown.selectOption(reportType);
    await this.addAttributeButton.click();
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async removeReportAttributes(reportType: string): Promise<void> {
    await this.reportTypeDropdown.selectOption(reportType);
    await this.removeAttributeButton.click();
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }
}
