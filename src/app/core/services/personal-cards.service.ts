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

const tripRequestsCacheBuster$ = new Subject<void>();

type matchExpenseResponse = Partial<{
  external_expense_id: string;
  id: string;
  transaction_split_group_id: string;
}>;
@Injectable({
  providedIn: 'root',
})
export class PersonalCardsService {
  constructor(
    private apiv2Service: ApiV2Service,
    private expenseAggregationService: ExpenseAggregationService,
    private apiService: ApiService
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
    return this.expenseAggregationService.get('/yodlee/access_token');
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
    return this.expenseAggregationService.post('/yodlee/bank_accounts', {
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
        ba_id: 'eq.' + config.queryParams.accountId,
        btxn_status: config.queryParams.status,
        limit: config.limit,
        offset: config.offset,
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
}
