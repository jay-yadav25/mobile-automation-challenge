import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput = () => this.page.locator('[data-test="username"]');
  private readonly passwordInput = () => this.page.locator('[data-test="password"]');
  private readonly loginButton = () => this.page.locator('[data-test="login-button"]');

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/');
    await expect(this.usernameInput()).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    // .fill() clears any pre-existing value first, so this is safe to call repeatedly
    // (e.g. across a data-driven negative-login loop) without leaking state between runs.
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
  }
}
