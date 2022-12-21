import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import * as dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseSuggestionsService {
  constructor(private apiService: ApiService) {}

  getSuggestions(queryParams) {
    const data: any = {
      params: {
        amount: queryParams.amount,
        txn_dt: dayjs(queryParams.txn_dt).format('YYYY-MM-DD'),
      },
    };

    if (queryParams.orgUserId) {
      data.params.org_user_id = queryParams.orgUserId;
    }
    return this.apiService.get('/expense_suggestions', data);
  }
}
