import { Component, OnInit, Input } from '@angular/core';
import { Expense } from 'src/app/core/models/expense.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-navigation-footer',
  templateUrl: './navigation-footer.component.html',
  styleUrls: ['./navigation-footer.component.scss'],
})
export class NavigationFooterComponent implements OnInit {
  @Input() numEtxnsInReport: number;

  @Input() activeEtxnIndex: number;

  reportEtxnIds: string[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private trackingService: TrackingService
  ) {}

  ngOnInit() {
    this.reportEtxnIds =
      this.activatedRoute.snapshot.params.txnIds && JSON.parse(this.activatedRoute.snapshot.params.txnIds);
  }

  goToPrev(etxnIndex?: number) {
    if (etxnIndex === 0) {
      return;
    }

    const prevIndex = etxnIndex ? etxnIndex - 1 : this.activeEtxnIndex - 1;
    this.trackingService.expenseNavClicked({ to: 'prev' });
    this.transactionService.getEtxn(this.reportEtxnIds[prevIndex]).subscribe((etxn) => {
      this.goToTransaction(etxn, prevIndex, 'prev');
    });
  }

  goToNext(etxnIndex?: number) {
    if (etxnIndex === this.numEtxnsInReport - 1) {
      return;
    }

    const nextIndex = etxnIndex ? etxnIndex + 1 : this.activeEtxnIndex + 1;
    this.trackingService.expenseNavClicked({ to: 'next' });
    this.transactionService.getEtxn(this.reportEtxnIds[nextIndex]).subscribe((etxn) => {
      this.goToTransaction(etxn, nextIndex, 'next');
    });
  }

  goToTransaction(etxn: Expense, etxnIndex: number, goTo: 'prev' | 'next') {
    const category = etxn && etxn.tx_org_category && etxn.tx_org_category.toLowerCase();

    if (category === 'activity') {
      if (goTo === 'next') {
        this.goToNext(etxnIndex);
      } else {
        this.goToPrev(etxnIndex);
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
    this.router.navigate([route, { ...this.activatedRoute.snapshot.params, id: etxn.tx_id, activeIndex: etxnIndex }]);
  }
}
