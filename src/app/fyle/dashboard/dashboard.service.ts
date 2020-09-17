import { Injectable } from '@angular/core';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Injectable()
export class DashboardService {

  constructor(
    private transactionService: TransactionService
  ) { }

  getreadyToReportStats = function () {
    return this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('all'));
  };

   
}