import { Component, Input, OnInit } from '@angular/core';
import { MatchedExpense } from 'src/app/core/models/matched-expense.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';

@Component({
  selector: 'app-expense-card-lite',
  templateUrl: './expense-card-lite.component.html',
  styleUrls: ['./expense-card-lite.component.scss'],
})
export class ExpenseCardLiteComponent implements OnInit {
  @Input() expense: Partial<MatchedExpense>;

  isReceiptPresent: boolean;

  constructor(private expensesService: ExpensesService) {}

  ngOnInit(): void {
    this.getReceipt();
  }

  getReceipt(): void {
    this.expensesService.getExpenseById(this.expense.id).subscribe((expense: Expense) => {
      this.isReceiptPresent = expense.file_ids?.length > 0;
    });
  }
}
