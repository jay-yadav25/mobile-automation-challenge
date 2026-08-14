import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { USERS, PASSWORD } from '../data/users';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
};

type AuthenticatedFixture = {
  /**
   * A page that is already logged in as the standard user and sitting on
   * /inventory.html. Cart/checkout specs consume this instead of re-typing
   * credentials in every single test - that duplication is exactly what a login
   * bug would make every downstream test fail on for the wrong reason.
   */
  authenticatedPage: Pages;
};

export const test = base.extend<Pages & AuthenticatedFixture>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),

  authenticatedPage: async ({ page, loginPage, inventoryPage }, use) => {
    await loginPage.open();
    await loginPage.login(USERS.standard, PASSWORD);
    await inventoryPage.expectLoaded();
    await use({
      loginPage,
      inventoryPage,
      cartPage: new CartPage(page),
      checkoutInfoPage: new CheckoutInfoPage(page),
      checkoutOverviewPage: new CheckoutOverviewPage(page),
      checkoutCompletePage: new CheckoutCompletePage(page),
    });
  },
});

export { expect } from '@playwright/test';
