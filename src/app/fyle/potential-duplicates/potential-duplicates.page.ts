import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Params, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, noop } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';

type Expenses = Expense[];

@Component({
  selector: 'app-potential-duplicates',
  templateUrl: './potential-duplicates.page.html',
  styleUrls: ['./potential-duplicates.page.scss'],
})
export class PotentialDuplicatesPage {
  duplicateSets$: Observable<Expenses[]>;

  loadData$ = new BehaviorSubject<void>(null);

  selectedSet = 0;

  duplicateSetData: string[][];

  duplicateExpenses: Expenses[];

  isLoading = true;

  constructor(
    private handleDuplicates: HandleDuplicatesService,
    private expensesService: ExpensesService,
    private router: Router,
    private snackbarProperties: SnackbarPropertiesService,
    private matSnackBar: MatSnackBar,
    private trackingService: TrackingService,
    private orgSettingsService: OrgSettingsService
  ) {}

  ionViewWillEnter(): void {
    this.selectedSet = 0;

    this.duplicateSets$ = this.loadData$.pipe(
      switchMap(() =>
        this.getDuplicates().pipe(
          tap((duplicateSets) => {
            this.duplicateSetData = duplicateSets;
            if (this.duplicateSetData.length === 0) {
              this.goToTasks();
              return EMPTY;
            }
          }),
          switchMap((duplicateSets) => {
            const duplicateIds = duplicateSets.reduce((acc, curVal) => acc.concat(curVal), []);

            const queryParams = {
              id: `in.(${duplicateIds.join(',')})`,
            };

            return this.expensesService
              .getExpenses({
                offset: 0,
                ...queryParams,
              })
              .pipe(
                map((expenses) => {
                  const expensesArray = expenses as [];
                  return duplicateSets.map((duplicateSet) =>
                    this.addExpenseDetailsToDuplicateSets(duplicateSet, expensesArray)
                  );
                })
              );
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
      )
    );
    this.duplicateSets$.subscribe((duplicateExpenses) => {
      this.duplicateExpenses = duplicateExpenses;
    });
  }

  getDuplicates(): Observable<string[][]> {
    const isDuplicateDetectionV2Enabled$ = this.orgSettingsService
      .get()
      .pipe(
        map(
          (orgSettings) =>
            orgSettings.duplicate_detection_v2_settings.allowed && orgSettings.duplicate_detection_v2_settings.enabled
        )
      );

    return isDuplicateDetectionV2Enabled$.pipe(
      switchMap((isDuplicateDetectionV2Enabled) => {
        if (isDuplicateDetectionV2Enabled) {
          return this.expensesService
            .getDuplicateSets()
            .pipe(map((duplicateSets) => duplicateSets.map((value) => value.expense_ids)));
        } else {
          return this.handleDuplicates
            .getDuplicateSets()
            .pipe(map((duplicateSets) => duplicateSets.map((value) => value.transaction_ids)));
        }
      })
    );
  }

  addExpenseDetailsToDuplicateSets(duplicateSet: string[], expensesArray: Expense[]): Expense[] {
    return duplicateSet.map(
      (expenseId) => expensesArray[expensesArray.findIndex((duplicateTxn: Expense) => expenseId === duplicateTxn.id)]
    );
  }

  next(): void {
    this.selectedSet++;
  }

  prev(): void {
    this.selectedSet--;
  }

  dismiss(expense: Expense): void {
    const transactionIds = [expense.id];
    const duplicateTxnIds = this.duplicateSetData[this.selectedSet];
    this.handleDuplicates.dismissAll(duplicateTxnIds, transactionIds).subscribe(() => {
      this.trackingService.dismissedIndividualExpenses();
      this.showDismissedSuccessToast();
      this.duplicateSetData[this.selectedSet] = this.duplicateSetData[this.selectedSet].filter(
        (expId) => expId !== expense.id
      );
      this.duplicateExpenses[this.selectedSet] = this.duplicateExpenses[this.selectedSet].filter(
        (exp) => exp.id !== expense.id
      );
    });
  }

  dismissAll(): void {
    const txnIds = this.duplicateSetData[this.selectedSet];
    this.handleDuplicates.dismissAll(txnIds, txnIds).subscribe(() => {
      if (this.selectedSet !== 0) {
        this.selectedSet--;
      }
      this.trackingService.dismissedDuplicateSet();
      this.showDismissedSuccessToast();
      this.loadData$.next();
      this.duplicateSets$.subscribe((duplicateExpenses) => {
        this.duplicateExpenses = duplicateExpenses;
      });
    });
  }

  mergeExpense(): void {
    const selectedTxnIds = this.duplicateSetData[this.selectedSet];

    const queryParams = {
      id: `in.(${selectedTxnIds.join(',')})`,
    };

    this.expensesService
      .getExpenses({
        offset: 0,
        limit: 10,
        ...queryParams,
      })
      .subscribe((selectedExpenses) => {
        const expenseIDs = selectedExpenses.map((expense) => expense.id);
        this.trackingService.visitedMergeExpensesPageFromTask();
        this.router.navigate([
          '/',
          'enterprise',
          'merge_expense',
          {
            expenseIDs: JSON.stringify(expenseIDs),
            from: 'TASK',
          },
        ]);
      });
  }

  showDismissedSuccessToast(): void {
    const toastMessageData = {
      message: 'Expense dismissed',
    };
    this.matSnackBar
      .openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
        panelClass: ['msb-success-with-camera-icon'],
      })
      .onAction()
      .subscribe(noop);
  }

  goToTasks(): void {
    const queryParams: Params = { state: 'tasks' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
      skipLocationChange: true,
    });
  }

  goToTransaction({ etxn: expense }: { etxn: Expense }): void {
    this.router.navigate(['/', 'enterprise', 'add_edit_expense', { id: expense.id, persist_filters: true }]);
  }
}
