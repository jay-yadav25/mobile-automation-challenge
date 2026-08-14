import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutInfo } from '../data/checkoutInfo';

/** Checkout Step One: /checkout-step-one.html - the shipping info form. */
export class CheckoutInfoPage extends BasePage {
  private readonly firstNameInput = () => this.page.locator('[data-test="firstName"]');
  private readonly lastNameInput = () => this.page.locator('[data-test="lastName"]');
  private readonly postalCodeInput = () => this.page.locator('[data-test="postalCode"]');
  private readonly continueButton = () => this.page.locator('[data-test="continue"]');
  private readonly cancelButton = () => this.page.locator('[data-test="cancel"]');

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }

  /**
   * Fills only the fields present on the supplied partial payload, then submits.
   * Leaving a field untouched is what lets INCOMPLETE_CHECKOUT_CASES exercise each
   * individual required-field validation without three near-duplicate methods.
   */
  async fillAndContinue(info: Partial<CheckoutInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstNameInput().fill(info.firstName);
    if (info.lastName !== undefined) await this.lastNameInput().fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCodeInput().fill(info.postalCode);
    await this.continueButton().click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton().click();
  }
}
