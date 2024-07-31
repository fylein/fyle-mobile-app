import { Inject, Injectable } from '@angular/core';
import { Observable, concatMap, map, of, range, reduce, switchMap } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private spenderService: SpenderService,
    private sharedExpenseService: SharedExpenseService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService
  ) {}

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
                  (ccTransaction) => ccTransaction.id === expense.matched_corporate_card_transaction_ids[0]
                ),
              ];
            }
          });

          return expenses;
        })
      );
  }

  getExpenseIdsWithUnmatchedCCCTransactions(expenses: Expense[]): string[] {
    return expenses
      .filter(
        (expense) =>
          expense.matched_corporate_card_transaction_ids.length > 0 &&
          expense.matched_corporate_card_transactions.length === 0
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
              })
            );
        } else {
          return of(expense);
        }
      })
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
      })
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

  getExpenseStats(
    params: Record<string, string | string[] | boolean>
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

  post(expense: Partial<Expense>): Observable<void> {
    return this.spenderService.post<void>('/expenses', {
      data: expense,
    });
  }
}
