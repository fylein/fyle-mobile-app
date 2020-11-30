import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TransactionService } from './services/transaction.service';

@Injectable({
  providedIn: 'root'
})
export class SplitExpenseService {

  constructor(
    private transactionService: TransactionService
  ) { }

  createSplitTxns(sourceTxn, totalSplitAmount, splitExpenses) {
    let splitGroupAmount = sourceTxn.split_group_user_amount || sourceTxn.amount;
    const splitGroupId = sourceTxn.split_group_id || sourceTxn.id;
    if (!splitGroupAmount) {
      splitGroupAmount = totalSplitAmount;
    }

    if (!splitGroupId) {
      let firstSplitExpense = splitExpenses[0];

      return this.createTxns(sourceTxn, [firstSplitExpense], splitGroupAmount, null, splitExpenses.length).pipe(
        map(firstTxn => {
          splitExpenses.splice(0, 1);
          return firstTxn;
        }),
        switchMap(firstTxn => {
          return this.createTxns(sourceTxn, splitExpenses, splitGroupAmount, firstTxn[0].split_group_id, splitExpenses.length).pipe(
            map(otherTxns => {
              return firstTxn.concat(otherTxns);
            })
          )
        })
      )

    } else {
      return this.createTxns(sourceTxn, splitExpenses, splitGroupAmount, splitGroupId, splitExpenses.length);
    }

  }

  createTxns(sourceTxn, splitExpenses, splitGroupAmount, splitGroupId, totalSplitExpensesCount) {
    const promises = [];

    splitExpenses.forEach((splitExpense, index) => {
      const transaction = { ...sourceTxn }

      if (sourceTxn.orig_currency) {
        const exchangeRate = sourceTxn.amount / sourceTxn.orig_amount;

        transaction.orig_amount = splitExpense.amount;
        transaction.amount = splitExpense.amount * exchangeRate;
      } else {
        transaction.amount = splitExpense.amount;
      }

      transaction.split_group_id = sourceTxn.split_group_id || splitGroupId;
      transaction.split_group_user_amount = sourceTxn.split_group_user_amount || splitGroupAmount;

      transaction.id = null;
      transaction.source = transaction.source || 'WEBAPP';

      transaction.txn_dt = splitExpense.txn_dt || sourceTxn.txn_dt;
      transaction.txn_dt = new Date(transaction.txn_dt);
      transaction.project_id = splitExpense.project_id || sourceTxn.project_id;
      transaction.cost_center_id = splitExpense.cost_center_id || sourceTxn.cost_center_id;
      transaction.org_category_id = splitExpense.org_category_id || sourceTxn.org_category_id;

      if (transaction.purpose) {
        let splitIndex = 1;

        if (splitGroupId) {
          splitIndex = index + 1;
        } else {
          splitIndex = totalSplitExpensesCount;
        }
        transaction.purpose += ' (' + splitIndex  + ')';
      }

      promises.push(this.transactionService.upsert(transaction));
    });

    return forkJoin(promises);
  }
}
