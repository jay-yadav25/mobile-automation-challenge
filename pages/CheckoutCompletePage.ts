import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Checkout Step Three: /checkout-complete.html - order confirmation. */
export class CheckoutCompletePage extends BasePage {
  private readonly completeHeader = () => this.page.locator('[data-test="complete-header"]');
  private readonly backHomeButton = () => this.page.locator('[data-test="back-to-products"]');

  constructor(page: Page) {
    super(page);
  }

  async expectOrderConfirmed(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader()).toHaveText(/Thank you for your order!/i);
  }

  async backToProducts(): Promise<void> {
    await this.backHomeButton().click();
  }
}
