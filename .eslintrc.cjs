module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    // Playwright locator getters are intentionally arrow functions returning a
    // fresh Locator each call - this keeps them lazy/re-query-safe. Disable the
    // "unused vars" false positives that trip on destructured fixture params we
    // consume only for their side effects (e.g. beforeEach ordering).
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': 'warn',
  },
  ignorePatterns: ['node_modules', 'playwright-report', 'test-results', 'dist'],
};
