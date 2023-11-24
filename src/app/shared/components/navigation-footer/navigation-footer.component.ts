import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';

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
    private expenseService: ExpensesService,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    this.reportEtxnIds = (this.activatedRoute.snapshot.params.txnIds &&
      JSON.parse(this.activatedRoute.snapshot.params.txnIds as string)) as string[];
  }

  goToPrev(expenseIndex?: number): void {
    if (expenseIndex === 0) {
      return;
    }

    const prevIndex = expenseIndex ? expenseIndex - 1 : this.activeEtxnIndex - 1;
    this.trackingService.expenseNavClicked({ to: 'prev' });
    this.expenseService.getExpenseById(this.reportEtxnIds[prevIndex]).subscribe((expense) => {
      this.goToTransaction(expense, prevIndex);
    });
  }

  goToNext(expenseIndex?: number): void {
    if (expenseIndex === this.numEtxnsInReport - 1) {
      return;
    }

    const nextIndex = expenseIndex ? expenseIndex + 1 : this.activeEtxnIndex + 1;
    this.trackingService.expenseNavClicked({ to: 'next' });
    this.expenseService.getExpenseById(this.reportEtxnIds[nextIndex]).subscribe((expense) => {
      this.goToTransaction(expense, nextIndex);
    });
  }

  goToTransaction(expense: Expense, expenseIndex: number): void {
    const category = expense && expense.category.name && expense.category.name.toLowerCase();

    let route: string;
    if (category === 'mileage') {
      route = '/enterprise/view_mileage';
    } else if (category === 'per diem') {
      route = '/enterprise/view_per_diem';
    } else {
      route = '/enterprise/view_expense';
    }
    this.router.navigate([
      route,
      { ...this.activatedRoute.snapshot.params, id: expense.id, activeIndex: expenseIndex },
    ]);
  }
}
