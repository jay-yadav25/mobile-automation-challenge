import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Product } from '../data/products';

export class CartPage extends BasePage {
  readonly cartItems = () => this.page.locator('[data-test="inventory-item"]');
  readonly checkoutButton = () => this.page.locator('[data-test="checkout"]');
  readonly continueShoppingButton = () => this.page.locator('[data-test="continue-shopping"]');

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async expectContainsProduct(product: Product): Promise<void> {
    await expect(this.page.locator(`[data-test="remove-${product.slug}"]`)).toBeVisible();
  }

  async getItemCount(): Promise<number> {
    return this.cartItems().count();
  }

  async removeItem(product: Product): Promise<void> {
    await this.page.locator(`[data-test="remove-${product.slug}"]`).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton().click();
  }
}
