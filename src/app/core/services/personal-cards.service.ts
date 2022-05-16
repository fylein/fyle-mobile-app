import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PersonalCard } from '../models/personal_card.model';
import { YodleeAccessToken } from '../models/yoodle-token.model';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ExpenseAggregationService } from './expense-aggregation.service';
import { ISODateString } from '@capacitor/core';
import { Expense } from '../models/expense.model';
import { DateService } from './date.service';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import * as moment from 'moment';

const tripRequestsCacheBuster$ = new Subject<void>();

type matchExpenseResponse = Partial<{
  external_expense_id: string;
  id: string;
  transaction_split_group_id: string;
}>;

type Filters = Partial<{
  amount: number;
  createdOn: Partial<{
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  }>;
  updatedOn: Partial<{
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  }>;
  transactionType: string;
}>;

@Injectable({
  providedIn: 'root',
})
export class PersonalCardsService {
  constructor(
    private apiv2Service: ApiV2Service,
    private expenseAggregationService: ExpenseAggregationService,
    private apiService: ApiService,
    private dateService: DateService
  ) {}

  getLinkedAccounts(): Observable<PersonalCard[]> {
    return this.apiv2Service
      .get('/personal_bank_accounts', {
        params: {
          order: 'last_synced_at.desc',
        },
      })
      .pipe(map((res) => res.data));
  }

  getToken(): Observable<YodleeAccessToken> {
    return this.expenseAggregationService.get('/yodlee/personal/access_token');
  }

  htmlFormUrl(url: string, accessToken: string): string {
    const pageContent = `<form id="fastlink-form" name="fastlink-form" action="${url}" method="POST">
                          <input name="accessToken" value="Bearer ${accessToken}" hidden="true" />
                          <input  name="extraParams" value="configName=Aggregation&callback=https://www.fylehq.com" hidden="true" />
                          </form> 
                          <script type="text/javascript">
                          document.getElementById("fastlink-form").submit();
                          </script>
                          `;
    const pageContentUrl = 'data:text/html;base64,' + btoa(pageContent);
    return pageContentUrl;
  }

  postBankAccounts(requestIds: string[]): Observable<string[]> {
    return this.expenseAggregationService.post('/yodlee/personal/bank_accounts', {
      aggregator: 'yodlee',
      request_ids: requestIds,
    });
  }

  getLinkedAccountsCount(): Observable<number> {
    return this.apiv2Service
      .get('/personal_bank_accounts', {
        params: {
          order: 'last_synced_at.desc',
        },
      })
      .pipe(map((res) => res.count));
  }

  getMatchedExpenses(amount: number, txnDate: ISODateString): Observable<Expense[]> {
    return this.apiService.get('/expense_suggestions/personal_cards', {
      params: {
        amount,
        txn_dt: txnDate,
      },
    });
  }

  deleteAccount(accountId: string): Observable<PersonalCard> {
    return this.expenseAggregationService.delete('/bank_accounts/' + accountId);
  }

  getBankTransactions(
    config: Partial<{ offset: number; limit: number; order: string; queryParams: any }> = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ) {
    return this.apiv2Service.get('/personal_bank_transactions', {
      params: {
        limit: config.limit,
        offset: config.offset,
        ...config.queryParams,
      },
    });
  }

  getMatchedExpensesCount(amount: number, txnDate: ISODateString): Observable<number> {
    return this.getMatchedExpenses(amount, txnDate).pipe(map((res) => res.length));
  }

  getExpenseDetails(transactionSplitGroupId: string): Observable<Expense> {
    return this.apiv2Service
      .get('/expenses', {
        params: {
          tx_split_group_id: `eq.${transactionSplitGroupId}`,
        },
      })
      .pipe(map((res) => res.data[0]));
  }

  matchExpense(transactionSplitGroupId: string, externalExpenseId: string): Observable<matchExpenseResponse> {
    return this.apiService.post('/transactions/external_expense/match', {
      transaction_split_group_id: transactionSplitGroupId,
      external_expense_id: externalExpenseId,
    });
  }

  getBankTransactionsCount(queryParams) {
    const params = {
      limit: 10,
      offset: 0,
      queryParams,
    };
    return this.getBankTransactions(params).pipe(map((res) => res.count));
  }

