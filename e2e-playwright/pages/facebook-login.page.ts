import { Locator, Page, expect } from '@playwright/test';

/**
 * Playwright port of the legacy Selenium page object
 * src/test/java/example/example/pages/FacebookLoginPage.java.
 *
 * The legacy page object located the email field by `id=email`, which no longer
 * exists: facebook.com now renders inputs with generated ids, so the field is
 * addressed by its stable `name` attribute instead.
 */
export class FacebookLoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="pass"]');
    this.submitButton = page.locator('form input[type="submit"], form button[type="submit"]').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async enterEmail(email: string): Promise<this> {
    await this.emailInput.fill(email);
    return this;
  }

  async enterPassword(password: string): Promise<this> {
    await this.passwordInput.fill(password);
    return this;
  }

  async clickSignIn(): Promise<void> {
    await this.passwordInput.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }
}
