import { Page, expect } from '@playwright/test';

/**
 * Wait for page to be fully loaded (no pending network requests)
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for a toast/notification message and verify its content
 */
export async function waitForToast(page: Page, expectedText: string): Promise<void> {
  const toast = page.locator('.toast-message, .notification, [role="alert"], .snackbar');
  await expect(toast).toBeVisible({ timeout: 10000 });
  await expect(toast).toContainText(expectedText);
}

/**
 * Wait for a success notification
 */
export async function waitForSuccessMessage(page: Page): Promise<void> {
  const success = page.locator('.toast-success, .success-message, .alert-success, [class*="success"]');
  await expect(success).toBeVisible({ timeout: 10000 });
}

/**
 * Click a menu item from the sidebar/navigation
 */
export async function clickMenuItem(page: Page, menuName: string): Promise<void> {
  await page.getByRole('link', { name: menuName }).or(
    page.getByRole('menuitem', { name: menuName })
  ).or(
    page.locator(`[data-menu="${menuName}"], [title="${menuName}"]`)
  ).first().click();
  await waitForPageLoad(page);
}

/**
 * Click a submenu item
 */
export async function clickSubMenuItem(page: Page, parentMenu: string, subMenu: string): Promise<void> {
  await clickMenuItem(page, parentMenu);
  await page.getByText(subMenu, { exact: false }).first().click();
  await waitForPageLoad(page);
}

/**
 * Fill a form field by label
 */
export async function fillField(page: Page, label: string, value: string): Promise<void> {
  await page.getByLabel(label).or(
    page.locator(`input[placeholder*="${label}"], input[name*="${label}"]`)
  ).first().fill(value);
}

/**
 * Select a dropdown option
 */
export async function selectOption(page: Page, label: string, value: string): Promise<void> {
  const select = page.getByLabel(label).or(
    page.locator(`select[name*="${label}"]`)
  ).first();
  await select.selectOption(value);
}

/**
 * Generate a unique name for test data
 */
export function generateUniqueName(prefix: string): string {
  const timestamp = Date.now();
  return `${prefix}_AutoTest_${timestamp}`;
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}
