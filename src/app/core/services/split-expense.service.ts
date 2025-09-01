import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { FileObject } from '../models/file-obj.model';
import { PolicyViolation } from '../models/policy-violation.model';
import { OrgCategory } from '../models/v1/org-category.model';
import { Transaction } from '../models/v1/transaction.model';
import { CategoriesService } from './categories.service';
import { PolicyService } from './policy.service';
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
import { ExpenseCommentService } from './platform/v1/spender/expense-comment.service';
import { ExpenseComment } from '../models/expense-comment.model';
import { UntypedFormArray, AbstractControl } from '@angular/forms';
import { fallbackCurrencies } from '../mock-data/fallback-currency-data';
import { map } from 'rxjs/operators';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class SplitExpenseService {
  private policyService = inject(PolicyService);

  private categoriesService = inject(CategoriesService);

  private utilityService = inject(UtilityService);

  private expensesService = inject(ExpensesService);

  private expenseCommentService = inject(ExpenseCommentService);

  private translocoService = inject(TranslocoService);

  formatDisplayName(model: number, categoryList: OrgCategory[]): string {
    const category = this.categoriesService.filterByOrgCategoryId(model, categoryList);
    return category?.displayName;
  }

  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  createSplitTxns(
    sourceTxn: Transaction,
    totalSplitAmount: number,
    splitExpenses: Transaction[],
    expenseFields: ExpenseField[],
    homeCurrency: string,
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
      expenseFields,
      homeCurrency,
    );
  }

  isCustomFieldAllowedToSelectedCategory(
    splitExpense: Transaction,
    sourceTxn: Transaction,
    customPropertyId: number,
    expenseFields: ExpenseField[],
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
    expenseFields: ExpenseField[],
    homeCurrency: string,
  ): Observable<Transaction[]> {
    const txnsObservables = [];

    splitExpenses.forEach((splitExpense: Transaction, index) => {
      const transaction: Transaction = { ...sourceTxn };

      if (sourceTxn.orig_currency) {
        const exchangeRate = sourceTxn.amount / sourceTxn.orig_amount;

        transaction.orig_amount = splitExpense.amount;
        const precision = this.getCurrencyPrecision(homeCurrency);
        transaction.amount = this.roundToPrecision(splitExpense.amount * exchangeRate, precision);
      } else {
        transaction.amount = splitExpense.amount;
      }

      transaction.split_group_id = sourceTxn.split_group_id || splitGroupId;
      transaction.split_group_user_amount = sourceTxn.split_group_user_amount || splitGroupAmount;

      transaction.id = null;
      transaction.source = transaction.source || 'MOBILE_SPLIT';

      transaction.spent_at = splitExpense.spent_at || sourceTxn.spent_at;
      transaction.spent_at = new Date(transaction.spent_at);
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

    return forkJoin(txnsObservables).pipe(
      map((transactions) => this.normalizeForeignCurrencySplitAmounts(sourceTxn, transactions, homeCurrency)),
    );
  }

  setupSplitExpensePurpose(
    transaction: Transaction,
    splitGroupId: string,
    index: number,
    totalSplitExpensesCount: number,
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
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory },
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
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory },
  ): SplitPayload {
    const platformSplitObject: SplitPayload = {
      id: transaction.id,
      splits: this.transformSplitArray(splitTxns, reportAndCategoryParams.unspecifiedCategory),
      // Platform will throw error if category_id is null in form, therefore adding unspecified category
      category_id: transaction.org_category_id || reportAndCategoryParams.unspecifiedCategory?.id,
      source: transaction.source,
      spent_at: transaction.spent_at,
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
        spent_at: splitEtxn.spent_at,
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
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory },
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
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory },
  ): Observable<{ policyViolations: SplitExpensePolicy; missingFields: Partial<SplitExpenseMissingFields> }> {
    const splitPolicyChecks$ = this.handleSplitPolicyCheck(splitEtxns, fileObjs, originalTxn, reportAndCategoryParams);
    const splitMissingFieldsCheck$ = this.handleSplitMissingFieldsCheck(
      splitEtxns,
      fileObjs,
      originalTxn,
      reportAndCategoryParams,
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
          inputFieldInfo: violations[key].inputFieldInfo,
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
          inputFieldInfo: mandatoryFields[key].inputFieldInfo,
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
    reportAndCategoryParams: { reportId: string; unspecifiedCategory: OrgCategory },
  ): Observable<{ data: Transaction[] }> {
    const fileIds = this.getFileIdsFromObjects(fileObjs);

    const splitExpensePayload = this.transformSplitTo(splitEtxns, originalTxn, fileIds, reportAndCategoryParams);
    return this.expensesService.splitExpense(splitExpensePayload);
  }

  postSplitExpenseComments(txnIds: string[], comments: { [id: number]: string }): Observable<ExpenseComment[]> {
    const commentsPayload = txnIds.map((txnId, index) => ({
      expense_id: txnId,
      comment:
        comments[index] !== ''
          ? this.translocoService.translate('services.splitExpense.policyViolationExplanationPrefix') + comments[index]
          : this.translocoService.translate('services.splitExpense.noPolicyViolationExplanation'),
      notify: true,
    }));

    return this.expenseCommentService.post(commentsPayload);
  }

  normalizeSplitAmounts(splitExpensesFormArray: UntypedFormArray, targetAmount: number, currency: string): void {
    if (splitExpensesFormArray.length === 0) {
      return;
    }

    const precision = this.getCurrencyPrecision(currency);
    const threshold = this.getThresholdTolerance(precision);
    const roundedTargetAmount = this.roundToPrecision(targetAmount, precision);
    let totalRoundedAmount = 0;

    splitExpensesFormArray.controls.forEach((control) => {
      const currentAmount = (control.get('amount')?.value as number) || 0;
      const roundedAmount = this.roundToPrecision(currentAmount, precision);

      this.setSplitValues(control, roundedAmount, roundedTargetAmount);
      totalRoundedAmount += roundedAmount;
    });

    const difference = this.roundToPrecision(roundedTargetAmount - totalRoundedAmount, precision + 1);

    if (Math.abs(difference) >= threshold) {
      const lastIndex = splitExpensesFormArray.length - 1;
      const lastControl = splitExpensesFormArray.at(lastIndex);
      const lastAmount = (lastControl.get('amount')?.value as number) || 0;
      const adjustedAmount = this.roundToPrecision(lastAmount + difference, precision);

      this.setSplitValues(lastControl, adjustedAmount, roundedTargetAmount);
    }
  }

  private getThresholdTolerance(precision: number): number {
    const toleranceMap = new Map<number, number>([
      [0, 1.0],
      [2, 0.001],
      [3, 0.001],
      [4, 0.0001],
    ]);

    return toleranceMap.get(precision) ?? 0.001;
  }

  private getCurrencyPrecision(currencyCode: string): number {
    if (!currencyCode) {
      return 2;
    }

    try {
      const { maximumFractionDigits } = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).resolvedOptions();
      return maximumFractionDigits;
    } catch (_) {
      const currencyConfig = fallbackCurrencies.find((config) => config.code === currencyCode.toUpperCase());
      return currencyConfig ? currencyConfig.decimalPlaces : 2;
    }
  }

  private roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  private setSplitValues(control: AbstractControl, amount: number, total: number): void {
    const percentage = total !== 0 ? this.roundToPrecision((Math.abs(amount) / Math.abs(total)) * 100, 3) : 0;
    control.patchValue({ amount, percentage }, { emitEvent: false });
  }

  private normalizeForeignCurrencySplitAmounts(
    sourceTxn: Transaction,
    transactionsPayload: Transaction[],
    homeCurrency: string,
  ): Transaction[] {
    if (!sourceTxn.orig_currency || transactionsPayload.length === 0) {
      return transactionsPayload;
    }

    const exchangeRate = sourceTxn.amount / sourceTxn.orig_amount;
    const homeCurrencyPrecision = this.getCurrencyPrecision(homeCurrency);
    const threshold = this.getThresholdTolerance(homeCurrencyPrecision);

    const totalExpectedAmount = this.roundToPrecision(sourceTxn.orig_amount * exchangeRate, homeCurrencyPrecision);
    const totalSplitAmount = transactionsPayload.reduce((sum, txn) => sum + txn.amount, 0);

    const difference = this.roundToPrecision(totalExpectedAmount - totalSplitAmount, homeCurrencyPrecision + 1);

    if (Math.abs(difference) >= threshold) {
      const lastTransaction = transactionsPayload[transactionsPayload.length - 1];
      lastTransaction.amount = this.roundToPrecision(lastTransaction.amount + difference, homeCurrencyPrecision);
    }

    return transactionsPayload;
  }
}
