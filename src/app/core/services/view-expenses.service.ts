import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';
import { TrackingService } from './tracking.service';

@Injectable({
  providedIn: 'root',
})
export class ViewExpensesService {
  activeEtxnIndex = 0;

  etxns$: Observable<Expense[]>;

  view: 'Team' | 'Individual';

  numEtxns: number;

  callingEtxnIndex: number;

  constructor(private router: Router, private trackingService: TrackingService) {}

  getNumEtxns() {
    this.etxns$?.subscribe((etxns) => (this.numEtxns = etxns.length));
    return this.numEtxns;
  }

  setActiveIdx(activeIndex: number) {
    this.activeEtxnIndex = activeIndex;
    this.callingEtxnIndex = activeIndex;
  }

  gotoPrev() {
    if (this.activeEtxnIndex === 0) {
      this.activeEtxnIndex = this.callingEtxnIndex;
    } else {
      this.activeEtxnIndex--;
      this.trackingService.expenseNavClicked({ to: 'prev' });
    }
    this.etxns$?.subscribe((etxns) => this.goToEtxn(etxns[this.activeEtxnIndex], 'prev'));
  }

  goToNext() {
    if (this.activeEtxnIndex >= this.numEtxns - 1) {
      this.activeEtxnIndex = this.callingEtxnIndex;
    } else {
      this.activeEtxnIndex++;
      this.trackingService.expenseNavClicked({ to: 'next' });
    }
    this.etxns$?.subscribe((etxns) => this.goToEtxn(etxns[this.activeEtxnIndex], 'next'));
  }

  goToEtxn(etxn: Expense, goTo?: 'next' | 'prev') {
    const category = etxn && etxn.tx_org_category && etxn.tx_org_category.toLowerCase();
    if (category === 'activity') {
      if (goTo === 'next') {
        this.goToNext();
      } else {
        this.gotoPrev();
      }
      return;
    }

    let route: string;
    if (category === 'mileage') {
      route = '/enterprise/view_mileage';
    } else if (category === 'per diem') {
      route = '/enterprise/view_per_diem';
    } else {
      route = '/enterprise/view_expense';
    }
    this.callingEtxnIndex = this.activeEtxnIndex;
    this.router.navigate([route, { id: etxn.tx_id }]);
  }
}
