import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { map, noop } from 'rxjs';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

@Component({
  selector: 'app-suggested-duplicates',
  templateUrl: './suggested-duplicates.component.html',
  styleUrls: ['./suggested-duplicates.component.scss'],
})
export class SuggestedDuplicatesComponent {
  @Input() duplicateExpenseIDs: string[];

  duplicateExpenses: Expense[] = [];

  constructor(
    private modalController: ModalController,
    private handleDuplicates: HandleDuplicatesService,
    private expensesService: ExpensesService,
    private router: Router,
    private snackbarProperties: SnackbarPropertiesService,
    private matSnackBar: MatSnackBar
  ) {}

  ionViewWillEnter(): void {
    const txnIds = this.duplicateExpenseIDs.join(',');
    const queryParams = {
      id: `in.(${txnIds})`,
    };

    this.expensesService
      .getExpenses({ offset: 0, limit: 10, queryParams })
      .pipe(map((expenses) => (this.duplicateExpenses = expenses)));
  }

  dismissAll(): void {
    const txnIds = this.duplicateExpenses.map((expense) => expense.id);
    this.handleDuplicates.dismissAll(txnIds, txnIds).subscribe(() => {
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
      message: 'Duplicates was successfully dismissed',
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
