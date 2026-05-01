import { type Page } from '@playwright/test';

/**
 * Base page object that all page classes should extend.
 *
 * Playwright's built-in auto-wait mechanism replaces Selenium's
 * FluentWait / implicit waits. Locators are lazy-evaluated and
 * automatically retry until actionable.
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
