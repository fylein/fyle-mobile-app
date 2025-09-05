import { getCurrentDate } from '../../utils/date';
import { getRequestHeaders } from '../../utils/api';
import { faker } from '@faker-js/faker';
import { getSuperAdminAccessToken } from '../../utils/get-super-admin-access-token';
import { waitFor } from '../../utils/wait';

export class Account {
  readonly apiDomain: string;

  readonly appDomain: string;

  readonly ownerEmail: string;

  readonly password: string;

  readonly accountDomain: string;

  readonly orgName: string;

  readonly userAccessTokens: Record<string, string> = {};

  private ownerRefreshToken: string;

  private ownerAccessToken: string;

  constructor() {
    this.apiDomain = process.env.API_DOMAIN!;
    this.accountDomain = 'fylefore2etests.com';
    this.ownerEmail = this.generateEmail('owner');
    this.password = 'Password@1234';
    this.orgName = "Owner's Personal Account";

    // Hardcoding seed value to make sure we get same set of random numbers every time
    faker.seed(0);
  }

  private async getRefreshToken() {
    const response = await fetch(`${this.apiDomain}/api/auth/basic/signin`, {
      method: 'POST',
      body: JSON.stringify({
        email: this.ownerEmail,
        password: this.password,
      }),
      headers: getRequestHeaders(),
    });
    return (await response.json())['refresh_token'];
  }

  private async getAccessToken(refreshToken?: string) {
    const response = await fetch(`${this.apiDomain}/api/auth/access_token`, {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: refreshToken || this.ownerRefreshToken,
      }),
      headers: getRequestHeaders(),
    });
    if (response.ok) {
      return (await response.json())['access_token'];
    } else {
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }
  }

  private async getUserOrgRefreshToken(orgId: string, userAccessToken: string) {
    const response = await fetch(`${this.apiDomain}/api/orgs/${orgId}/refresh_token`, {
      method: 'POST',
      headers: getRequestHeaders(userAccessToken),
    });
    return (await response.json())['refresh_token'];
  }

  private async markUserActive(userAccessToken?: string) {
    const accessToken = userAccessToken ? userAccessToken : this.ownerAccessToken;
    const headers = getRequestHeaders(accessToken);
    await fetch(`${this.apiDomain}/api/orgusers/current/mark_active`, {
      method: 'POST',
      headers,
    });
  }

  private async verifyUser(email: string): Promise<string> {
    const response = await fetch(`${this.apiDomain}/api/auth/test/email_verify`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: getRequestHeaders(process.env.SUPER_ADMIN_ACCESS_TOKEN),
    });

    if (response.ok) {
      const { refresh_token } = await response.json();
      return refresh_token;
    } else if (response.status === 401) {
      // If super admin access token is expired, refetch it
      process.env.SUPER_ADMIN_ACCESS_TOKEN = await getSuperAdminAccessToken();
      return this.verifyUser(email);
    } else {
      throw new Error(`User verification failed ${response.status} ${response.statusText}`);
    }
  }

  public async createSubOrg() {
    const ownerAccessToken = this.ownerAccessToken;
    const headers = getRequestHeaders(ownerAccessToken);
    const ran = Math.floor(Math.random() * 999) + 1;
    const subOrgName = `E2E Test Sub Org ${getCurrentDate()}-${ran}`;
    const response = await fetch(`${this.apiDomain}/api/orgs`, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        currency: 'USD',
        domain: this.accountDomain,
        name: subOrgName,
      }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Failed to create sub org: ${response.status} ${response.statusText}`);
    }
  }

  public async deleteAll(orgs, ownerAccessToken: string) {
    for (const org of orgs) {
      const userOrgRefreshToken = await this.getUserOrgRefreshToken(org.id, ownerAccessToken);
      const accessToken = await this.getAccessToken(userOrgRefreshToken);
      const response = await fetch(`${this.apiDomain}/platform/v1/owner/orgs/delete`, {
        method: 'POST',
        headers: getRequestHeaders(accessToken),
        body: JSON.stringify({
          data: { id: org.id },
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete account with orgId ${org.id} ${response.status} ${response.statusText}`);
      }
    }
  }

  public async delete(isRefreshTokenExpired = false) {
    const ownerAccessToken = isRefreshTokenExpired
      ? await this.getAccessToken(await this.getRefreshToken())
      : this.ownerAccessToken;
    const headers = getRequestHeaders(ownerAccessToken);
    const orgResponse = await fetch(`${this.apiDomain}/api/orgs`, { method: 'GET', headers });
    const orgs = await orgResponse.json();
    if (orgs.length > 1) {
      return await this.deleteAll(orgs, ownerAccessToken);
    }

    const org = orgs[0];
    const response = await fetch(`${this.apiDomain}/platform/v1/owner/orgs/delete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: { id: org.id },
      }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Failed to delete account: ${response.status} ${response.statusText}`);
    }
  }

  public generateEmail(role: string) {
    return `${role}-${Date.now()}@${this.accountDomain}`;
  }

  public getOwnerAccessToken() {
    return this.ownerAccessToken;
  }

  public static async create(orgCurrency = 'USD') {
    const account = new Account();

    const signupPayload = {
      email: account.ownerEmail,
      password: account.password,
      full_name: 'Owner',
      title: 'Owner',
      signup_params: {
        org_currency: orgCurrency,
      },
    };

    const response = await fetch(`${account.apiDomain}/api/auth/basic/signup`, {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify(signupPayload),
    });

    if (response.ok) {
      console.log('Account created successfully');
    } else if (response.status >= 500) {
      console.log(`Failed to create account due to ${response.status} server issue, retrying after 2s...`);
      await waitFor(2000);
      return this.create(orgCurrency);
    } else {
      throw new Error(`Failed to create account: ${response.status} ${response.statusText}`);
    }

    const refreshToken = await account.verifyUser(signupPayload.email);
    account.ownerAccessToken = await account.getAccessToken(refreshToken);

    await account.markUserActive();
    await account.waitForOnboarding();

    return account;
  }

  public async waitForOnboarding() {
    const response = await fetch(`${this.apiDomain}/platform/v1/spender/onboarding`, {
      headers: getRequestHeaders(this.ownerAccessToken),
    });

    if (response.status === 404) {
      console.log('Onboarding data not initialised for user yet, retrying after 2s...');
      await waitFor(2000);
      return await this.waitForOnboarding();
    }
  }

  public async verifyAndActivateUser(userEmail: string) {
    const refreshToken = await this.verifyUser(userEmail);
    const userAccessToken = await this.getAccessToken(refreshToken);
    await this.markUserActive(userAccessToken);
    this.userAccessTokens[userEmail] = userAccessToken;
  }
}
