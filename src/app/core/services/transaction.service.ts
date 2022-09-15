import { Inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DateService } from './date.service';
import { map, switchMap, tap, concatMap, reduce, filter } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';
import { from, Observable, range, concat, forkJoin, Subject, of } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { DataTransformService } from './data-transform.service';
import { AuthService } from './auth.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TimezoneService } from 'src/app/core/services/timezone.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FileService } from 'src/app/core/services/file.service';
import { PolicyApiService } from './policy-api.service';
import { Expense } from '../models/expense.model';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { UserEventService } from './user-event.service';
import { UndoMerge } from '../models/undo-merge.model';
import { cloneDeep } from 'lodash';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { Filters } from 'src/app/fyle/my-expenses/my-expenses-filters.model';
import { OfflineService } from './offline.service';
import { AccountsService } from './accounts.service';

enum FilterState {
  READY_TO_REPORT = 'READY_TO_REPORT',
  POLICY_VIOLATED = 'POLICY_VIOLATED',
  CANNOT_REPORT = 'CANNOT_REPORT',
  DRAFT = 'DRAFT',
}
import { PAGINATION_SIZE } from 'src/app/constants';

const transactionsCacheBuster$ = new Subject<void>();

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
    private policyApiService: PolicyApiService,
    private userEventService: UserEventService,
    private offlineService: OfflineService,
    private accountsService: AccountsService
  ) {
    transactionsCacheBuster$.subscribe(() => {
      this.userEventService.clearTaskCache();
    });
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  clearCache() {
    return of(null);
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  get(txnId) {
    // TODO api v2
    return this.apiService
      .get('/transactions/' + txnId)
      .pipe(map((transaction) => this.dateService.fixDates(transaction)));
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  getEtxn(txnId) {
    // TODO api v2
    return this.apiService.get('/etxns/' + txnId).pipe(
      map((transaction) => {
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
  manualFlag(txnId) {
    return this.apiService.post('/transactions/' + txnId + '/manual_flag');
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  manualUnflag(txnId) {
    return this.apiService.post('/transactions/' + txnId + '/manual_unflag');
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  getAllETxnc(params) {
    return this.getETxnCount(params).pipe(
      switchMap((res) => {
        const count = res.count > this.paginationSize ? res.count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getETxnc({ offset: this.paginationSize * page, limit: this.paginationSize, params })),
      reduce((acc, curr) => acc.concat(curr))
    );
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  getMyExpenses(
    config: Partial<{ offset: number; limit: number; order: string; queryParams: any }> = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ) {
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
            data: any[];
            limit: number;
            offset: number;
            url: string;
          }
      ),
      map((res) => ({
        ...res,
        data: res.data.map((datum) => this.dateService.fixDatesV2(datum)),
      }))
    );
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  getAllExpenses(config: Partial<{ order: string; queryParams: any }>) {
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
      reduce((acc, curr) => acc.concat(curr), [] as any[])
    );
  }

  @Cacheable({
    cacheBusterObserver: transactionsCacheBuster$,
  })
  getTransactionStats(aggregates: string, queryParams = {}) {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiV2Service.get('/expenses/stats', {
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
  delete(txnId: string) {
    return this.apiService.delete('/transactions/' + txnId);
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  deleteBulk(txnIds: string[]) {
    const chunkSize = 10;
    const count = txnIds.length > chunkSize ? txnIds.length / chunkSize : 1;
    return range(0, count).pipe(
      concatMap((page) => {
        const filteredtxnIds = txnIds.slice(chunkSize * page, chunkSize * page + chunkSize);
        return this.apiService.post('/transactions/delete/bulk', {
          txn_ids: filteredtxnIds,
        });
      }),
      reduce((acc, curr) => acc.concat(curr), [] as any[])
    );
  }

  getTxnAccount() {
    return forkJoin({
      orgUserSettings: this.offlineService.getOrgUserSettings(),
      accounts: this.offlineService.getAccounts(),
      orgSettings: this.offlineService.getOrgSettings(),
    }).pipe(
      switchMap(({ orgUserSettings, accounts, orgSettings }) => {
        return this.accountsService.getAccount(orgSettings, accounts, orgUserSettings).pipe(
          filter((account) => !!account),
          map((account) => {
            const accountDetails = {
              source_account_id: account.acc.id,
              skip_reimbursement: !account.acc.isReimbursable || false,
            };
            return accountDetails;
          })
        );
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  upsert(transaction) {
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

        transaction.custom_properties = this.timezoneService.convertAllDatesToProperLocale(
          transaction.custom_properties,
          offset
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

        transaction.source_account_id = transaction.source_account_id
          ? transaction.source_account_id
          : txnAccount.source_account_id;
        transaction.skip_reimbursement = transaction.skip_reimbursement
          ? transaction.skip_reimbursement
          : txnAccount.skip_reimbursement;

        const transactionCopy = this.utilityService.discardRedundantCharacters(transaction, fieldsToCheck);

        return this.apiService.post('/transactions', transactionCopy);
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  createTxnWithFiles(txn, fileUploads$: Observable<any>) {
    return fileUploads$.pipe(
      switchMap((fileObjs: any[]) =>
        this.upsert(txn).pipe(
          switchMap((transaction) =>
            from(
              fileObjs.map((fileObj) => {
                fileObj.transaction_id = transaction.id;
                return fileObj;
              })
            ).pipe(
              concatMap((fileObj) => this.fileService.post(fileObj)),
              reduce((acc, curr) => acc.concat([curr]), []),
              map(() => transaction)
            )
          )
        )
      )
    );
  }

  @CacheBuster({
    cacheBusterNotifier: transactionsCacheBuster$,
  })
  removeTxnsFromRptInBulk(txnIds, comment?) {
    const count = txnIds.length > this.paginationSize ? txnIds.length / this.paginationSize : 1;
    return range(0, count).pipe(
      concatMap((page) => {
        const data: any = {
          ids: txnIds.slice(page * this.paginationSize, (page + 1) * this.paginationSize),
        };

        if (comment) {
          data.comment = comment;
        }

        return this.apiService.post('/transactions/remove_report/bulk', data);
      }),
      reduce((acc, curr) => acc.concat(curr), [] as any[])
    );
  }

  parseRaw(etxnsRaw) {
    const etxns = [];

    etxnsRaw.forEach((element) => {
      const etxn = this.dataTransformService.unflatten(element);

      this.dateService.fixDates(etxn.tx);
      this.dateService.fixDates(etxn.rp);

      let categoryDisplayName = etxn.tx.org_category;
      if (etxn.tx.sub_category && etxn.tx.sub_category.toLowerCase() !== categoryDisplayName.toLowerCase()) {
        categoryDisplayName += ' / ' + etxn.tx.sub_category;
      }
      etxn.tx.categoryDisplayName = categoryDisplayName;
      etxns.push(etxn);
    });

    return etxns;
  }

  getCountBySource(etxns, source) {
    const lowerCaseSource = source.toLowerCase();
    let count = 0;

    etxns.forEach((etxn) => {
      if (etxn.tx_source && etxn.tx_source.toLowerCase().indexOf(lowerCaseSource) > -1) {
        count++;
      }
    });

    return count;
  }

  getUserTransactionParams(state: string) {
    const stateMap = {
      draft: {
        state: ['DRAFT'],
      },
      all: {
        state: ['COMPLETE'],
        policy_amount: ['is:null', 'gt:0.0001'],
      },
      flagged: {
        policy_flag: true,
        policy_amount: ['is:null', 'gt:0.0001'],
      },
      critical: {
        policy_amount: ['lt:0.0001'],
      },
      unreported: {
        state: ['COMPLETE', 'DRAFT'],
      },
      recurrence: {
        source: ['RECURRENCE_WEBAPP'],
      },
      needsReceipt: {
        tx_receipt_required: true,
      },
    };

    return stateMap[state];
  }

  getPaginatedETxncCount(params?) {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.apiService.get('/etxns/count', { params }).pipe(
            tap((res) => {
              this.storageService.set('etxncCount' + JSON.stringify(params), res);
            })
          );
        } else {
          return from(this.storageService.get('etxncCount' + JSON.stringify(params)));
        }
      })
    );
  }

  getETxnc(params: { offset: number; limit: number; params: any }) {
    return this.apiV2Service
      .get('/expenses', {
        ...params,
      })
      .pipe(map((etxns) => etxns.data));
  }

  getETxnCount(params: any) {
    return this.apiV2Service.get('/expenses', { params }).pipe(map((res) => res as { count: number }));
  }

  getMyExpensesCount(queryParams = {}) {
    return this.getMyExpenses({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((res) => res.count));
  }

  getTotalNoCurrency(etxns) {
    let total = 0;
    etxns.forEach((etxn) => {
      total = total + etxn.tx_amount;
    });
    return total;
  }

  getExpenseV2(id: string): Observable<any> {
    return this.apiV2Service
      .get('/expenses', {
        params: {
          tx_id: `eq.${id}`,
        },
      })
      .pipe(map((res) => this.fixDates(res.data[0]) as Expense));
  }

  fixDates(data: Expense) {
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

  testPolicy(etxn) {
    return this.orgUserSettingsService.get().pipe(
      switchMap((orgUserSettings) => {
        if (etxn.tx_tax) {
          delete etxn.tx_tax;
        }
        // setting txn_dt time to T10:00:00:000 in local time zone
        if (etxn.tx_txn_dt) {
          etxn.tx_txn_dt.setHours(12);
          etxn.tx_txn_dt.setMinutes(0);
          etxn.tx_txn_dt.setSeconds(0);
          etxn.tx_txn_dt.setMilliseconds(0);
          etxn.tx_txn_dt = this.timezoneService.convertToUtc(etxn.tx_txn_dt, orgUserSettings.locale.offset);
        }

        if (etxn.tx_from_dt) {
          etxn.tx_from_dt.setHours(12);
          etxn.tx_from_dt.setMinutes(0);
          etxn.tx_from_dt.setSeconds(0);
          etxn.tx_from_dt.setMilliseconds(0);
          etxn.tx_from_dt = this.timezoneService.convertToUtc(etxn.tx_from_dt, orgUserSettings.locale.offset);
        }

        if (etxn.tx_to_dt) {
          etxn.tx_to_dt.setHours(12);
          etxn.tx_to_dt.setMinutes(0);
          etxn.tx_to_dt.setSeconds(0);
          etxn.tx_to_dt.setMilliseconds(0);
          etxn.tx_to_dt = this.timezoneService.convertToUtc(etxn.tx_to_dt, orgUserSettings.locale.offset);
        }

        // FYLE-6148. Don't send custom_attributes.
        etxn.tx_custom_attributes = null;

        return this.policyApiService.post('/policy/test', etxn);
      })
    );
  }

  getETxn(txnId) {
    return this.apiService.get('/etxns/' + txnId).pipe(
      map((data) => {
        const etxn = this.dataTransformService.unflatten(data);
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

  matchCCCExpense(txnId, corporateCreditCardExpenseId) {
    const data = {
      transaction_id: txnId,
      corporate_credit_card_expense_id: corporateCreditCardExpenseId,
    };

    return this.apiService.post('/transactions/match', data);
  }

  review(txnId: string) {
    return this.apiService.post('/transactions/' + txnId + '/review');
  }

  setDefaultVehicleType(vehicleType) {
    return from(this.storageService.set('vehicle_preference', vehicleType));
  }

  getDefaultVehicleType() {
    return from(this.storageService.get('vehicle_preference'));
  }

  uploadBase64File(txnId, name, base64Content) {
    const data = {
      content: base64Content,
      name,
    };
    return this.apiService.post('/transactions/' + txnId + '/upload_b64', data);
  }

  getSplitExpenses(txnSplitGroupId: string) {
    const data = {
      tx_split_group_id: 'eq.' + txnSplitGroupId,
    };

    return this.getAllETxnc(data);
  }

  unmatchCCCExpense(txnId: string, corporateCreditCardExpenseId: string) {
    const data = {
      transaction_id: txnId,
      corporate_credit_card_expense_id: corporateCreditCardExpenseId,
    };

    return this.apiService.post('/transactions/unmatch', data);
  }

  getTransactionByExpenseNumber(expenseNumber: string) {
    return this.apiService.get('/transactions', {
      params: {
        expense_number: expenseNumber,
      },
    });
  }

  getVendorDetails(expense: Expense): string {
    const fyleCategory = expense.tx_fyle_category && expense.tx_fyle_category.toLowerCase();
    let vendorDisplayName = expense.tx_vendor;

    if (fyleCategory === 'mileage') {
      vendorDisplayName = expense.tx_distance || 0;
      vendorDisplayName += ' ' + expense.tx_distance_unit;
    } else if (fyleCategory === 'per diem') {
      vendorDisplayName = expense.tx_num_days;
      if (expense.tx_num_days > 1) {
        vendorDisplayName += ' Days';
      } else {
        vendorDisplayName += ' Day';
      }
    }

    return vendorDisplayName;
  }

  getReportableExpenses(expenses: Expense[]): Expense[] {
    return expenses.filter(
      (expense) => !this.getIsCriticalPolicyViolated(expense) && !this.getIsDraft(expense) && expense.tx_id
    );
  }

  getIsCriticalPolicyViolated(expense: Expense): boolean {
    return typeof expense.tx_policy_amount === 'number' && expense.tx_policy_amount < 0.0001;
  }

  getIsDraft(expense: Expense): boolean {
    return expense.tx_state && expense.tx_state === 'DRAFT';
  }

  getPaymentModeForEtxn(etxn: Expense, paymentModes: PaymentMode[]) {
    return paymentModes.find((paymentMode) => this.isEtxnInPaymentMode(etxn, paymentMode.key));
  }

  isEtxnInPaymentMode(etxn: Expense, paymentMode: string) {
    let etxnInPaymentMode = false;
    const isAdvanceOrCCCEtxn =
      etxn.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT' ||
      etxn.source_account_type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT';

    if (paymentMode === 'reimbursable') {
      //Paid by Employee: reimbursable
      etxnInPaymentMode = !etxn.tx_skip_reimbursement && !isAdvanceOrCCCEtxn;
    } else if (paymentMode === 'nonReimbursable') {
      //Paid by Company: not reimbursable
      etxnInPaymentMode = etxn.tx_skip_reimbursement && !isAdvanceOrCCCEtxn;
    } else if (paymentMode === 'advance') {
      //Paid from Advance account: not reimbursable
      etxnInPaymentMode = etxn.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT';
    } else if (paymentMode === 'ccc') {
      //Paid from CCC: not reimbursable
      etxnInPaymentMode = etxn.source_account_type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT';
    }
    return etxnInPaymentMode;
  }

  getPaymentModeWiseSummary(etxns: Expense[]) {
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
      .reduce((paymentMap, etxnData) => {
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

  addEtxnToCurrencyMap(currencyMap: {}, txCurrency: string, txAmount: number, txOrigAmount: number = null) {
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

  getCurrenyWiseSummary(etxns: Expense[]) {
    const currencyMap = {};
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

  excludeCCCExpenses(expenses: Expense[]) {
    return expenses.filter((expense) => expense && !expense.tx_corporate_credit_card_expense_group_id);
  }

  getDeletableTxns(expenses: Expense[]) {
    return expenses.filter((expense) => expense && expense.tx_user_can_delete);
  }

  getExpenseDeletionMessage(expensesToBeDeleted: Expense[]) {
    return `You are about to permanently delete ${
      expensesToBeDeleted?.length === 1 ? '1 selected expense.' : expensesToBeDeleted?.length + ' selected expenses.'
    }`;
  }

  getCCCExpenseMessage(expensesToBeDeleted: Expense[], cccExpenses: number) {
    return `There ${cccExpenses > 1 ? ' are ' : ' is '} ${cccExpenses} corporate card ${
      cccExpenses > 1 ? 'expenses' : 'expense'
    } from the selection which can\'t be deleted. ${
      expensesToBeDeleted?.length > 0 ? 'However you can delete the other expenses from the selection.' : ''
    }`;
  }

  getDeleteDialogBody(
    expensesToBeDeleted: Expense[],
    cccExpenses: number,
    expenseDeletionMessage: string,
    cccExpensesMessage: string
  ) {
    let dialogBody: string;

    if (expensesToBeDeleted?.length > 0 && cccExpenses > 0) {
      dialogBody = `<ul class="text-left">
        <li>${cccExpensesMessage}</li>
        <li>Once deleted, the action can't be reversed.</li>
        </ul>
        <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`;
    } else if (expensesToBeDeleted?.length > 0 && cccExpenses === 0) {
      dialogBody = `<ul class="text-left">
      <li>${expenseDeletionMessage}</li>
      <li>Once deleted, the action can't be reversed.</li>
      </ul>
      <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`;
    } else if (expensesToBeDeleted?.length === 0 && cccExpenses > 0) {
      dialogBody = `<ul class="text-left">
      <li>${cccExpensesMessage}</li>
      </ul>`;
    }

    return dialogBody;
  }

  getUnlinkDialogBody(isSplitExpensesPresent: boolean): string {
    const dialogBody = isSplitExpensesPresent
      ? `<ul class="text-left">
    <li>If you're sure that your expense is linked with the wrong card details, you can proceed to unlink the card details by clicking on <strong>Confirm.</strong></li>
    <li>It removes the card details from the expense and creates a new card expense under the Expenses section.</li>
    <li>Since this is a split expense, clicking on Confirm will remove the card details from all the related split expenses.</li>
    </ul>`
      : `<ul class="text-left">
    <li>If you're sure that your expense is linked with the wrong card details, you can proceed to unlink the card details by clicking on <strong>Confirm.</strong></li>
    <li>It removes the card details from the expense and creates a new card expense under the Expenses section.</li>
    </ul>`;

    return dialogBody;
  }

  unlinkCorporateCardExpense(txnId: string): Observable<UndoMerge> {
    const data: Object = {
      txn_id: txnId,
    };
    return this.apiService.post('/transactions/unlink_card_expense', data);
  }

  isMergeAllowed(expenses: Expense[]): boolean {
    if (expenses?.length === 2) {
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

  generateStateOrFilter(filters: Filters, newQueryParamsCopy): string[] {
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

  generateStateFilters(newQueryParams, filters: Filters) {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    const stateOrFilter = this.generateStateOrFilter(filters, newQueryParamsCopy);

    if (stateOrFilter.length > 0) {
      let combinedStateOrFilter = stateOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
      combinedStateOrFilter = `(${combinedStateOrFilter})`;
      newQueryParamsCopy.or.push(combinedStateOrFilter);
    }

    return newQueryParamsCopy;
  }

  generateCardNumberParams(newQueryParams, filters: Filters) {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.cardNumbers?.length > 0) {
      let cardNumberString = '';
      filters.cardNumbers?.forEach((cardNumber) => {
        cardNumberString += cardNumber + ',';
      });
      cardNumberString = cardNumberString.slice(0, cardNumberString.length - 1);
      newQueryParamsCopy.corporate_credit_card_account_number = 'in.(' + cardNumberString + ')';
    }

    return newQueryParamsCopy;
  }

  generateReceiptAttachedParams(newQueryParams, filters) {
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

  generateDateParams(newQueryParams, filters) {
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

      newQueryParamsCopy = this.generateCustomDateParams(newQueryParams, filters);
    }

    return newQueryParamsCopy;
  }

  generateCustomDateParams(newQueryParams, filters: Filters) {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.date === DateFilters.custom) {
      const startDate = filters?.customDateStart?.toISOString();
      const endDate = filters?.customDateEnd?.toISOString();
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

  generateTypeOrFilter(filters: Filters): string[] {
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

  generateTypeFilters(newQueryParams, filters: Filters) {
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
    currentParams: Partial<{
      pageNumber: number;
      queryParams: any;
      sortParam: string;
      sortDir: string;
      searchString: string;
    }>,
    filters
  ) {
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
}
