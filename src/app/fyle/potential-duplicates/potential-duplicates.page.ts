import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Params, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, noop } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { DuplicateSet } from 'src/app/core/models/v2/duplicate-sets.model';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

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

  duplicateSetData: DuplicateSet[];

  duplicateExpenses: Expenses[];

  isLoading = true;

  constructor(
    private handleDuplicates: HandleDuplicatesService,
    private transaction: TransactionService,
    private router: Router,
    private snackbarProperties: SnackbarPropertiesService,
    private matSnackBar: MatSnackBar,
    private trackingService: TrackingService
  ) {}

  ionViewWillEnter(): void {
    this.selectedSet = 0;

    this.duplicateSets$ = this.loadData$.pipe(
      switchMap(() =>
        this.handleDuplicates.getDuplicateSets().pipe(
          tap((duplicateSets) => {
            this.duplicateSetData = duplicateSets;
            if (this.duplicateSetData.length === 0) {
              this.goToTasks();
              return EMPTY;
            }
          }),
          switchMap((duplicateSets) => {
            const duplicateIds = duplicateSets
              .map((value) => value.transaction_ids)
              .reduce((acc, curVal) => acc.concat(curVal), []);
            const params = {
              tx_id: `in.(${duplicateIds.join(',')})`,
            };
            return this.transaction.getETxnc({ offset: 0, limit: 10, params }).pipe(
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

  addExpenseDetailsToDuplicateSets(duplicateSet: DuplicateSet, expensesArray: Expense[]): Expense[] {
    return duplicateSet.transaction_ids.map(
      (expenseId) => expensesArray[expensesArray.findIndex((duplicateTxn: Expense) => expenseId === duplicateTxn.tx_id)]
    );
  }

  next(): void {
    this.selectedSet++;
  }

  prev(): void {
    this.selectedSet--;
  }

  dismiss(expense: Expense): void {
    const transactionIds = [expense.tx_id];
    const duplicateTxnIds = this.duplicateSetData[this.selectedSet].transaction_ids;
    this.handleDuplicates.dismissAll(duplicateTxnIds, transactionIds).subscribe(() => {
      this.trackingService.dismissedIndividualExpenses();
      this.showDismissedSuccessToast();
      this.duplicateSetData[this.selectedSet].transaction_ids = this.duplicateSetData[
        this.selectedSet
      ].transaction_ids.filter((expId) => expId !== expense.tx_id);
      this.duplicateExpenses[this.selectedSet] = this.duplicateExpenses[this.selectedSet].filter(
        (exp) => exp.tx_id !== expense.tx_id
      );
    });
  }

  dismissAll(): void {
    const txnIds = this.duplicateSetData[this.selectedSet].transaction_ids;
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
    const selectedTxnIds = this.duplicateSetData[this.selectedSet].transaction_ids;
    const params = {
      tx_id: `in.(${selectedTxnIds.join(',')})`,
    };
    this.transaction.getETxnc({ offset: 0, limit: 10, params }).subscribe((selectedExpenses) => {
      this.trackingService.visitedMergeExpensesPageFromTask();
      this.router.navigate([
        '/',
        'enterprise',
        'merge_expense',
        {
          selectedElements: JSON.stringify(selectedExpenses),
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
    this.router.navigate(['/', 'enterprise', 'add_edit_expense', { id: expense.tx_id, persist_filters: true }]);
  }
}
