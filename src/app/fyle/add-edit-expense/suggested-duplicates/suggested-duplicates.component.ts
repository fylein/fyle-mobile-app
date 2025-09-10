import { Component, Input, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { Observable, map, noop } from 'rxjs';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { ExpensesCardComponent } from '../../../shared/components/expenses-card-v2/expenses-card.component';
import { CurrencyPipe } from '@angular/common';
import { FyCurrencyPipe } from '../../../shared/pipes/fy-currency.pipe';

@Component({
  selector: 'app-suggested-duplicates',
  templateUrl: './suggested-duplicates.component.html',
  styleUrls: ['./suggested-duplicates.component.scss'],
  imports: [IonicModule, MatIcon, ExpensesCardComponent, CurrencyPipe, FyCurrencyPipe, TranslocoPipe],
})
export class SuggestedDuplicatesComponent {
  private modalController = inject(ModalController);

  private expensesService = inject(ExpensesService);

  private router = inject(Router);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private matSnackBar = inject(MatSnackBar);

  private orgSettingsService = inject(OrgSettingsService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() duplicateExpenseIDs: string[];

  duplicateExpenses: Expense[] = [];

  ionViewWillEnter(): void {
    const txnIds = this.duplicateExpenseIDs.join(',');
    const queryParams = {
      id: `in.(${txnIds})`,
    };

    this.expensesService
      .getExpenses({ offset: 0, limit: 10, ...queryParams })
      .pipe(map((expenses) => (this.duplicateExpenses = expenses)))
      .subscribe(noop);
  }

  dismissDuplicates(duplicateExpenseIds: string[], targetExpenseIds: string[]): Observable<void> {
    return this.expensesService.dismissDuplicates(duplicateExpenseIds, targetExpenseIds);
  }

  dismissAll(): void {
    const txnIds = this.duplicateExpenses.map((expense) => expense.id);
    this.dismissDuplicates(txnIds, txnIds).subscribe(() => {
      this.showDismissedSuccessToast();
      this.modalController.dismiss({
        action: 'dismissed',
      });
    });
  }

  mergeExpenses(): void {
    this.modalController.dismiss();
    const expenseIDs = this.duplicateExpenses.map((expense) => expense.id);
    this.router.navigate([
      '/',
      'enterprise',
      'merge_expense',
      {
        expenseIDs: JSON.stringify(expenseIDs),
        from: 'EDIT_EXPENSE',
      },
    ]);
  }

  showDismissedSuccessToast(): void {
    const toastMessageData = {
      message: this.translocoService.translate('suggestedDuplicates.dismissSuccess'),
    };
    this.matSnackBar
      .openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
        panelClass: ['msb-success-with-camera-icon'],
      })
      .onAction()
      .subscribe(noop);
  }
}
