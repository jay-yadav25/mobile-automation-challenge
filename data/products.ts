export interface Product {
  name: string;
  /** Suffix used in SauceDemo's data-test="add-to-cart-<slug>" attributes. */
  slug: string;
  price: number;
}

/**
 * Static catalog reference. SauceDemo's inventory does not change, so hard-coding it
 * here is intentional - it lets tests assert against known values (e.g. price math)
 * instead of only ever comparing the app to itself.
 */
export const PRODUCTS: Record<string, Product> = {
  backpack: { name: 'Sauce Labs Backpack', slug: 'sauce-labs-backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', slug: 'sauce-labs-bike-light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', slug: 'sauce-labs-bolt-t-shirt', price: 15.99 },
  fleeceJacket: {
    name: 'Sauce Labs Fleece Jacket',
    slug: 'sauce-labs-fleece-jacket',
    price: 49.99,
  },
  onesie: { name: 'Sauce Labs Onesie', slug: 'sauce-labs-onesie', price: 7.99 },
};
