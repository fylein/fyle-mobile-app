import { Component, Input } from '@angular/core';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-review-split-expense',
  templateUrl: './review-split-expense.component.html',
  styleUrls: ['./review-split-expense.component.scss'],
})
export class ReviewSplitExpenseComponent {
  @Input() splitExpenses: Expense;

  @Input() reportId: string;

  constructor(private router: Router) {}

  goToTransaction(event: { expense: Expense; expenseIndex: number }): void {
    let category: string;

    if (event.expense?.category?.name) {
      category = event.expense.category.name.toLowerCase();
    }

    if (category === 'mileage') {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_mileage',
        { id: event.expense.id, navigate_back: true, persist_filters: true },
      ]);
    } else if (category === 'per diem') {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_per_diem',
        { id: event.expense.id, navigate_back: true, persist_filters: true },
      ]);
    } else {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_expense',
        { id: event.expense.id, navigate_back: true, persist_filters: true },
      ]);
    }
  }

  close(): void {
    if (this.reportId) {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.reportId }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    }
  }
}
