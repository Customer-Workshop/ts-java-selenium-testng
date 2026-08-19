import { expect, test } from '@playwright/test';

import { FacebookLoginPage } from '../pages/facebook-login.page';

/**
 * Migration of the legacy Selenium/TestNG test
 * src/test/java/example/example/tests/FaceBookLoginTest.java.
 *
 * The legacy test did three things:
 *   1. navigated to https://www.facebook.com/
 *   2. filled email ("abc") and password ("abc") and submitted the login form
 *   3. called `Assert.assertTrue(false, "Login failed : Test failed")`
 *
 * Steps 1 and 2 are ported below against the current facebook.com markup: the
 * legacy `id=email` locator is gone (ids are generated per render), so the
 * fields are addressed by their `name` attributes.
 *
 * Step 3 is a deliberate, unconditional failure in the legacy suite - it
 * asserts a literal `false` and is not a statement about the application under
 * test. There is also no real credential pair to log in with. It is therefore
 * kept as an explicitly pending `test.fixme` rather than rewritten into an
 * assertion that would trivially pass and hide the gap.
 */
test.describe('Facebook login (migrated from FaceBookLoginTest)', () => {
  test('loads the login page and submits the credentials entered', async ({ page }) => {
    const loginPage = new FacebookLoginPage(page);

    await loginPage.goto();
    await loginPage.expectLoaded();

    await (await loginPage.enterEmail('abc')).enterPassword('abc');
    await expect(loginPage.emailInput).toHaveValue('abc');
    await expect(loginPage.passwordInput).toHaveValue('abc');

    await loginPage.clickSignIn();

    // The bogus credentials cannot authenticate; all that can honestly be
    // asserted is that the submission was handled by facebook.com.
    expect(new URL(page.url()).hostname).toContain('facebook.com');
  });

  test.fixme(
    'reports a successful login - legacy assertion is an unconditional failure',
    async () => {
      // FaceBookLoginTest ends with `Assert.assertTrue(false, "Login failed : Test failed")`,
      // so the legacy test can never pass. Verifying a successful login needs
      // real credentials (and would require handling Facebook's bot checks),
      // neither of which exists in this repository. Left pending on purpose:
      // faking a passing assertion here would misrepresent coverage.
      expect(true).toBe(false);
    },
  );
});
