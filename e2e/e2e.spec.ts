import { test, expect } from "./common/fixtures"

test.describe('test', () => {
  // test.beforeEach(async ({ page, account }) => {
  //   await page.goto(account.appDomain);
  // });

  test('should login', async ({ page, account }) => {    
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Sign in with email address' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'fyle-logo Sign in with Google' })).toBeVisible();
    await page.getByRole('button', { name: 'Sign in with email address' }).click();
    await page.getByRole('textbox', { name: 'Enter email address' }).click();

    
    await expect(page.getByText('Sign inEnter the credentials')).toBeVisible();
    await expect(page.getByText('Registered email')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter email address' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Enter email address' }).fill(account.ownerEmail);
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Forgot password?' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Enter password' }).click();
    await page.getByRole('textbox', { name: 'Enter password' }).fill(account.password);
    
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForTimeout(10000)
  });
});