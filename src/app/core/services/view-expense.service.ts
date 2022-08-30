import { Injectable } from '@angular/core';
import { AccountsService } from './accounts.service';
import { OfflineService } from './offline.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { Expense } from '../models/expense.model';
import { map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewExpenseService {
  constructor(
    private accountsService: AccountsService,
    private offlineService: OfflineService,
    private launchDarklyService: LaunchDarklyService
  ) {}

  shouldPaymentModeBeShown(etxn: Expense): Observable<boolean> {
    return forkJoin({
      allowedPaymentModes: this.offlineService.getAllowedPaymentModes(),
      isPaymentModeConfigurationsEnabled: this.launchDarklyService.checkIfPaymentModeConfigurationsIsEnabled(),
    }).pipe(
      map(({ allowedPaymentModes, isPaymentModeConfigurationsEnabled }) => {
        if (isPaymentModeConfigurationsEnabled && allowedPaymentModes.length === 1) {
          const etxnAccountType = this.accountsService.getEtxnAccountType(etxn);
          return allowedPaymentModes[0] !== etxnAccountType;
        }
        return true;
      })
    );
  }
}
