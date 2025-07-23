import { Component, Input } from '@angular/core';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ModalController, IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';
import { ExpensesCardComponent } from '../expenses-card-v2/expenses-card.component';
import { TranslocoPipe } from '@jsverse/transloco';
@Component({
    selector: 'app-review-split-expense',
    templateUrl: './review-split-expense.component.html',
    styleUrls: ['./review-split-expense.component.scss'],
    imports: [
        IonicModule,
        MatIcon,
        ExpensesCardComponent,
        TranslocoPipe,
    ],
})
export class ReviewSplitExpenseComponent {
  @Input() splitExpenses: Expense[];

  constructor(private modalController: ModalController) {}

  goToExpense(event: { expense: Expense; expenseIndex: number }): void {
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
