import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
import { Expense } from '../models/expense.model';
import { FileObject } from '../models/file-obj.model';
import { FormattedPolicyViolation } from '../models/formatted-policy-violation.model';
import { PolicyViolationComment } from '../models/policy-violation-comment.model';
import { PolicyViolation } from '../models/policy-violation.model';
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
import { SplitExpensePolicy } from '../models/platform/v1/split-expense-policy.model';
import { SplitExpenseMissingFields } from '../models/platform/v1/split-expense-missing-fields.model';
import { Splits } from '../models/platform/v1/splits.model';
import { SplitPayload } from '../models/platform/v1/split-payload.model';
import { FilteredSplitPolicyViolations } from '../models/filtered-split-policy-violations.model';
import { FilteredMissingFieldsViolations } from '../models/filtered-missing-fields-violations.model';
import { TransformedSplitExpenseMissingFields } from '../models/transformed-split-expense-missing-fields.model';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';

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
      const newCustomProperties: TxnCustomProperties[] = [];

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
        transaction.amount = parseFloat((splitExpense.amount * exchangeRate).toFixed(3));
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
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory }
  ): Observable<SplitExpensePolicy> {
    const fileIds = this.getFileIdsFromObjects(fileObjs);

    const splitPolicyChecksPayload = this.transformSplitTo(splitEtxns, originalTxn, fileIds, reportAndCategoryParams);
    return this.expensesService.splitExpenseCheckPolicies(splitPolicyChecksPayload);
  }

  transformSplitFlightClasses(transaction: Transaction, platformSplitObject: SplitPayload): void {
    if (transaction.fyle_category?.toLowerCase() === 'airlines') {
      if (transaction.flight_journey_travel_class) {
        platformSplitObject.travel_classes.push(transaction.flight_journey_travel_class);
      }
      if (transaction.flight_return_travel_class) {
        platformSplitObject.travel_classes.push(transaction.flight_return_travel_class);
      }
    }
  }

  tranformSplitBusClasses(transaction: Transaction, platformSplitObject: SplitPayload): void {
    if (transaction.fyle_category?.toLowerCase() === 'bus' && transaction.bus_travel_class) {
      platformSplitObject.travel_classes.push(transaction.bus_travel_class);
    }
  }

  transformSplitTrainClasses(transaction: Transaction, platformSplitObject: SplitPayload): void {
    if (transaction.fyle_category?.toLowerCase() === 'train' && transaction.train_travel_class) {
      platformSplitObject.travel_classes.push(transaction.train_travel_class);
    }
  }

  transformSplitTravelClasses(transaction: Transaction, platformSplitObject: SplitPayload): void {
    this.transformSplitFlightClasses(transaction, platformSplitObject);
    this.tranformSplitBusClasses(transaction, platformSplitObject);
    this.transformSplitTrainClasses(transaction, platformSplitObject);
  }

  transformSplitTo(
    splitTxns: Transaction[],
    transaction: Transaction,
    fileIds: string[],
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory }
  ): SplitPayload {
    const platformSplitObject: SplitPayload = {
      id: transaction.id,
      splits: this.transformSplitArray(splitTxns, reportAndCategoryParams.unspecifiedCategory),
      // Platform will throw error if category_id is null in form, therefore adding unspecified category
      category_id: transaction.org_category_id || reportAndCategoryParams.unspecifiedCategory?.id,
      source: transaction.source,
      spent_at: transaction.txn_dt,
      is_reimbursable: transaction.skip_reimbursement === null ? null : !transaction.skip_reimbursement,
      travel_classes: [],
      locations: transaction.locations,
      foreign_currency: transaction.orig_currency,
      foreign_amount: transaction.orig_amount,
      project_id: transaction.project_id,
      file_ids: fileIds,
      cost_center_id: transaction.cost_center_id,
      source_account_id: transaction.source_account_id,
      tax_amount: transaction.tax_amount,
      started_at: transaction.from_dt,
      ended_at: transaction.to_dt,
      merchant: transaction.vendor,
      purpose: transaction.purpose,
      is_billable: transaction.billable,
      custom_fields: transaction.custom_properties,
      claim_amount: transaction.amount,
      tax_group_id: transaction.tax_group_id,
    };

    this.transformSplitTravelClasses(transaction, platformSplitObject);

    if (reportAndCategoryParams.reportId) {
      platformSplitObject.report_id = reportAndCategoryParams.reportId;
    }

    return platformSplitObject;
  }

  transformSplitArray(splitEtxns: Transaction[], unspecifiedCategory: OrgCategory): Splits[] {
    const splits: Splits[] = [];

    for (const splitEtxn of splitEtxns) {
      const splitObject = {
        spent_at: splitEtxn.txn_dt,
        category_id: splitEtxn.org_category_id || unspecifiedCategory?.id,
        project_id: splitEtxn.project_id,
        cost_center_id: splitEtxn.cost_center_id,
        purpose: splitEtxn.purpose,
        foreign_amount: splitEtxn.orig_amount,
        custom_fields: splitEtxn.custom_properties,
        claim_amount: splitEtxn.amount,
      };

      splits.push(splitObject);
    }

    return splits;
  }

  handleSplitMissingFieldsCheck(
    splitEtxns: Transaction[],
    fileObjs: FileObject[],
    originalTxn: Transaction,
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory }
  ): Observable<Partial<SplitExpenseMissingFields>> {
    const fileIds = this.getFileIdsFromObjects(fileObjs);

    if (!reportAndCategoryParams.reportId && !originalTxn.report_id) {
      // No need to check missing fields if there is no report id
      return of({});
    }

    const splitPolicyChecksPayload = this.transformSplitTo(splitEtxns, originalTxn, fileIds, reportAndCategoryParams);
    return this.expensesService.splitExpenseCheckMissingFields(splitPolicyChecksPayload);
  }

  handlePolicyAndMissingFieldsCheck(
    splitEtxns: Transaction[],
    fileObjs: FileObject[],
    originalTxn: Transaction,
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory }
  ): Observable<{ policyViolations: SplitExpensePolicy; missingFields: Partial<SplitExpenseMissingFields> }> {
    const splitPolicyChecks$ = this.handleSplitPolicyCheck(splitEtxns, fileObjs, originalTxn, reportAndCategoryParams);
    const splitMissingFieldsCheck$ = this.handleSplitMissingFieldsCheck(
      splitEtxns,
      fileObjs,
      originalTxn,
      reportAndCategoryParams
    );

    return forkJoin({ policyViolations: splitPolicyChecks$, missingFields: splitMissingFieldsCheck$ });
  }

  getFileIdsFromObjects(fileObjs: FileObject[]): string[] {
    const fileIds: string[] = [];

    if (fileObjs?.length > 0) {
      for (const fileObj of fileObjs) {
        fileIds.push(fileObj.id);
      }
    }

    return fileIds;
  }

  isMissingFields(mandatoryFields: Partial<TransformedSplitExpenseMissingFields>): boolean {
    return (
      !!mandatoryFields.data.missing_amount ||
      !!mandatoryFields.data.missing_currency ||
      !!mandatoryFields.data.missing_receipt ||
      mandatoryFields.data.missing_expense_field_ids?.length > 0
    );
  }

  checkIfMissingFieldsExist(mandatoryFields: { [id: number]: Partial<TransformedSplitExpenseMissingFields> }): boolean {
    return Object.keys(mandatoryFields).some((key) => {
      const mandatoryFieldsData = mandatoryFields[key] as Partial<TransformedSplitExpenseMissingFields>;
      return (
        mandatoryFields.hasOwnProperty(key) && mandatoryFieldsData.data && this.isMissingFields(mandatoryFieldsData)
      );
    });
  }

  filteredPolicyViolations(violations: { [id: number]: PolicyViolation }): {
    [id: number]: FilteredSplitPolicyViolations;
  } {
    const filteredViolations = {};

    for (const key in violations) {
      if (violations.hasOwnProperty(key)) {
        // check for popup field for all polices
        const rules = this.policyService.getPolicyRules(violations[key]);
        const criticalPolicyRules = this.policyService.getCriticalPolicyRules(violations[key]);
        let isCriticalPolicyViolation = false;
        if (criticalPolicyRules && criticalPolicyRules.length > 0) {
          isCriticalPolicyViolation = true;
        }
        filteredViolations[key] = {
          rules,
          action: violations[key].data,
          type: violations[key].type,
          name: violations[key].name,
          currency: violations[key].currency,
          amount: violations[key].amount,
          isCriticalPolicyViolation,
        };
      }
    }

    return filteredViolations;
  }

  filteredMissingFieldsViolations(mandatoryFields: { [id: number]: Partial<TransformedSplitExpenseMissingFields> }): {
    [id: number]: FilteredMissingFieldsViolations;
  } {
    const filteredMandatoryFields = {};

    for (const key in mandatoryFields) {
      if (mandatoryFields.hasOwnProperty(key)) {
        filteredMandatoryFields[key] = {
          isMissingFields: mandatoryFields[key].data && this.isMissingFields(mandatoryFields[key]),
          type: mandatoryFields[key].type,
          name: mandatoryFields[key].name,
          currency: mandatoryFields[key].currency,
          amount: mandatoryFields[key].amount,
        };
      }
    }

    return filteredMandatoryFields;
  }

  splitExpense(
    splitEtxns: Transaction[],
    fileObjs: FileObject[],
    originalTxn: Transaction,
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory }
  ): Observable<{ data: Transaction[] }> {
    const fileIds = this.getFileIdsFromObjects(fileObjs);

    const splitExpensePayload = this.transformSplitTo(splitEtxns, originalTxn, fileIds, reportAndCategoryParams);
    return this.expensesService.splitExpense(splitExpensePayload);
  }

  postSplitExpenseComments(txnIds: string[], comments: { [id: number]: string }): Observable<TransactionStatus[]> {
    const payloadData = [];

    for (const idx in txnIds) {
      if (txnIds.hasOwnProperty(idx)) {
        const comment =
          comments[idx] !== ''
            ? this.prependPolicyViolationMessage + comments[idx]
            : this.defaultPolicyViolationMessage;
        const apiPayload = {
          objectType: 'transactions',
          txnId: txnIds[idx],
          comment: { comment },
          notify: true,
        };
        payloadData.push(apiPayload);
      }
    }

    return from(payloadData).pipe(
      concatMap((payload: PolicyViolationComment) => this.postComment(payload)),
      toArray()
    );
  }
}
