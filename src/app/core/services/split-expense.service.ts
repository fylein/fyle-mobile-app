import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, map, reduce, switchMap, toArray } from 'rxjs/operators';
import { Expense } from '../models/expense.model';
import { FileObject } from '../models/file_obj.model';
import { FormattedPolicyViolation } from '../models/formatted-policy-violation.model';
import { PolicyViolationComment } from '../models/policy-violation-comment.model';
import { PolicyViolation } from '../models/policy-violation.model';
import { PublicPolicyExpense } from '../models/public-policy-expense.model';
import { TransactionStatus } from '../models/transaction-status.model';
import { OrgCategory } from '../models/v1/org-category.model';
import { CategoriesService } from './categories.service';
import { DataTransformService } from './data-transform.service';
import { FileService } from './file.service';
import { PolicyService } from './policy.service';
import { StatusService } from './status.service';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root',
})
export class SplitExpenseService {
  defaultPolicyViolationMessage = 'No policy violation explanation provided';

  prependPolicyViolationMessage = 'Policy violation explanation: ';

  constructor(
    private transactionService: TransactionService,
    private fileService: FileService,
    private policyService: PolicyService,
    private statusService: StatusService,
    private categoriesService: CategoriesService,
    private dataTransformService: DataTransformService
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

  checkPolicyForTransaction(etxn: PublicPolicyExpense): Observable<{ [transactionID: string]: PolicyViolation }> {
    const policyResponse = {};

    /*
    Expense creation has not moved to platform yet and since policy is moved to platform,
    it expects the expense object in terms of platform world. Until then, the method
    `transformTo` act as a bridge by translating the public expense object to platform
    expense.
    */
    const platformPolicyExpense = this.policyService.transformTo(etxn);
    return this.transactionService.checkPolicy(platformPolicyExpense).pipe(
      map((policyViolationresponse) => {
        policyResponse[etxn.id] = policyViolationresponse;
        return policyResponse;
      })
    );
  }

  postComment(apiPayload: PolicyViolationComment): Observable<TransactionStatus> {
    return this.statusService.post(apiPayload.objectType, apiPayload.txnId, apiPayload.comment, apiPayload.notify);
  }

  postCommentsFromUsers(
    transactionIDs: string[],
    comments: { [transactionID: string]: string }
  ): Observable<TransactionStatus[]> {
    const payloadData = [];
    transactionIDs.forEach((transactionID) => {
      const comment =
        comments[transactionID] && comments[transactionID] !== ''
          ? this.prependPolicyViolationMessage + comments[transactionID]
          : this.defaultPolicyViolationMessage;
      const apiPayload = {
        objectType: 'transactions',
        txnId: transactionID,
        comment: { comment },
        notify: true,
      };
      payloadData.push(apiPayload);
    });

    return from(payloadData).pipe(
      concatMap((payload) => this.postComment(payload)),
      toArray()
    );
  }

  formatPolicyViolations(violations: { [id: string]: PolicyViolation }): {
    [transactionID: string]: FormattedPolicyViolation;
  } {
    const formattedViolations = {};

    for (const key of Object.keys(violations)) {
      if (violations.hasOwnProperty(key)) {
        // check for popup field for all polices
        const rules = this.policyService.getPolicyRules(violations[key]);
        const criticalPolicyRules = this.policyService.getCriticalPolicyRules(violations[key]);
        const isCriticalPolicyViolation = criticalPolicyRules?.length > 0;

        formattedViolations[key] = {
          rules,
          action: violations[key].data,
          type: violations[key].type,
          name: violations[key].name,
          currency: violations[key].currency,
          amount: violations[key].amount,
          isCriticalPolicyViolation,
          isExpanded: false,
        };
      }
    }
    return formattedViolations;
  }

  formatDisplayName(model: number, categoryList: OrgCategory[]): string {
    const category = this.categoriesService.filterByOrgCategoryId(model, categoryList);
    return category?.displayName;
  }

  mapViolationDataWithEtxn(
    policyViolation: { [transactionID: string]: PolicyViolation },
    etxns: Expense[],
    categoryList: OrgCategory[]
  ): { [transactionID: string]: PolicyViolation } {
    etxns.forEach((etxn) => {
      for (const key of Object.keys(policyViolation)) {
        if (policyViolation.hasOwnProperty(key) && key === etxn?.tx_id) {
          policyViolation[key].amount = etxn.tx_orig_amount || etxn.tx_amount;
          policyViolation[key].currency = etxn.tx_orig_currency || etxn.tx_currency;
          policyViolation[key].name = this.formatDisplayName(etxn.tx_org_category_id, categoryList);
          policyViolation[key].type = 'category';
          break;
        }
      }
    });
    return policyViolation;
  }

  executePolicyCheck(
    etxns: Expense[],
    fileObjs: FileObject[],
    categoryList: OrgCategory[]
  ): Observable<{ [id: string]: PolicyViolation }> {
    return this.runPolicyCheck(etxns, fileObjs).pipe(
      map((policyViolation) => this.mapViolationDataWithEtxn(policyViolation, etxns, categoryList))
    );
  }

  checkForPolicyViolations(
    txnIds: string[],
    fileObjs: FileObject[],
    categoryList: OrgCategory[]
  ): Observable<{ [id: string]: PolicyViolation }> {
    return from(txnIds).pipe(
      concatMap((txnId) => this.transactionService.getEtxn(txnId)),
      toArray(),
      switchMap((etxns) => this.executePolicyCheck(etxns, fileObjs, categoryList))
    );
  }

  checkPolicyForTransactions(etxns: PublicPolicyExpense[]): Observable<{ [transactionID: string]: PolicyViolation }> {
    return from(etxns).pipe(
      concatMap((etxn) => this.checkPolicyForTransaction(etxn)),
      reduce((accumulator, violation) => {
        accumulator = { ...accumulator, ...violation };
        return accumulator;
      }, {})
    );
  }

  runPolicyCheck(etxns: Expense[], fileObjs: FileObject[]): Observable<{ [transactionID: string]: PolicyViolation }> {
    if (etxns?.length > 0) {
      const platformExpensesList = [];
      etxns.forEach((etxn) => {
        // transformTo method requires unflattend transaction object
        const platformExpense = this.dataTransformService.unflatten(etxn).tx;
        platformExpense.num_files = fileObjs ? fileObjs.length : 0;

        // Since expense has already been created in split expense flow, taking user_amount here.
        platformExpense.amount =
          typeof platformExpense.user_amount === 'number' ? platformExpense.user_amount : platformExpense.amount;
        platformExpensesList.push(platformExpense);
      });
      return this.checkPolicyForTransactions(platformExpensesList);
    } else {
      return of({});
    }
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
