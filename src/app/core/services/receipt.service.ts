import {Injectable} from '@angular/core';
import {ApiV2Service} from './api-v2.service';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  constructor(
    private apiv2Service: ApiV2Service,
    private apiService: ApiService
  ) { }

  getReceiptsWithNoMatchingExpensesByState(orgUserId, state) {
    const params = {
      org_user_id: 'eq.' + orgUserId,
      extraction_state: 'eq.' + state,
      transaction_id: 'is.null'
    };
    const data = {
      params
    };
    return this.apiv2Service.get('/receipts', data);
  }

  getReceiptById(receiptId) {
    const params = {
      id: 'eq.' + receiptId
    };
    const data = {
      params
    };
    return this.apiv2Service.get('/receipts', data);
  }

  deleteReceipts(deleteReceiptPayload) {
    return this.apiService.post('/receipts/delete/bulk', deleteReceiptPayload);
  }

  linkReceiptWithExpense(receiptId, linkReceiptPayload) {
    return this.apiService.post('/receipts/' + receiptId + '/link', linkReceiptPayload);
  }

  uploadReceipt(receiptPayload) {
    return this.apiService.post('/receipts/upload', receiptPayload);
  }
}
