import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad } from '../utils/helpers';

export class PortalPage {
  readonly page: Page;
  readonly userManagementLink: Locator;
  readonly benefitsManagementInstance: Locator;
  readonly instanceCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userManagementLink = page.getByText('User Management', { exact: false }).or(
      page.locator('[data-testid="user-management"], a[href*="user-management"]')
    ).first();
    this.benefitsManagementInstance = page.getByText('Benefits Management', { exact: false }).or(
      page.locator('[data-testid="benefits-management"]')
    ).first();
    this.instanceCards = page.locator('.instance-card, .portal-card, [class*="instance"]');
  }

  async navigateToUserManagement(): Promise<void> {
    await this.userManagementLink.click();
    await waitForPageLoad(this.page);
  }

  async clickBenefitsManagement(): Promise<void> {
    await this.benefitsManagementInstance.click();
    await waitForPageLoad(this.page);
  }

  async verifyNoSRPInstance(): Promise<void> {
    await expect(this.page.getByText('SRP', { exact: true })).not.toBeVisible();
  }

  async verifyNoM3PInstance(): Promise<void> {
    await expect(this.page.getByText('M3P', { exact: true })).not.toBeVisible();
  }

  async verifyUserManagementAccessible(): Promise<void> {
    await expect(this.userManagementLink).toBeVisible();
  }
}
