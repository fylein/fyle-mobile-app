import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ISODateString } from '@capacitor/core';
import { Expense } from '../models/expense.model';
import { ExpensesInfo } from './expenses-info.model';

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

  isAllAdvanceExpenses(expenses: Expense[]) {
    return expenses.every(
      (expense) => expense.source_account_type && expense.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT'
    );
  }

  checkIfAdvanceExpensePresent(expenses: Expense[]) {
    return expenses.filter(
      (expense) => expense.source_account_type && expense.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT'
    );
  }

  setDefaultExpenseToKeep(expenses: Expense[]) {
    const advanceExpenses = this.checkIfAdvanceExpensePresent(expenses);
    const reportedAndAboveExpenses = expenses.filter(
      (expense) =>
        ['APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(expense.tx_state) > -1
    );
    const expensesInfo: ExpensesInfo = {
      isReportedAndAbove: reportedAndAboveExpenses && reportedAndAboveExpenses.length > 0,
      isAdvancePresent: advanceExpenses && advanceExpenses.length > 0,
      defaultExpenses: [],
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
    const extension = this.getReceiptExtension(file.name);
    const fileResponse = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (extension && ['pdf'].indexOf(extension) > -1) {
      fileResponse.type = 'pdf';
      fileResponse.thumbnail = 'img/fy-pdf.svg';
    } else if (extension && ['png', 'jpg', 'jpeg', 'gif'].indexOf(extension) > -1) {
      fileResponse.type = 'image';
      fileResponse.thumbnail = file.url;
    }

    return fileResponse;
  }

  getReceiptExtension(name: string) {
    let extension = null;

    if (name) {
      const filename = name.toLowerCase();
      const index = filename.lastIndexOf('.');

      if (index > -1) {
        extension = filename.substring(index + 1, filename.length);
      }
    }

    return extension;
  }

  isApprovedAndAbove(expenses: Expense[]) {
    const approvedAndAboveExpenses = expenses.filter(function (expense) {
      return ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(expense.tx_state) > -1;
    });
    return approvedAndAboveExpenses;
  }

  isAdvancePresent(expensesInfo: ExpensesInfo) {
    return expensesInfo.defaultExpenses && expensesInfo.defaultExpenses.length === 1 && expensesInfo.isAdvancePresent;
  }

  isReportedPresent(expenses: Expense[]) {
    const reportedExpense = expenses.filter((expense) => expense.tx_state === 'APPROVER_PENDING');
    return reportedExpense;
  }

  isMoreThanOneAdvancePresent(expensesInfo: ExpensesInfo, isAllAdvanceExpenses: boolean) {
    return (
      expensesInfo.defaultExpenses &&
      expensesInfo.defaultExpenses.length > 1 &&
      isAllAdvanceExpenses &&
      expensesInfo.isAdvancePresent
    );
  }

  isReportedOrAbove(expensesInfo: ExpensesInfo) {
    return expensesInfo.defaultExpenses && expensesInfo.defaultExpenses.length === 1 && expensesInfo.isReportedAndAbove;
  }
}
