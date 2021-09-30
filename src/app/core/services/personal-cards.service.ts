import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PersonalCard } from '../models/personal_card.model';
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

  getToken(): Observable<any> {
    return this.expenseAggregationService.get('/yodlee/access_token');
  }

  htmlFormUrl(url, access_token) {
    const pageContent = `<form id="fastlink-form" name="fastlink-form" action="${url}" method="POST">
                          <input name="accessToken" value="Bearer ${access_token}" hidden="true" />
                          <input  name="extraParams" value="configName=Aggregation&callback=https://www.fylehq.com" hidden="true" />
                          </form> 
                          <script type="text/javascript">
                          document.getElementById("fastlink-form").submit();
                          </script>
                          `;
    const pageContentUrl = 'data:text/html;base64,' + btoa(pageContent);
    return pageContentUrl;
  }

  postBankAccounts(requestIds): Observable<any> {
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

  deleteAccount(accountid): Observable<any> {
    return this.expenseAggregationService.delete('/bank_accounts/' + accountid);
  }
}