  fetchTransactions(accountId: string): Observable<string[]> {
    return this.expenseAggregationService.post(`/bank_accounts/${accountId}/sync`, {
      owner_type: 'org_user',
    });
  }

  hideTransactions(txnIds: string[]): Observable<[]> {
    return this.expenseAggregationService.post('/bank_transactions/hide/bulk', {
      bank_transaction_ids: txnIds,
    });
  }

  unmatchExpense(transactionSplitGroupId: string, externalExpenseId: string): Observable<any> {
    return this.apiService.post('/transactions/external_expense/unmatch', {
      transaction_split_group_id: transactionSplitGroupId,
      external_expense_id: externalExpenseId,
    });
  }

  generateDateParams(data, currentParams) {
    if (data.range === 'This Month') {
      const thisMonth = this.dateService.getThisMonthRange();
      currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${thisMonth.from.toISOString()},btxn_transaction_dt.lt.${thisMonth.to.toISOString()}))`;
    }

    if (data.range === 'Last Month') {
      const lastMonth = this.dateService.getLastMonthRange();
      currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${lastMonth.from.toISOString()},btxn_transaction_dt.lt.${lastMonth.to.toISOString()}))`;
    }

    if (data.range === 'Last 30 Days') {
      const last30Days = this.dateService.getLastDaysRange(30);
      currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${last30Days.from.toISOString()},btxn_transaction_dt.lt.${last30Days.to.toISOString()}))`;
    }

    if (data.range === 'Last 60 Days') {
      const last60Days = this.dateService.getLastDaysRange(60);
      currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${last60Days.from.toISOString()},btxn_transaction_dt.lt.${last60Days.to.toISOString()}))`;
    }

    if (data.range === 'All Time') {
      const last90Days = this.dateService.getLastDaysRange(90);
      currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${last90Days.from.toISOString()},btxn_transaction_dt.lt.${last90Days.to.toISOString()}))`;
    }

    if (data.range === 'Custom Range') {
      currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${new Date(
        data.startDate
      ).toISOString()},btxn_transaction_dt.lt.${new Date(data.endDate).toISOString()}))`;
    }

    return currentParams;
  }

  convertFilters(selectedFilters: SelectedFilters<any>[]): Filters {
    const generatedFilters: Filters = {};
    const createdOnDateFilter = selectedFilters.find((filter) => filter.name === 'Created On');
    if (createdOnDateFilter) {
      generatedFilters.createdOn = { name: createdOnDateFilter.value };
      if (createdOnDateFilter.associatedData) {
        generatedFilters.createdOn.customDateStart = createdOnDateFilter.associatedData.startDate;
        generatedFilters.createdOn.customDateEnd = createdOnDateFilter.associatedData.endDate;
      }
    }

    const updatedOnDateFilter = selectedFilters.find((filter) => filter.name === 'Updated On');
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

  generateSelectedFilters(filter: Filters): SelectedFilters<any>[] {
    const generatedFilters: SelectedFilters<any>[] = [];

    if (filter?.updatedOn) {
      generatedFilters.push({
        name: 'Updated On',
        value: filter.updatedOn.name,
        associatedData: {
          startDate: filter.updatedOn.customDateStart,
          endDate: filter.updatedOn.customDateEnd,
        },
      });
    }

    if (filter?.createdOn) {
      generatedFilters.push({
        name: 'Created On',
        value: filter.createdOn.name,
        associatedData: {
          startDate: filter.createdOn.customDateStart,
          endDate: filter.createdOn.customDateEnd,
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

  generateTxnDateParams(newQueryParams, filters, type) {
    let queryType;
    if (type === 'createdOn') {
      queryType = 'btxn_created_at';
    } else {
      queryType = 'btxn_updated_at';
    }
    if (filters[type]) {
      filters[type].customDateStart = filters[type].customDateStart && new Date(filters[type].customDateStart);
      filters[type].customDateEnd = filters[type].customDateEnd && new Date(filters[type].customDateEnd);
      if (filters[type].name === DateFilters.thisMonth) {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParams.or.push(
          `(and(${queryType}.gte.${thisMonth.from.toISOString()},${queryType}.lt.${thisMonth.to.toISOString()}))`
        );
      }

      if (filters[type].name === DateFilters.thisWeek) {
        const thisWeek = this.dateService.getThisWeekRange();
        newQueryParams.or.push(
          `(and(${queryType}.gte.${thisWeek.from.toISOString()},${queryType}.lt.${thisWeek.to.toISOString()}))`
        );
      }

      if (filters[type].name === DateFilters.lastMonth) {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParams.or.push(
          `(and(${queryType}.gte.${lastMonth.from.toISOString()},${queryType}.lt.${lastMonth.to.toISOString()}))`
        );
      }

      this.generateCustomDateParams(newQueryParams, filters, type, queryType);
    }
  }

  generateCustomDateParams(newQueryParams: any, filters: Filters, type: string, queryType: string) {
    if (filters[type].name === DateFilters.custom) {
      const startDate = filters[type].customDateStart.toISOString();
      const endDate = filters[type].customDateEnd.toISOString();
      if (filters[type].customDateStart && filters[type].customDateEnd) {
        newQueryParams.or.push(`(and(${queryType}.gte.${startDate},${queryType}.lt.${endDate}))`);
      } else if (filters[type].customDateStart) {
        newQueryParams.or.push(`(and(${queryType}.gte.${startDate}))`);
      } else if (filters[type].customDateEnd) {
        newQueryParams.or.push(`(and(${queryType}.lt.${endDate}))`);
      }
    }
  }

  generateCreditParams(newQueryParams, filters) {
    const transactionTypeMap = {
      credit: '(btxn_transaction_type.in.(credit))',
      debit: '(btxn_transaction_type.in.(debit))',
    };
    if (filters.transactionType) {
      newQueryParams.or.push(transactionTypeMap[filters.transactionType.toLowerCase()]);
    }
  }

  generateFilterPills(filters: Filters) {
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

  generateDateFilterPills(type, filters, filterPills: FilterPill[]) {
    if (filters[type].name === DateFilters.thisWeek) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: 'this Week',
      });
    }

    if (filters[type].name === DateFilters.thisMonth) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: 'this Month',
      });
    }

    if (filters[type].name === DateFilters.all) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: 'All',
      });
    }

    if (filters[type].name === DateFilters.lastMonth) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: 'Last Month',
      });
    }

    if (filters[type].name === DateFilters.custom) {
      if (type === 'createdOn') {
        this.generateCreatedOnCustomDatePill(filters, filterPills);
      }
      if (type === 'updatedOn') {
        this.generateUpdatedOnCustomDatePill(filters, filterPills);
      }
    }
  }

  generateCreatedOnCustomDatePill(filters: any, filterPills: FilterPill[]) {
    const startDate = filters.createdOn.customDateStart && moment(filters.createdOn.customDateStart).format('y-MM-D');
    const endDate = filters.createdOn.customDateEnd && moment(filters.createdOn.customDateEnd).format('y-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: `${startDate} to ${endDate}`,
      });
    } else if (startDate) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: `>= ${startDate}`,
      });
    } else if (endDate) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: `<= ${endDate}`,
      });
    }
  }

  generateUpdatedOnCustomDatePill(filters: any, filterPills: FilterPill[]) {
    const startDate = filters.updatedOn.customDateStart && moment(filters.updatedOn.customDateStart).format('y-MM-D');
    const endDate = filters.updatedOn.customDateEnd && moment(filters.updatedOn.customDateEnd).format('y-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: `${startDate} to ${endDate}`,
      });
    } else if (startDate) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: `>= ${startDate}`,
      });
    } else if (endDate) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: `<= ${endDate}`,
      });
    }
  }

  generateCreditTrasactionsFilterPills(filters, filterPills: FilterPill[]) {
    if (filters.transactionType === 'Credit') {
      filterPills.push({
        label: 'Transactions Type',
        type: 'string',
        value: 'Credit',
      });
    }

    if (filters.transactionType === 'Debit') {
      filterPills.push({
        label: 'Transactions Type',
        type: 'string',
        value: 'Debit',
      });
    }
  }
}
