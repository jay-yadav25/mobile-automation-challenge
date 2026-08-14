import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the SauceDemo mobile-web automation suite.
 *
 * WHY MOBILE DEVICE EMULATION INSTEAD OF APPIUM?
 * The target application under test (https://www.saucedemo.com) is a mobile-responsive
 * web application, not a native/hybrid app. For mobile *web* apps, Playwright's built-in
 * device emulation (real device viewport, user agent, touch events, pixel ratio) gives
 * accurate, fast, and CI-friendly mobile coverage without the overhead of Appium/real
 * device farms. Appium remains the right tool for native iOS/Android apps (see the
 * "Tool Selection Rationale" section of docs/TEST_DESIGN_DOCUMENT.md for the full
 * discussion of when each tool applies).
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    // Primary mobile targets - this is what we ship coverage against for a "Mobile
    // Automation Engineer" scope: real device viewport, UA string, touch, and DPR.
    {
      name: 'Mobile Chrome (Pixel 7)',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Safari (iPhone 14)',
      use: { ...devices['iPhone 14'] },
    },
    // Desktop baseline kept as a regression project so we can tell a "mobile-only"
    // layout bug apart from a functional/business-logic bug that breaks everywhere.
    {
      name: 'Desktop Chrome (Regression)',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
