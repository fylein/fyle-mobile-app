import { Component, OnInit, Input, inject } from '@angular/core';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensesService as ApproverExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { ExpensesService as SpenderExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { Observable } from 'rxjs';
import { FyNavFooterComponent } from './fy-nav-footer/fy-nav-footer.component';

@Component({
  selector: 'app-navigation-footer',
  templateUrl: './navigation-footer.component.html',
  styleUrls: ['./navigation-footer.component.scss'],
  imports: [FyNavFooterComponent],
})
export class NavigationFooterComponent implements OnInit {
  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);

  private trackingService = inject(TrackingService);

  private approverExpensesService = inject(ApproverExpensesService);

  private spenderExpensesService = inject(SpenderExpensesService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() reportExpenseCount: number;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() activeExpenseIndex: number;

  reportExpenseIds: string[];

  view: ExpenseView;

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
    this.getExpense(expenseId).subscribe((expense) => {
      this.goToExpense(expense, prevIndex);
    });
  }

  goToNext(expenseIndex?: number): void {
    if (expenseIndex === this.reportExpenseCount - 1) {
      return;
    }

    const nextIndex = expenseIndex ? expenseIndex + 1 : this.activeExpenseIndex + 1;
    this.trackingService.expenseNavClicked({ to: 'next' });

    const expenseId = this.reportExpenseIds[nextIndex];
    this.getExpense(expenseId).subscribe((expense) => {
      this.goToExpense(expense, nextIndex);
    });
  }

  getExpense(expenseId: string): Observable<Expense> {
    return this.view === ExpenseView.team
      ? this.approverExpensesService.getExpenseById(expenseId)
      : this.spenderExpensesService.getExpenseById(expenseId);
  }

  goToExpense(expense: Expense, expenseIndex: number): void {
    const category = expense.category.name.toLowerCase();

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
