import { Page, expect } from '@playwright/test';
import { HELP_ARTICLES_DOMAIN } from '../../test-data/shared/constants';

/**
 * Verifies that clicking the "Read More" link opens the correct help article page
 * @param page - Playwright page object
 */
export const verifyReadMoreLink = async (page: Page): Promise<void> => {
  const [newPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: 'Read More' }).click(),
  ]);

  expect(newPage.url()).toContain(HELP_ARTICLES_DOMAIN);
  await newPage.close();
};
