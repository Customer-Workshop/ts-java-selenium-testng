# e2e-playwright

Self-contained Playwright (TypeScript, chromium) project holding the modern port of the
legacy Selenium/TestNG `FaceBookLoginTest`. It has its own `package.json` and
`playwright.config.ts` and is independent of the Maven build; the Java suite is unchanged.

```bash
cd e2e-playwright
npm ci
npx playwright install --with-deps chromium
npm test                 # or: npx playwright test tests/facebook-login.spec.ts
```

## What was migrated

| Legacy (Java) | Here |
| --- | --- |
| `tests/FaceBookLoginTest.java` | `tests/facebook-login.spec.ts` |
| `pages/FacebookLoginPage.java` | `pages/facebook-login.page.ts` |
| `BaseTest` WebDriver setup, `WebDriverContext`, `PageinstancesFactory` | Playwright `page` fixture + config |
| `@FindBy(id = "email")` | `input[name="email"]` (the `id` is generated per render on current facebook.com) |

The legacy test's final step is `Assert.assertTrue(false, "Login failed : Test failed")` -
an unconditional failure rather than a real check, with no credentials available to
actually log in. That step is preserved as a `test.fixme` in the spec with an explanatory
comment instead of being rewritten into an assertion that would pass vacuously.

CI runs only this spec on pull requests via `.github/workflows/playwright-facebook.yml`.
