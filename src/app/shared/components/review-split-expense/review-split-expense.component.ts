import { Component, Input } from '@angular/core';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-review-split-expense',
  templateUrl: './review-split-expense.component.html',
  styleUrls: ['./review-split-expense.component.scss'],
})
export class ReviewSplitExpenseComponent {
  @Input() splitExpenses: Expense[];

  constructor(private modalController: ModalController) {}

  goToTransaction(event: { expense: Expense; expenseIndex: number }): void {
    this.modalController.dismiss({
      dismissed: true,
      action: 'navigate',
      expense: event.expense,
    });
  }

  close(): void {
    this.modalController.dismiss({
      dismissed: true,
      action: 'close',
    });
  }
}
