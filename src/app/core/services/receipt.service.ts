import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ReceiptService {
  constructor(private apiService: ApiService) {}

  linkReceiptWithExpense(receiptId, linkReceiptPayload) {
    return this.apiService.post('/receipts/' + receiptId + '/link', linkReceiptPayload);
  }
}
