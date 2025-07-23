import { Component } from '@angular/core';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ExpensePreviewComponent } from './expense-preview/expense-preview.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PlatformPersonalCardTxn } from 'src/app/core/models/platform/platform-personal-card-txn.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { PlatformPersonalCard } from 'src/app/core/models/platform/platform-personal-card.model';
@Component({
  selector: 'app-personal-cards-matched-expenses',
  templateUrl: './personal-cards-matched-expenses.page.html',
  styleUrls: ['./personal-cards-matched-expenses.page.scss'],
  standalone: false,
})
export class PersonalCardsMatchedExpensesPage {
  headerState: HeaderState = HeaderState.base;

  navigateBack = true;

  personalCard: PlatformPersonalCard;

  txnDetails: PlatformPersonalCardTxn;

  expenseSuggestions: Expense[];

  constructor(
    private router: Router,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService
  ) {
    this.personalCard = this.router.getCurrentNavigation().extras.state.personalCard as PlatformPersonalCard;
    this.txnDetails = this.router.getCurrentNavigation().extras.state.txnDetails as PlatformPersonalCardTxn;
    this.expenseSuggestions = this.router.getCurrentNavigation().extras.state.expenseSuggestions as Expense[];
  }

  createExpense(): void {
    this.router.navigate([
      '/',
      'enterprise',
      'add_edit_expense',
      { personalCardTxn: JSON.stringify(this.txnDetails), navigate_back: true },
    ]);
  }

  async openExpensePreview(expenseId: string): Promise<void> {
    const expenseDetailsModal = await this.modalController.create({
      component: ExpensePreviewComponent,
      componentProps: {
        expenseId,
        card: this.personalCard.card_number,
        cardTxnId: this.txnDetails.id,
        type: 'match',
      },
      ...this.modalProperties.getModalDefaultProperties('expense-preview-modal'),
    });

    await expenseDetailsModal.present();
  }
}
