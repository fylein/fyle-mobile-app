import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsOutboxService {
  transactionQueue = [];

  constructor(
    private storageService: StorageService
  ) { }

  addEntry(transaction, dataUrls?, comments?, reportId?, applyMagic?, receiptsData?) {
    this.transactionQueue.push({
      transaction,
      dataUrls,
      comments,
      reportId,
      applyMagic: !!applyMagic,
      receiptsData
    });

    this.saveQueue();
  }

  saveQueue() {
    this.storageService.set('transaction-outbox', this.transactionQueue);
  }

  getAllQueue() {
    return this.storageService.get('transaction-outbox');
  }

}
