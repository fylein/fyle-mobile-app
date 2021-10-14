import { Component, OnInit } from '@angular/core';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ExpensePreviewComponent } from './expense-preview/expense-preview.component';

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
    // const txnDetailsJson = this.router.getCurrentNavigation().extras.state.txnDetails;

    const txnDetailsJson = `{
      "_search_document": "'051':7 '200':1 'buffalo':3,8 'debit':11 'gs':6 'usd':2 'wild':4,9 'win':5 'wings':10",
      "ba_account_number": "xxxx4197",
      "ba_bank_name": "Dag Site",
      "ba_id": "baccU732N6WS7v",
      "ba_mask": "4197",
      "ba_nickname": "Robin",
      "btxn_amount": 200,
      "btxn_created_at": "2021-10-04T05:23:03.958432",
      "btxn_currency": "USD",
      "btxn_description": "BUFFALO WILD WIN GS 051",
      "btxn_external_id": "30040541",
      "btxn_id": "btxnpN7aFw4YtJ",
      "btxn_orig_amount": null,
      "btxn_orig_currency": null,
      "btxn_status": "INITIALIZED",
      "btxn_transaction_dt": "2021-09-20T10:00:00",
      "btxn_transaction_type": "debit",
      "btxn_updated_at": "2021-10-04T05:23:03.958436",
      "btxn_vendor": "Buffalo Wild Wings",
      "tx_matched_at": null,
      "tx_split_group_id": null,
      "txn_details": null
    }`;
    this.txnDetails = JSON.parse(txnDetailsJson);
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const txnDate = new Date(this.txnDetails.btxn_transaction_dt).toISOString().slice(0, 10);
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
