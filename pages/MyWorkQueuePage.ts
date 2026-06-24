import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, waitForSuccessMessage } from '../utils/helpers';

export class MyWorkQueuePage {
  readonly page: Page;
  readonly workQueueTable: Locator;
  readonly editButton: Locator;
  readonly copyButton: Locator;
  readonly versionButton: Locator;
  readonly statusChangeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.workQueueTable = page.locator('.work-queue, table, [class*="work-queue"]').first();
    this.editButton = page.locator('[title*="edit" i], .edit-icon').first();
    this.copyButton = page.locator('[title*="copy" i], .copy-icon').first();
    this.versionButton = page.locator('[title*="version" i], button:has-text("Add New Version")').first();
    this.statusChangeButton = page.getByRole('button', { name: /submit for review|approve|publish/i }).first();
  }

  async navigateToMyWorkQueue(): Promise<void> {
    await this.page.getByText('My Work', { exact: false }).or(
      this.page.locator('[data-testid="my-work-queue"], a[href*="work-queue"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async editPlan(planName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    await row.locator('[title*="edit" i], .edit-icon').first().click();
    await waitForPageLoad(this.page);
  }

  async copyPlan(planName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    await row.locator('[title*="copy" i], .copy-icon').first().click();
    await this.page.getByRole('button', { name: /save|submit/i }).first().click();
    await waitForSuccessMessage(this.page);
  }

  async createNewVersion(planName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    await row.locator('[title*="version" i], button:has-text("Version")').first().click();
    await this.page.getByRole('button', { name: /save|submit/i }).first().click();
    await waitForSuccessMessage(this.page);
  }

  async changeStatus(planName: string, action: 'Submit for Review' | 'Approve' | 'Publish'): Promise<void> {
    const row = this.page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    await row.locator('[title*="edit" i], .edit-icon').first().click();
    await this.page.getByRole('button', { name: new RegExp(action, 'i') }).first().click();
    await waitForSuccessMessage(this.page);
  }

  async verifyPlanInQueue(planName: string): Promise<void> {
    await expect(this.page.getByText(planName)).toBeVisible();
  }

  async verifyPlanNotInQueue(planName: string): Promise<void> {
    await expect(this.page.getByText(planName)).not.toBeVisible();
  }
}
