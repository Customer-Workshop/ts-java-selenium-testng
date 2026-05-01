# Selenium → Playwright Migration Plan

## 1. Executive Summary

This document outlines the migration strategy for converting the existing Selenium + TestNG (Java/Maven) test automation framework to Playwright (TypeScript). The current framework follows a Page Object Model pattern with Extent Reports, Log4j logging, and email notifications.

---

## 2. Current Framework Inventory

### 2.1 Page Object Classes

| Class | Location | Elements | Methods |
|-------|----------|----------|---------|
| `BasePage` | `pages/BasePage.java` | — | Constructor: initializes `PageFactory`, creates `FluentWait` (10s timeout, 2s polling, ignoring `NoSuchElementException`/`WebDriverException`) |
| `GooglePage` | `pages/GooglePage.java` | `searchinput` (`@FindBy(name="q")`) | `searchText(key)` — types text + ENTER |
| `FacebookLoginPage` | `pages/FacebookLoginPage.java` | `emailInput` (`@FindBy(id="email")`), `pass` (`@FindBy(id="pass")`) | `enterEmail(email)`, `enterPassword(password)`, `clickSignIn()` — fluent API returning `this` |

### 2.2 Test Classes

| Class | Annotation | Tests | Description |
|-------|-----------|-------|-------------|
| `BaseTest` | `@Listeners({ReportListener, LogListener})` | — | `@BeforeSuite`: load properties, log start. `@AfterSuite`: log stats, send mail. `@BeforeClass`: ChromeDriver setup (headless, WebDriverManager). `@AfterClass`: driver cleanup. |
| `GoogleSearchTest` | `@Test(testName="Google search test")` | `googleSearchTest()` — navigate to Google, search "abc", assert title contains "abc" |
| `FaceBookLoginTest` | `@Test(testName="Facebook login test")` | `facebookLoginTest()` — navigate to Facebook, enter credentials, click sign in, `Assert.assertTrue(false)` (intentional failure) |

### 2.3 TestNG Configuration (`testng.xml`)

- Suite with `parallel="classes"`, `thread-count="5"`
- Two test classes registered

### 2.4 Utility & Infrastructure Classes

| Class | Purpose |
|-------|---------|
| `WebDriverContext` | `InheritableThreadLocal<WebDriver>` — thread-safe driver instance storage |
| `Constants` | File path constants (report dir, config paths, driver path) |
| `PageinstancesFactory` | Reflective factory creating Page Object instances via `WebDriverContext.getDriver()` |
| `LoggerUtil` | Log4j wrapper (`log()`, `getLogger()`) |
| `MailUtil` | Email report sender via SimpleJavaMail (SMTP/TLS, HTML body with pass/fail stats) |
| `ReportUtil` | Screenshot capture (Base64) + ExtentReports logging |
| `TestProperties` | Java Properties file loader for `test.properties` |

### 2.5 Integrations

| Integration | Library | Usage |
|-------------|---------|-------|
| **Extent Reports** | `com.relevantcodes:extentreports:2.41.2` | HTML report generation with screenshots, managed by `ExtentReportManager` and `ReportListener` |
| **Log4j** | `log4j:log4j:1.2.17` | File-based logging to `logfile.log` |
| **SimpleJavaMail** | `org.simplejavamail:simple-java-mail:5.1.1` | Email notifications with SMTP/TLS, toggled via `mail.sendmail` property |
| **WebDriverManager** | `io.github.bonigarcia:webdrivermanager:5.9.2` | Automatic ChromeDriver binary management |
| **Postgres / ALM** | — | **Not present** in this codebase |

### 2.6 Dependencies (pom.xml)

- Selenium Java 4.25.0
- TestNG 6.14.3
- ExtentReports 2.41.2
- Log4j 1.2.17
- SimpleJavaMail 5.1.1
- WebDriverManager 5.9.2
- Maven Surefire Plugin 2.19.1

---

## 3. Language Decision: Playwright TypeScript

### Decision: **Playwright TypeScript**

### Rationale

| Factor | Playwright Java | Playwright TypeScript |
|--------|----------------|----------------------|
| **Maturity** | Stable but follows TS releases | First-class, most mature |
| **Test Runner** | Requires JUnit/TestNG integration | Built-in `@playwright/test` with fixtures, parallelism, retries |
| **Reporting** | Manual setup needed | Built-in HTML reporter, trace viewer, video recording |
| **Auto-Wait** | Available | Available + tightest integration |
| **Community** | Smaller | Largest ecosystem, most examples |
| **Codegen** | Available | Available + best integration |
| **Tooling** | Maven/Gradle | npm/pnpm — faster iteration, simpler CI |
| **Framework Features** | Need to wire reporters, parallel config | All included out of the box |

**Key justification:** The existing Java framework's complexity (WebDriverContext, PageinstancesFactory, ExtentReportManager, ReportListener, LogListener) exists to work around Selenium/TestNG limitations. Playwright's TypeScript test runner eliminates the need for all of these — fixtures handle driver lifecycle, built-in reporters replace ExtentReports, auto-wait replaces FluentWait, and the test runner handles parallelism natively. The migration to TypeScript results in significantly less code to maintain.

---

## 4. Component-by-Component Migration Strategy

### 4.1 BasePage → Base Page Object

| Selenium (Java) | Playwright (TypeScript) | Risk |
|-----------------|------------------------|------|
| `PageFactory.initElements()` | Not needed — Playwright locators are lazy | Low |
| `FluentWait` (10s, 2s polling) | Playwright auto-wait (built-in) | Low |
| `WebDriver` field | `Page` field from Playwright | Low |

