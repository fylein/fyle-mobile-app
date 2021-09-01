import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CorporateCreditCardExpenseSuggestionsService {
  constructor(private apiService: ApiService) {}

  getSuggestions(queryParams) {
    const data: any = {
      params: {
        amount: queryParams.amount,
        txn_dt: moment(queryParams.txn_dt).format('yyyy-MM-DD'),
      },
    };

    if (queryParams.orgUserId) {
      data.params.org_user_id = queryParams.orgUserId;
    }
    return this.apiService.get('/corporate_credit_card_expense_suggestions', data);
  }
}
