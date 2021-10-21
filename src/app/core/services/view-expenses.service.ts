import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';
import { TrackingService } from './tracking.service';

@Injectable({
  providedIn: 'root',
})
export class ViewExpensesService {
  activeEtxnIdx = 0;

  etxns$: Observable<Expense[]>;

  view: 'Team' | 'Individual';

  numEtxns: number;

  callingEtxnIdx: number;

  constructor(private router: Router, private trackingService: TrackingService) {}

  getNumEtxns() {
    this.etxns$?.subscribe((etxns) => (this.numEtxns = etxns.length));
    return this.numEtxns;
  }

  setActiveIdx(activeIdx: number) {
    this.activeEtxnIdx = activeIdx;
    this.callingEtxnIdx = activeIdx;
  }

  gotoPrev() {
    if (this.activeEtxnIdx === 0) {
      this.activeEtxnIdx = this.callingEtxnIdx;
    } else {
      this.activeEtxnIdx--;
      this.trackingService.expenseNavClicked({ to: 'prev' });
    }
    this.etxns$?.subscribe((etxns) => this.goToEtxn(etxns[this.activeEtxnIdx], 'prev'));
  }

  goToNext() {
    if (this.activeEtxnIdx >= this.numEtxns - 1) {
      this.activeEtxnIdx = this.callingEtxnIdx;
    } else {
      this.activeEtxnIdx++;
      this.trackingService.expenseNavClicked({ to: 'next' });
    }
    this.etxns$?.subscribe((etxns) => this.goToEtxn(etxns[this.activeEtxnIdx], 'next'));
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
    this.callingEtxnIdx = this.activeEtxnIdx;
    this.router.navigate([route, { id: etxn.tx_id }]);
  }
}
