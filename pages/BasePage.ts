import { Page } from '@playwright/test';

/**
 * Shared behaviour for every page object. Concrete pages extend this instead of
 * re-implementing navigation/error-reading boilerplate.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  /** SauceDemo renders every field/form error inside the same [data-test="error"] banner. */
  readonly errorBanner = () => this.page.locator('[data-test="error"]');

  async getErrorText(): Promise<string> {
    return (await this.errorBanner().textContent())?.trim() ?? '';
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
