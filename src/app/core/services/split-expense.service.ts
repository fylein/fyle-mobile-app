import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, last, map, mergeMap, scan, switchMap, tap, toArray } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { FileService } from './file.service';
import { PolicyService } from './policy.service';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root',
})
export class SplitExpenseService {
  constructor(
    private transactionService: TransactionService,
    private fileService: FileService,
    private policyService: PolicyService
  ) {}

  linkTxnWithFiles(data) {
    const observables = [];
    const files = data.files;
    const txns = data.txns;

    if (files && files.length > 0) {
      files.forEach((file) => {
        txns.forEach((txn) => {
          observables.push(this.transactionService.uploadBase64File(txn.id, file.name, file.content));
        });
      });
    } else {
      observables.push(of(null));
    }

    return forkJoin(observables);
  }

  getBase64Content(fileObjs) {
    const fileObservables = [];
    const newFileObjs: any[] = fileObjs.map((fileObj) => ({
      id: fileObj.id,
      name: fileObj.name,
      content: '',
    }));

    newFileObjs.forEach((fileObj) => {
      fileObservables.push(this.fileService.base64Download(fileObj.id));
    });

    return forkJoin(fileObservables).pipe(
      map((data: any[]) => {
        newFileObjs.forEach((fileObj, index) => {
          fileObj.content = data[index].content;
        });

        return newFileObjs;
      })
    );
  }

  testPolicyForATxn(etxn) {
    const policyResponse = {};
    return this.transactionService.testPolicy(etxn).pipe(
      map((response) => {
        policyResponse[etxn.tx_id] = response;
        return policyResponse;
      })
    );
  }

  formatPolicyViolations(violations) {
    const formattedViolations = {};

    for (const key in violations) {
      if (violations.hasOwnProperty(key)) {
        // check for popup field for all polices
        const rules = this.policyService.getPolicyRules(violations[key]);
        const criticalPolicyRules = this.policyService.getCriticalPolicyRules(violations[key]);
        const isCriticalPolicyViolation = criticalPolicyRules && criticalPolicyRules.length > 0;

        formattedViolations[key] = {
          rules: rules,
          action: violations[key].transaction_desired_state.action_description,
          type: violations[key].type,
          name: violations[key].name,
          currency: violations[key].currency,
          amount: violations[key].amount,
          isCriticalPolicyViolation: isCriticalPolicyViolation,
          isExpanded: false,
        };
      }
    }
    return formattedViolations;
  }

  runApiCallSerially(etxns) {
    return from(etxns).pipe(
      mergeMap((etxn) => this.testPolicyForATxn(etxn)),
      scan((acc, curr) => ({ ...curr, ...acc }), {}),
      last()
    );
  }

  runPolicyCheck(etxns, fileObjs) {
    const txnsPayload = [];
    const that = this;
    etxns.forEach(function (etxn) {
      etxn.tx_num_files = fileObjs ? fileObjs.length : 0;
    });

    return this.runApiCallSerially(etxns);
  }

  createSplitTxns(sourceTxn, totalSplitAmount, splitExpenses) {
    let splitGroupAmount = sourceTxn.split_group_user_amount || sourceTxn.amount;
    const splitGroupId = sourceTxn.split_group_id || sourceTxn.id;
    if (!splitGroupAmount) {
      splitGroupAmount = totalSplitAmount;
    }

    if (!splitGroupId) {
      const firstSplitExpense = splitExpenses[0];

      return this.createTxns(sourceTxn, [firstSplitExpense], splitGroupAmount, null, splitExpenses.length).pipe(
        map((firstTxn) => {
          splitExpenses.splice(0, 1);
          return firstTxn;
        }),
        switchMap((firstTxn: any[]) =>
          this.createTxns(
            sourceTxn,
            splitExpenses,
            splitGroupAmount,
            firstTxn[0].split_group_id,
            splitExpenses.length
          ).pipe(map((otherTxns) => firstTxn.concat(otherTxns)))
        )
      );
    } else {
      return this.createTxns(sourceTxn, splitExpenses, splitGroupAmount, splitGroupId, splitExpenses.length);
    }
  }

  // TODO: Fix later. High impact
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  createTxns(sourceTxn, splitExpenses, splitGroupAmount, splitGroupId, totalSplitExpensesCount) {
    const txnsObservables = [];

    splitExpenses.forEach((splitExpense, index) => {
      const transaction = { ...sourceTxn };

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
      transaction.billable = this.setUpSplitExpenseBillable(sourceTxn, splitExpense);
      transaction.tax_amount = this.setUpSplitExpenseTax(sourceTxn, splitExpense);

      this.setupSplitExpensePurpose(transaction, splitGroupId, index, totalSplitExpensesCount);

      txnsObservables.push(this.transactionService.upsert(transaction));
    });

    return forkJoin(txnsObservables);
  }

  private setupSplitExpensePurpose(transaction: any, splitGroupId: any, index: any, totalSplitExpensesCount: any) {
    if (transaction.purpose) {
      let splitIndex = 1;

      if (splitGroupId) {
        splitIndex = index + 1;
      } else {
        splitIndex = totalSplitExpensesCount;
      }
      transaction.purpose += ' (' + splitIndex + ')';
    }
  }

  private setUpSplitExpenseBillable(sourceTxn, splitExpense) {
    return splitExpense.project_id ? splitExpense.billable : sourceTxn.billable;
  }

  private setUpSplitExpenseTax(sourceTxn, splitExpense) {
    return splitExpense.tax_amount ? splitExpense.tax_amount : sourceTxn.tax_amount;
  }
}
