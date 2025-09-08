import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concatMap, map, of, range, reduce, switchMap } from 'rxjs';
import { SpenderService } from '../spender/spender.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpensesQueryParams } from 'src/app/core/models/platform/v1/expenses-query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CacheBuster, Cacheable } from 'ts-cacheable';
import {
  ExpenseDuplicateSet,
  ExpenseDuplicateSetsResponse,
} from 'src/app/core/models/platform/v1/expense-duplicate-sets.model';
import { ExpensesService as SharedExpenseService } from '../shared/expenses.service';
import { SplitPayload } from 'src/app/core/models/platform/v1/split-payload.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { SplitExpensePolicy } from 'src/app/core/models/platform/v1/split-expense-policy.model';
import { SplitExpenseMissingFields } from 'src/app/core/models/platform/v1/split-expense-missing-fields.model';
import { expensesCacheBuster$ } from 'src/app/core/cache-buster/expense-cache-buster';
import { CorporateCreditCardExpenseService } from '../../../corporate-credit-card-expense.service';
import { corporateCardTransaction } from 'src/app/core/models/platform/v1/cc-transaction.model';
import { MatchedCorporateCardTransaction } from 'src/app/core/models/platform/v1/matched-corpporate-card-transaction.model';
import { MileageUnitEnum } from 'src/app/core/models/platform/platform-mileage-rates.model';
import { Location } from 'src/app/core/models/location.model';
import { CommuteDeduction } from 'src/app/core/enums/commute-deduction.enum';
import { Expense as PlatformExpense } from 'src/app/core/models/platform/v1/expense.model';
import { MergeExpensesPayload } from 'src/app/core/models/merge-expenses-payload.model';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  splitExpensesData$ = new BehaviorSubject<{
    expenses: Partial<Transaction>[] | PlatformExpense[];
  } | null>(null);

  private spenderService = inject(SpenderService);

  private sharedExpenseService = inject(SharedExpenseService);

  private corporateCreditCardExpenseService = inject(CorporateCreditCardExpenseService);

  private translocoService = inject(TranslocoService);

  private paginationSize = inject(PAGINATION_SIZE);

  @CacheBuster({
    cacheBusterNotifier: expensesCacheBuster$,
    isInstant: true,
  })
  clearCache(): Observable<null> {
    return of(null);
  }

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
        }),
      ),
      reduce((acc, curr) => acc.concat(curr), [] as Expense[]),
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
        this.getExpenses({ offset: this.paginationSize * batchNum, limit: this.paginationSize, ...params }),
      ),
      reduce((acc, curr) => acc.concat(curr), [] as Expense[]),
    );
  }

  fetchAndMapCCCTransactions(ids: string[], expenses: Expense[]): Observable<Expense[]> {
    const params = {
      id: `in.(${ids.join(',')})`,
    };
    return this.spenderService
      .get<PlatformApiResponse<corporateCardTransaction[]>>('/corporate_card_transactions', { params })
      .pipe(
        map((res) => {
          const formattedCCCTransaction = res.data.map((ccTransaction) => this.mapCCCEToExpense(ccTransaction));

          expenses.forEach((expense) => {
            if (
              expense.matched_corporate_card_transaction_ids.length > 0 &&
              expense.matched_corporate_card_transactions.length === 0
            ) {
              expense.matched_corporate_card_transactions = [
                formattedCCCTransaction.find(
                  (ccTransaction) => ccTransaction.id === expense.matched_corporate_card_transaction_ids[0],
                ),
              ];
            }
          });

          return expenses;
        }),
      );
  }

  getExpenseIdsWithUnmatchedCCCTransactions(expenses: Expense[]): string[] {
    return expenses
      .filter(
        (expense) =>
          expense.matched_corporate_card_transaction_ids.length > 0 &&
          expense.matched_corporate_card_transactions.length === 0,
      )
      .map((expense) => expense.matched_corporate_card_transaction_ids[0]);
  }

  getExpenseById(id: string): Observable<Expense> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    // TODO: Remove this extra call of corporate card transaction once the slow sync issue is fixed
    return this.spenderService.get<PlatformApiResponse<Expense[]>>('/expenses', data).pipe(
      map((res) => res.data[0]),
      switchMap((expense) => {
        if (!expense) {
          throw new Error(this.translocoService.translate('services.expenses.expenseNotFound'));
        }
        if (
          expense.matched_corporate_card_transaction_ids.length > 0 &&
          expense.matched_corporate_card_transactions.length === 0
        ) {
          return this.corporateCreditCardExpenseService
            .getMatchedTransactionById(expense.matched_corporate_card_transaction_ids[0])
            .pipe(
              map((res) => {
                expense.matched_corporate_card_transactions = [this.mapCCCEToExpense(res.data[0])];
                return expense;
              }),
            );
        } else {
          return of(expense);
        }
      }),
    );
  }

  mapCCCEToExpense(ccTransaction: corporateCardTransaction): MatchedCorporateCardTransaction {
    return {
      id: ccTransaction.id,
      corporate_card_id: ccTransaction.corporate_card_id,
      corporate_card_number: ccTransaction.corporate_card.card_number,
      corporate_card_nickname: ccTransaction.corporate_card.nickname,
      masked_corporate_card_number: ccTransaction.corporate_card.masked_number,
      bank_name: ccTransaction.corporate_card.bank_name,
      corporate_card_user_full_name: ccTransaction.corporate_card.user_full_name,
      amount: ccTransaction.amount,
      currency: ccTransaction.currency,
      category: ccTransaction.category,
      spent_at: new Date(ccTransaction.spent_at),
      posted_at: new Date(ccTransaction.post_date),
      description: ccTransaction.description,
      status: ccTransaction.transaction_status,
      foreign_currency: ccTransaction.foreign_currency,
      foreign_amount: ccTransaction.foreign_amount,
      merchant: ccTransaction.merchant,
      matched_by: null,
    };
  }

  @Cacheable({
    cacheBusterObserver: expensesCacheBuster$,
  })
  getExpensesCount(params: ExpensesQueryParams): Observable<number> {
    return this.spenderService
      .get<PlatformApiResponse<Expense[]>>('/expenses', { params })
      .pipe(map((response) => response.count));
  }

  getExpenses(params: ExpensesQueryParams): Observable<Expense[]> {
    return this.spenderService.get<PlatformApiResponse<Expense[]>>('/expenses', { params }).pipe(
      map((expenses) => expenses.data),
      switchMap((expenses) => {
        const expenseIdsWithUnmatchedCCCTransactions = this.getExpenseIdsWithUnmatchedCCCTransactions(expenses);

        if (expenseIdsWithUnmatchedCCCTransactions.length > 0) {
          return this.fetchAndMapCCCTransactions(expenseIdsWithUnmatchedCCCTransactions, expenses);
        } else {
          return of(expenses);
        }
      }),
    );
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

  splitExpenseCheckPolicies(params: SplitPayload): Observable<SplitExpensePolicy> {
    return this.spenderService.post<SplitExpensePolicy>('/expenses/split/check_policies', {
      data: params,
    });
  }

  splitExpenseCheckMissingFields(params: SplitPayload): Observable<SplitExpenseMissingFields> {
    return this.spenderService.post<SplitExpenseMissingFields>('/expenses/split/check_mandatory_fields', {
      data: params,
    });
  }

  splitExpense(params: SplitPayload): Observable<{ data: Transaction[] }> {
    return this.spenderService
      .post<{ data: Transaction[] }>('/expenses/split', {
        data: params,
      })
      .pipe(switchMap((res) => this.clearCache().pipe(map(() => res))));
  }

  @Cacheable({
    cacheBusterObserver: expensesCacheBuster$,
  })
  getExpenseStats(
    params: Record<string, string | string[] | boolean>,
  ): Observable<{ data: { count: number; total_amount: number } }> {
    return this.spenderService.post('/expenses/stats', {
      data: {
        query_params: this.sharedExpenseService.generateStatsQueryParams(params),
      },
    });
  }

  getSplitExpenses(expenseSplitGroupId: string): Observable<Expense[]> {
    const params: ExpensesQueryParams = {
      queryParams: {
        split_group_id: 'eq.' + expenseSplitGroupId,
      },
    };

    return this.getAllExpenses(params);
  }

  attachReceiptToExpense(expenseId: string, fileId: string): Observable<Expense> {
    const payload = {
      data: {
        id: expenseId,
        file_id: fileId,
      },
    };

    return this.spenderService
      .post<PlatformApiResponse<Expense>>('/expenses/attach_receipt', payload)
      .pipe(map((res) => res.data));
  }

  attachReceiptsToExpense(expenseId: string, fileIds: string[]): Observable<Expense[]> {
    const payload = {
      data: [
        {
          id: expenseId,
          file_ids: fileIds,
        },
      ],
    };

    return this.spenderService
      .post<PlatformApiResponse<Expense[]>>('/expenses/attach_files/bulk', payload)
      .pipe(map((res) => res.data));
  }

  // transform public transaction to expense payload for /post expenses
  transformTo(transaction: Partial<Transaction>): Partial<Expense> {
    const expense: Partial<Expense> = {
      id: transaction.id,
      spent_at: transaction.spent_at,
      category_id: transaction.category_id,
      purpose: transaction.purpose,
      source_account_id: transaction.source_account_id,
      claim_amount: transaction.amount,
      merchant: transaction.vendor,
      project_id: transaction.project_id,
      cost_center_id: transaction.cost_center_id,
      foreign_currency: transaction.orig_currency,
      foreign_amount: transaction.orig_amount,
      source: transaction.source,
      is_reimbursable: !transaction.skip_reimbursement,
      tax_amount: transaction.tax_amount,
      tax_group_id: transaction.tax_group_id,
      is_billable: transaction.billable,
      distance: transaction.distance,
      distance_unit: transaction.distance_unit as MileageUnitEnum,
      started_at: transaction.from_dt,
      ended_at: transaction.to_dt,
      locations: transaction.locations as unknown as Location[],
      custom_fields: transaction.custom_properties.map((customProperty) => ({
        ...(customProperty.id && { id: customProperty.id }),
        name: customProperty.name,
        value: customProperty.value,
      })),
      per_diem_rate_id: transaction.per_diem_rate_id,
      per_diem_num_days: transaction.num_days || 0,
      mileage_rate_id: transaction.mileage_rate_id, // @arjun check if this is present
      commute_deduction: transaction.commute_deduction as CommuteDeduction,
      mileage_is_round_trip: transaction.mileage_is_round_trip,
      commute_details_id: transaction.commute_details_id,
      hotel_is_breakfast_provided: transaction.hotel_is_breakfast_provided,
      advance_wallet_id: transaction.advance_wallet_id,
      file_ids: transaction.file_ids,
      report_id: transaction.report_id,
      travel_classes: [],
      mileage_calculated_distance: transaction.mileage_calculated_distance,
      mileage_calculated_amount: transaction.mileage_calculated_amount,
    };

    if (
      transaction.category?.system_category.toLowerCase() === 'flight' ||
      transaction.category?.system_category.toLowerCase() === 'airlines'
    ) {
      if (transaction.flight_journey_travel_class) {
        expense.travel_classes.push(transaction.flight_journey_travel_class);
      }
      if (transaction.flight_return_travel_class) {
        expense.travel_classes.push(transaction.flight_return_travel_class);
      }
    } else if (transaction.category?.system_category.toLowerCase() === 'bus' && transaction.bus_travel_class) {
      expense.travel_classes.push(transaction.bus_travel_class);
    } else if (transaction.category?.system_category.toLowerCase() === 'train' && transaction.train_travel_class) {
      expense.travel_classes.push(transaction.train_travel_class);
    }

    return expense;
  }

  post(expense: Partial<Expense>): Observable<{ data: Expense }> {
    return this.spenderService.post<{ data: Expense }>('/expenses', {
      data: expense,
    });
  }

  createFromFile(fileId: string, source: string): Observable<{ data: Expense[] }> {
    return this.spenderService.post<{ data: Expense[] }>('/expenses/create_from_file/bulk', {
      data: [
        {
          file_id: fileId,
          source,
        },
      ],
    });
  }

  deleteExpenses(expenseIds: string[]): Observable<void> {
    const payload = {
      data: expenseIds.map((id) => ({ id })),
    };

    return this.spenderService
      .post<PlatformApiResponse<null>>('/expenses/delete/bulk', payload)
      .pipe(map((): void => void 0));
  }

  mergeExpenses(payload: MergeExpensesPayload): Observable<Expense> {
    return this.spenderService
      .post<PlatformApiResponse<Expense>>('/expenses/merge', { data: payload })
      .pipe(map((response) => response.data));
  }
}
