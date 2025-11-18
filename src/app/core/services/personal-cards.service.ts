import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { YodleeAccessToken } from '../models/yoodle-token.model';
import { PersonalCardFilter } from '../models/personal-card-filters.model';
import { Expense } from '../models/platform/v1/expense.model';
import { DateService } from './date.service';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import dayjs from 'dayjs';
import { PersonalCardDateFilter } from '../models/personal-card-date-filter.model';
import { PlatformPersonalCardFilterParams } from '../models/platform/platform-personal-card-filter-params.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformPersonalCard } from '../models/platform/platform-personal-card.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformPersonalCardTxn } from '../models/platform/platform-personal-card-txn.model';
import { PlatformPersonalCardQueryParams } from '../models/platform/platform-personal-card-query-params.model';
import { PersonalCardSyncTxns } from '../models/platform/platform-personal-card-syn-txns.model';
import { environment } from 'src/environments/environment';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class PersonalCardsService {
  private dateService = inject(DateService);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private translocoService = inject(TranslocoService);

  addTransactionTypeToTxns(txns: PlatformPersonalCardTxn[]): PlatformPersonalCardTxn[] {
    return txns.map((txn) => ({
      ...txn,
      transactionType:
        txn.amount < 0
          ? this.translocoService.translate('services.personalCards.transactionCredit')
          : this.translocoService.translate('services.personalCards.transactionDebit'),
      amount: Math.abs(txn.amount),
    }));
  }

  getPersonalCards(): Observable<PlatformPersonalCard[]> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformPersonalCard[]>>('/personal_cards')
      .pipe(map((res) => res.data));
  }

  getToken(): Observable<YodleeAccessToken> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<Omit<YodleeAccessToken, 'fast_link_url'>>>('/personal_cards/access_token')
      .pipe(
        map(
          (res) =>
            ({
              access_token: res.data.access_token,
              fast_link_url: environment.YODLEE_FAST_LINK_URL,
            }) as YodleeAccessToken,
        ),
      );
  }

  isMfaEnabled(personalCardId: string): Observable<boolean> {
    const payload = {
      data: {
        id: personalCardId,
      },
    };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<{ is_mfa_enabled: boolean }>>('/personal_cards/mfa', payload)
      .pipe(map((res) => res.data.is_mfa_enabled));
  }

  htmlFormUrl(url: string, accessToken: string, isMfaFlow: boolean, providerAccountId = ''): string {
    let extraParams = 'configName=Aggregation&callback=https://www.fylehq.com';
    if (isMfaFlow) {
      extraParams = `configName=Aggregation&flow=refresh&providerAccountId=${providerAccountId}&callback=https://www.fylehq.com`;
    }
    const pageContent = `<form id="fastlink-form" name="fastlink-form" action="${url}" method="POST">
                          <input name="accessToken" value="Bearer ${accessToken}" hidden="true" />
                          <input  name="extraParams" value="${extraParams}" hidden="true" />
                          </form> 
                          <script type="text/javascript">
                          document.getElementById("fastlink-form").submit();
                          </script>
                          `;
    const pageContentUrl = 'data:text/html;base64,' + btoa(pageContent);
    return pageContentUrl;
  }

  postBankAccounts(): Observable<PlatformPersonalCard[]> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<PlatformPersonalCard[]>>('/personal_cards', { data: {} })
      .pipe(map((res) => res.data));
  }

  getPersonalCardsCount(): Observable<number> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformPersonalCard[]>>('/personal_cards')
      .pipe(map((res) => res.count));
  }

  getMatchedExpensesSuggestions(amount: number, txnDate: string): Observable<Expense[]> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<Expense[]>>('/personal_card_transactions/expense_suggestion', {
        params: {
          amount,
          spent_at: txnDate,
        },
      })
      .pipe(map((res) => res.data));
  }

  deleteAccount(accountId: string): Observable<PlatformPersonalCard> {
    const payload = {
      data: {
        id: accountId,
      },
    };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<PlatformPersonalCard>>('/personal_cards/delete', payload)
      .pipe(map((response) => response.data));
  }

  getBankTransactions(
    config: Partial<{
      offset: number;
      limit: number;
      order: string;
      queryParams: Partial<PlatformPersonalCardQueryParams>;
    }> = {
      offset: 0,
      limit: 10,
      queryParams: {},
    },
  ): Observable<PlatformApiResponse<PlatformPersonalCardTxn[]>> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformPersonalCardTxn[]>>('/personal_card_transactions', {
        params: {
          limit: config.limit,
          offset: config.offset,
          ...config.queryParams,
          order: 'spent_at.desc,id.desc',
        },
      })
      .pipe(
        map((res) => ({
          ...res,
          data: this.addTransactionTypeToTxns(res.data),
        })),
      );
  }

  matchExpense(
    transactionSplitGroupId: string,
    externalExpenseId: string,
  ): Observable<{
    external_expense_id: string;
    transaction_split_group_id: string;
  }> {
    const payload = {
      data: {
        id: externalExpenseId,
        expense_split_group_id: transactionSplitGroupId,
      },
    };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<PlatformPersonalCardTxn>>('/personal_card_transactions/match', payload)
      .pipe(
        map((res) => ({
          transaction_split_group_id: res.data.matched_expense_ids[0],
          external_expense_id: res.data.id,
        })),
      );
  }

  getBankTransactionsCount(queryParams: Partial<PlatformPersonalCardQueryParams>): Observable<number> {
    const params = {
      limit: 10,
      offset: 0,
      queryParams,
    };
    return this.getBankTransactions(params).pipe(map((res) => res.count));
  }

  syncTransactions(accountId: string): Observable<PlatformApiResponse<PersonalCardSyncTxns>> {
    const payload = {
      data: {
        personal_card_id: accountId,
      },
    };
    return this.spenderPlatformV1ApiService.post('/personal_card_transactions', payload);
  }

  hideTransactions(txnIds: string[]): Observable<number> {
    const payload = {
      data: txnIds.map((txnId) => ({ id: txnId })),
    };
    return this.spenderPlatformV1ApiService
      .post<void>('/personal_card_transactions/hide/bulk', payload)
      .pipe(map(() => txnIds.length));
  }

  generateDateParams(
    data: { range: string; endDate?: string; startDate?: string },
    currentParams: Partial<PlatformPersonalCardFilterParams>,
  ): Partial<PlatformPersonalCardFilterParams> {
    let dateRangeQuickFilter = '';
    if (data.range === 'This Month') {
      const thisMonth = this.dateService.getThisMonthRange();
      dateRangeQuickFilter = `(and(spent_at.gte.${thisMonth.from.toISOString()},spent_at.lt.${thisMonth.to.toISOString()}))`;
    }

    if (data.range === 'Last Month') {
      const lastMonth = this.dateService.getLastMonthRange();
      dateRangeQuickFilter = `(and(spent_at.gte.${lastMonth.from.toISOString()},spent_at.lt.${lastMonth.to.toISOString()}))`;
    }

    if (data.range === 'Last 30 Days') {
      const last30Days = this.dateService.getLastDaysRange(30);
      dateRangeQuickFilter = `(and(spent_at.gte.${last30Days.from.toISOString()},spent_at.lt.${last30Days.to.toISOString()}))`;
    }

    if (data.range === 'Last 60 Days') {
      const last60Days = this.dateService.getLastDaysRange(60);
      dateRangeQuickFilter = `(and(spent_at.gte.${last60Days.from.toISOString()},spent_at.lt.${last60Days.to.toISOString()}))`;
    }

    if (data.range === 'All Time') {
      const last90Days = this.dateService.getLastDaysRange(90);
      dateRangeQuickFilter = `(and(spent_at.gte.${last90Days.from.toISOString()},spent_at.lt.${last90Days.to.toISOString()}))`;
    }

    if (data.range === 'Custom Range') {
      dateRangeQuickFilter = `(and(spent_at.gte.${new Date(data.startDate).toISOString()},spent_at.lt.${new Date(
        data.endDate,
      ).toISOString()}))`;
    }
    if (!currentParams.queryParams) {
      currentParams.queryParams = {};
    }
    currentParams.queryParams.or = [dateRangeQuickFilter];
    return currentParams;
  }

  convertFilters(selectedFilters: SelectedFilters<string>[]): Partial<PersonalCardFilter> {
    const generatedFilters: PersonalCardFilter = {} as PersonalCardFilter;
    const createdOnDateFilter = selectedFilters.find((filter) => filter.name === 'Created date');
    if (createdOnDateFilter) {
      generatedFilters.createdOn = { name: createdOnDateFilter.value };
      if (createdOnDateFilter.associatedData) {
        generatedFilters.createdOn.customDateStart = createdOnDateFilter.associatedData.startDate;
        generatedFilters.createdOn.customDateEnd = createdOnDateFilter.associatedData.endDate;
      }
    }

    const updatedOnDateFilter = selectedFilters.find((filter) => filter.name === 'Updated date');
    if (updatedOnDateFilter) {
      generatedFilters.updatedOn = { name: updatedOnDateFilter.value };
      if (updatedOnDateFilter.associatedData) {
        generatedFilters.updatedOn.customDateStart = updatedOnDateFilter.associatedData.startDate;
        generatedFilters.updatedOn.customDateEnd = updatedOnDateFilter.associatedData.endDate;
      }
    }

    const transactionTypeFilter = selectedFilters.find((filter) => filter.name === 'Transactions Type');

    if (transactionTypeFilter) {
      generatedFilters.transactionType = transactionTypeFilter.value;
    }

    return generatedFilters;
  }

  generateSelectedFilters(filter: Partial<PersonalCardFilter>): SelectedFilters<string>[] {
    const generatedFilters: SelectedFilters<string>[] = [];

    if (filter?.updatedOn) {
      const dateFilter = filter;
      generatedFilters.push({
        name: 'Updated date',
        value: dateFilter.updatedOn.name,
        associatedData: {
          startDate: dateFilter.updatedOn.customDateStart,
          endDate: dateFilter.updatedOn.customDateEnd,
        },
      });
    }

    if (filter?.createdOn) {
      const dateFilter = filter;
      generatedFilters.push({
        name: 'Created date',
        value: dateFilter.createdOn.name,
        associatedData: {
          startDate: dateFilter.createdOn.customDateStart,
          endDate: dateFilter.createdOn.customDateEnd,
        },
      });
    }

    if (filter?.transactionType) {
      generatedFilters.push({
        name: 'Transactions Type',
        value: filter.transactionType,
      });
    }

    return generatedFilters;
  }

  generateTxnDateParams(
    newQueryParams: Partial<PlatformPersonalCardQueryParams>,
    filters: Partial<PersonalCardFilter>,
    type: string,
  ): void {
    let queryType: string;
    if (type === 'createdOn') {
      queryType = 'created_at';
    } else {
      queryType = 'updated_at';
    }
    if (filters[type]) {
      const dateFilter = filters[type] as PersonalCardDateFilter;
      dateFilter.customDateStart = dateFilter.customDateStart && new Date(dateFilter.customDateStart);
      dateFilter.customDateEnd = dateFilter.customDateEnd && new Date(dateFilter.customDateEnd);
      if (dateFilter.name === DateFilters.thisMonth) {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParams.or.push(
          `(and(${queryType}.gte.${thisMonth.from.toISOString()},${queryType}.lt.${thisMonth.to.toISOString()}))`,
        );
      }

      if (dateFilter.name === DateFilters.thisWeek) {
        const thisWeek = this.dateService.getThisWeekRange();
        newQueryParams.or.push(
          `(and(${queryType}.gte.${thisWeek.from.toISOString()},${queryType}.lt.${thisWeek.to.toISOString()}))`,
        );
      }

      if (dateFilter.name === DateFilters.lastMonth) {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParams.or.push(
          `(and(${queryType}.gte.${lastMonth.from.toISOString()},${queryType}.lt.${lastMonth.to.toISOString()}))`,
        );
      }

      this.generateCustomDateParams(newQueryParams, filters, type, queryType);
    }
  }

  generateCustomDateParams(
    newQueryParams: Partial<PlatformPersonalCardQueryParams>,
    filters: Partial<PersonalCardFilter>,
    type: string,
    queryType: string,
  ): void {
    const dateFilter = filters[type] as PersonalCardDateFilter;
    if (dateFilter.name === DateFilters.custom) {
      const startDate = dateFilter.customDateStart?.toISOString();
      const endDate = dateFilter.customDateEnd?.toISOString();
      if (dateFilter.customDateStart && dateFilter.customDateEnd) {
        newQueryParams.or.push(`(and(${queryType}.gte.${startDate},${queryType}.lt.${endDate}))`);
      } else if (dateFilter.customDateStart) {
        newQueryParams.or.push(`(and(${queryType}.gte.${startDate}))`);
      } else if (dateFilter.customDateEnd) {
        newQueryParams.or.push(`(and(${queryType}.lt.${endDate}))`);
      }
    }
  }

  generateCreditParams(
    newQueryParams: Partial<PlatformPersonalCardQueryParams>,
    filters: Partial<PersonalCardFilter>,
  ): void {
    if (filters.transactionType) {
      const txnType = filters.transactionType.toLowerCase();
      const amountParam = txnType === 'credit' ? 'lte.0' : 'gte.0';
      newQueryParams.amount = amountParam;
    }
  }

  generateFilterPills(filters: Partial<PersonalCardFilter>): FilterPill[] {
    const filterPills: FilterPill[] = [];

    if (filters?.createdOn) {
      this.generateDateFilterPills('createdOn', filters, filterPills);
    }

    if (filters?.updatedOn) {
      this.generateDateFilterPills('updatedOn', filters, filterPills);
    }

    if (filters?.transactionType) {
      this.generateCreditTrasactionsFilterPills(filters, filterPills);
    }

    return filterPills;
  }

  private generateUpdatedOnCustomDatePill(filters: Partial<PersonalCardFilter>, filterPills: FilterPill[]): void {
    const startDate = filters.updatedOn.customDateStart && dayjs(filters.updatedOn.customDateStart).format('YYYY-MM-D');
    const endDate = filters.updatedOn.customDateEnd && dayjs(filters.updatedOn.customDateEnd).format('YYYY-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.updatedDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.dateRangeTo', { startDate, endDate }),
      });
    } else if (startDate) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.updatedDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.dateRangeFrom', { startDate }),
      });
    } else if (endDate) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.updatedDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.dateRangeToInclusive', { endDate }),
      });
    }
  }

  private generateCreditTrasactionsFilterPills(filters: Partial<PersonalCardFilter>, filterPills: FilterPill[]): void {
    if (filters.transactionType === 'Credit') {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.transactionsType'),
        type: 'string',
        value: this.translocoService.translate('services.personalCards.creditPillValue'),
      });
    }

    if (filters.transactionType === 'Debit') {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.transactionsType'),
        type: 'string',
        value: this.translocoService.translate('services.personalCards.debitPillValue'),
      });
    }
  }

  private generateCreatedOnCustomDatePill(filters: Partial<PersonalCardFilter>, filterPills: FilterPill[]): void {
    const startDate = filters.createdOn.customDateStart && dayjs(filters.createdOn.customDateStart).format('YYYY-MM-D');
    const endDate = filters.createdOn.customDateEnd && dayjs(filters.createdOn.customDateEnd).format('YYYY-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.createdDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.dateRangeTo', { startDate, endDate }),
      });
    } else if (startDate) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.createdDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.dateRangeFrom', { startDate }),
      });
    } else if (endDate) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.createdDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.dateRangeToInclusive', { endDate }),
      });
    }
  }

  private generateDateFilterPills(type: string, filters: Partial<PersonalCardFilter>, filterPills: FilterPill[]): void {
    const dateFilter = filters[type] as PersonalCardDateFilter;
    if (dateFilter.name === DateFilters.thisWeek) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.createdDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.thisWeekPillValue'),
      });
    }

    if (dateFilter.name === DateFilters.thisMonth) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.createdDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.thisMonthPillValue'),
      });
    }

    if (dateFilter.name === DateFilters.all) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.createdDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.allPillValue'),
      });
    }

    if (dateFilter.name === DateFilters.lastMonth) {
      filterPills.push({
        label: this.translocoService.translate('services.personalCards.createdDate'),
        type: 'date',
        value: this.translocoService.translate('services.personalCards.lastMonthPillValue'),
      });
    }

    if (dateFilter.name === DateFilters.custom) {
      if (type === 'createdOn') {
        this.generateCreatedOnCustomDatePill(filters, filterPills);
      }
      if (type === 'updatedOn') {
        this.generateUpdatedOnCustomDatePill(filters, filterPills);
      }
    }
  }
}
