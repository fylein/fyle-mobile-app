import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, EMPTY, from, noop, Observable, Subject } from 'rxjs';
import { map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { DuplicateSets } from 'src/app/core/models/v2/duplicate-sets.model';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { Params, Router } from '@angular/router';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-potential-duplicates',
  templateUrl: './potential-duplicates.page.html',
  styleUrls: ['./potential-duplicates.page.scss'],
})
export class PotentialDuplicatesPage implements OnInit {
  duplicateSets$: Observable<Expense[][]>;

  loadData$ = new BehaviorSubject<void>(null);

  selectedSet = 0;

  duplicateSetData: DuplicateSets[];

  duplicateExpenses: Expense[][];

  isLoading = true;

  constructor(
    private handleDuplicates: HandleDuplicatesService,
    private transaction: TransactionService,
    private router: Router,
    private snackbarProperties: SnackbarPropertiesService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.selectedSet = 0;

    this.duplicateSets$ = this.loadData$.pipe(
      switchMap(() =>
        this.handleDuplicates.getDuplicateSets().pipe(
          tap((duplicateSets) => {
            this.duplicateSetData = duplicateSets;
            if (this.duplicateSetData?.length === 0) {
              this.goToTasks();
              return EMPTY;
            }
          }),
          switchMap((duplicateSets) => {
            const duplicateIds = duplicateSets
              .map((value) => value.transaction_ids)
              .reduce((acc, curVal) => acc.concat(curVal), []);
            const params = {
              tx_id: `in.(${duplicateIds.toString()})`,
            };
            return this.transaction.getETxnc({ offset: 0, limit: 10, params }).pipe(
              map((expenses) => {
                const expensesArray = expenses as [];
                return duplicateSets.map((duplicateSet) =>
                  duplicateSet.transaction_ids.map(
                    (expenseId) =>
                      expensesArray[expensesArray.findIndex((duplicateTxn: any) => expenseId === duplicateTxn.tx_id)]
                  )
                );
              })
            );
          })
        )
      ),
      tap((duplicateExpenses) => {
        this.duplicateExpenses = duplicateExpenses;
        this.isLoading = false;
      })
    );
    this.duplicateSets$.subscribe(noop);
  }

  next() {
    this.selectedSet++;
  }

  prev() {
    this.selectedSet--;
  }

  dismiss(expense: Expense) {
    const transactionIds = [expense.tx_id];
    const duplicateTxnIds = this.duplicateSetData[this.selectedSet]?.transaction_ids;
    this.handleDuplicates.dismissAll(duplicateTxnIds, transactionIds).subscribe(() => {
      this.showDismissedSuccessToast();
      this.duplicateSetData[this.selectedSet].transaction_ids = this.duplicateSetData[
        this.selectedSet
      ]?.transaction_ids.filter((expId) => expId !== expense.tx_id);
      this.duplicateExpenses[this.selectedSet] = this.duplicateExpenses[this.selectedSet]?.filter(
        (exp) => exp.tx_id !== expense.tx_id
      );
    });
  }

  dismissAll() {
    const txnIds = this.duplicateSetData[this.selectedSet]?.transaction_ids;
    this.handleDuplicates.dismissAll(txnIds, txnIds).subscribe(() => {
      if (this.selectedSet === 0) {
        this.selectedSet = 1;
      } else {
        this.selectedSet--;
      }
      this.showDismissedSuccessToast();
      this.loadData$.next();
    });
  }

  mergeExpense() {
    const selectedTxnIds = this.duplicateSetData[this.selectedSet]?.transaction_ids;
    const params = {
      tx_id: `in.(${selectedTxnIds.toString()})`,
    };
    this.transaction.getETxnc({ offset: 0, limit: 10, params }).subscribe((selectedExpenses) => {
      this.router.navigate(['/', 'enterprise', 'merge_expense'], {
        state: { selectedElements: selectedExpenses, from: 'TASK' },
      });
    });
  }

  showDismissedSuccessToast() {
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

  goToTasks() {
    const queryParams: Params = { state: 'tasks' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
      skipLocationChange: true,
    });
  }

  goToTransaction({ etxn: expense, etxnIndex }) {
    this.router.navigate(['/', 'enterprise', 'add_edit_expense', { id: expense.tx_id, persist_filters: true }]);
  }
}
