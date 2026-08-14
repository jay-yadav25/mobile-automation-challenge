import {test ,expect} from '../fixtures/pages.fixture';
import { PRODUCTS} from '../data/products';
import {buildValidCheckoutInfo, INCOMPLETE_CHECKOUT_CASES} from '../data/checkoutInfo';

test.describe('Checkout', () => {
  test('TC-CHK-01 @smoke @video -standard user completes a purchase end to end', async ({authenticatedPage}) => {
    const {inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage} = authenticatedPage;
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    
    await cartPage.proceedToCheckout();
    await checkoutInfoPage.expectLoaded();
    await checkoutInfoPage.fillAndContinue(buildValidCheckoutInfo());

    await checkoutOverviewPage.expectLoaded();
    const {subtotal, tax, total} = await checkoutOverviewPage.getPriceSummary();
    expect (subtotal).toBeCloseTo(PRODUCTS.backpack.price + PRODUCTS.bikeLight.price, 2);
    expect (total).toBeCloseTo(subtotal + tax, 2);

    await checkoutOverviewPage.finish();
    await checkoutCompletePage.expectOrderConfirmed();
  });


for (const [index,{description, info, expectedError}] of INCOMPLETE_CHECKOUT_CASES.entries()) {
const videoTag= index === 0 ? '@video' : '';
  test(`TC-CHK-02-${videoTag} -checkout rejects submission with ${description}`, async ({authenticatedPage, page}) => {
    const {inventoryPage, cartPage, checkoutInfoPage} = authenticatedPage;
    await inventoryPage.addToCart(PRODUCTS.onesie);
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutInfoPage.expectLoaded();
    await checkoutInfoPage.fillAndContinue(info);
    await expect(checkoutInfoPage.errorBanner()).toContainText(expectedError);
    await expect(page).not.toHaveURL(/checkout-step-two/);
  });
}
test(`TC-CHK-03 -Order total always equals item subtotal plus tax`, async ({authenticatedPage}) => {
    const {inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage} = authenticatedPage;
    await inventoryPage.addToCart(PRODUCTS.fleeceJacket);
    await inventoryPage.addToCart(PRODUCTS.boltTShirt);
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await inventoryPage.openCart();

    await cartPage.proceedToCheckout();
    await checkoutInfoPage.fillAndContinue(buildValidCheckoutInfo());
    await checkoutOverviewPage.expectLoaded();
    const {subtotal, tax, total} = await checkoutOverviewPage.getPriceSummary();
    expect (subtotal).toBeCloseTo(PRODUCTS.fleeceJacket.price + PRODUCTS.boltTShirt.price + PRODUCTS.bikeLight.price, 2);
    expect (total).toBeCloseTo(subtotal + tax, 2);
  });
 
});