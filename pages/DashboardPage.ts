import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad } from '../utils/helpers';

export class DashboardPage {
  readonly page: Page;
  readonly dashboardContainer: Locator;
  readonly myWorkQueue: Locator;
  readonly adminMenu: Locator;
  readonly configurationMenu: Locator;
  readonly plansLink: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardContainer = page.locator('.dashboard, [class*="dashboard"], #dashboard').first();
    this.myWorkQueue = page.getByText('My Work', { exact: false }).or(
      page.locator('[data-testid="my-work-queue"]')
    ).first();
    this.adminMenu = page.getByText('Admin', { exact: false }).or(
      page.getByRole('menuitem', { name: /admin/i })
    ).first();
    this.configurationMenu = page.getByText('Configuration', { exact: false }).or(
      page.getByRole('menuitem', { name: /configuration/i })
    ).first();
    this.plansLink = page.getByText('Plans', { exact: false }).or(
      page.locator('[data-testid="plans-link"], a[href*="plans"]')
    ).first();
    this.errorMessages = page.locator('.error, [class*="error"], .alert-danger');
  }

  async verifyDashboardLoaded(): Promise<void> {
    await expect(this.dashboardContainer).toBeVisible({ timeout: 30000 });
    await expect(this.errorMessages).not.toBeVisible();
  }

  async navigateToMyWorkQueue(): Promise<void> {
    await this.myWorkQueue.click();
    await waitForPageLoad(this.page);
  }

  async navigateToAdmin(): Promise<void> {
    await this.adminMenu.click();
    await waitForPageLoad(this.page);
  }

  async navigateToConfiguration(): Promise<void> {
    await this.configurationMenu.click();
    await waitForPageLoad(this.page);
  }

  async navigateToPlans(): Promise<void> {
    await this.plansLink.click();
    await waitForPageLoad(this.page);
  }
}
