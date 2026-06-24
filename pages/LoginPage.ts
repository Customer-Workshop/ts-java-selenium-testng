import { Page, Locator, expect } from '@playwright/test';
import { config } from '../utils/test-config';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[type="text"], input[name="username"], input[placeholder*="user" i]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.loginButton = page.getByRole('button', { name: /login|sign in|submit/i }).or(
      page.locator('button[type="submit"]')
    ).first();
    this.errorMessage = page.locator('.error-message, .alert-danger, [class*="error"]').first();
  }

  async goto(): Promise<void> {
    await this.page.goto(config.portalUrl);
    await this.page.waitForLoadState('networkidle');
  }

  async login(username?: string, password?: string): Promise<void> {
    const user = username || config.credentials.username;
    const pass = password || config.credentials.password;

    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoginSuccess(): Promise<void> {
    await expect(this.page).not.toHaveURL(/login/i, { timeout: 30000 });
  }

  async verifyLoginError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
