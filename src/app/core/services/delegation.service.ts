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

  async canAccessAnyOf(required: ReadonlyArray<'SUBMIT' | 'APPROVE'>): Promise<boolean> {
    const inDelegateeMode = await this.inDelegateeMode();
    if (!inDelegateeMode) {
      return true;
    }

    const scopes = await this.getScopes();
    if (!scopes) {
      return false;
    }

    if (scopes.includes('ALL')) {
      return true;
    }

    return scopes.some((s) => required.includes(s as 'SUBMIT' | 'APPROVE'));
  }

  canAccessSubmitFeatures(): Promise<boolean> {
    return this.canAccessAnyOf(['SUBMIT']);
  }

  canAccessApproveFeatures(): Promise<boolean> {
    return this.canAccessAnyOf(['APPROVE']);
  }

  async canAccessAllOnlyFeatures(): Promise<boolean> {
    const inDelegateeMode = await this.inDelegateeMode();
    if (!inDelegateeMode) {
      return true;
    }

    const scopes = await this.getScopes();
    return !!scopes?.includes('ALL');
  }

  async inDelegateeMode(): Promise<boolean> {
    const accessToken = await this.tokenService.getAccessToken();
    const tokenPayload = this.jwtHelperService.decodeToken(accessToken) as AccessTokenData;
    return !!tokenPayload?.proxy_org_user_id;
  }

  async updateDelegationScopesFromEou(currentEou: ExtendedOrgUser): Promise<void> {
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
