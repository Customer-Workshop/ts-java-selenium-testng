import { type Page } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Page object representing the Google search page.
 *
 * Selenium equivalent: GooglePage.java
 * - @FindBy(name = "q") → page.locator('[name="q"]')
 * - searchinput.sendKeys(key + Keys.ENTER) → fill() + press('Enter')
 */
export class GooglePage extends BasePage {
  private readonly searchInput = this.page.locator('[name="q"]');

  constructor(page: Page) {
    super(page);
  }

  async searchText(key: string): Promise<void> {
    await this.searchInput.fill(key);
    await this.searchInput.press('Enter');
  }
}