**Risk: Low** — Direct pattern mapping, Playwright's auto-wait is strictly superior.

### 4.2 Page Object Classes (GooglePage, FacebookLoginPage)

| Selenium Pattern | Playwright Equivalent | Risk |
|-----------------|----------------------|------|
| `@FindBy(name="q")` | `this.page.locator('[name="q"]')` or `this.page.getByRole()` | Low |
| `@FindBy(id="email")` | `this.page.locator('#email')` | Low |
| `element.sendKeys(text + Keys.ENTER)` | `locator.fill(text)` + `locator.press('Enter')` | Low |
| `element.submit()` | `locator.click()` on submit button or `press('Enter')` | Low |
| Fluent API (`return this`) | Same pattern preserved | Low |

**Risk: Low** — Locator strategies map 1:1. Playwright locators are more robust.

### 4.3 Test Runner: TestNG → Playwright Test

| TestNG Feature | Playwright Test Equivalent | Risk |
|---------------|---------------------------|------|
| `@BeforeSuite` / `@AfterSuite` | `globalSetup` / `globalTeardown` in config | Low |
| `@BeforeClass` / `@AfterClass` | Fixtures (`beforeAll` / `afterAll`) or custom fixtures | Low |
| `@Test` annotation | `test()` function | Low |
| `parallel="classes"` | `fullyParallel: true` in config | Low |
| `Assert.assertTrue()` | `expect()` from `@playwright/test` | Low |
| `@Listeners` | Reporter config in `playwright.config.ts` | Low |

**Risk: Low** — Playwright Test provides superset of TestNG capabilities.

### 4.4 WebDriverContext (ThreadLocal) → Eliminated

Playwright Test's fixture system manages browser/page lifecycle per test worker. No manual thread-local management needed.

**Risk: Low** — Complete elimination of boilerplate.

### 4.5 PageinstancesFactory → Eliminated

Page Objects instantiated directly with `new PageClass(page)` in tests. Reflection-based factory is unnecessary.

**Risk: Low** — Simpler, type-safe instantiation.

### 4.6 ExtentReports → Playwright HTML Reporter

| Extent Feature | Playwright Equivalent | Risk |
|---------------|----------------------|------|
| HTML report | `html` reporter (built-in) | Low |
| Screenshots on pass/fail | `screenshot: 'on'` config option | Low |
| Custom config XML | Reporter options in `playwright.config.ts` | Low |
| Thread-safe report manager | Not needed — reporter is built-in | Low |

**Risk: Low** — Playwright HTML reporter is more feature-rich than ExtentReports v2.

### 4.7 Log4j → Console + Trace Viewer

| Log4j Feature | Playwright Equivalent | Risk |
|--------------|----------------------|------|
| File-based logging | Trace viewer (`trace: 'on-first-retry'`) | Low |
| Log levels | `console.log()` + Playwright's built-in test output | Low |

**Risk: Low** — Trace viewer provides far richer debugging than log files.

### 4.8 SimpleJavaMail → Post-test CI Integration

| Mail Feature | Playwright Equivalent | Risk |
|-------------|----------------------|------|
| SMTP email with stats | CI pipeline notification (GitHub Actions, etc.) | Medium |
| Configurable via properties | Environment variables or config file | Low |

**Risk: Medium** — Email sending is typically handled at CI level, not framework level. A placeholder utility will be provided showing how to integrate with CI notification systems.

---

## 5. Migration Phases

### Phase 1: Framework Setup
1. Initialize Node.js project with TypeScript
2. Install Playwright and configure browsers
3. Create `playwright.config.ts` with parallel execution, reporters, and browser configs
4. Set up project directory structure

### Phase 2: Page Object Migration
1. Create `BasePage` class with Playwright `Page` reference
2. Migrate `GooglePage` with Playwright locators
3. Migrate `FacebookLoginPage` with Playwright locators

### Phase 3: Test Migration
1. Convert `GoogleSearchTest` to Playwright test spec
2. Convert `FaceBookLoginTest` to Playwright test spec

### Phase 4: Optimization
1. Configure trace collection
2. Add screenshot-on-failure
3. Set up cross-browser testing (Chromium, Firefox, WebKit)
4. Configure parallel execution

### Phase 5: Documentation
1. Create `MIGRATION_RUNBOOK.md`
2. Update `README.md`

---

## 6. Recommended Project Structure

```
ts-selenium-simple/
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript configuration
├── tests/
│   ├── google-search.spec.ts     # Google search test
│   └── facebook-login.spec.ts    # Facebook login test
├── pages/
│   ├── base.page.ts              # Base page object
│   ├── google.page.ts            # Google page object
│   └── facebook-login.page.ts    # Facebook login page object
├── MIGRATION_PLAN.md             # This document
├── MIGRATION_RUNBOOK.md          # Migration runbook
└── README.md                     # Updated documentation
```

---

## 7. Risk Summary

| Component | Risk Level | Mitigation |
|-----------|-----------|------------|
| Page Objects | Low | 1:1 locator mapping |
| Test Runner | Low | Playwright Test has superset features |
| Assertions | Low | `expect()` is more powerful than TestNG assertions |
| Waits | Low | Auto-wait eliminates all explicit/implicit waits |
| Reporting | Low | Built-in HTML reporter is superior |
| Logging | Low | Trace viewer replaces file logging |
| Email Notifications | Medium | Handled at CI level; placeholder provided |
| Parallel Execution | Low | Native in Playwright Test |

**Overall Risk: Low** — The existing framework is straightforward with no complex integrations (no DB, no ALM). All components have direct or superior Playwright equivalents.
