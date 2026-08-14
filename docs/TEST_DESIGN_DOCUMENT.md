# Test Design Document
**Mobile Automation Engineer — Real Work Challenge**

| | |
|---|---|
| **Tool** | Playwright + TypeScript |
| **Target application** | [SauceDemo](https://www.saucedemo.com) — a purpose-built e-commerce demo app (login → catalog → cart → checkout) |
| **Scope** | Web/mobile-web UI test automation, executed against real mobile device emulation profiles |
| **Author** | Candidate submission |

---

## 1. Why this application

SauceDemo is a deliberately realistic e-commerce funnel: **authentication → product discovery → cart → checkout → order confirmation**. That is the same shape as almost any real mobile shopping app, and it ships six seeded accounts that each simulate a different production failure mode (disabled account, slow network/backend, broken UI state, etc.) — which means the *business logic* being exercised is representative of real-world risk, not just decorative UI. It's also public, stable, and has no rate limiting or destructive side effects, so the recorded session and the CI pipeline in this repo are fully reproducible by a reviewer.

## 2. Tool selection rationale

**Chosen: Playwright (TypeScript), using real-device emulation (Pixel 7 / iPhone 14 viewports, user agents, touch input, device pixel ratio) as the primary mobile-web testing approach.**

| Requirement | Why Playwright fits |
|---|---|
| Auto-waiting / low flake | Locators auto-wait for actionability (visible, stable, enabled) instead of hand-rolled sleeps — the single biggest source of flaky mobile UI suites. |
| Native TypeScript | First-class typings across the whole API; no wrapper libraries needed. |
| Cross-engine mobile coverage | One API drives Chromium (proxy for Android Chrome) and WebKit (proxy for iOS Safari) with accurate device metrics via `devices[...]`. |
| Debuggability | Trace viewer, step-by-step timeline, and video/screenshot-on-failure are built in — critical when a mobile layout bug only reproduces at a specific viewport. |
| CI-native | Headless by default, parallel workers, first-class GitHub Actions support (see `.github/workflows/playwright.yml`). |

**Honest limitation, stated up front:** SauceDemo is a *mobile-web* app, not a native/hybrid mobile app. Playwright's device emulation is the right tool for responsive mobile-web testing (viewport, UA, touch, DPR) but it does **not** drive a real OS, native gestures, push notifications, or app-store binaries. For a native iOS/Android app, the correct tool is **Appium** (or platform-native XCUITest/Espresso), and the Page Object Model, fixture, and prioritization approach in this document would carry over directly — only the driver layer changes. Playwright was selected for this assessment because (a) it lets the test *design and strategy* be demonstrated end-to-end inside a 30–45 minute recording without device-farm/provisioning overhead, and (b) mobile-web regression coverage is a real, common slice of a Mobile Automation Engineer's actual scope (most product companies ship a responsive mobile site alongside native apps and need both covered). A production extension of this suite onto BrowserStack/Sauce Labs real-device cloud is noted in Section 6.

## 3. Test Case Description — features in scope

| # | Feature area | What it does | Why it's in scope |
|---|---|---|---|
| 4.1 | **Authentication** | Username/password login gate in front of the entire app; six seeded accounts each simulate a distinct real-world account state. | Every other flow is unreachable without it — the highest-leverage area in the app. |
| 4.2 | **Shopping Cart** | Add/remove items from the catalog or cart view; a persistent badge reflects live count. | Directly determines what a customer is charged for. |
| 4.3 | **Checkout** | Three-step flow: shipping info form → priced order summary → confirmation. | The revenue-critical path; where money and required-field validation both live. |
| 4.4 | **Product Sorting** (bonus) | Client-side sort of the catalog by name/price. | Lower business risk than 4.1–4.3, but a silent-fail here quietly hurts conversion without ever throwing a visible error — a good example of a defect exploratory testing tends to miss. |

## 4. Test Strategy

**4.a — Architecture.** Page Object Model (`pages/`) isolates locators/actions from assertions (`tests/`); a custom Playwright fixture (`fixtures/pages.fixture.ts`) injects page objects and exposes an `authenticatedPage` fixture so cart/checkout specs don't re-type login on every test — that duplication would otherwise make a login bug fail every downstream test for the wrong reason.

**4.b — Mobile-first execution matrix.** Every spec runs, unmodified, against three Playwright projects:
- `Mobile Chrome (Pixel 7)` — Android reference profile
- `Mobile Safari (iPhone 14)` — iOS reference profile
- `Desktop Chrome (Regression)` — baseline, so a failure that only appears on the two mobile projects is immediately identifiable as a *responsive-layout* defect rather than a functional one.

**4.c — Data strategy.** Seeded accounts (`data/users.ts`) and product catalog (`data/products.ts`) are centralized constants so every spec references one source of truth instead of duplicating magic strings. Checkout payloads are generated fresh per run (`data/checkoutInfo.ts`) to avoid any cross-run state coupling.

**4.d — Coverage shape (positive / negative / edge).** Each feature area is tested with: one happy-path case, at least one input-validation/negative case, and at least one edge case tied to a real failure mode of the app (locked account, incomplete form, navigation-state loss, price-arithmetic drift). See the full catalog in Section 5.

**4.e — Risk-based prioritization.**
- **P0** — blocks the core revenue funnel if broken (Login happy path, full Checkout happy path, required-field validation).
- **P1** — high-value functional correctness that doesn't block the funnel outright but causes wrong orders/charges if broken (cart accuracy, price arithmetic, cancel/back-out flows).
- **P2** — secondary UX that affects conversion/discoverability but has no data-integrity risk (sorting).

**4.f — Tagging & selective execution.** Tests are tagged `@smoke` (the minimal critical-path set safe to run on every PR in under a minute) and `@video` (the exact two cases implemented in the recorded live-coding session — see Section 7). `npm run test:smoke` / `--grep @video` isolate either subset.

**4.g — CI/CD.** `.github/workflows/playwright.yml` runs on every push/PR: install → `tsc --noEmit` → `eslint` → full Playwright matrix → HTML report uploaded as a build artifact. Failures block merge (`forbidOnly` in CI).

**4.h — Explicitly out of scope (and why).** API-level/contract testing, load/performance testing, full WCAG accessibility audit, and pixel-level visual regression are not attempted here — they need different tooling (k6/Artillery, axe-core, Percy/Chromatic) and would dilute a UI-automation-focused, time-boxed assessment. They're called out here rather than silently omitted, and Section 6 sketches how each would plug into this same framework.

## 5. Full Test Case Catalog

Legend — **Type**: P = Positive, N = Negative, E = Edge · **Automated**: ✅ in this repo, — designed but not yet automated (time-boxed for this exercise, listed to show the fuller design surface) · **🎥** = one of the two cases implemented in the live-coding recording.

### 5.1 Authentication

| ID | Title | Priority | Type | Preconditions | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|---|
| TC-LOGIN-01 | Standard user logs in successfully | P0 | P | On login page | 1. Enter `standard_user` / `secret_sauce`. 2. Click **Login**. | Redirected to `/inventory.html`; "Products" title visible. | ✅ |
| TC-LOGIN-02 | Locked-out account is blocked with a specific error | P0 | N | On login page | 1. Enter `locked_out_user` / `secret_sauce`. 2. Click **Login**. | Stays on login page; error explicitly says the account is locked out (not a generic "wrong credentials" message). | ✅ |
| TC-LOGIN-03 | Invalid credential combinations are rejected | P0 | N | On login page | Run for: (a) valid user + wrong password, (b) unregistered username, (c) empty username, (d) empty password, (e) both empty. | Each shows the correct field-specific or credential-mismatch error; no session is created. | ✅ (5 data-driven variants) |
| TC-LOGIN-04 | Password field masks input | P2 | E | On login page | Inspect the password `<input>`. | `type="password"` — characters render masked. | ✅ |
| TC-LOGIN-05 | Performance-glitch user still logs in despite backend latency | P1 | E | On login page | Enter `performance_glitch_user` / `secret_sauce`; allow extra time. | Login eventually succeeds — app must not time out or silently fail under latency, a key mobile-network concern. | — |

### 5.2 Shopping Cart

| ID | Title | Priority | Type | Preconditions | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|---|
| TC-CART-01 | Adding one item updates the badge | P0 | P | Logged in, empty cart | Click **Add to cart** on one product. | Cart badge shows `1`; button flips to **Remove**. | ✅ |
| TC-CART-02 | Adding multiple items accumulates the count | P1 | P | Logged in, empty cart | Add 3 distinct products. | Badge shows `3`. | ✅ |
| TC-CART-03 | Removing an item decrements the badge | P1 | P | 2 items already in cart | Click **Remove** on one item. | Badge decrements to `1`; that item's button reverts to **Add to cart**. | ✅ |
| TC-CART-04 | Cart state survives navigation | P1 | E | 1 item in cart | Open cart view, then click **Continue Shopping** back to the catalog. | Item and badge count are unchanged after the round trip. | ✅ |
| TC-CART-05 | Badge is fully hidden (not "0") when cart is empty | P2 | E | Logged in, empty cart | Observe the cart icon on load. | No badge element is rendered at all — an app that shows a literal "0" chip instead is a UX regression worth flagging. | — |

### 5.3 Checkout

| ID | Title | Priority | Type | Preconditions | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|---|
| TC-CHK-01 | End-to-end purchase completes successfully | P0 | P | Logged in | 1. Add 2 items. 2. Go to cart → **Checkout**. 3. Fill valid shipping info → **Continue**. 4. Verify subtotal/tax/total math on the overview. 5. Click **Finish**. | Order confirmation page shows "Thank you for your order!"; subtotal matches the sum of item prices; total = subtotal + tax. | ✅ 🎥 |
| TC-CHK-02 | Required-field validation blocks submission | P0 | N | Logged in, 1 item in cart, on checkout info step | Submit with (a) first name missing, (b) last name missing, (c) postal code missing — one case per test. | A field-specific "X is required" error appears; user stays on the info step (does not advance to the priced overview). | ✅ 🎥 (case a) |
| TC-CHK-03 | Order total always equals subtotal + tax | P1 | P | Logged in | Add 3 items with distinct prices, complete checkout info, reach the overview step. | Displayed subtotal equals the sum of the 3 catalog prices; displayed total equals subtotal + displayed tax — verified independent of *which* items are in the cart, to catch a pricing-engine regression rather than one product's price. | ✅ |
| TC-CHK-04 | Cancelling checkout preserves cart contents | P1 | E | Logged in, 1 item in cart, on checkout info step | Click **Cancel**. | Returns to the cart view; the item added earlier is still present (checkout must not silently clear the cart). | ✅ |
| TC-CHK-05 | Cancelling from the priced overview also preserves state | P2 | E | On checkout overview step | Click **Cancel**. | Returns to the product catalog; cart badge count is unchanged. | — |

### 5.4 Product Sorting (bonus)

| ID | Title | Priority | Type | Preconditions | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|---|
| TC-SORT-01 | Price low→high sorts ascending | P2 | P | Logged in, on catalog | Select "Price (low to high)" from the sort dropdown. | Displayed prices are in non-decreasing order. | ✅ |
| TC-SORT-02 | Name Z→A sorts descending alphabetically | P2 | P | Logged in, on catalog | Select "Name (Z to A)". | Displayed product names are in descending alphabetical order. | ✅ |

**Totals:** 20 designed test cases (including data-driven variants) across 4 feature areas → **18 automated** in this repository (60 executions once multiplied across the 3 mobile/desktop projects), 3 explicitly deferred and documented rather than silently dropped.

## 6. Rationale — why this prioritization

- **Login, cart, and checkout are all P0/P1** because they map 1:1 onto the funnel that actually generates revenue: a visitor cannot become a paying customer without passing through all three. A defect anywhere in that chain doesn't degrade the app, it **halts the business outcome entirely** — which is why they receive the deepest positive/negative/edge coverage in this catalog, ahead of secondary features like sorting.
- **Negative and edge cases were chosen from real account/business states the app ships, not invented ones** — `locked_out_user`, `performance_glitch_user`, and empty-field submissions all correspond to failure modes a real support team would actually see in production (disabled accounts, slow/flaky backends, users bailing mid-form).
- **The price-arithmetic case (TC-CHK-03) is written against the tax/total relationship, not a hard-coded dollar figure**, so it keeps failing correctly even if SauceDemo's catalog prices ever change — that's a deliberate maintainability choice, not an oversight.
- **Sorting is deliberately P2/bonus**: it has no data-integrity blast radius (nobody gets charged the wrong amount), but it was still included because a silently-broken client-side sort throws no error and would otherwise never surface outside of exploratory testing — a good demonstration of thinking beyond the obvious happy path.
- **The three cases marked "designed but not automated"** (TC-LOGIN-05, TC-CART-05, TC-CHK-05) are left in the catalog on purpose. Cutting them silently would overstate this submission's coverage; listing them with an honest reason (time-box, or — for TC-LOGIN-05 specifically — the flakiness risk of asserting against an artificially-slowed backend) is meant to demonstrate the same prioritization judgment a Mobile Automation Engineer applies daily against a real, time-constrained sprint.
- **Future extension points**, in priority order a real team would tackle next: (1) point the same Page Object layer at BrowserStack/Sauce Labs real-device cloud for true native-gesture coverage where it matters most (checkout, since payment UI is the highest-risk native surface); (2) add `axe-core` accessibility assertions to the P0 flows; (3) add a lightweight `@playwright/test` visual-comparison snapshot on the checkout overview to catch pricing-layout regressions pixel-for-pixel.

## 7. Live Coding Video Plan

To satisfy "implementation exactly as per the pre-written design," the recording implements **exactly two cases, tagged `@video` in the code**, live and unscripted-beyond-this-outline:

1. **TC-CHK-01** — the full purchase happy path — chosen because it's the single highest-business-value flow in the app and showcases the Page Object Model, fixtures, and the subtotal/tax/total business-logic assertion in one pass.
2. **TC-CHK-02 (case a: missing first name)** — chosen as the negative counterpart on the same screen, showing how the same Page Object (`CheckoutInfoPage.fillAndContinue`) is reused for both positive and negative paths via a partial-payload parameter, and that a rejected submission does not advance the user.

**Recording outline:**
1. State the objective and pull up this document side-by-side with the empty `tests/checkout.spec.ts`.
2. Scaffold `pages/CheckoutInfoPage.ts` / `CheckoutOverviewPage.ts` locators live, narrating the `data-test` locator strategy and why it's preferred over CSS/text selectors (resilient to styling/copy changes).
3. Write TC-CHK-01 test body, run it headed (`npm run test:headed -- --grep "TC-CHK-01"`) against both `Mobile Chrome (Pixel 7)` and `Mobile Safari (iPhone 14)`, and open the trace viewer on one run to show the debugging workflow.
4. Write TC-CHK-02 (case a), re-using `fillAndContinue` with a partial object, run it, and show the assertion failing first with a deliberately wrong locator (to prove the test isn't a false positive) before fixing it and showing it pass.
5. Close by running the full mobile project (`npm run test:mobile-chrome`) and opening the HTML report.

---
*Repository layout, setup, and run instructions are in the root `README.md`.*
