# Playwright Test Automation Framework

A test automation framework based on **Page Object Model** and **Playwright** using TypeScript.

> **Migrated from:** Selenium + TestNG (Java/Maven). See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) and [MIGRATION_RUNBOOK.md](./MIGRATION_RUNBOOK.md) for details.

## Tech Stack

- [Playwright](https://playwright.dev/) — Browser automation and testing
- [TypeScript](https://www.typescriptlang.org/) — Type-safe JavaScript
- [Playwright Test](https://playwright.dev/docs/test-intro) — Built-in test runner with parallel execution

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
npx playwright install --with-deps
```

## Running Tests

```bash
# Run all tests across all browsers
npm test

# Run tests for a specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode (Playwright Inspector)
npm run test:debug

# Run tests with Playwright UI mode
npm run test:ui
```

## Viewing Reports

After running tests, an HTML report is generated automatically:

```bash
npm run report
```

Reports are saved in the `playwright-report/` directory.

## Project Structure

```
├── playwright.config.ts          # Playwright configuration (browsers, reporters, timeouts)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── pages/                        # Page Object classes
│   ├── base.page.ts              # Base page with common methods
│   ├── google.page.ts            # Google search page
│   └── facebook-login.page.ts    # Facebook login page
├── tests/                        # Test specifications
│   ├── google-search.spec.ts     # Google search tests
│   └── facebook-login.spec.ts    # Facebook login tests
├── MIGRATION_PLAN.md             # Migration planning document
└── MIGRATION_RUNBOOK.md          # Migration patterns and runbook
```

## Creating New Tests

### 1. Create a Page Object

```typescript
import { type Page } from '@playwright/test';
import { BasePage } from './base.page.js';

export class MyPage extends BasePage {
  private readonly myElement = this.page.locator('#my-element');

  constructor(page: Page) {
    super(page);
  }

  async doSomething(): Promise<void> {
    await this.myElement.click();
  }
}
```

### 2. Create a Test Spec

```typescript
import { test, expect } from '@playwright/test';
import { MyPage } from '../pages/my.page.js';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    const myPage = new MyPage(page);
    await myPage.navigate('https://example.com');
    await myPage.doSomething();
    await expect(page).toHaveTitle(/Expected Title/);
  });
});
```

## Configuration

Key settings in `playwright.config.ts`:

| Setting | Value | Description |
|---------|-------|-------------|
| `fullyParallel` | `true` | Tests run in parallel across workers |
| `retries` | `2` (CI) / `0` (local) | Automatic retries on failure |
| `trace` | `on-first-retry` | Trace collection for debugging failures |
| `screenshot` | `only-on-failure` | Automatic screenshots on test failure |
| `video` | `on-first-retry` | Video recording on first retry |
| `projects` | Chromium, Firefox, WebKit | Cross-browser testing |

## Key Differences from Selenium Framework

| Selenium + TestNG | Playwright |
|-------------------|------------|
| `WebDriverManager` + `ChromeDriver` | Built-in browser management |
| `PageFactory.initElements()` | Lazy locators (no initialization needed) |
| `FluentWait` / implicit waits | Auto-wait (built-in) |
| `@FindBy` annotations | `page.locator()` / `page.getByRole()` |
| `Assert.assertTrue()` | `expect()` with auto-retry |
| `ExtentReports` | Built-in HTML reporter |
| `Log4j` | Trace viewer + console output |
| `testng.xml` suite config | `playwright.config.ts` |
| `WebDriverContext` (ThreadLocal) | Playwright fixtures (automatic) |
| `PageinstancesFactory` | Direct `new Page(page)` construction |
