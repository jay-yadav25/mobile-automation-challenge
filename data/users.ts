
export const PASSWORD = 'secret_sauce';
/** Below is the list of valid users */
export const USERS = {
  /** Fully functional account - our "happy path" user. */
  standard: 'standard_user',
  /** Authenticates successfully server-side but is blocked with a specific error -
   *  the classic "disabled account" business scenario every e-commerce app must handle. */
  lockedOut: 'locked_out_user',
  /** Logs in fine but the UI renders broken/mismatched product data - simulates a
   *  front-end data-binding regression. */
  problem: 'problem_user',
  /** Logs in fine but every action is artificially slow - useful for asserting the
   *  app does not time out or fail under latency, a key mobile-network concern. */
  performanceGlitch: 'performance_glitch_user',
} as const;

export type UserKey = keyof typeof USERS;

/** Negative-path credential combinations, paired with the error text SauceDemo returns. */
export const INVALID_LOGIN_CASES: Array<{
  description: string;
  username: string;
  password: string;
  expectedError: string | RegExp;
}> = [
  {
    description: 'valid username, wrong password',
    username: USERS.standard,
    password: 'wrong_password',
    expectedError: /Username and password do not match/i,
  },
  {
    description: 'unregistered username',
    username: 'not_a_real_user',
    password: PASSWORD,
    expectedError: /Username and password do not match/i,
  },
  {
    description: 'empty username',
    username: '',
    password: PASSWORD,
    expectedError: /Username is required/i,
  },
  {
    description: 'empty password',
    username: USERS.standard,
    password: '',
    expectedError: /Password is required/i,
  },
  {
    description: 'both fields empty',
    username: '',
    password: '',
    expectedError: /Username is required/i,
  },
];
