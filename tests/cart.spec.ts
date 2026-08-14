import { test, expect } from '../fixtures/pages.fixture';
import { PRODUCTS } from '../data/products';

/**
 * Covers: docs/TEST_DESIGN_DOCUMENT.md - Section 4.2 "Shopping Cart"
 * Business rationale: the cart is the last chance to correctly reflect purchase
 * intent before money changes hands. A miscount here directly causes wrong orders.
 */
test.describe('Shopping Cart', () => {
  test('TC-CART-01 @smoke - adding a single item updates the cart badge', async ({
    authenticatedPage,
  }) => {
    const { inventoryPage } = authenticatedPage;
    expect(await inventoryPage.getCartCount()).toBe(0);

    await inventoryPage.addToCart(PRODUCTS.backpack);

    expect(await inventoryPage.getCartCount()).toBe(1);
  });

  test('TC-CART-02 - adding multiple distinct items accumulates the badge count', async ({
    authenticatedPage,
  }) => {
    const { inventoryPage } = authenticatedPage;

    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await inventoryPage.addToCart(PRODUCTS.onesie);

    expect(await inventoryPage.getCartCount()).toBe(3);
  });

  test('TC-CART-03 - removing an item from the inventory page decrements the badge', async ({
    authenticatedPage,
  }) => {
    const { inventoryPage } = authenticatedPage;

    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    expect(await inventoryPage.getCartCount()).toBe(2);

    await inventoryPage.removeFromCart(PRODUCTS.backpack);

    expect(await inventoryPage.getCartCount()).toBe(1);
  });

  test('TC-CART-04 - cart contents and badge persist across navigation', async ({
    authenticatedPage,
  }) => {
    // Edge case: SauceDemo (like many SPA-ish apps) is a common place for cart state
    // to leak or reset unexpectedly on client-side navigation - worth an explicit check.
    const { inventoryPage, cartPage } = authenticatedPage;

    await inventoryPage.addToCart(PRODUCTS.fleeceJacket);
    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectContainsProduct(PRODUCTS.fleeceJacket);
    expect(await cartPage.getItemCount()).toBe(1);

    await cartPage.continueShoppingButton().click();
    await inventoryPage.expectLoaded();

    expect(await inventoryPage.getCartCount()).toBe(1);
  });
});
