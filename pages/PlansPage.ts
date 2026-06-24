import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad, generateUniqueName, waitForSuccessMessage } from '../utils/helpers';

export class PlansPage {
  readonly page: Page;
  readonly addPlanButton: Locator;
  readonly planNameInput: Locator;
  readonly saveButton: Locator;
  readonly planList: Locator;
  readonly editButton: Locator;
  readonly copyButton: Locator;
  readonly deleteButton: Locator;
  readonly versionButton: Locator;
  readonly massStatusUpdateButton: Locator;
  readonly advanceSearchButton: Locator;
  readonly searchInput: Locator;
  readonly contextFilter: Locator;
  readonly statusFilters: {
    open: Locator;
    reviewPending: Locator;
    approved: Locator;
    rejected: Locator;
    published: Locator;
  };
  readonly exportButton: Locator;
  readonly planCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addPlanButton = page.getByRole('button', { name: /add|create|\+/i }).or(
      page.locator('[data-testid="add-plan"]')
    ).first();
    this.planNameInput = page.getByLabel(/plan name|name/i).or(
      page.locator('input[name*="plan"], input[placeholder*="plan" i]')
    ).first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
    this.planList = page.locator('.plan-list, table, [class*="plan-list"]').first();
    this.editButton = page.locator('[title*="edit" i], .edit-icon').first();
    this.copyButton = page.locator('[title*="copy" i], .copy-icon').first();
    this.deleteButton = page.getByRole('button', { name: /delete/i }).or(
      page.locator('[data-testid="delete-plan"]')
    ).first();
    this.versionButton = page.locator('[title*="version" i], button:has-text("Add New Version")').first();
    this.massStatusUpdateButton = page.getByRole('button', { name: /mass status|bulk update/i }).first();
    this.advanceSearchButton = page.getByRole('button', { name: /advance search|advanced/i }).or(
      page.locator('[data-testid="advance-search"]')
    ).first();
    this.searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    this.contextFilter = page.locator('select[name*="context"], [data-testid="context-filter"]').first();
    this.statusFilters = {
      open: page.getByText('OPEN', { exact: true }).or(page.locator('[data-status="open"]')).first(),
      reviewPending: page.getByText('REVIEW PENDING', { exact: false }).or(page.locator('[data-status="review-pending"]')).first(),
      approved: page.getByText('APPROVED', { exact: true }).or(page.locator('[data-status="approved"]')).first(),
      rejected: page.getByText('REJECTED', { exact: true }).or(page.locator('[data-status="rejected"]')).first(),
      published: page.getByText('PUBLISHED', { exact: true }).or(page.locator('[data-status="published"]')).first(),
    };
    this.exportButton = page.getByRole('button', { name: /export/i }).first();
    this.planCheckbox = page.locator('input[type="checkbox"]').first();
  }

  async navigateToPlans(): Promise<void> {
    await this.page.getByText('Plans', { exact: false }).or(
      this.page.locator('a[href*="plans"]')
    ).first().click();
    await waitForPageLoad(this.page);
  }

  async createPlan(planName?: string): Promise<string> {
    const name = planName || generateUniqueName('Plan');
    await this.addPlanButton.click();
    await this.planNameInput.fill(name);
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
    return name;
  }

  async editPlan(planName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    await row.locator('[title*="edit" i], .edit-icon').first().click();
    await waitForPageLoad(this.page);
  }

  async copyPlan(planName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    await row.locator('[title*="copy" i], .copy-icon').first().click();
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async createNewVersion(planName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    await row.locator('[title*="version" i], button:has-text("Add New Version")').first().click();
    await this.saveButton.click();
    await waitForSuccessMessage(this.page);
  }

  async deletePlan(planName: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    await row.locator('input[type="checkbox"]').first().check();
    await this.deleteButton.click();
    // Confirm deletion dialog
    await this.page.getByRole('button', { name: /confirm|yes|ok/i }).first().click();
    await waitForSuccessMessage(this.page);
  }

  async filterByStatus(status: 'open' | 'reviewPending' | 'approved' | 'rejected' | 'published'): Promise<void> {
    await this.statusFilters[status].click();
    await waitForPageLoad(this.page);
  }

  async filterByContext(contextName: string): Promise<void> {
    await this.contextFilter.selectOption(contextName);
    await waitForPageLoad(this.page);
  }

  async advanceSearch(searchTerm: string): Promise<void> {
    await this.advanceSearchButton.click();
    await this.searchInput.fill(searchTerm);
    await this.page.getByRole('button', { name: /search|apply/i }).first().click();
    await waitForPageLoad(this.page);
  }

  async massStatusUpdate(): Promise<void> {
    await this.massStatusUpdateButton.click();
    await waitForPageLoad(this.page);
  }

  async verifyPlanExists(planName: string): Promise<void> {
    await expect(this.page.getByText(planName)).toBeVisible();
  }

  async verifyPlanNotVisible(planName: string): Promise<void> {
    await expect(this.page.getByText(planName)).not.toBeVisible();
  }

  async getStatusDot(planName: string): Promise<Locator> {
    const row = this.page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    return row.locator('.status-dot, [class*="status"], .dot').first();
  }

  async submitForReview(planName: string): Promise<void> {
    await this.editPlan(planName);
    await this.page.getByRole('button', { name: /submit for review/i }).first().click();
    await waitForSuccessMessage(this.page);
  }

  async approvePlan(planName: string): Promise<void> {
    await this.editPlan(planName);
    await this.page.getByRole('button', { name: /approve/i }).first().click();
    await waitForSuccessMessage(this.page);
  }

  async publishPlan(planName: string): Promise<void> {
    await this.editPlan(planName);
    await this.page.getByRole('button', { name: /publish/i }).first().click();
    await waitForSuccessMessage(this.page);
  }

  async rejectPlan(planName: string): Promise<void> {
    await this.editPlan(planName);
    await this.page.getByRole('button', { name: /reject/i }).first().click();
    await waitForSuccessMessage(this.page);
  }

  async exportPlans(format: string): Promise<void> {
    await this.planCheckbox.check();
    await this.exportButton.click();
    await this.page.getByText(format, { exact: false }).first().click();
    await this.page.getByRole('button', { name: /proceed|export|download/i }).first().click();
    await waitForPageLoad(this.page);
  }
}
