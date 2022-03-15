import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, from, noop, Observable, Subject } from 'rxjs';
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
  duplicatesSet$: Observable<any>;

  loadData$: BehaviorSubject<any>;

  selectedSet = 0;

  duplicatesSetCount: number;

  duplicatesSetData: DuplicateSets[];

  duplicateExpenses;

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
    this.handleDuplicates
      .getDuplicatesSet()
      .pipe(map((sets: any) => sets.length))
      .subscribe((duplicatesSetCount) => {
        this.duplicatesSetCount = duplicatesSetCount;
        if (this.duplicatesSetCount === 0) {
          this.goToTasks();
        }
      });

    this.loadData$ = new BehaviorSubject({});

    this.duplicatesSet$ = this.loadData$.pipe(
      switchMap(() =>
        this.handleDuplicates.getDuplicatesSet().pipe(
          tap((duplicatesSets) => {
            this.duplicatesSetData = duplicatesSets;
            this.duplicatesSetCount = duplicatesSets.length;
            if (this.duplicatesSetCount === 0) {
              this.goToTasks();
            }
          }),
          switchMap((duplicatesSets) => {
            const duplicateIds = [].concat.apply(
              [],
              duplicatesSets.map((value) => value.transaction_ids)
            );
            const params = {
              tx_id: `in.(${duplicateIds.toString()})`,
            };
            return this.transaction.getETxnc({ offset: 0, limit: 10, params }).pipe(
              map((expenses) => {
                const expensesArray = expenses as [];
                return duplicatesSets.map((set) =>
                  set.transaction_ids.map(
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
    this.duplicatesSet$.subscribe(noop);
  }

  next() {
    this.selectedSet++;
  }

  prev() {
    this.selectedSet--;
  }

  dismiss(expense: Expense) {
    const transactionIds = [expense.tx_id];
    const duplicateTxnIds = this.duplicatesSetData[this.selectedSet].transaction_ids;
    this.handleDuplicates.dismissAll(duplicateTxnIds, transactionIds).subscribe(() => {
      this.showDismissedSuccessToast();
      console.log(this.duplicatesSetData[this.selectedSet].transaction_ids);
      const index = this.duplicatesSetData[this.selectedSet].transaction_ids.indexOf(expense.tx_id);
      if (index > -1) {
        this.duplicatesSetData[this.selectedSet].transaction_ids.splice(index, 1);
      }
      const index1 = this.duplicateExpenses[this.selectedSet].findIndex((x) => x.tx_id === expense.tx_id);
      if (index1 > -1) {
        this.duplicateExpenses[this.selectedSet].splice(index1, 1);
      }
    });
  }

  dismissAll() {
    const txnIds = this.duplicatesSetData[this.selectedSet].transaction_ids;
    this.handleDuplicates.dismissAll(txnIds, txnIds).subscribe(() => {
      if (this.selectedSet === 0) {
        this.selectedSet = 1;
      } else {
        this.selectedSet--;
      }
      this.showDismissedSuccessToast();
      this.loadData$.next({});
    });
  }

  mergeExpense() {
    const selectedTxnIds = this.duplicatesSetData[this.selectedSet].transaction_ids;
    const params = {
      tx_id: `in.(${selectedTxnIds.toString()})`,
    };
    this.transaction.getETxnc({ offset: 0, limit: 10, params }).subscribe((selectedExpenses) => {
      this.router.navigate(['/', 'enterprise', 'merge_expense'], { state: { selectedElements: selectedExpenses } });
    });
  }

  showDismissedSuccessToast() {
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

  goToTasks() {
    const queryParams: Params = { state: 'tasks' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
      skipLocationChange: true,
    });
  }
}
