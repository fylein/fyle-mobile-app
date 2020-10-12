import { Injectable } from '@angular/core';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardService {

  dashBoardState$: BehaviorSubject<string> = new BehaviorSubject('default');

  constructor(
    private transactionService: TransactionService
  ) { }

  getreadyToReportStats() {
    return this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('all'));
  }

  setDashBoardState(state: string) {
    this.dashBoardState$.next(state);
  }

  getDashBoardState() {
    return this.dashBoardState$.asObservable();
  }

}