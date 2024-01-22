import { Inject, Injectable } from '@angular/core';
import { Observable, concatMap, map, range, reduce, switchMap } from 'rxjs';
import { SpenderService } from '../spender/spender.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpensesQueryParams } from 'src/app/core/models/platform/v1/expenses-query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { Cacheable } from 'ts-cacheable';
import { expensesCacheBuster$ } from '../../../transaction.service';
import {
  ExpenseDuplicateSet,
  ExpenseDuplicateSetsResponse,
} from 'src/app/core/models/platform/v1/expense-duplicate-sets.model';
import { ExpensesService as SharedExpenseService } from '../shared/expenses.service';
import { SplitPayload } from 'src/app/core/models/platform/v1/split-payload.model';
import { Splits } from 'src/app/core/models/platform/v1/splits.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { SplitExpensePolicy } from 'src/app/core/models/platform/v1/split-expense-policy.model';
import { SplitExpenseMissingFields } from 'src/app/core/models/platform/v1/split-expense-missing-fields.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private spenderService: SpenderService,
    private sharedExpenseService: SharedExpenseService
  ) {}

  @Cacheable({
    cacheBusterObserver: expensesCacheBuster$,
  })
  getAllExpenses(params: ExpensesQueryParams): Observable<Expense[]> {
    return this.getExpensesCount(params.queryParams).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) =>
        this.getExpenses({
          offset: this.paginationSize * page,
          limit: this.paginationSize,
          ...params.queryParams,
          order: params.order || 'spent_at.desc,created_at.desc,id.desc',
        })
      ),
      reduce((acc, curr) => acc.concat(curr), [] as Expense[])
    );
  }

  @Cacheable({
    cacheBusterObserver: expensesCacheBuster$,
  })
  getReportExpenses(reportId: string): Observable<Expense[]> {
    const params = {
      report_id: `eq.${reportId}`,
      order: 'spent_at.desc,id.desc',
    };
    return this.getExpensesCount(params).pipe(
      switchMap((expensesCount) => {
        const numBatches = expensesCount > this.paginationSize ? Math.ceil(expensesCount / this.paginationSize) : 1;
        return range(0, numBatches);
      }),
      concatMap((batchNum) =>
        this.getExpenses({ offset: this.paginationSize * batchNum, limit: this.paginationSize, ...params })
      ),
      reduce((acc, curr) => acc.concat(curr), [] as Expense[])
    );
  }

  getExpenseById(id: string): Observable<Expense> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.spenderService.get<PlatformApiResponse<Expense>>('/expenses', data).pipe(map((res) => res.data[0]));
  }

  getExpensesCount(params: ExpensesQueryParams): Observable<number> {
    return this.spenderService
      .get<PlatformApiResponse<Expense>>('/expenses', { params })
      .pipe(map((response) => response.count));
  }

  getExpenses(params: ExpensesQueryParams): Observable<Expense[]> {
    return this.spenderService
      .get<PlatformApiResponse<Expense>>('/expenses', { params })
      .pipe(map((expenses) => expenses.data));
  }

  getDuplicateSets(): Observable<ExpenseDuplicateSet[]> {
    return this.spenderService
      .get<ExpenseDuplicateSetsResponse>('/expenses/duplicate_sets')
      .pipe(map((response) => response.data));
  }

  getDuplicatesByExpense(expenseId: string): Observable<ExpenseDuplicateSet[]> {
    return this.spenderService
      .get<ExpenseDuplicateSetsResponse>('/expenses/duplicate_sets', {
        params: {
          expense_id: expenseId,
        },
      })
      .pipe(map((response) => response.data));
  }

  dismissDuplicates(duplicateExpenseIds: string[], targetExpenseIds: string[]): Observable<void> {
    const payload = targetExpenseIds.map((targetExpenseId) => ({
      id: targetExpenseId,
      duplicate_expense_ids: duplicateExpenseIds,
    }));

    return this.spenderService.post<void>('/expenses/dismiss_duplicates/bulk', {
      data: payload,
    });
  }

  formatSplitResponse(response) {
    const formattedResponse = {};

    for (let index = 0; index < response?.data?.length; index++) {
      formattedResponse[index] = {
        data: response?.data[index],
      };
    }

    return formattedResponse;
  }

  transformSplitTo(splitTxns: Transaction[], transaction: Transaction, fileIds: string[], reportId: string) {
    const platformSplitObject: SplitPayload = {
      id: transaction?.id,
      splits: this.transformSplitArray(splitTxns),
      // Platform will throw error if category_id is null in form, therefore adding unspecified category
      category_id: transaction?.org_category_id,
      source: transaction?.source,
      spent_at: transaction?.txn_dt,
      is_reimbursable: transaction?.skip_reimbursement === null ? null : !transaction?.skip_reimbursement,
      travel_classes: [],
      locations: transaction?.locations,
      foreign_currency: transaction?.orig_currency,
      foreign_amount: transaction?.orig_amount,
      project_id: transaction?.project_id,
      file_ids: fileIds,
      cost_center_id: transaction?.cost_center_id,
      source_account_id: transaction?.source_account_id,
      tax_amount: transaction?.tax_amount,
      started_at: transaction?.from_dt,
      ended_at: transaction?.to_dt,
      merchant: transaction?.vendor,
      purpose: transaction?.purpose,
      is_billable: transaction?.billable,
      custom_fields: transaction?.custom_properties,
      claim_amount: transaction?.amount,
    };

    if (transaction?.fyle_category && transaction?.fyle_category.toLowerCase() === 'airlines') {
      if (transaction?.flight_journey_travel_class) {
        platformSplitObject.travel_classes.push(transaction?.flight_journey_travel_class);
      }
      if (transaction?.flight_return_travel_class) {
        platformSplitObject.travel_classes.push(transaction?.flight_return_travel_class);
      }
    } else if (
      transaction?.fyle_category &&
      transaction?.fyle_category.toLowerCase() === 'bus' &&
      transaction?.bus_travel_class
    ) {
      platformSplitObject.travel_classes.push(transaction?.bus_travel_class);
    } else if (
      transaction?.fyle_category &&
      transaction?.fyle_category.toLowerCase() === 'train' &&
      transaction?.train_travel_class
    ) {
      platformSplitObject.travel_classes.push(transaction?.train_travel_class);
    }

    if (reportId) {
      platformSplitObject.report_id = reportId;
    }

    return platformSplitObject;
  }

  transformSplitArray(splitEtxns: Transaction[]): Splits[] {
    const splits: Splits[] = [];

    for (const splitEtxn of splitEtxns) {
      const splitObject = {
        spent_at: splitEtxn?.txn_dt,
        category_id: splitEtxn?.org_category_id,
        project_id: splitEtxn?.project_id,
        cost_center_id: splitEtxn?.cost_center_id,
        purpose: splitEtxn?.purpose,
        foreign_amount: splitEtxn?.orig_amount,
        custom_fields: splitEtxn?.custom_properties,
        claim_amount: splitEtxn?.amount,
      };

      splits.push(splitObject);
    }

    return splits;
  }

  splitExpenseCheckPolicies(params: SplitPayload) {
    return this.spenderService.post<SplitExpensePolicy>('/expenses/split/check_policies', {
      data: params,
    });
  }

  splitExpenseCheckMissingFields(params: SplitPayload) {
    return this.spenderService.post<SplitExpenseMissingFields>('/expenses/split/check_mandatory_fields', {
      data: params,
    });
  }

  splitExpense(params: SplitPayload) {
    return this.spenderService.post<{ data: Transaction[] }>('/expenses/split', {
      data: params,
    });
  }

  getExpenseStats(
    params: Record<string, string | string[] | boolean>
  ): Observable<{ data: { count: number; total_amount: number } }> {
    return this.spenderService.post('/expenses/stats', {
      data: {
        query_params: this.sharedExpenseService.generateStatsQueryParams(params),
      },
    });
  }
}
