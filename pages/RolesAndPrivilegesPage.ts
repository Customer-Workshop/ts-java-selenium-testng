import { Page, Locator, expect } from '@playwright/test';
import { waitForPageLoad } from '../utils/helpers';

export class RolesAndPrivilegesPage {
  readonly page: Page;
  readonly userPermissionsLink: Locator;
  readonly userList: Locator;
  readonly roleDropdown: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userPermissionsLink = page.getByText('User Permissions', { exact: false }).or(
      page.locator('a[href*="user-permission"], [data-testid="user-permissions"]')
    ).first();
    this.userList = page.locator('.user-list, table, [class*="user"]').first();
    this.roleDropdown = page.locator('select[name*="role"], [data-testid="role-dropdown"]').first();
    this.saveButton = page.getByRole('button', { name: /save|submit/i }).first();
  }

  async navigateToUserPermissions(): Promise<void> {
    await this.userPermissionsLink.click();
    await waitForPageLoad(this.page);
  }

  async verifyUsersExist(): Promise<void> {
    await expect(this.userList).toBeVisible();
    const rows = this.page.locator('table tbody tr, .user-row');
    await expect(rows.first()).toBeVisible();
  }

  async verifyRoleExists(roleName: string): Promise<void> {
    await expect(this.page.getByText(roleName, { exact: false })).toBeVisible();
  }

  async verifyUserAccess(username: string, expectedRole: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${username}"), [class*="row"]:has-text("${username}")`).first();
    await expect(row).toBeVisible();
    await expect(row.getByText(expectedRole, { exact: false })).toBeVisible();
  }

  async verifyScreenAccess(screenName: string, canAccess: boolean): Promise<void> {
    if (canAccess) {
      await expect(this.page.getByText(screenName, { exact: false })).toBeVisible();
    } else {
      await expect(this.page.getByText(screenName, { exact: false })).not.toBeVisible();
    }
  }
}
