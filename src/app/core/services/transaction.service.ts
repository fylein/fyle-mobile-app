import { Inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DateService } from './date.service';
import { map, switchMap, tap, concatMap, reduce } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';
import { from, Observable, range, forkJoin, Subject, of } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { DataTransformService } from './data-transform.service';
import { AuthService } from './auth.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TimezoneService } from 'src/app/core/services/timezone.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FileService } from 'src/app/core/services/file.service';
import { Expense } from '../models/expense.model';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { UserEventService } from './user-event.service';
import { UndoMerge } from '../models/undo-merge.model';
import { AccountType } from '../enums/account-type.enum';
import { cloneDeep } from 'lodash';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { ExpenseFilters } from 'src/app/fyle/my-expenses/expense-filters.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { PaymentModesService } from './payment-modes.service';
import { OrgSettingsService } from './org-settings.service';
import { AccountsService } from './accounts.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformPolicyExpense } from '../models/platform/platform-policy-expense.model';
import { ExpensePolicy } from '../models/platform/platform-expense-policy.model';
import { EtxnParams } from '../models/etxn-params.model';
import { ApiV2Response } from '../models/v2/api-v2-response.model';
import { Transaction } from '../models/v1/transaction.model';
import { FileObject } from '../models/file-obj.model';
import { UnflattenedTransaction } from '../models/unflattened-transaction.model';
import { CurrencySummary } from '../models/currency-summary.model';
import { FilterQueryParams } from '../models/filter-query-params.model';
import { SortFiltersParams } from '../models/sort-filters-params.model';
import { PaymentModeSummary } from '../models/payment-mode-summary.model';
import { Datum, StatsResponse } from '../models/v2/stats-response.model';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';
import { PlatformMissingMandatoryFields } from '../models/platform/platform-missing-mandatory-fields.model';
import { PlatformMissingMandatoryFieldsResponse } from '../models/platform/platform-missing-mandatory-fields-response.model';
import { FilterState } from '../enums/filter-state.enum';

export const transactionsCacheBuster$ = new Subject<void>();

