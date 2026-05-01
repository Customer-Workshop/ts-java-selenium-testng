import { type Page } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Page object representing the Facebook login page.
 *
 * Selenium equivalent: FacebookLoginPage.java
 * - @FindBy(id = "email") → page.locator('#email')
 * - @FindBy(id = "pass")  → page.locator('#pass')
 * - Fluent API pattern (return this) preserved
 */
export class FacebookLoginPage extends BasePage {
  private readonly emailInput = this.page.locator('#email');
  private readonly passwordInput = this.page.locator('#pass');
  private readonly loginButton = this.page.locator('[name="login"]');

  constructor(page: Page) {
    super(page);
  }

  async enterEmail(email: string): Promise<FacebookLoginPage> {
    await this.emailInput.fill(email);
    return this;
  }

  async enterPassword(password: string): Promise<FacebookLoginPage> {
    await this.passwordInput.fill(password);
    return this;
  }

  async clickSignIn(): Promise<void> {
    await this.loginButton.click();
  }
}
