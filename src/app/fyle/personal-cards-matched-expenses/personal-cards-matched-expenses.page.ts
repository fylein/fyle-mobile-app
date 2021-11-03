import { Component, OnInit } from '@angular/core';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ExpensePreviewComponent } from './expense-preview/expense-preview.component';
import * as moment from 'moment';
@Component({
  selector: 'app-personal-cards-matched-expenses',
  templateUrl: './personal-cards-matched-expenses.page.html',
  styleUrls: ['./personal-cards-matched-expenses.page.scss'],
})
export class PersonalCardsMatchedExpensesPage implements OnInit {
  headerState: HeaderState = HeaderState.base;

  navigateBack = true;

  txnDetails: any = {};

  matchedExpenses$;

  constructor(
    private personalCardsService: PersonalCardsService,
    private router: Router,
    private modalController: ModalController
  ) {
    this.txnDetails = this.router.getCurrentNavigation().extras.state.txnDetails;
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const txnDate = moment(this.txnDetails.btxn_transaction_dt).format('yyyy-MM-DD');
    this.personalCardsService.getMatchedExpensesCount(this.txnDetails.btxn_amount, txnDate).subscribe((count) => {
      if (count === 0) {
        this.router.navigate(
          [
            '/',
            'enterprise',
            'add_edit_expense',
            { personalCardTxn: JSON.stringify(this.txnDetails), navigate_back: true },
          ],
          { replaceUrl: true }
        );
      }
    });

    this.matchedExpenses$ = this.personalCardsService.getMatchedExpenses(this.txnDetails.btxn_amount, txnDate);
  }

  createExpense() {
    this.router.navigate([
      '/',
      'enterprise',
      'add_edit_expense',
      { personalCardTxn: JSON.stringify(this.txnDetails), navigate_back: true },
    ]);
  }

  async openExpensePreview(expenseId) {
    const expenseDetailsModal = await this.modalController.create({
      component: ExpensePreviewComponent,
      componentProps: {
        expenseId,
        card: this.txnDetails.ba_account_number,
        cardTxnId: this.txnDetails.btxn_id,
      },
      cssClass: 'expense-preview-modal',
      showBackdrop: true,
      swipeToClose: true,
      backdropDismiss: true,
      animated: true,
    });

    await expenseDetailsModal.present();
  }
}