type PaymentMode = {
  name: string;
  key: string;
};

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private apiV2Service: ApiV2Service,
    private dataTransformService: DataTransformService,
    private dateService: DateService,
    private authService: AuthService,
    private orgUserSettingsService: OrgUserSettingsService,
    private timezoneService: TimezoneService,
    private utilityService: UtilityService,
    private fileService: FileService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private userEventService: UserEventService,
    private paymentModesService: PaymentModesService,
    private orgSettingsService: OrgSettingsService,
    private accountsService: AccountsService,
    private spenderPlatformAPIV1Service: SpenderPlatformV1ApiService
  ) {
    transactionsCacheBuster$.subscribe(() => {
      this.userEventService.clearTaskCache();
    });
  }

  /*
    'isInstant' clears the cache before the method returns a value.
    If we don't pass that property, then the cache is not cleared in our case.
    Ref: https://www.npmjs.com/package/ts-cacheable#:~:text=need%20to%20set-,isInstant%3A%20true,-on%20CacheBuster%20configuration
  */
  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
    isInstant: true,
  })
  clearCache(): Observable<null> {
    return of(null);
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  getEtxn(txnId: string): Observable<Expense> {
    // TODO api v2
    return this.apiService.get<Expense>('/etxns/' + txnId).pipe(
      map((transaction: Expense) => {
        let categoryDisplayName = transaction.tx_org_category;
        if (
          transaction.tx_sub_category &&
          transaction.tx_sub_category.toLowerCase() !== categoryDisplayName.toLowerCase()
        ) {
          categoryDisplayName += ' / ' + transaction.tx_sub_category;
        }
        transaction.tx_categoryDisplayName = categoryDisplayName;

        return this.dateService.fixDates(transaction);
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  manualFlag(txnId: string): Observable<Expense> {
    return this.apiService.post('/transactions/' + txnId + '/manual_flag');
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  manualUnflag(txnId: string): Observable<Expense> {
    return this.apiService.post('/transactions/' + txnId + '/manual_unflag');
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  getAllETxnc(params: EtxnParams): Observable<Expense[]> {
    return this.getETxnCount(params).pipe(
      switchMap((res) => {
        const count = res.count > this.paginationSize ? res.count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getETxnc({ offset: this.paginationSize * page, limit: this.paginationSize, params })),
      reduce((acc, curr) => acc.concat(curr), [] as Expense[])
    );
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  getMyExpenses(
    config: Partial<{ offset: number; limit: number; order: string; queryParams: EtxnParams }> = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ): Observable<ApiV2Response<Expense>> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiV2Service.get('/expenses', {
          params: {
            offset: config.offset,
            limit: config.limit,
            order: `${config.order || 'tx_txn_dt.desc'},tx_created_at.desc,tx_id.desc`,
            tx_org_user_id: 'eq.' + eou.ou.id,
            ...config.queryParams,
          },
        })
      ),
      map(
        (res) =>
          res as {
            count: number;
            data: Expense[];
            limit: number;
            offset: number;
            url: string;
          }
      ),
      map((res) => ({
        ...res,
        data: res.data.map((datum: Expense) => this.dateService.fixDatesV2(datum)),
      }))
    );
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  getAllExpenses(config: Partial<{ order: string; queryParams: EtxnParams }>): Observable<Expense[]> {
    return this.getMyExpensesCount(config.queryParams).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) =>
        this.getMyExpenses({
          offset: this.paginationSize * page,
          limit: this.paginationSize,
          queryParams: config.queryParams,
          order: config.order,
        })
      ),
      map((res) => res.data),
      reduce((acc, curr) => acc.concat(curr), [] as Expense[])
    );
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  // TODO: Remove `any` type once the stats response implementation is fixed
  getTransactionStats(aggregates: string, queryParams: EtxnParams): Observable<Datum[]> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiV2Service.getStats<StatsResponse>('/expenses/stats', {
          params: {
            aggregates,
            tx_org_user_id: 'eq.' + eou.ou.id,
            ...queryParams,
          },
        })
      ),
      map((res) => res.data)
    );
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  delete(txnId: string): Observable<Expense> {
    return this.apiService.delete<Expense>('/transactions/' + txnId);
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  deleteBulk(txnIds: string[]): Observable<Transaction[]> {
    const chunkSize = 10;
    const count = txnIds.length > chunkSize ? txnIds.length / chunkSize : 1;
    return range(0, count).pipe(
      concatMap((page) => {
        const filteredtxnIds = txnIds.slice(chunkSize * page, chunkSize * page + chunkSize);
        return this.apiService.post<Transaction>('/transactions/delete/bulk', {
          txn_ids: filteredtxnIds,
        });
      }),
      reduce((acc, curr) => acc.concat(curr), [] as Transaction[])
    );
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
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
    }).pipe(
      switchMap(({ orgUserSettings, txnAccount }) => {
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
          transaction.txn_dt = this.timezoneService.convertToUtc(transaction.txn_dt, offset);
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

        if (!transaction.source_account_id) {
          transaction.source_account_id = txnAccount.source_account_id;
          transaction.skip_reimbursement = txnAccount.skip_reimbursement;
        }

        const transactionCopy = this.utilityService.discardRedundantCharacters(transaction, fieldsToCheck);

        return this.apiService.post<Transaction>('/transactions', transactionCopy);
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  createTxnWithFiles(
    txn: Partial<Transaction>,
    fileUploads$: Observable<FileObject[]>
  ): Observable<Partial<Transaction>> {
    return fileUploads$.pipe(
      switchMap((fileObjs: FileObject[]) =>
        this.upsert(txn).pipe(
          switchMap((transaction) =>
            from(
              fileObjs.map((fileObj) => {
                fileObj.transaction_id = transaction.id;
                return fileObj;
              })
            ).pipe(
              concatMap((fileObj) => this.fileService.post(fileObj)),
              reduce((acc: FileObject[], curr: FileObject) => acc.concat([curr]), []),
              map(() => transaction)
            )
          )
        )
      )
    );
  }

  getPaginatedETxncCount(): Observable<{ count: number }> {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.apiService.get<{ count: number }>('/etxns/count').pipe(
            tap((res) => {
              this.storageService.set('etxncCount', res);
            })
          );
        } else {
          return from(this.storageService.get<{ count: number }>('etxncCount'));
        }
      })
    );
  }

  getETxnc(params: { offset: number; limit: number; params: EtxnParams }): Observable<Expense[]> {
    return this.apiV2Service
      .get<Expense, {}>('/expenses', {
        ...params,
      })
      .pipe(map((etxns) => etxns.data));
  }

  getMyExpensesCount(queryParams: EtxnParams): Observable<number> {
    return this.getMyExpenses({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((res) => res.count));
  }

  getExpenseV2(id: string): Observable<Expense> {
    return this.apiV2Service
      .get<Expense, {}>('/expenses', {
        params: {
          tx_id: `eq.${id}`,
        },
      })
      .pipe(map((res) => this.fixDates(res.data[0])));
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

  getETxnUnflattened(txnId: string): Observable<UnflattenedTransaction> {
    return this.apiService.get('/etxns/' + txnId).pipe(
      map((data) => {
        const etxn: UnflattenedTransaction = this.dataTransformService.unflatten(data);
        this.dateService.fixDates(etxn.tx);

        // Adding a field categoryDisplayName in transaction object to save funciton calls
        let categoryDisplayName = etxn.tx.org_category;
        if (etxn.tx.sub_category && etxn.tx.sub_category.toLowerCase() !== categoryDisplayName.toLowerCase()) {
          categoryDisplayName += ' / ' + etxn.tx.sub_category;
        }
        etxn.tx.categoryDisplayName = categoryDisplayName;
        return etxn;
      })
    );
  }

  matchCCCExpense(txnId: string, corporateCreditCardExpenseId: string): Observable<null> {
    const data = {
      transaction_id: txnId,
      corporate_credit_card_expense_id: corporateCreditCardExpenseId,
    };

    return this.apiService.post('/transactions/match', data);
  }

  review(txnId: string): Observable<null> {
    return this.apiService.post('/transactions/' + txnId + '/review');
  }

  getDefaultVehicleType(): Observable<string> {
    return from(this.storageService.get<string>('vehicle_preference'));
  }

  uploadBase64File(txnId: string, name: string, base64Content: string): Observable<FileObject> {
    const data = {
      content: base64Content,
      name,
    };
    return this.apiService.post('/transactions/' + txnId + '/upload_b64', data);
  }

  getSplitExpenses(txnSplitGroupId: string): Observable<Expense[]> {
    const data = {
      tx_split_group_id: 'eq.' + txnSplitGroupId,
    };

    return this.getAllETxnc(data);
  }

  unmatchCCCExpense(txnId: string, corporateCreditCardExpenseId: string): Observable<null> {
    const data = {
      transaction_id: txnId,
      corporate_credit_card_expense_id: corporateCreditCardExpenseId,
    };

    return this.apiService.post('/transactions/unmatch', data);
  }

  getReportableExpenses(expenses: Partial<Expense>[]): Partial<Expense>[] {
    return expenses.filter(
      (expense) => !this.getIsCriticalPolicyViolated(expense) && !this.getIsDraft(expense) && expense.tx_id
    );
  }

  getIsCriticalPolicyViolated(expense: Partial<Expense>): boolean {
    return typeof expense.tx_policy_amount === 'number' && expense.tx_policy_amount < 0.0001;
  }

  getIsDraft(expense: Partial<Expense>): boolean {
    return expense.tx_state && expense.tx_state === 'DRAFT';
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

  excludeCCCExpenses(expenses: Partial<Expense>[]): Partial<Expense>[] {
    return expenses.filter((expense) => expense && !expense.tx_corporate_credit_card_expense_group_id);
  }

  getDeletableTxns(expenses: Partial<Expense>[]): Partial<Expense>[] {
    return expenses.filter((expense) => expense && expense.tx_user_can_delete);
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
      newQueryParamsCopy.or.push(combinedStateOrFilter);
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
        newQueryParamsCopy.or.push('(tx_is_split_expense.eq.true)');
      }

      if (filters.splitExpense === 'NO') {
        newQueryParamsCopy.or.push('(tx_is_split_expense.eq.false)');
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
      newQueryParamsCopy.or.push(combinedTypeOrFilter);
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

  private getTxnAccount(): Observable<{ source_account_id: string; skip_reimbursement: boolean }> {
    return forkJoin({
      orgSettings: this.orgSettingsService.get(),
      accounts: this.accountsService.getEMyAccounts(),
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

  private getETxnCount(params: EtxnParams): Observable<{ count: number }> {
    return this.apiV2Service.get('/expenses', { params }).pipe(map((res) => res as { count: number }));
  }

  private fixDates(data: Expense): Expense {
    data.tx_created_at = new Date(data.tx_created_at);
    if (data.tx_txn_dt) {
      data.tx_txn_dt = new Date(data.tx_txn_dt);
    }

    if (data.tx_from_dt) {
      data.tx_from_dt = new Date(data.tx_from_dt);
    }

    if (data.tx_to_dt) {
      data.tx_to_dt = new Date(data.tx_to_dt);
    }

    data.tx_updated_at = new Date(data.tx_updated_at);
    return data;
  }

  private getPaymentModeForEtxn(etxn: Expense, paymentModes: PaymentMode[]): PaymentMode {
    const txnSkipReimbursement = etxn.tx_skip_reimbursement;
    const txnSourceAccountType = etxn.source_account_type;
    return paymentModes.find((paymentMode) =>
      this.isEtxnInPaymentMode(txnSkipReimbursement, txnSourceAccountType, paymentMode.key)
    );
  }

  private addEtxnToCurrencyMap(
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
}
