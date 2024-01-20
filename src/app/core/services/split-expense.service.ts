import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, map, reduce, switchMap, toArray } from 'rxjs/operators';
import { Expense } from '../models/expense.model';
import { FileObject } from '../models/file-obj.model';
import { FileTransaction } from '../models/file-txn.model';
import { FormattedPolicyViolation } from '../models/formatted-policy-violation.model';
import { PolicyViolationComment } from '../models/policy-violation-comment.model';
import { PolicyViolation } from '../models/policy-violation.model';
import { PublicPolicyExpense } from '../models/public-policy-expense.model';
import { TransactionStatus } from '../models/transaction-status.model';
import { OrgCategory } from '../models/v1/org-category.model';
import { Transaction } from '../models/v1/transaction.model';
import { CategoriesService } from './categories.service';
import { DataTransformService } from './data-transform.service';
import { FileService } from './file.service';
import { PolicyService } from './policy.service';
import { StatusService } from './status.service';
import { TransactionService } from './transaction.service';
import { PolicyViolationTxn } from '../models/policy-violation-txn.model';
import { UtilityService } from './utility.service';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { ExpenseField } from '../models/v1/expense-field.model';
import { SplitExpense } from '../models/split-expense.model';
import { SplitExpensePolicy } from '../models/platform/v1/split-expense-policy.model';
import { SplitExpenseMissingFields } from '../models/platform/v1/split-expense-missing-fields.model';

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
    private dataTransformService: DataTransformService,
    private utilityService: UtilityService,
    private expensesService: ExpensesService
  ) {}

  linkTxnWithFiles(data: Partial<FileTransaction>): Observable<FileObject[]> {
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

  getBase64Content(fileObjs: FileObject[]): Observable<FileObject[]> {
    const fileObservables: Observable<{ content: string }>[] = [];
    const newFileObjs: FileObject[] = fileObjs.map((fileObj) => ({
      id: fileObj.id,
      name: fileObj.name,
      content: '',
    }));

    newFileObjs.forEach((fileObj) => {
      fileObservables.push(this.fileService.base64Download(fileObj.id));
    });

    return forkJoin(fileObservables).pipe(
      map((data) => {
        newFileObjs.forEach((fileObj: FileObject, index) => {
          fileObj.content = data[index].content;
        });

        return newFileObjs;
      })
    );
  }

  checkPolicyForTransaction(etxn: PublicPolicyExpense): Observable<PolicyViolationTxn> {
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
      concatMap((payload: PolicyViolationComment) => this.postComment(payload)),
      toArray()
    );
  }

  formatPolicyViolations(violations: PolicyViolationTxn): {
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
    policyViolation: PolicyViolationTxn,
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
  ): Observable<PolicyViolationTxn> {
    return this.runPolicyCheck(etxns, fileObjs).pipe(
      map((policyViolation) => this.mapViolationDataWithEtxn(policyViolation, etxns, categoryList))
    );
  }

  checkForPolicyViolations(
    txnIds: string[],
    fileObjs: FileObject[],
    categoryList: OrgCategory[]
  ): Observable<PolicyViolationTxn> {
    return from(txnIds).pipe(
      concatMap((txnId) => this.transactionService.getEtxn(txnId)),
      toArray(),
      switchMap((etxns) => this.executePolicyCheck(etxns, fileObjs, categoryList))
    );
  }

  checkPolicyForTransactions(etxns: PublicPolicyExpense[]): Observable<PolicyViolationTxn> {
    return from(etxns).pipe(
      concatMap((etxn) => this.checkPolicyForTransaction(etxn)),
      reduce((accumulator, violation) => {
        accumulator = { ...accumulator, ...violation };
        return accumulator;
      }, {})
    );
  }

  runPolicyCheck(etxns: Expense[], fileObjs: FileObject[]): Observable<PolicyViolationTxn> {
    if (etxns?.length > 0) {
      const platformExpensesList: PublicPolicyExpense[] = [];
      etxns.forEach((etxn) => {
        // transformTo method requires unflattend transaction object
        const platformExpense = this.dataTransformService.unflatten<{ tx: PublicPolicyExpense }, Expense>(etxn).tx;
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

  createSplitTxns(
    sourceTxn: Transaction,
    totalSplitAmount: number,
    splitExpenses: Transaction[],
    expenseFields: ExpenseField[]
  ): Observable<Transaction[]> {
    let splitGroupAmount = sourceTxn.split_group_user_amount || sourceTxn.amount;
    let splitGroupId = sourceTxn.split_group_id || sourceTxn.id;

    if (!splitGroupAmount) {
      splitGroupAmount = totalSplitAmount;
    }

    if (!splitGroupId) {
      // Hack: Split group id must be present and it should point to the original expense for identifying split expenses, but for splitting expenses through the creation flow, we don't have an original expense. So, we are generating a new random expense id and using it as split group id.
      splitGroupId = `tx${this.utilityService.generateRandomString(10)}`;
    }

    return this.createTxns(
      sourceTxn,
      splitExpenses,
      splitGroupAmount,
      splitGroupId,
      splitExpenses.length,
      expenseFields
    );
  }

  isCustomFieldAllowedToSelectedCategory(
    splitExpense: Transaction,
    sourceTxn: Transaction,
    customPropertyId: number,
    expenseFields: ExpenseField[]
  ): boolean {
    const categoryId = splitExpense.org_category_id || sourceTxn?.org_category_id;
    if (categoryId && expenseFields?.length > 0) {
      const customField = expenseFields.find((field) => field.id === customPropertyId);
      return customField?.org_category_ids?.includes(categoryId);
    }
    return false;
  }

  updateCustomProperties(transaction: Transaction, sourceTxn: Transaction, expenseFields: ExpenseField[]): void {
    if (transaction.custom_properties?.length > 0) {
      const newCustomProperties = [];

      for (const customProperty of transaction.custom_properties) {
        if (this.isCustomFieldAllowedToSelectedCategory(transaction, sourceTxn, customProperty.id, expenseFields)) {
          newCustomProperties.push(customProperty);
        }
      }

      transaction.custom_properties = newCustomProperties;
    }
  }

  // TODO: Fix later. High impact
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  createTxns(
    sourceTxn: Transaction,
    splitExpenses: Transaction[],
    splitGroupAmount: number,
    splitGroupId: string,
    totalSplitExpensesCount: number,
    expenseFields: ExpenseField[]
  ): Observable<Transaction[]> {
    const txnsObservables = [];

    splitExpenses.forEach((splitExpense: Transaction, index) => {
      const transaction: Transaction = { ...sourceTxn };

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
      transaction.source = transaction.source || 'MOBILE_SPLIT';

      transaction.txn_dt = splitExpense.txn_dt || sourceTxn.txn_dt;
      transaction.txn_dt = new Date(transaction.txn_dt);
      transaction.project_id = splitExpense.project_id || sourceTxn.project_id;
      transaction.cost_center_id = splitExpense.cost_center_id || sourceTxn.cost_center_id;
      transaction.org_category_id = splitExpense.org_category_id || sourceTxn.org_category_id;
      transaction.billable = this.setUpSplitExpenseBillable(sourceTxn, splitExpense);
      transaction.tax_amount = this.setUpSplitExpenseTax(sourceTxn, splitExpense);
      transaction.custom_properties = splitExpense.custom_properties || sourceTxn.custom_properties;

      this.updateCustomProperties(transaction, sourceTxn, expenseFields);

      this.setupSplitExpensePurpose(transaction, splitGroupId, index, totalSplitExpensesCount);

      txnsObservables.push(of(transaction));
    });

    return forkJoin(txnsObservables);
  }

  setupSplitExpensePurpose(
    transaction: Transaction,
    splitGroupId: string,
    index: number,
    totalSplitExpensesCount: number
  ): void {
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

  setUpSplitExpenseBillable(sourceTxn: Transaction, splitExpense: Transaction): boolean {
    return splitExpense.project_id ? splitExpense.billable : sourceTxn.billable;
  }

  setUpSplitExpenseTax(sourceTxn: Transaction, splitExpense: Transaction): number {
    return splitExpense.tax_amount ? splitExpense.tax_amount : sourceTxn.tax_amount;
  }

  handleSplitPolicyCheck(
    splitEtxns: Transaction[],
    fileObjs: FileObject[],
    originalTxn: Transaction,
    reportId: string
  ): Observable<SplitExpensePolicy> {
    const fileIds = this.getFileIdsFromObjects(fileObjs);

    const splitPolicyChecksPayload = this.expensesService.transformSplitTo(splitEtxns, originalTxn, fileIds, reportId);
    return this.expensesService.splitExpenseCheckPolicies(splitPolicyChecksPayload);
  }

  handleSplitMissingFieldsCheck(
    splitEtxns: Transaction[],
    fileObjs: FileObject[],
    originalTxn: Transaction,
    reportId: string
  ): Observable<Partial<SplitExpenseMissingFields>> {
    const fileIds = this.getFileIdsFromObjects(fileObjs);

    if (!reportId && !originalTxn.report_id) {
      // No need to check missing fields if there is no report id
      return of({});
    }

    const splitPolicyChecksPayload = this.expensesService.transformSplitTo(splitEtxns, originalTxn, fileIds, reportId);
    return this.expensesService.splitExpenseCheckMissingFields(splitPolicyChecksPayload);
  }

  handlePolicyAndMissingFieldsCheck(
    splitEtxns: Transaction[],
    fileObjs: FileObject[],
    originalTxn: Transaction,
    reportId: string
  ): Observable<{ policyViolations: SplitExpensePolicy; missingFields: Partial<SplitExpenseMissingFields> }> {
    const splitPolicyChecks$ = this.handleSplitPolicyCheck(splitEtxns, fileObjs, originalTxn, reportId);
    const splitMissingFieldsCheck$ = this.handleSplitMissingFieldsCheck(splitEtxns, fileObjs, originalTxn, reportId);

    return forkJoin({ policyViolations: splitPolicyChecks$, missingFields: splitMissingFieldsCheck$ });
  }

  getFileIdsFromObjects(fileObjs: FileObject[]): string[] {
    const fileIds = [];

    if (fileObjs && fileObjs.length > 0) {
      for (const fileObj of fileObjs) {
        fileIds.push(fileObj.id);
      }
    }

    return fileIds;
  }
}
