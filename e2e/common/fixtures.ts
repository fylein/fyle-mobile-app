import { test as base } from '@playwright/test';
import { Account } from './test-setup/account';

// Extend basic test fixture with our custom fixture
export const test = base.extend<{ account: Account; currency: string }>({
  currency: 'USD',
  account: async ({ currency }, use) => {
    // Set up the fixture (create the account)
    const account = await Account.create(currency);

    // Use the fixture in the test
    await use(account);

    // Clean up after test (delete the account)
    await account.delete();
  },
});

export { expect } from '@playwright/test';
