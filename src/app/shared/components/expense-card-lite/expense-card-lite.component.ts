import { Component, Input, OnInit } from '@angular/core';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

@Component({
  selector: 'app-expense-card-lite',
  templateUrl: './expense-card-lite.component.html',
  styleUrls: ['./expense-card-lite.component.scss'],
  standalone: false,
})
export class ExpenseCardLiteComponent implements OnInit {
  @Input() expense: Expense;

  isReceiptPresent: boolean;

  ngOnInit(): void {
    this.getReceipt();
  }

  getReceipt(): void {
    this.isReceiptPresent = this.expense.file_ids?.length > 0;
  }
}
