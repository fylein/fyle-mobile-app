import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable, map, noop, switchMap } from 'rxjs';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
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

  isDuplicateDetectionV2Enabled$: Observable<boolean>;

  constructor(
    private modalController: ModalController,
    private handleDuplicates: HandleDuplicatesService,
    private expensesService: ExpensesService,
    private router: Router,
    private snackbarProperties: SnackbarPropertiesService,
    private matSnackBar: MatSnackBar,
    private orgSettingsService: OrgSettingsService
  ) {}

  ionViewWillEnter(): void {
    this.isDuplicateDetectionV2Enabled$ = this.orgSettingsService
      .get()
      .pipe(
        map(
          (orgSettings) =>
            orgSettings.duplicate_detection_v2_settings.allowed && orgSettings.duplicate_detection_v2_settings.enabled
        )
      );

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
    return this.isDuplicateDetectionV2Enabled$.pipe(
      switchMap((isDuplicateDetectionV2Enabled) => {
        if (isDuplicateDetectionV2Enabled) {
          return this.expensesService.dismissDuplicates(duplicateExpenseIds, targetExpenseIds);
        } else {
          return this.handleDuplicates.dismissAll(duplicateExpenseIds, targetExpenseIds);
        }
      })
    );
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
