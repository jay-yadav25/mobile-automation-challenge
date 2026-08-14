import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseDollarAmount } from '../utils/money';

/** Checkout Step Two: /checkout-step-two.html - order summary with pricing breakdown. */
export class CheckoutOverviewPage extends BasePage {
  private readonly finishButton = () => this.page.locator('[data-test="finish"]');
  private readonly cancelButton = () => this.page.locator('[data-test="cancel"]');
  private readonly subtotalLabel = () => this.page.locator('.summary_subtotal_label');
  private readonly taxLabel = () => this.page.locator('.summary_tax_label');
  private readonly totalLabel = () => this.page.locator('.summary_total_label');

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  /** Parses the three summary labels into numeric dollar values for arithmetic assertions. */
  async getPriceSummary(): Promise<{ subtotal: number; tax: number; total: number }> {
    const [subtotalText, taxText, totalText] = await Promise.all([
      this.subtotalLabel().textContent(),
      this.taxLabel().textContent(),
      this.totalLabel().textContent(),
    ]);

    return {
      subtotal: parseDollarAmount(subtotalText ?? ''),
      tax: parseDollarAmount(taxText ?? ''),
      total: parseDollarAmount(totalText ?? ''),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton().click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton().click();
  }
}
