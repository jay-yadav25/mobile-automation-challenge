# SauceDemo Mobile Automation Suite

Playwright + TypeScript UI automation suite for [saucedemo.com](https://www.saucedemo.com), built for the **Mobile Automation Engineer — Real Work Challenge**.

📄 Full test design (description, strategy, rationale, and the complete test case catalog): **[`docs/TEST_DESIGN_DOCUMENT.md`](docs/TEST_DESIGN_DOCUMENT.md)** — read this first.

🎥 Live coding video: `<ADD YOUR VIDEO LINK HERE>`
🔗 This repo: `<ADD YOUR PUBLIC GITHUB URL HERE>`

## Why this app, why Playwright, why this device matrix

Short version — full reasoning is in the design doc:
- **App:** SauceDemo mirrors a real e-commerce funnel (login → catalog → cart → checkout) and ships seeded accounts that simulate real account/backend failure states.
- **Tool:** Playwright's auto-waiting, native TypeScript support, and built-in mobile device emulation make it well suited to mobile-web regression testing; see §2 of the design doc for the explicit Appium comparison and its limits.
- **Matrix:** Every test runs against `Mobile Chrome (Pixel 7)`, `Mobile Safari (iPhone 14)`, and a `Desktop Chrome (Regression)` baseline, so a mobile-only failure is immediately distinguishable from a functional one.

## Project structure

```
.
├── docs/
│   └── TEST_DESIGN_DOCUMENT.md   # Component 1 of the assessment - read first
├── pages/                        # Page Object Model - one class per screen/step
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   ├── CheckoutInfoPage.ts       # checkout step 1 (shipping form)
│   ├── CheckoutOverviewPage.ts   # checkout step 2 (priced summary)
│   └── CheckoutCompletePage.ts   # checkout step 3 (confirmation)
├── fixtures/
│   └── pages.fixture.ts          # injects page objects + an `authenticatedPage` fixture
├── data/
│   ├── users.ts                  # seeded accounts + negative-login data table
│   ├── products.ts               # catalog reference (name/slug/price)
│   └── checkoutInfo.ts           # valid + incomplete checkout payload builders
├── tests/
│   ├── login.spec.ts             # TC-LOGIN-*
│   ├── cart.spec.ts              # TC-CART-*
│   ├── checkout.spec.ts          # TC-CHK-*  (TC-CHK-01 and TC-CHK-02 are tagged @video)
│   └── sorting.spec.ts           # TC-SORT-* (bonus coverage)
├── playwright.config.ts          # mobile device projects, reporters, trace/video/screenshot policy
├── .github/workflows/playwright.yml  # CI: typecheck → lint → full mobile matrix
└── .eslintrc.cjs / .prettierrc   # code-quality gates
```

Every spec file opens with a comment mapping it to the relevant section of the design document, so a reviewer can trace **written test case → automated test** directly.

## Setup

Requires Node.js 18+.

```bash
npm install
npx playwright install --with-deps   # downloads the Chromium/WebKit browser binaries
```

## Running the suite

```bash
npm test                          # full matrix: 3 device projects × all specs
npm run test:mobile-chrome        # Pixel 7 only
npm run test:mobile-safari        # iPhone 14 only
npm run test:desktop              # desktop regression baseline only
npm run test:smoke                # just the @smoke-tagged critical-path subset
npx playwright test --grep @video # just the two cases from the recorded video
npm run test:headed               # watch the browser while it runs
npm run test:ui                   # Playwright's interactive UI mode
npm run report                    # open the last HTML report
```

Quality gates (also run in CI):

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
```

## Test data

No external fixtures/CSV needed — all test data (accounts, catalog, checkout payloads) lives in `data/` as typed TypeScript modules, so every value used by a test is both human-readable in a diff and type-checked at compile time.

## Notes for reviewers

- `authenticatedPage` (in `fixtures/pages.fixture.ts`) logs in once per test as `standard_user` so cart/checkout specs aren't re-testing login on every single case — login itself is tested exhaustively and separately in `login.spec.ts`.
- Locators use SauceDemo's `data-test` attributes wherever the app exposes one (the same convention this app's own maintainers recommend), which is more resistant to CSS/copy churn than text or class selectors.
- `docs/TEST_DESIGN_DOCUMENT.md` §5 lists 3 additional designed-but-not-yet-automated cases (TC-LOGIN-05, TC-CART-05, TC-CHK-05) and explains why they were deliberately left out of this pass rather than silently dropped.
