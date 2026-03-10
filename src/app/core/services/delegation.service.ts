import { inject, Injectable } from '@angular/core';
import { OrgUserService } from './org-user.service';

@Injectable({
  providedIn: 'root',
})
export class DelegationService {
  private orgUserService = inject(OrgUserService);

  private async isDelegateeOwned(userId: string): Promise<boolean> {
    const inDelegateeMode = await this.inDelegateeMode();
    if (!inDelegateeMode) {
      return false;
    }

    const delegateeUserId = await this.getDelegateeUserId();
    if (!delegateeUserId) {
      return false;
    }

    return userId === delegateeUserId;
  }

  inDelegateeMode(): Promise<boolean> {
    return this.orgUserService.isSwitchedToDelegator();
  }

  getDelegateeUserId(): Promise<string | null> {
    return this.orgUserService.getBaseDelegateeUserId();
  }

  isDelegateeOwnedReport(reportUserId: string): Promise<boolean> {
    return this.isDelegateeOwned(reportUserId);
  }

  isDelegateeOwnedExpense(expenseUserId: string): Promise<boolean> {
    return this.isDelegateeOwned(expenseUserId);
  }
}
