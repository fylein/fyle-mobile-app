import { inject, Injectable } from '@angular/core';
import { OrgUserService } from './org-user.service';

@Injectable({
  providedIn: 'root',
})
export class DelegationService {
  private orgUserService = inject(OrgUserService);

  private async isDelegateeOwned(userId: string): Promise<boolean> {
    const inDelegateeMode = await this.orgUserService.isSwitchedToDelegator();
    const delegateeUserId = await this.orgUserService.getDelegateeUserId();

    return inDelegateeMode && userId === delegateeUserId;
  }

  inDelegateeMode(): Promise<boolean> {
    return this.orgUserService.isSwitchedToDelegator();
  }

  isDelegateeOwnedReport(reportUserId: string): Promise<boolean> {
    return this.isDelegateeOwned(reportUserId);
  }

  isDelegateeOwnedExpense(expenseUserId: string): Promise<boolean> {
    return this.isDelegateeOwned(expenseUserId);
  }
}
