# Migration Runbook: Selenium + TestNG → Playwright

## 1. Pattern Conversion Reference

### 1.1 Locator Strategies

| Selenium (Java) | Playwright (TypeScript) | Notes |
|-----------------|------------------------|-------|
| `@FindBy(id = "email")` | `page.locator('#email')` | CSS selector |
| `@FindBy(name = "q")` | `page.locator('[name="q"]')` | Attribute selector |
| `@FindBy(className = "btn")` | `page.locator('.btn')` | CSS class |
| `@FindBy(xpath = "//div")` | `page.locator('//div')` | XPath (supported but discouraged) |
| `@FindBy(css = "div.class")` | `page.locator('div.class')` | CSS selector |
| `@FindBy(linkText = "Click")` | `page.getByRole('link', { name: 'Click' })` | Prefer role-based |
| `@FindBy(tagName = "input")` | `page.locator('input')` | Tag name |
| `driver.findElement(By.id("x"))` | `page.locator('#x')` | Inline locator |

**Best practice:** Prefer Playwright's user-facing locators (`getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`) over CSS/XPath selectors for more resilient tests.

### 1.2 Element Interactions

| Selenium | Playwright | Notes |
|----------|-----------|-------|
| `element.sendKeys("text")` | `locator.fill("text")` | `fill()` clears first, unlike `sendKeys` |
| `element.sendKeys(Keys.ENTER)` | `locator.press('Enter')` | Key name strings |
| `element.click()` | `locator.click()` | Auto-waits for element |
| `element.submit()` | `locator.press('Enter')` or `submitButton.click()` | No direct `submit()` — use explicit action |
| `element.clear()` | `locator.clear()` | Or `locator.fill('')` |
| `element.getText()` | `locator.textContent()` | Or `locator.innerText()` |
| `element.getAttribute("x")` | `locator.getAttribute('x')` | Same concept |
| `element.isDisplayed()` | `locator.isVisible()` | Or use `expect(locator).toBeVisible()` |

### 1.3 Navigation & Browser

| Selenium | Playwright | Notes |
|----------|-----------|-------|
| `driver.get(url)` | `page.goto(url)` | Returns Response object |
| `driver.getTitle()` | `page.title()` | Async |
| `driver.getCurrentUrl()` | `page.url()` | Synchronous property |
| `driver.navigate().back()` | `page.goBack()` | — |
| `driver.navigate().forward()` | `page.goForward()` | — |
| `driver.navigate().refresh()` | `page.reload()` | — |
| `driver.manage().window().maximize()` | Config: `viewport: { width: 1280, height: 720 }` | Set in config or per-test |

### 1.4 Waits

| Selenium | Playwright | Notes |
|----------|-----------|-------|
| `driver.manage().timeouts().implicitlyWait(10, SECONDS)` | **Not needed** | Playwright auto-waits |
| `new FluentWait<>(driver).withTimeout(10s).pollingEvery(2s)` | **Not needed** | Auto-wait with configurable `actionTimeout` |
| `new WebDriverWait(driver, 10).until(ExpectedConditions.visibilityOf(el))` | `await locator.waitFor({ state: 'visible' })` | Explicit when needed |
| `ExpectedConditions.elementToBeClickable(el)` | **Not needed** | Auto-wait ensures clickability |
| `Thread.sleep(ms)` | `await page.waitForTimeout(ms)` | **Avoid** — use proper waits |
| — | `await page.waitForLoadState('networkidle')` | Wait for network to settle |
| — | `await page.waitForURL(/pattern/)` | Wait for URL change |

**Key insight:** Playwright's auto-wait is the single biggest improvement. It automatically waits for elements to be attached, visible, stable, enabled, and not obscured before performing actions. This eliminates 90%+ of wait-related code.

### 1.5 Assertions

| TestNG | Playwright | Notes |
|--------|-----------|-------|
| `Assert.assertTrue(condition)` | `expect(value).toBeTruthy()` | Generic boolean |
| `Assert.assertTrue(condition, msg)` | `expect(value, msg).toBeTruthy()` | With custom message |
| `Assert.assertEquals(actual, expected)` | `expect(actual).toBe(expected)` | Strict equality |
| `Assert.assertNotNull(obj)` | `expect(obj).not.toBeNull()` | Null check |
| — | `await expect(page).toHaveTitle(/regex/)` | **Auto-retrying** page assertion |
| — | `await expect(page).toHaveURL(/regex/)` | **Auto-retrying** URL assertion |
| — | `await expect(locator).toBeVisible()` | **Auto-retrying** element assertion |
| — | `await expect(locator).toHaveText('text')` | **Auto-retrying** text assertion |

**Key insight:** Playwright's `expect` with locators/page auto-retries until timeout. This is fundamentally more reliable than TestNG assertions which check once and fail immediately.

### 1.6 Test Lifecycle

