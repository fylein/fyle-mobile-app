import { Component, OnInit, Input } from '@angular/core';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensesService as ApproverExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { ExpensesService as SpenderExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';

@Component({
  selector: 'app-navigation-footer',
  templateUrl: './navigation-footer.component.html',
  styleUrls: ['./navigation-footer.component.scss'],
})
export class NavigationFooterComponent implements OnInit {
  @Input() numExpensesInReport: number;

  @Input() activeExpenseIndex: number;

  reportExpenseIds: string[];

  view: ExpenseView;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private trackingService: TrackingService,
    private approverExpensesService: ApproverExpensesService,
    private spenderExpensesService: SpenderExpensesService
  ) {}

  ngOnInit(): void {
    const expenseIds = this.activatedRoute.snapshot.params.txnIds as string;

    this.reportExpenseIds = expenseIds && (JSON.parse(expenseIds) as string[]);

    this.view = this.activatedRoute.snapshot.params.view as ExpenseView;
  }

  goToPrev(expenseIndex?: number): void {
    if (expenseIndex === 0) {
      return;
    }

    const prevIndex = expenseIndex ? expenseIndex - 1 : this.activeExpenseIndex - 1;
    this.trackingService.expenseNavClicked({ to: 'prev' });

    const expenseId = this.reportExpenseIds[prevIndex];
    const expense$ =
      this.view === ExpenseView.team
        ? this.approverExpensesService.getExpenseById(expenseId)
        : this.spenderExpensesService.getExpenseById(expenseId);

    expense$.subscribe((expense) => {
      this.goToExpense(expense, prevIndex);
    });
  }

  goToNext(expenseIndex?: number): void {
    if (expenseIndex === this.numExpensesInReport - 1) {
      return;
    }

    const nextIndex = expenseIndex ? expenseIndex + 1 : this.activeExpenseIndex + 1;
    this.trackingService.expenseNavClicked({ to: 'next' });

    const expenseId = this.reportExpenseIds[nextIndex];
    const expense$ =
      this.view === ExpenseView.team
        ? this.approverExpensesService.getExpenseById(expenseId)
        : this.spenderExpensesService.getExpenseById(expenseId);

    expense$.subscribe((expense) => {
      this.goToExpense(expense, nextIndex);
    });
  }

  goToExpense(expense: Expense, expenseIndex: number): void {
    const category = expense?.category?.name.toLowerCase();

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
