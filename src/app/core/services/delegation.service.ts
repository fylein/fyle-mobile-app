import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { JwtHelperService } from './jwt-helper.service';
import { AccessTokenData } from '../models/access-token-data.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

@Injectable({
  providedIn: 'root',
})
export class DelegationService {
  private storageService = inject(StorageService);

  private tokenService = inject(TokenService);

  private jwtHelperService = inject(JwtHelperService);

  private readonly scopesStorageKey = 'delegatee_session_scopes';

  private readonly delegateeIdStorageKey = 'delegatee_id';

  async setDelegateeUserId(userId: string): Promise<void> {
    if (userId) {
      await this.storageService.set(this.delegateeIdStorageKey, userId);
    }
  }

  getDelegateeUserId(): Promise<string | null> {
    return this.storageService.get<string>(this.delegateeIdStorageKey);
  }

  private normalizeScopes(scopes: Array<'SUBMIT' | 'APPROVE' | 'ALL'> | null): string {
    return (scopes ?? []).slice().sort().join('|');
  }

  private async isDelegateeOwned(userId: string): Promise<boolean> {
    const inDelegateeMode = await this.inDelegateeMode();
    const delegateeUserId = await this.storageService.get<string>(this.delegateeIdStorageKey);

    return inDelegateeMode && userId === delegateeUserId;
  }

  async setScopes(scopes: Array<'SUBMIT' | 'APPROVE' | 'ALL'> | null): Promise<void> {
    if (scopes === null) {
      await this.storageService.delete(this.scopesStorageKey);
    } else {
      await this.storageService.set(this.scopesStorageKey, scopes);
    }
  }

  getScopes(): Promise<Array<'SUBMIT' | 'APPROVE' | 'ALL'> | null> {
    return this.storageService.get(this.scopesStorageKey);
  }

  async inDelegateeMode(): Promise<boolean> {
    const accessToken = await this.tokenService.getAccessToken();
    if (!accessToken) {
      return false;
    }
    const tokenPayload = this.jwtHelperService.decodeToken(accessToken) as AccessTokenData;
    return !!tokenPayload?.proxy_org_user_id;
  }

  async updateDelegationScopesFromEou(currentEou: ExtendedOrgUser): Promise<void> {
    // Only relevant in delegatee mode; clear otherwise to avoid stale values.
    const inDelegateeMode = await this.inDelegateeMode();
    if (!inDelegateeMode) {
      await this.setScopes(null);
      return;
    }

    const delegateeId = await this.getDelegateeUserId();
    const delegatee = currentEou?.delegatees?.find((d) => d.user_id === delegateeId);
    const newScopes = delegatee?.scopes ?? [];

    const currentScopes = await this.getScopes();
    if (this.normalizeScopes(currentScopes) !== this.normalizeScopes(newScopes)) {
      await this.setScopes(newScopes);
    }
  }

  isDelegateeOwnedReport(reportUserId: string): Promise<boolean> {
    return this.isDelegateeOwned(reportUserId);
  }

  isDelegateeOwnedExpense(expenseUserId: string): Promise<boolean> {
    return this.isDelegateeOwned(expenseUserId);
  }
}