| TestNG | Playwright Test | Notes |
|--------|----------------|-------|
| `@BeforeSuite` | `globalSetup` in config | Runs once before all tests |
| `@AfterSuite` | `globalTeardown` in config | Runs once after all tests |
| `@BeforeClass` | `test.beforeAll()` | Runs once per test file |
| `@AfterClass` | `test.afterAll()` | Runs once per test file |
| `@BeforeMethod` | `test.beforeEach()` | Runs before each test |
| `@AfterMethod` | `test.afterEach()` | Runs after each test |
| `@Test` | `test('name', async ({ page }) => { ... })` | Test definition |
| `@Test(enabled = false)` | `test.skip('name', ...)` | Skip test |
| `@Test(groups = "smoke")` | `test.describe('smoke', ...)` or tags | Grouping |
| `@Listeners({...})` | Reporter config in `playwright.config.ts` | Automatic |

### 1.7 Page Object Pattern

**Selenium (Java):**
```java
public class MyPage extends BasePage {
    @FindBy(id = "element")
    private WebElement myElement;

    public MyPage(WebDriver driver) {
        super(driver);
    }

    public void doAction() {
        myElement.click();
    }
}
```

**Playwright (TypeScript):**
```typescript
import { type Page } from '@playwright/test';
import { BasePage } from './base.page.js';

export class MyPage extends BasePage {
  private readonly myElement = this.page.locator('#element');

  constructor(page: Page) {
    super(page);
  }

  async doAction(): Promise<void> {
    await this.myElement.click();
  }
}
```

**Differences:**
- No `PageFactory.initElements()` — Playwright locators are lazy (evaluated on use)
- No `@FindBy` — locators are regular class properties
- All actions are `async` — Playwright uses promises
- No `WebDriverContext` / `ThreadLocal` — Playwright Test manages browser context per worker

### 1.8 Test Instantiation

**Selenium:**
```java
GooglePage page = PageinstancesFactory.getInstance(GooglePage.class);
```

**Playwright:**
```typescript
const googlePage = new GooglePage(page);
```

The `PageinstancesFactory` reflection-based factory is completely eliminated. Direct construction is type-safe and simpler.

---

## 2. Gotchas and Manual Interventions

### 2.1 `sendKeys` vs `fill`
- Selenium's `sendKeys` **appends** to existing text; Playwright's `fill` **replaces** it.
- If you need append behavior, use `locator.pressSequentially('text')` instead of `fill`.

### 2.2 `submit()` Removal
- Selenium has `element.submit()` that submits the enclosing form.
- Playwright has no direct equivalent. Use `button.click()` on the submit button or `input.press('Enter')`.

### 2.3 Implicit Waits Are Gone
- Remove ALL implicit wait configuration. Playwright auto-waits.
- If tests are "too fast," the page likely hasn't loaded yet — use `await page.waitForLoadState()` or proper locator waits.

### 2.4 Thread Safety Is Automatic
- `WebDriverContext` (InheritableThreadLocal) is eliminated.
- Playwright Test provides isolated `page` fixtures per test — no manual thread management needed.

### 2.5 Screenshots Are Automatic
- Remove all manual `TakesScreenshot` code.
- Configure `screenshot: 'only-on-failure'` (or `'on'`) in `playwright.config.ts`.

### 2.6 Browser Setup Is Automatic
- Remove `WebDriverManager.chromedriver().setup()` and `ChromeOptions` configuration.
- Playwright manages browser binaries via `npx playwright install`.
- Headless is the default; use `--headed` flag for visible browser.

### 2.7 Assertions Are Auto-Retrying
- TestNG's `Assert.assertTrue(driver.getTitle().contains("abc"))` checks once.
- Playwright's `await expect(page).toHaveTitle(/abc/)` retries until timeout.
- This eliminates most flaky test issues related to timing.

### 2.8 Cookie/Session Handling
- Selenium: `driver.manage().getCookies()`
- Playwright: `context.cookies()` and `context.addCookies()`
- Storage state can be saved/loaded: `context.storageState({ path: 'state.json' })`

---

## 3. Framework Comparison

| Aspect | Before (Selenium + TestNG) | After (Playwright) |
|--------|---------------------------|---------------------|
| **Language** | Java 8 | TypeScript (ES2022) |
| **Build Tool** | Maven (pom.xml) | npm (package.json) |
| **Test Runner** | TestNG 6.14.3 | Playwright Test (built-in) |
| **Browser Automation** | Selenium 4.25.0 | Playwright 1.59+ |
| **Browser Management** | WebDriverManager 5.9.2 | Built-in (`npx playwright install`) |
| **Reporting** | ExtentReports 2.41.2 | HTML Reporter (built-in) |
| **Logging** | Log4j 1.2.17 | Trace Viewer + console |
| **Email** | SimpleJavaMail 5.1.1 | CI-level notifications |
| **Wait Strategy** | FluentWait + implicit waits | Auto-wait (zero config) |
| **Parallel Execution** | `testng.xml` config | `fullyParallel: true` |
| **Page Factory** | `PageFactory.initElements()` | Not needed (lazy locators) |
| **Thread Safety** | `InheritableThreadLocal` | Automatic (fixtures) |
| **Screenshot** | Manual (`TakesScreenshot`) | Config-driven (automatic) |
| **Cross-Browser** | Manual driver setup per browser | Config-driven (projects) |
| **Debugging** | Log files + screenshots | Trace viewer + video + step-through |
| **Total Source Files** | 16 Java files + 4 XML configs | 5 TypeScript files + 1 config |
| **Lines of Code (framework)** | ~700 LOC | ~120 LOC |
| **External Dependencies** | 6 (Maven) | 3 (npm: playwright, typescript, @types/node) |

