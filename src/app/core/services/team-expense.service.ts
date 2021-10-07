import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class TeamExpenseService {
  activeEtxnIdx = 0;

  etxns$: Observable<Expense[]>;

  constructor(private router: Router) {}

  getNumEtxns() {
    let numEtxns: number;
    this.etxns$?.subscribe((etxns) => (numEtxns = etxns.length));
    return numEtxns;
  }

  gotoPrev() {
    this.etxns$?.subscribe((etxns) => this.goToEtxn(etxns[this.activeEtxnIdx - 1]));
    this.activeEtxnIdx--;
  }

  goToNext() {
    this.etxns$?.subscribe((etxns) => this.goToEtxn(etxns[this.activeEtxnIdx + 1]));
    this.activeEtxnIdx++;
  }

  goToEtxn(etxn: Expense) {
    let category: string;
    if (etxn.tx_org_category) {
      category = etxn.tx_org_category.toLowerCase();
    }
    let route: string;
    if (category === 'mileage') {
      route = '/enterprise/view_team_mileage';
    } else if (category === 'per diem') {
      route = '/enterprise/view_team_per_diem';
    } else {
      route = '/enterprise/view_team_expense';
    }
    this.router.navigate([route, { id: etxn.tx_id }]);
  }
}
