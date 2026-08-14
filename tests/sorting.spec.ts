import { test, expect } from '../fixtures/pages.fixture';

/**
 * Covers: docs/TEST_DESIGN_DOCUMENT.md - Section 4.4 "Product Sorting" (P2, bonus coverage)
 * Business rationale: sort is a self-service tool shoppers use to find the item they
 * want faster - a silently-broken sort quietly hurts conversion without ever throwing
 * a visible error, which is exactly the kind of defect exploratory testing misses.
 */
test.describe('Product Sorting', () => {
  test('TC-SORT-01 - price low-to-high sorts the catalog in ascending order', async ({
    authenticatedPage,
  }) => {
    const { inventoryPage } = authenticatedPage;

    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getDisplayedPrices();

    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('TC-SORT-02 - name Z-to-A sorts the catalog in descending alphabetical order', async ({
    authenticatedPage,
  }) => {
    const { inventoryPage } = authenticatedPage;

    await inventoryPage.sortBy('za');
    const names = await inventoryPage.getDisplayedNames();

    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });
});
