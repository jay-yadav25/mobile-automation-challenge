export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/**
 * Generates a fresh, valid checkout payload for each test run. Using a timestamp
 * suffix avoids any (unlikely) cross-test collisions and makes it obvious in a
 * report/trace which run produced which data.
 */
export function buildValidCheckoutInfo(): CheckoutInfo {
  const uniqueSuffix = Date.now().toString().slice(-5);
  return {
    firstName: `Jay`,
    lastName: `yadav-${uniqueSuffix}`,
    postalCode: '401305',
  };
}

export const INCOMPLETE_CHECKOUT_CASES: Array<{
  description: string;
  info: Partial<CheckoutInfo>;
  expectedError: string | RegExp;
}> = [
  {
    description: 'missing first name',
    info: { lastName: 'Verma', postalCode: '401305' },
    expectedError: /First Name is required/i,
  },
  {
    description: 'missing last name',
    info: { firstName: 'Jay', postalCode: '401305' },
    expectedError: /Last Name is required/i,
  },
  {
    description: 'missing postal code',
    info: { firstName: 'Jay', lastName: 'yadav' },
    expectedError: /Postal Code is required/i,
  },
];
