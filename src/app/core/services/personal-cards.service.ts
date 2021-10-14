import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PersonalCard } from '../models/personal_card.model';
import { YodleeAccessToken } from '../models/yoodle-token.model';
import { ApiV2Service } from './api-v2.service';
import { ExpenseAggregationService } from './expense-aggregation.service';

@Injectable({
  providedIn: 'root',
})
export class PersonalCardsService {
  constructor(private apiv2Service: ApiV2Service, private expenseAggregationService: ExpenseAggregationService) {}

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
        or: '(and(btxn_transaction_dt.gte.2021-06-29T00:00:00.000Z,btxn_transaction_dt.lt.2021-09-27T23:59:59.999Z))',
        order: 'btxn_transaction_dt.desc,ba_id.desc',
      },
    });
  }

  getBankTransactionsCount(queryParams) {
    const parms = {
      limit: 10,
      offset: 0,
      queryParams,
    };
    return this.getBankTransactions(parms).pipe(map((res) => res.count));
  }
}