---

## 4. Recommendations for Teams Doing Similar Migrations

### 4.1 Migration Strategy
1. **Start with the Page Objects** — they map most directly and validate locator strategies.
2. **Convert one test at a time** — verify it passes before moving to the next.
3. **Run old and new suites in parallel** during transition to ensure parity.
4. **Delete legacy infrastructure last** — WebDriverContext, ExtentReportManager, listeners, etc. are not needed but can remain during transition for reference.

### 4.2 Effort Optimization
- **Auto-wait eliminates the most code.** Every `FluentWait`, `WebDriverWait`, `Thread.sleep`, and implicit wait is deleted with no replacement needed.
- **Built-in reporter eliminates the most files.** ExtentReportManager, ReportListener, ReportUtil, extent-config.xml — all gone, replaced by one config line.
- **Fixtures eliminate WebDriverContext.** All ThreadLocal/driver lifecycle management disappears.
- **PageinstancesFactory is unnecessary.** Direct `new Page(page)` is type-safe and simpler.

### 4.3 Effort Estimates (by team size)

| Team Familiarity | Framework Size | Estimated Effort |
|-----------------|----------------|------------------|
| TypeScript-proficient | Small (< 20 tests) | 1-2 days |
| TypeScript-proficient | Medium (20-100 tests) | 1-2 weeks |
| TypeScript-proficient | Large (100+ tests) | 2-4 weeks |
| Java-only, learning TS | Small (< 20 tests) | 3-5 days |
| Java-only, learning TS | Medium (20-100 tests) | 2-4 weeks |
| Java-only, learning TS | Large (100+ tests) | 4-8 weeks |

### 4.4 Maintainability Guidelines
- **Use role-based locators** (`getByRole`, `getByText`, `getByLabel`) over CSS selectors when possible — they're more resilient to DOM changes.
- **Keep page objects focused** — one page object per page/component, not per test.
- **Use `test.describe` for grouping** — replaces TestNG test groups and suites.
- **Leverage fixtures for shared state** — custom fixtures can replace `@BeforeClass` patterns for complex setup.
- **Use Playwright's codegen** (`npx playwright codegen`) to quickly generate locators for new pages.

### 4.5 CI/CD Integration
- Playwright's `--reporter=github` outputs annotations for GitHub Actions.
- Use `--reporter=blob` for sharded test runs (merge with `npx playwright merge-reports`).
- Set `retries: 2` in CI to handle flaky external sites.
- Use `workers: 1` in CI for predictable resource usage, or increase for speed.

---

## 5. Files Migrated

| Original (Selenium/Java) | Migrated (Playwright/TS) | Status |
|--------------------------|--------------------------|--------|
| `pages/BasePage.java` | `pages/base.page.ts` | Migrated |
| `pages/GooglePage.java` | `pages/google.page.ts` | Migrated |
| `pages/FacebookLoginPage.java` | `pages/facebook-login.page.ts` | Migrated |
| `tests/BaseTest.java` | `playwright.config.ts` (config-driven) | Eliminated — replaced by config |
| `tests/GoogleSearchTest.java` | `tests/google-search.spec.ts` | Migrated |
| `tests/FaceBookLoginTest.java` | `tests/facebook-login.spec.ts` | Migrated |
| `context/WebDriverContext.java` | — | Eliminated — Playwright fixtures |
| `context/Constants.java` | — | Eliminated — paths in config |
| `factory/PageinstancesFactory.java` | — | Eliminated — direct construction |
| `listeners/LogListener.java` | — | Eliminated — built-in logging |
| `listeners/ReportListener.java` | — | Eliminated — built-in reporter |
| `report/ExtentReportManager.java` | — | Eliminated — HTML reporter |
| `util/LoggerUtil.java` | — | Eliminated — trace viewer |
| `util/MailUtil.java` | — | Eliminated — CI notifications |
| `util/ReportUtil.java` | — | Eliminated — automatic screenshots |
| `util/TestProperties.java` | — | Eliminated — env vars / config |
| `resources/config/extent-config.xml` | — | Eliminated — reporter config in TS |
| `resources/config/test.properties` | — | Eliminated — env vars |
| `resources/log4j.xml` | — | Eliminated — trace viewer |
| `resources/suites/testng.xml` | `playwright.config.ts` | Migrated — projects & parallel config |
| `pom.xml` | `package.json` | Migrated |
