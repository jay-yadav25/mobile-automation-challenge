import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Product } from '../data/products';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly pageTitle = () => this.page.locator('[data-test="title"]');
  readonly cartLink = () => this.page.locator('[data-test="shopping-cart-link"]');
  readonly cartBadge = () => this.page.locator('[data-test="shopping-cart-badge"]');
  readonly sortDropdown = () => this.page.locator('[data-test="product-sort-container"]');
  readonly inventoryItems = () => this.page.locator('[data-test="inventory-item"]');
  readonly inventoryItemNames = () => this.page.locator('[data-test="inventory-item-name"]');
  readonly inventoryItemPrices = () => this.page.locator('[data-test="inventory-item-price"]');

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.pageTitle()).toHaveText('Products');
  }

  private addToCartButton(product: Product): Locator {
    return this.page.locator(`[data-test="add-to-cart-${product.slug}"]`);
  }

  private removeFromCartButton(product: Product): Locator {
    return this.page.locator(`[data-test="remove-${product.slug}"]`);
  }

  async addToCart(product: Product): Promise<void> {
    await this.addToCartButton(product).click();
    // The same button flips to "Remove" in place - asserting on it confirms the
    // add actually registered rather than just that the click event fired.
    await expect(this.removeFromCartButton(product)).toBeVisible();
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.removeFromCartButton(product).click();
    await expect(this.addToCartButton(product)).toBeVisible();
  }

  /** Returns the numeric cart badge count, or 0 when the badge is absent (empty cart). */
  async getCartCount(): Promise<number> {
    if (!(await this.cartBadge().isVisible())) return 0;
    const text = await this.cartBadge().textContent();
    return Number(text?.trim() ?? '0');
  }

  async openCart(): Promise<void> {
    await this.cartLink().click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown().selectOption(option);
  }

  async getDisplayedPrices(): Promise<number[]> {
    const raw = await this.inventoryItemPrices().allTextContents();
    return raw.map((t) => Number(t.replace('$', '')));
  }

  async getDisplayedNames(): Promise<string[]> {
    return this.inventoryItemNames().allTextContents();
  }
}
