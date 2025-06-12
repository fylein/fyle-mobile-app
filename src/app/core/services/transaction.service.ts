import { Inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DateService } from './date.service';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { from, Observable, forkJoin, of } from 'rxjs';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TimezoneService } from 'src/app/core/services/timezone.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { Expense } from '../models/expense.model';
import { CacheBuster } from 'ts-cacheable';
import { UserEventService } from './user-event.service';
import { UndoMerge } from '../models/undo-merge.model';
import { cloneDeep } from 'lodash';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { PAGINATION_SIZE } from 'src/app/constants';
import { PaymentModesService } from './payment-modes.service';
import { OrgSettingsService } from './org-settings.service';
import { AccountsService } from './accounts.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformPolicyExpense } from '../models/platform/platform-policy-expense.model';
import { ExpensePolicy } from '../models/platform/platform-expense-policy.model';
import { Transaction } from '../models/v1/transaction.model';
import { FileObject } from '../models/file-obj.model';
import { UnflattenedTransaction } from '../models/unflattened-transaction.model';
import { CurrencySummary } from '../models/currency-summary.model';
import { FilterQueryParams } from '../models/filter-query-params.model';
import { SortFiltersParams } from '../models/sort-filters-params.model';
import { PaymentModeSummary } from '../models/payment-mode-summary.model';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';
import { PlatformMissingMandatoryFields } from '../models/platform/platform-missing-mandatory-fields.model';
import { PlatformMissingMandatoryFieldsResponse } from '../models/platform/platform-missing-mandatory-fields-response.model';
import { AccountType } from '../enums/account-type.enum';
import { Expense as PlatformExpense } from '../models/platform/v1/expense.model';
import { CorporateCardTransactionRes } from '../models/platform/v1/corporate-card-transaction-res.model';
import { ExpenseFilters } from '../models/expense-filters.model';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { expensesCacheBuster$ } from '../cache-buster/expense-cache-buster';
import { FilterState } from '../enums/filter-state.enum';
import { PaymentMode } from '../models/payment-mode.model';
import { TrackingService } from './tracking.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private clearTaskCache = true;

  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private storageService: StorageService,
    private apiService: ApiService,
    private dateService: DateService,
    private orgUserSettingsService: OrgUserSettingsService,
    private timezoneService: TimezoneService,
    private utilityService: UtilityService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private userEventService: UserEventService,
    private paymentModesService: PaymentModesService,
    private orgSettingsService: OrgSettingsService,
    private accountsService: AccountsService,
    private expensesService: ExpensesService,
    private trackingService: TrackingService
  ) {
    expensesCacheBuster$.subscribe(() => {
      if (this.clearTaskCache) {
        this.userEventService.clearTaskCache();
      }
    });
  }

  /*
    'isInstant' clears the cache before the method returns a value.
    If we don't pass that property, then the cache is not cleared in our case.
    Ref: https://www.npmjs.com/package/ts-cacheable#:~:text=need%20to%20set-,isInstant%3A%20true,-on%20CacheBuster%20configuration
  */
  @CacheBuster({
    cacheBusterNotifier: expensesCacheBuster$,
    isInstant: true,
  })
  clearCache(clearTaskCache: boolean = true): Observable<null> {
    return of(null).pipe(
      tap(() => {
        this.clearTaskCache = clearTaskCache;
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: expensesCacheBuster$,
  })
  upsert(transaction: Partial<Transaction>): Observable<Partial<Transaction>> {
    /** Only these fields will be of type text & custom fields */
    const fieldsToCheck = ['purpose', 'vendor', 'train_travel_class', 'bus_travel_class'];

    // Frontend should only send amount
    transaction.user_amount = null;
    transaction.admin_amount = null;
    transaction.policy_amount = null;

    // FYLE-6148. Don't send custom_attributes.
    transaction.custom_attributes = null;

    if (transaction.tax) {
      delete transaction.tax;
    }

    return forkJoin({
      orgUserSettings: this.orgUserSettingsService.get(),
      txnAccount: this.getTxnAccount(),
      personalAccount: this.getPersonalAccount(),
    }).pipe(
      switchMap(({ orgUserSettings, txnAccount, personalAccount }) => {
        const offset = orgUserSettings.locale.offset;

        transaction.custom_properties = <TxnCustomProperties[]>(
          this.timezoneService.convertAllDatesToProperLocale(transaction.custom_properties, offset)
        );
        // setting txn_dt time to T10:00:00:000 in local time zone
        if (transaction.txn_dt) {
          transaction.txn_dt.setHours(12);
          transaction.txn_dt.setMinutes(0);
          transaction.txn_dt.setSeconds(0);
          transaction.txn_dt.setMilliseconds(0);

          transaction.txn_dt = this.dateService.getUTCMidAfternoonDate(transaction.txn_dt);
        }

        if (transaction.from_dt) {
          transaction.from_dt.setHours(12);
          transaction.from_dt.setMinutes(0);
          transaction.from_dt.setSeconds(0);
          transaction.from_dt.setMilliseconds(0);
          transaction.from_dt = this.timezoneService.convertToUtc(transaction.from_dt, offset);
        }

        if (transaction.to_dt) {
          transaction.to_dt.setHours(12);
          transaction.to_dt.setMinutes(0);
          transaction.to_dt.setSeconds(0);
          transaction.to_dt.setMilliseconds(0);
          transaction.to_dt = this.timezoneService.convertToUtc(transaction.to_dt, offset);
        }

        if (!transaction.source_account_id && !transaction.advance_wallet_id) {
          transaction.source_account_id = txnAccount.source_account_id;
          transaction.skip_reimbursement = txnAccount.skip_reimbursement;
        }

        if (transaction.advance_wallet_id) {
          // this is required as a failsafe to make sue that the source_account_id is not set as any other account other than Personal account.
          transaction.skip_reimbursement = true;
          transaction.source_account_id = personalAccount?.source_account_id || null;
        }

        const transactionCopy = this.utilityService.discardRedundantCharacters(transaction, fieldsToCheck);

        const expensePayload = this.expensesService.transformTo(transactionCopy);
        return this.expensesService.post(expensePayload).pipe(map((result) => this.transformExpense(result.data).tx));
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: expensesCacheBuster$,
  })
  createTxnWithFiles(
    txn: Partial<Transaction>,
    fileUploads$: Observable<FileObject[]>
  ): Observable<Partial<Transaction>> {
    return fileUploads$.pipe(
      switchMap((fileObjs) => {
        const fileIds = fileObjs.map((fileObj) => fileObj.id);
        const isReceiptUpload = txn.hasOwnProperty('source') && Object.keys(txn).length === 1;
        const isAmountPresent = !!txn.amount;
        if ((isReceiptUpload || !isAmountPresent) && fileIds.length > 0) {
          return this.expensesService.createFromFile(fileIds[0], txn.source).pipe(
            switchMap((result) => {
              /** capture receipt flow: patching the expense in case of amount not present
               * if not receiptUpload and amount is not present, then it is the capture receipt
               * flow where the user has captured a receipt and saved without entering the amount.
               */
              if (!isReceiptUpload && !isAmountPresent) {
                txn.id = result.data[0].id;
                return this.upsert(this.cleanupExpensePayload(txn)).pipe(
                  /**
                   * ignoring error in case of patching the expense during the capture receipt flow
                   * as the expense is already created with the receipt and we don't want the caller
                   * to recall this function due to this patch expense failure
                   */
                  catchError((err: Error) => {
                    this.trackingService.patchExpensesError({ label: err });
                    return of(this.transformExpense(result.data[0]).tx);
                  })
                );
              } else {
                return of(this.transformExpense(result.data[0]).tx);
              }
            })
          );
        } else {
          txn.file_ids = fileIds;
          return this.upsert(txn);
        }
      })
    );
  }

  checkMandatoryFields(platformPolicyExpense: PlatformPolicyExpense): Observable<PlatformMissingMandatoryFields> {
    const payload = {
      data: platformPolicyExpense,
    };

    return this.spenderPlatformV1ApiService
      .post<PlatformMissingMandatoryFieldsResponse>('/expenses/check_mandatory_fields', payload)
      .pipe(map((res) => res.data));
  }

  checkPolicy(platformPolicyExpense: PlatformPolicyExpense): Observable<ExpensePolicy> {
    return this.orgUserSettingsService.get().pipe(
      switchMap((orgUserSettings) => {
        // setting txn_dt time to T10:00:00:000 in local time zone
        if (platformPolicyExpense.spent_at) {
          platformPolicyExpense.spent_at.setHours(12);
          platformPolicyExpense.spent_at.setMinutes(0);
          platformPolicyExpense.spent_at.setSeconds(0);
          platformPolicyExpense.spent_at.setMilliseconds(0);
          platformPolicyExpense.spent_at = this.timezoneService.convertToUtc(
            platformPolicyExpense.spent_at,
            orgUserSettings.locale.offset
          );
        }

        if (platformPolicyExpense.started_at) {
          platformPolicyExpense.started_at.setHours(12);
          platformPolicyExpense.started_at.setMinutes(0);
          platformPolicyExpense.started_at.setSeconds(0);
          platformPolicyExpense.started_at.setMilliseconds(0);
          platformPolicyExpense.started_at = this.timezoneService.convertToUtc(
            platformPolicyExpense.started_at,
            orgUserSettings.locale.offset
          );
        }

        if (platformPolicyExpense.ended_at) {
          platformPolicyExpense.ended_at.setHours(12);
          platformPolicyExpense.ended_at.setMinutes(0);
          platformPolicyExpense.ended_at.setSeconds(0);
          platformPolicyExpense.ended_at.setMilliseconds(0);
          platformPolicyExpense.ended_at = this.timezoneService.convertToUtc(
            platformPolicyExpense.ended_at,
            orgUserSettings.locale.offset
          );
        }
        const payload = {
          data: platformPolicyExpense,
        };
        return this.spenderPlatformV1ApiService.post<ExpensePolicy>('/expenses/check_policies', payload);
      })
    );
  }

  matchCCCExpense(id: string, expenseId: string): Observable<CorporateCardTransactionRes> {
    const payload = {
      id,
      expense_ids: [expenseId],
    };

    return this.spenderPlatformV1ApiService.post('/corporate_card_transactions/match', { data: payload });
  }

  getDefaultVehicleType(): Observable<string> {
    return from(this.storageService.get<string>('vehicle_preference'));
  }

  unmatchCCCExpense(id: string, expenseId: string): Observable<CorporateCardTransactionRes> {
    const payload = {
      id,
      expense_ids: [expenseId],
    };

    return this.spenderPlatformV1ApiService.post('/corporate_card_transactions/unmatch', { data: payload });
  }

  getVendorDetails(expense: Expense): string {
    const fyleCategory = expense.tx_fyle_category && expense.tx_fyle_category.toLowerCase();
    let vendorDisplayName = expense.tx_vendor;

    if (fyleCategory === 'mileage') {
      vendorDisplayName = (expense.tx_distance || 0).toString();
      vendorDisplayName += ' ' + expense.tx_distance_unit;
    } else if (fyleCategory === 'per diem') {
      vendorDisplayName = expense.tx_num_days.toString();
      if (expense.tx_num_days > 1) {
        vendorDisplayName += ' Days';
      } else {
        vendorDisplayName += ' Day';
      }
    }

    return vendorDisplayName;
  }

  getReportableExpenses(expenses: Partial<Expense>[]): Partial<Expense>[] {
    return expenses?.filter(
      (expense) => !this.getIsCriticalPolicyViolated(expense) && !this.getIsDraft(expense) && expense.tx_id
    );
  }

  getIsCriticalPolicyViolated(expense: Partial<Expense>): boolean {
    return typeof expense.tx_policy_amount === 'number' && expense.tx_policy_amount < 0.0001;
  }

  getIsDraft(expense: Partial<Expense>): boolean {
    return expense.tx_state && expense.tx_state === 'DRAFT';
  }

  excludeCCCExpenses(expenses: Partial<Expense>[]): Partial<Expense>[] {
    return expenses.filter((expense) => expense && !expense.tx_corporate_credit_card_expense_group_id);
  }

  getExpenseDeletionMessage(expensesToBeDeleted: Partial<Expense>[]): string {
    return `You are about to permanently delete ${
      expensesToBeDeleted.length === 1 ? '1 selected expense.' : expensesToBeDeleted.length + ' selected expenses.'
    }`;
  }

  getCCCExpenseMessage(expensesToBeDeleted: Partial<Expense>[], cccExpenses: number): string {
    return `There ${cccExpenses > 1 ? 'are' : 'is'} ${cccExpenses} corporate card ${
      cccExpenses > 1 ? 'expenses' : 'expense'
    } from the selection which can\'t be deleted. ${
      expensesToBeDeleted?.length > 0 ? 'However you can delete the other expenses from the selection.' : ''
    }`;
  }

  getDeleteDialogBody(
    expensesToBeDeleted: Partial<Expense>[],
    cccExpenses: number,
    expenseDeletionMessage: string,
    cccExpensesMessage: string
  ): string {
    let dialogBody: string;

    if (expensesToBeDeleted.length > 0 && cccExpenses > 0) {
      dialogBody = `<ul class="text-left">
        <li>${cccExpensesMessage}</li>
        <li>Once deleted, the action can't be reversed.</li>
        </ul>
        <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`;
    } else if (expensesToBeDeleted.length > 0 && cccExpenses === 0) {
      dialogBody = `<ul class="text-left">
      <li>${expenseDeletionMessage}</li>
      <li>Once deleted, the action can't be reversed.</li>
      </ul>
      <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`;
    } else if (expensesToBeDeleted.length === 0 && cccExpenses > 0) {
      dialogBody = `<ul class="text-left">
      <li>${cccExpensesMessage}</li>
      </ul>`;
    }

    return dialogBody;
  }

  getRemoveCardExpenseDialogBody(isSplitExpensesPresent: boolean): string {
    const dialogBody = isSplitExpensesPresent
      ? `<ul class="text-left">
    <li>Since this is a split expense, clicking on <strong>Confirm</strong> will remove the card details from all the related split expenses.</li>
    <li>A new expense will be created from the card expense removed here.</li>
    <li>Are you sure to remove your card expense from this expense?</li>
    </ul>`
      : `<ul class="text-left">
    <li>A new expense will be created from the card expense removed here.</li>
    <li>Are you sure to remove your card expense from this expense?</li>
    </ul>`;

    return dialogBody;
  }

  removeCorporateCardExpense(txnId: string): Observable<UndoMerge> {
    const data: Object = {
      txn_id: txnId,
    };
    return this.apiService.post('/transactions/unlink_card_expense', data);
  }

  isMergeAllowed(expenses: Partial<Expense>[]): boolean {
    if (expenses.length === 2) {
      const areSomeMileageOrPerDiemExpenses = expenses.some(
        (expense) => expense.tx_fyle_category === 'Mileage' || expense.tx_fyle_category === 'Per Diem'
      );
      const areAllExpensesSubmitted = expenses.every((expense) =>
        ['APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].includes(expense.tx_state)
      );
      const areAllCCCMatchedExpenses = expenses.every((expense) => expense.tx_corporate_credit_card_expense_group_id);
      return !areSomeMileageOrPerDiemExpenses && !areAllExpensesSubmitted && !areAllCCCMatchedExpenses;
    } else {
      return false;
    }
  }

  generateStateFilters(newQueryParams: FilterQueryParams, filters: Partial<ExpenseFilters>): FilterQueryParams {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    const stateOrFilter = this.generateStateOrFilter(filters, newQueryParamsCopy);

    if (stateOrFilter.length > 0) {
      let combinedStateOrFilter = stateOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
      combinedStateOrFilter = `(${combinedStateOrFilter})`;
      (newQueryParamsCopy.or as string[]).push(combinedStateOrFilter);
    }

    return newQueryParamsCopy;
  }

  generateCardNumberParams(newQueryParams: FilterQueryParams, filters: Partial<ExpenseFilters>): FilterQueryParams {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.cardNumbers?.length > 0) {
      let cardNumberString = '';
      filters.cardNumbers.forEach((cardNumber) => {
        cardNumberString += cardNumber + ',';
      });
      cardNumberString = cardNumberString.slice(0, cardNumberString.length - 1);
      newQueryParamsCopy.corporate_credit_card_account_number = 'in.(' + cardNumberString + ')';
    }

    return newQueryParamsCopy;
  }

  generateReceiptAttachedParams(
    newQueryParams: FilterQueryParams,
    filters: Partial<ExpenseFilters>
  ): FilterQueryParams {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.receiptsAttached) {
      if (filters.receiptsAttached === 'YES') {
        newQueryParamsCopy.tx_num_files = 'gt.0';
      }

      if (filters.receiptsAttached === 'NO') {
        newQueryParamsCopy.tx_num_files = 'eq.0';
      }
    }
    return newQueryParamsCopy;
  }

  generateSplitExpenseParams(newQueryParams: FilterQueryParams, filters: Partial<ExpenseFilters>): FilterQueryParams {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.splitExpense) {
      if (filters.splitExpense === 'YES') {
        (newQueryParamsCopy.or as string[]).push('(tx_is_split_expense.eq.true)');
      }

      if (filters.splitExpense === 'NO') {
        (newQueryParamsCopy.or as string[]).push('(tx_is_split_expense.eq.false)');
      }
    }

    return newQueryParamsCopy;
  }

  generateDateParams(newQueryParams: FilterQueryParams, filters: Partial<ExpenseFilters>): FilterQueryParams {
    let newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.date) {
      filters.customDateStart = filters.customDateStart && new Date(filters.customDateStart);
      filters.customDateEnd = filters.customDateEnd && new Date(filters.customDateEnd);
      if (filters.date === DateFilters.thisMonth) {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParamsCopy.and = `(tx_txn_dt.gte.${thisMonth.from.toISOString()},tx_txn_dt.lt.${thisMonth.to.toISOString()})`;
      }

      if (filters.date === DateFilters.thisWeek) {
        const thisWeek = this.dateService.getThisWeekRange();
        newQueryParamsCopy.and = `(tx_txn_dt.gte.${thisWeek.from.toISOString()},tx_txn_dt.lt.${thisWeek.to.toISOString()})`;
      }

      if (filters.date === DateFilters.lastMonth) {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParamsCopy.and = `(tx_txn_dt.gte.${lastMonth.from.toISOString()},tx_txn_dt.lt.${lastMonth.to.toISOString()})`;
      }

      newQueryParamsCopy = this.generateCustomDateParams(newQueryParamsCopy, filters);
    }

    return newQueryParamsCopy;
  }

  generateTypeFilters(newQueryParams: FilterQueryParams, filters: Partial<ExpenseFilters>): FilterQueryParams {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    const typeOrFilter = this.generateTypeOrFilter(filters);

    if (typeOrFilter.length > 0) {
      let combinedTypeOrFilter = typeOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
      combinedTypeOrFilter = `(${combinedTypeOrFilter})`;
      (newQueryParamsCopy.or as string[]).push(combinedTypeOrFilter);
    }

    return newQueryParamsCopy;
  }

  setSortParams(
    currentParams: Partial<SortFiltersParams>,
    filters: Partial<ExpenseFilters>
  ): Partial<SortFiltersParams> {
    const currentParamsCopy = cloneDeep(currentParams);
    if (filters.sortParam && filters.sortDir) {
      currentParamsCopy.sortParam = filters.sortParam;
      currentParamsCopy.sortDir = filters.sortDir;
    } else {
      currentParamsCopy.sortParam = 'tx_txn_dt';
      currentParamsCopy.sortDir = 'desc';
    }

    return currentParamsCopy;
  }

  getPaymentModeWiseSummary(etxns: Expense[]): PaymentModeSummary {
    const paymentModes = [
      {
        name: 'Reimbursable',
        key: 'reimbursable',
      },
      {
        name: 'Non-Reimbursable',
        key: 'nonReimbursable',
      },
      {
        name: 'Advance',
        key: 'advance',
      },
      {
        name: 'CCC',
        key: 'ccc',
      },
    ];

    return etxns
      .map((etxn) => ({
        ...etxn,
        paymentMode: this.getPaymentModeForEtxn(etxn, paymentModes),
      }))
      .reduce((paymentMap: PaymentModeSummary, etxnData) => {
        if (paymentMap.hasOwnProperty(etxnData.paymentMode.key)) {
          paymentMap[etxnData.paymentMode.key].name = etxnData.paymentMode.name;
          paymentMap[etxnData.paymentMode.key].key = etxnData.paymentMode.key;
          paymentMap[etxnData.paymentMode.key].amount += etxnData.tx_amount;
          paymentMap[etxnData.paymentMode.key].count++;
        } else {
          paymentMap[etxnData.paymentMode.key] = {
            name: etxnData.paymentMode.name,
            key: etxnData.paymentMode.key,
            amount: etxnData.tx_amount,
            count: 1,
          };
        }
        return paymentMap;
      }, {});
  }

  getCurrenyWiseSummary(etxns: Expense[]): CurrencySummary[] {
    const currencyMap: Record<string, CurrencySummary> = {};
    etxns.forEach((etxn) => {
      if (!(etxn.tx_orig_currency && etxn.tx_orig_amount)) {
        this.addEtxnToCurrencyMap(currencyMap, etxn.tx_currency, etxn.tx_amount);
      } else {
        this.addEtxnToCurrencyMap(currencyMap, etxn.tx_orig_currency, etxn.tx_amount, etxn.tx_orig_amount);
      }
    });

    return Object.keys(currencyMap)
      .map((currency) => currencyMap[currency])
      .sort((a, b) => (a.amount < b.amount ? 1 : -1));
  }

  isEtxnInPaymentMode(txnSkipReimbursement: boolean, txnSourceAccountType: string, paymentMode: string): boolean {
    let etxnInPaymentMode = false;
    const isAdvanceOrCCCEtxn = txnSourceAccountType === AccountType.ADVANCE || txnSourceAccountType === AccountType.CCC;

    if (paymentMode === 'reimbursable') {
      //Paid by Employee: reimbursable
      etxnInPaymentMode = !txnSkipReimbursement && !isAdvanceOrCCCEtxn;
    } else if (paymentMode === 'nonReimbursable') {
      //Paid by Company: not reimbursable
      etxnInPaymentMode = txnSkipReimbursement && !isAdvanceOrCCCEtxn;
    } else if (paymentMode === 'advance') {
      //Paid from Advance account: not reimbursable
      etxnInPaymentMode = txnSourceAccountType === AccountType.ADVANCE;
    } else if (paymentMode === 'ccc') {
      //Paid from CCC: not reimbursable
      etxnInPaymentMode = txnSourceAccountType === AccountType.CCC;
    }
    return etxnInPaymentMode;
  }

  getPaymentModeForEtxn(etxn: Expense, paymentModes: PaymentMode[]): PaymentMode {
    const txnSkipReimbursement = etxn.tx_skip_reimbursement;
    const txnSourceAccountType = etxn.source_account_type;
    return paymentModes.find((paymentMode) =>
      this.isEtxnInPaymentMode(txnSkipReimbursement, txnSourceAccountType, paymentMode.key)
    );
  }

  addEtxnToCurrencyMap(
    currencyMap: Record<string, CurrencySummary>,
    txCurrency: string,
    txAmount: number,
    txOrigAmount: number = null
  ): void {
    if (currencyMap.hasOwnProperty(txCurrency)) {
      currencyMap[txCurrency].origAmount += txOrigAmount ? txOrigAmount : txAmount;
      currencyMap[txCurrency].amount += txAmount;
      currencyMap[txCurrency].count++;
    } else {
      currencyMap[txCurrency] = {
        name: txCurrency,
        currency: txCurrency,
        amount: txAmount,
        origAmount: txOrigAmount ? txOrigAmount : txAmount,
        count: 1,
      };
    }
  }

  // Todo : Remove transformExpense method once upsert in migrated to platform
  // eslint-disable-next-line complexity
  transformExpense(expense: PlatformExpense): Partial<UnflattenedTransaction> {
    const updatedExpense = {
      tx: {
        id: expense.id,
        created_at: expense.created_at,
        txn_dt: expense.spent_at,
        categoryDisplayName: expense.category?.display_name,
        num_files: expense.files?.length,
        org_category: expense.category?.name,
        fyle_category: expense.category?.system_category,
        state: expense.state,
        admin_amount: expense.admin_amount,
        policy_amount: expense.policy_amount,
        skip_reimbursement: !expense.is_reimbursable,
        amount: expense.amount,
        currency: expense.currency,
        user_amount: expense.claim_amount,
        orig_amount: expense.foreign_amount,
        orig_currency: expense.foreign_currency,
        from_dt: expense.started_at,
        to_dt: expense.ended_at,
        tax: expense.tax_amount,
        vendor: expense.merchant,
        distance: expense.distance,
        distance_unit: expense.distance_unit,
        locations: expense.locations,
        verification_state: expense.is_verified ? 'VERIFIED' : null,
        org_user_id: expense.employee_id,
        expense_number: expense.seq_num,
        taxi_travel_class: expense.travel_classes && expense.travel_classes[0],
        bus_travel_class: expense.travel_classes && expense.travel_classes[0],
        train_travel_class: expense.travel_classes && expense.travel_classes[0],
        flight_journey_travel_class: expense.travel_classes && expense.travel_classes[0],
        flight_return_travel_class: expense.travel_classes && expense.travel_classes[1],
        hotel_is_breakfast_provided: expense.hotel_is_breakfast_provided,
        tax_group_id: expense.tax_group_id,
        creator_id: expense.creator_user_id,
        request_id: expense.is_receipt_mandatory,
        report_id: expense.report_id,
        org_category_id: expense.category_id,
        cost_center_id: expense.cost_center_id,
        cost_center_name: expense.cost_center?.name,
        cost_center_code: expense.cost_center?.code,
        project_id: expense.project_id,
        project_name: expense.project?.name,
        custom_properties: expense.custom_fields.map((item) => item as TxnCustomProperties),
        purpose: expense.purpose,
        billable: expense.is_billable,
        sub_category: expense.category?.sub_category,
        tax_amount: expense?.tax_amount,
        corporate_credit_card_expense_group_id:
          expense.matched_corporate_card_transaction_ids?.length > 0
            ? expense.matched_corporate_card_transaction_ids[0]
            : null,
        split_group_id: expense.split_group_id,
        split_group_user_amount: expense.split_group_amount,
        receipt_required: expense.is_receipt_mandatory,
        per_diem_rate_id: expense.per_diem_rate_id,
        num_days: expense.per_diem_num_days,
        mileage_rate_id: expense.mileage_rate_id,
        mileage_rate: expense.mileage_rate?.rate,
        mileage_vehicle_type: expense.mileage_rate?.vehicle_type,
        mileage_is_round_trip: expense.mileage_is_round_trip,
        mileage_calculated_distance: expense.mileage_calculated_distance,
        mileage_calculated_amount: expense.mileage_calculated_amount,
        commute_deduction: expense.commute_deduction,
        commute_deduction_id: expense.commute_details_id,
        policy_flag: expense.is_policy_flagged,
        extracted_data: expense.extracted_data
          ? {
              vendor: expense.extracted_data?.vendor_name,
              currency: expense.extracted_data?.currency,
              amount: expense.extracted_data?.amount,
              date: expense.extracted_data?.date,
              category: expense.extracted_data?.category,
              invoice_dt: expense.extracted_data?.invoice_dt,
            }
          : null,
        matched_corporate_card_transactions: Array.isArray(expense.matched_corporate_card_transactions)
          ? expense.matched_corporate_card_transactions.map((transaction) => ({
              id: transaction.id,
              group_id: transaction.id,
              amount: transaction.amount,
              vendor: transaction.merchant,
              txn_dt: transaction.spent_at.toISOString(),
              currency: transaction.currency,
              description: transaction.description,
              card_or_account_number: transaction.corporate_card_number,
              corporate_credit_card_account_number: transaction.corporate_card_number,
              orig_amount: transaction.foreign_amount,
              orig_currency: transaction.foreign_currency,
              status: transaction.status,
              corporate_card_nickname: transaction?.corporate_card_nickname,
            }))
          : null,
        source_account_id: expense.advance_wallet_id ? null : expense.source_account_id,
        advance_wallet_id: expense.advance_wallet_id || null,
        org_category_code: expense.category?.code,
        project_code: expense.project?.code,
      },
      source: {
        account_id: expense.source_account?.id,
        account_type: expense.source_account?.type,
      },
      ou: {
        id: expense.employee?.id,
        org_id: expense.employee?.org_id,
      },
    };

    return updatedExpense;
  }

  // Todo : Remove transformRawExpenses method once upsert in migrated to platform
  transformRawExpense(expense: PlatformExpense): Partial<Expense> {
    const updatedExpense = {
      tx_id: expense.id,
      tx_txn_dt: expense.spent_at,
      tx_expense_number: expense.seq_num,
      tx_num_files: expense.files?.length,
      tx_org_category: expense.category?.name,
      tx_amount: expense.amount,
      tx_purpose: expense.purpose,
      tx_currency: expense.currency,
      tx_vendor: expense.merchant,
      tx_split_group_id: expense.split_group_id,
      tx_split_group_user_amount: expense.split_group_amount,
      tx_skip_reimbursement: !expense.is_reimbursable,
      tx_file_ids: expense.file_ids,
      tx_creator_id: expense.creator_user_id,
      tx_state: expense.state,
      tx_org_category_id: expense.category_id,
      tx_from_dt: expense.started_at,
      tx_to_dt: expense.ended_at,
      tx_tax_group_id: expense.tax_group_id,
      tx_tax: expense.tax_amount,
      tg_name: expense.tax_group?.name,
      tx_project_name: expense.project?.name,
      tx_project_id: expense.project_id,
      tx_cost_center_name: expense.cost_center?.name || null,
      tx_cost_center_id: expense.cost_center_id,
      tx_corporate_credit_card_expense_group_id:
        expense.matched_corporate_card_transaction_ids?.length > 0
          ? expense.matched_corporate_card_transaction_ids[0]
          : null,
      tx_custom_properties: expense.custom_fields.map((item) => item as TxnCustomProperties),
      tx_locations: expense.locations,
      tx_hotel_is_breakfast_provided: expense.hotel_is_breakfast_provided,
      tx_billable: expense.is_billable,
      tx_fyle_category: expense.category?.system_category,
      tx_orig_currency: expense.foreign_currency,
      tx_orig_amount: expense.foreign_amount,
      tx_taxi_travel_class: expense.travel_classes && expense.travel_classes[0],
      tx_bus_travel_class: expense.travel_classes && expense.travel_classes[0],
      tx_flight_journey_travel_class: expense.travel_classes && expense.travel_classes[0],
      tx_flight_return_travel_class: expense.travel_classes && expense.travel_classes[1],
      tx_train_travel_class: expense.travel_classes && expense.travel_classes[0],
      tx_distance: expense.distance,
      tx_distance_unit: expense.distance_unit,
      tx_per_diem_rate_id: expense.per_diem_rate_id?.toString(),
      tx_num_days: expense.per_diem_num_days,
      tx_mileage_rate_id: expense.mileage_rate_id?.toString(),
      tx_mileage_rate: expense.mileage_rate?.rate,
      tx_mileage_vehicle_type: expense.mileage_rate?.vehicle_type,
      tx_mileage_is_round_trip: expense.mileage_is_round_trip,
      tx_mileage_calculated_distance: expense.mileage_calculated_distance,
      tx_mileage_calculated_amount: expense.mileage_calculated_amount,
      tx_policy_flag: expense.is_policy_flagged,
      tx_extracted_data: expense.extracted_data
        ? {
            vendor: expense.extracted_data?.vendor_name,
            currency: expense.extracted_data?.currency,
            amount: expense.extracted_data?.amount,
            date: expense.extracted_data?.date,
          }
        : null,
      tx_matched_corporate_card_transactions: Array.isArray(expense.matched_corporate_card_transactions)
        ? expense.matched_corporate_card_transactions.map((transaction) => ({
            id: transaction.id,
            group_id: transaction.id,
            amount: transaction.amount,
            vendor: transaction.merchant,
            txn_dt: transaction.spent_at.toISOString(),
            currency: transaction.currency,
            description: transaction.description,
            card_or_account_number: transaction.corporate_card_number,
            orig_amount: transaction.foreign_amount,
            orig_currency: transaction.foreign_currency,
            status: transaction.status,
          }))
        : null,
      tx_org_category_code: expense.category?.code,
      tx_project_code: expense.project?.code,
      tx_advance_wallet_id: expense.advance_wallet_id,
      source_account_id: expense.source_account_id,
      source_account_type: expense.source_account?.type,
    };
    return updatedExpense;
  }

  private getPersonalAccount(): Observable<{ source_account_id: string }> {
    return this.accountsService.getMyAccounts().pipe(
      map((accounts) => {
        const account = accounts?.find((account) => account?.acc?.type === AccountType.PERSONAL);
        return {
          source_account_id: account?.acc?.id,
        };
      })
    );
  }

  private getTxnAccount(): Observable<{ source_account_id: string; skip_reimbursement: boolean }> {
    return forkJoin({
      orgSettings: this.orgSettingsService.get(),
      accounts: this.accountsService.getMyAccounts(),
      orgUserSettings: this.orgUserSettingsService.get(),
    }).pipe(
      switchMap(({ orgSettings, accounts, orgUserSettings }) =>
        this.paymentModesService.getDefaultAccount(orgSettings, accounts, orgUserSettings)
      ),
      map((account) => {
        const accountDetails = {
          source_account_id: account.acc.id,
          skip_reimbursement: !account.acc.isReimbursable || false,
        };
        return accountDetails;
      })
    );
  }

  private generateStateOrFilter(filters: Partial<ExpenseFilters>, newQueryParamsCopy: FilterQueryParams): string[] {
    const stateOrFilter: string[] = [];
    if (filters.state) {
      newQueryParamsCopy.tx_report_id = 'is.null';
      if (filters.state.includes(FilterState.READY_TO_REPORT)) {
        stateOrFilter.push('and(tx_state.in.(COMPLETE),or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001))');
      }

      if (filters.state.includes(FilterState.POLICY_VIOLATED)) {
        stateOrFilter.push('and(tx_policy_flag.eq.true,or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001))');
      }

      if (filters.state.includes(FilterState.CANNOT_REPORT)) {
        stateOrFilter.push('tx_policy_amount.lt.0.0001');
      }

      if (filters.state.includes(FilterState.DRAFT)) {
        stateOrFilter.push('tx_state.in.(DRAFT)');
      }
    }

    return stateOrFilter;
  }

  private generateCustomDateParams(
    newQueryParams: FilterQueryParams,
    filters: Partial<ExpenseFilters>
  ): FilterQueryParams {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.date === DateFilters.custom) {
      const startDate = filters.customDateStart?.toISOString();
      const endDate = filters.customDateEnd?.toISOString();
      if (filters.customDateStart && filters.customDateEnd) {
        newQueryParamsCopy.and = `(tx_txn_dt.gte.${startDate},tx_txn_dt.lt.${endDate})`;
      } else if (filters.customDateStart) {
        newQueryParamsCopy.and = `(tx_txn_dt.gte.${startDate})`;
      } else if (filters.customDateEnd) {
        newQueryParamsCopy.and = `(tx_txn_dt.lt.${endDate})`;
      }
    }

    return newQueryParamsCopy;
  }

  private generateTypeOrFilter(filters: Partial<ExpenseFilters>): string[] {
    const typeOrFilter: string[] = [];
    if (filters.type) {
      if (filters.type.includes('Mileage')) {
        typeOrFilter.push('tx_fyle_category.eq.Mileage');
      }

      if (filters.type.includes('PerDiem')) {
        // The space encoding is done by angular into %20 so no worries here
        typeOrFilter.push('tx_fyle_category.eq.Per Diem');
      }

      if (filters.type.includes('RegularExpenses')) {
        typeOrFilter.push('and(tx_fyle_category.not.eq.Mileage, tx_fyle_category.not.eq.Per Diem)');
      }
    }

    return typeOrFilter;
  }

  // to be used only when updating created expense with form values during capture recept flow
  private cleanupExpensePayload(txn: Partial<Transaction>): Partial<Transaction> {
    const newTxn: Partial<Transaction> = {};
    for (const key in txn) {
      if (txn[key] !== null && txn[key] !== undefined) {
        newTxn[key] = txn[key] as Transaction[keyof Transaction];
      }
    }
    return newTxn;
  }
}
