import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ISODateString } from '@capacitor/core';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class MergeExpensesService {
  constructor(private apiService: ApiService) {}

  mergeExpenses(sourceTxnIds: string[], targetTxnId: string, targetTxnFields): Observable<string> {
    return this.apiService.post('/transactions/merge', {
      source_txn_ids: sourceTxnIds,
      target_txn_id: targetTxnId,
      target_txn_fields: targetTxnFields,
    });
  }

  isAllAdvanceExpenses(expenses) {
    return expenses.every(
      (expense) => expense.source_account_type && expense.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT'
    );
  }

  checkIfAdvanceExpensePresent(expenses) {
    return expenses.filter(
      (expense) => expense.source_account_type && expense.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT'
    );
  }

  setDefaultExpenseToKeep(expenses) {
    const advanceExpenses = this.checkIfAdvanceExpensePresent(expenses);
    const reportedAndAboveExpenses = expenses.filter(
      (expense) =>
        ['APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(expense.tx_state) > -1
    );
    const expensesInfo: any = {
      isReportedAndAbove: reportedAndAboveExpenses && reportedAndAboveExpenses.length > 0,
      isAdvancePresent: advanceExpenses && advanceExpenses.length > 0,
    };
    if (reportedAndAboveExpenses && reportedAndAboveExpenses.length > 0) {
      expensesInfo.defaultExpenses = reportedAndAboveExpenses;
    } else if (advanceExpenses && advanceExpenses.length > 0) {
      expensesInfo.defaultExpenses = advanceExpenses;
    } else {
      expensesInfo.defaultExpenses = null;
    }
    return expensesInfo;
  }

  getReceiptDetails(file) {
    const ext = this.getReceiptExtension(file.name);
    const res = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (ext && ['pdf'].indexOf(ext) > -1) {
      res.type = 'pdf';
      res.thumbnail = 'img/fy-pdf.svg';
    } else if (ext && ['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1) {
      res.type = 'image';
      res.thumbnail = file.url;
    }

    return res;
  }

  getReceiptExtension(name) {
    let res = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  isApprovedAndAbove(expenses) {
    const approvedAndAboveExpenses = expenses.filter(function (expense) {
      return ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(expense.tx_state) > -1;
    });
    return approvedAndAboveExpenses;
  }

  isAdvancePresent(expensesInfo) {
    return expensesInfo.defaultExpenses && expensesInfo.defaultExpenses.length === 1 && expensesInfo.isAdvancePresent;
  }

  isReportedPresent(expenses) {
    const reportedExpense = expenses.filter((expense) => expense.tx_state === 'APPROVER_PENDING');
    return reportedExpense;
  }

  isMoreThanOneAdvancePresent(expensesInfo, isAllAdvanceExpenses) {
    return (
      expensesInfo.defaultExpenses &&
      expensesInfo.defaultExpenses.length > 1 &&
      isAllAdvanceExpenses &&
      expensesInfo.isAdvancePresent
    );
  }

  isReportedOrAbove(expensesInfo) {
    return expensesInfo.defaultExpenses && expensesInfo.defaultExpenses.length === 1 && expensesInfo.isReportedAndAbove;
  }
}
