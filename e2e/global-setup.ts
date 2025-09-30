import { getSuperAdminAccessToken } from './utils/get-super-admin-access-token';

async function globalSetup() {
  const apiDomain = process.env.API_DOMAIN;
  const appDomain = process.env.APP_DOMAIN;

  if (apiDomain?.includes('staging') || appDomain?.includes('staging')) {
    throw new Error('Running tests against the staging environment is not allowed. Please use blackwidow to run tests');
  }

  process.env.SUPER_ADMIN_ACCESS_TOKEN = await getSuperAdminAccessToken();
}

export default globalSetup;
