import { Injectable } from '@angular/core';
import { from, Observable, of, Subject } from 'rxjs';
import { concatMap, filter, map, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ISODateString } from '@capacitor/core';
import { Expense } from '../models/expense.model';
import { ExpensesInfo } from './expenses-info.model';
import { FileService } from './file.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { OfflineService } from './offline.service';
import * as moment from 'moment';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';

type option = Partial<{ label: string; value: any }>;

@Injectable({
  providedIn: 'root',
})
export class MergeExpensesService {
  constructor(
    private apiService: ApiService,
    private fileService: FileService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private offlineService: OfflineService,
    private humanizeCurrency: HumanizeCurrencyPipe
  ) {}

  mergeExpenses(sourceTxnIds: string[], targetTxnId: string, targetTxnFields): Observable<string> {
    console.log(targetTxnFields);
    return this.apiService.post('/transactions/merge', {
      source_txn_ids: sourceTxnIds,
      target_txn_id: targetTxnId,
      target_txn_fields: targetTxnFields,
    });
  }

  isAllAdvanceExpenses(expenses: Expense[]) {
    return expenses.every((expense) => expense?.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT');
  }

  checkIfAdvanceExpensePresent(expenses: Expense[]) {
    return expenses.filter((expense) => expense?.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT');
  }

  setDefaultExpenseToKeep(expenses: Expense[]) {
    const advanceExpenses = this.checkIfAdvanceExpensePresent(expenses);
    const reportedAndAboveExpenses = expenses.filter((expense) =>
      ['APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].includes(expense.tx_state)
    );
    const expensesInfo: ExpensesInfo = {
      isReportedAndAbove: reportedAndAboveExpenses?.length > 0,
      isAdvancePresent: advanceExpenses?.length > 0,
      defaultExpenses: [],
    };
    if (reportedAndAboveExpenses?.length > 0) {
      expensesInfo.defaultExpenses = reportedAndAboveExpenses;
    } else if (advanceExpenses?.length > 0) {
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

    if (['pdf'].includes(extension)) {
      fileResponse.type = 'pdf';
      fileResponse.thumbnail = 'img/fy-pdf.svg';
    } else if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
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
    const approvedAndAboveExpenses = expenses.filter((expense) =>
      ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].includes(expense.tx_state)
    );
    return approvedAndAboveExpenses;
  }

  isAdvancePresent(expensesInfo: ExpensesInfo) {
    return expensesInfo.defaultExpenses && expensesInfo.defaultExpenses.length === 1 && expensesInfo.isAdvancePresent;
  }

  isReportedPresent(expenses: Expense[]) {
    return expenses.filter((expense) => expense.tx_state === 'APPROVER_PENDING');
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

  getAttachements(txnID: string) {
    return this.fileService.findByTransactionId(txnID).pipe(
      switchMap((fileObjs) => from(fileObjs)),
      concatMap((fileObj: any) =>
        this.fileService.downloadUrl(fileObj.id).pipe(
          map((downloadUrl) => {
            fileObj.url = downloadUrl;
            const details = this.getReceiptDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        )
      ),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  getCardCardTransactions(expenses: Expense[]) {
    return this.offlineService.getCustomInputs().pipe(
      switchMap(() => {
        const CCCGroupIds = expenses.map((expense) => expense?.tx_corporate_credit_card_expense_group_id);

        if (CCCGroupIds?.length > 0) {
          const queryParams = {
            group_id: ['in.(' + CCCGroupIds + ')'],
          };
          const params: any = {};
          params.queryParams = queryParams;
          params.offset = 0;
          params.limit = 1;
          return this.corporateCreditCardExpenseService.getv2CardTransactions(params).pipe(map((res) => res.data));
        } else {
          return of([]);
        }
      })
    );
  }

  generateExpenseToKeepOptions(expenses: Expense[]) {
    return from(expenses).pipe(
      map((expense) => {
        let vendorOrCategory = '';
        if (expense.tx_org_category) {
          vendorOrCategory = expense.tx_org_category;
        }
        if (expense.tx_vendor) {
          vendorOrCategory = expense.tx_vendor;
        }
        let projectName = '';
        if (expense.tx_project_name) {
          projectName = `- ${expense.tx_project_name}`;
        }

        let date = '';
        if (expense.tx_txn_dt) {
          date = moment(expense.tx_txn_dt).format('MMM DD');
        }
        let amount = this.humanizeCurrency.transform(expense.tx_amount, expense.tx_currency, 2);
        if (!date) {
          amount = '';
        }
        return {
          label: `${date} ${amount} ${vendorOrCategory} ${projectName}`,
          value: expense.tx_id,
        };
      }),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      shareReplay(1)
    );
  }

  generateReceiptOptions(expenses: Expense[]) {
    return from(expenses).pipe(
      filter((expense) => expense.tx_file_ids !== null),
      map((expense, index) => ({
        label: `Receipt From Expense ${index + 1} `,
        value: expense.tx_id,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, [])
    );
  }

  formatDateOptions(options: option[]) {
    return options.map((option) => {
      option.label = moment(option.label).format('MMM DD, YYYY');
      return option;
    });
  }

  formatBillableOptions(options: option[]) {
    return options.map((option) => {
      if (option.value === true) {
        option.label = 'Yes';
      } else {
        option.label = 'No';
      }
      return option;
    });
  }

  formatPaymentModeOptions(options: option[]) {
    return options.map((option) => {
      if (option.value === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT') {
        option.label = 'Paid via Corporate Card';
      } else if (option.value === 'PERSONAL_ACCOUNT') {
        option.label = 'Paid by Me';
      } else if (option.value === 'PERSONAL_ADVANCE_ACCOUNT') {
        option.label = 'Paid from Advance';
      }
      return option;
    });
  }

  generateLocationOptions(expenses: Expense[], locationIndex: number) {
    return expenses
      .filter((expense) => expense.tx_locations[locationIndex])
      .map((expense) => ({
        label: expense.tx_locations[locationIndex]?.formatted_address,
        value: expense.tx_locations[locationIndex],
      }));
  }
}
