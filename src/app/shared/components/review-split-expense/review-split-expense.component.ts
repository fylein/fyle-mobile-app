import { Component, inject, input } from '@angular/core';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { MatIcon } from '@angular/material/icon';
import { ExpensesCardComponent } from '../expenses-card-v2/expenses-card.component';
import { TranslocoPipe } from '@jsverse/transloco';
@Component({
  selector: 'app-review-split-expense',
  templateUrl: './review-split-expense.component.html',
  styleUrls: ['./review-split-expense.component.scss'],
  imports: [
    ExpensesCardComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    MatIcon,
    TranslocoPipe
  ],
})
export class ReviewSplitExpenseComponent {
  private modalController = inject(ModalController);

  readonly splitExpenses = input<Expense[]>([]);

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
