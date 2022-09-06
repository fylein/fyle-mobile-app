import { Injectable } from '@angular/core';
import { AccountsService } from './accounts.service';
import { OfflineService } from './offline.service';
import { Expense } from '../models/expense.model';
import { map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { ExpenseType } from '../enums/expense-type.enum';
import { AccountType } from '../enums/account-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ViewExpenseService {
  constructor(private accountsService: AccountsService, private offlineService: OfflineService) {}

  shouldPaymentModeBeShown(etxn: Expense, expenseType: ExpenseType): Observable<boolean> {
    return forkJoin({
      allowedPaymentModes: this.offlineService.getAllowedPaymentModes(),
      isPaymentModeConfigurationsEnabled: this.offlineService.checkIfPaymentModeConfigurationsIsEnabled(),
    }).pipe(
      map(({ allowedPaymentModes, isPaymentModeConfigurationsEnabled }) => {
        const isMileageOrPerDiemExpense = [ExpenseType.MILEAGE, ExpenseType.PER_DIEM].includes(expenseType);
        if (isMileageOrPerDiemExpense) {
          allowedPaymentModes = allowedPaymentModes.filter(
            (allowedPaymentMode) => allowedPaymentMode !== AccountType.CCC
          );

          /*
           * For mileage and per-diem expenses, since default payment mode is PERSONAL_ACCOUNT,
           * we don't show Payment Mode field if COMPANY_ACCOUNT and PERSONAL_ADVANCE_ACCOUNT
           * are not present
           */
          if (!allowedPaymentModes.length) {
            return false;
          }
        }
        if (isPaymentModeConfigurationsEnabled && allowedPaymentModes.length === 1) {
          const etxnAccountType = this.accountsService.getEtxnAccountType(etxn);
          return allowedPaymentModes[0] !== etxnAccountType;
        }
        return true;
      })
    );
  }
}
