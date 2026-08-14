import { test, expect } from '../fixtures/pages.fixture';
import { USERS, PASSWORD, INVALID_LOGIN_CASES } from '../data/users';

/**
 * Covers: docs/TEST_DESIGN_DOCUMENT.md - Section 4.1 "Authentication"
 * Business rationale: login is the gate in front of every other flow in the app.
 * A regression here blocks 100% of revenue-generating traffic, so it is the
 * highest-priority (P0) area regardless of how simple the UI looks.
 */
test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('TC-LOGIN-01 @smoke - standard user can log in and reach the product catalog', async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(USERS.standard, PASSWORD);
    await inventoryPage.expectLoaded();
  });

  test('TC-LOGIN-02 - locked out user is blocked with an explicit, actionable error', async ({
    loginPage,
    page,
  }) => {
    // Business rationale: distinguishing "wrong password" from "account disabled" is
    // the difference between a user retrying forever and a user contacting support.
    await loginPage.login(USERS.lockedOut, PASSWORD);
    await expect(loginPage.errorBanner()).toContainText(/this user has been locked out/i);
    // The app must not silently proceed - staying on the login route is the assertion
    // that actually matters here, not just the presence of an error string.
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
  });

  for (const { description, username, password, expectedError } of INVALID_LOGIN_CASES) {
    test(`TC-LOGIN-03 - rejects login with ${description}`, async ({ loginPage }) => {
      await loginPage.login(username, password);
      await expect(loginPage.errorBanner()).toContainText(expectedError);
    });
  }

  test('TC-LOGIN-04 - password field masks input', async ({ page }) => {
    // Edge/security case: even a demo app should not render credentials in clear text.
    const passwordField = page.locator('[data-test="password"]');
    await expect(passwordField).toHaveAttribute('type', 'password');
  });
});
