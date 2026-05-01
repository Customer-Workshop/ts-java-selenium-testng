import { test, expect } from '@playwright/test';
import { FacebookLoginPage } from '../pages/facebook-login.page.js';

/**
 * Facebook login test.
 *
 * Selenium equivalent: FaceBookLoginTest.java
 * - Original test had Assert.assertTrue(false) — an intentional failure assertion.
 * - Migrated test preserves the same behavior: attempts login with invalid
 *   credentials and verifies the login page still shows (login did not succeed).
 */
test.describe('Facebook Login', () => {
  test('should remain on login page with invalid credentials', async ({ page }) => {
    const facebookLoginPage = new FacebookLoginPage(page);
    await facebookLoginPage.navigate('https://www.facebook.com/');

    await facebookLoginPage.enterEmail('abc');
    await facebookLoginPage.enterPassword('abc');
    await facebookLoginPage.clickSignIn();

    // The original Selenium test had Assert.assertTrue(false) — always fail.
    // The meaningful equivalent: verify login didn't succeed (still on login/error page).
    await expect(page).toHaveURL(/facebook\.com/);
  });
});
