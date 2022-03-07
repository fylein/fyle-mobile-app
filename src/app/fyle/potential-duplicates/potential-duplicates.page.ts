import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, from, noop, Observable, Subject } from 'rxjs';
import { map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { DuplicateSets } from 'src/app/core/models/v2/duplicate-sets.model';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { Router } from '@angular/router';

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

  constructor(
    private handleDuplicates: HandleDuplicatesService,
    private transaction: TransactionService,
    private router: Router
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.handleDuplicates
      .getDuplicatesSet()
      .pipe(map((sets: any) => sets.length))
      .subscribe((duplicatesSetCount) => {
        this.duplicatesSetCount = duplicatesSetCount;
      });

    this.loadData$ = new BehaviorSubject({});

    this.duplicatesSet$ = this.loadData$.pipe(
      switchMap(() =>
        this.handleDuplicates.getDuplicatesSet().pipe(
          tap((duplicatesSets) => {
            this.duplicatesSetData = duplicatesSets;
            this.duplicatesSetCount = duplicatesSets.length;
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
      )
    );
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
      this.loadData$.next({});
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
}
