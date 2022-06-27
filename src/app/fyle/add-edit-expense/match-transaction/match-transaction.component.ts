import { Component, Input, OnInit } from '@angular/core';
import { CorporateCardExpense } from '../../../core/models/v2/corporate-card-expense.model';
import { ModalController } from '@ionic/angular';
import { PopupService } from '../../../core/services/popup.service';
import { getCurrencySymbol } from '@angular/common';

@Component({
  selector: 'app-match-transaction',
  templateUrl: './match-transaction.component.html',
  styleUrls: ['./match-transaction.component.scss'],
})
export class MatchTransactionComponent implements OnInit {
  @Input() matchingCCCTransactions: CorporateCardExpense[];

  @Input() mode: string;

  @Input() selectedCCCTransaction: CorporateCardExpense;

  constructor(private modalController: ModalController, private popupService: PopupService) {}

  ngOnInit() {}

  getCurrencySymbol(currencyCode: string): string {
    return getCurrencySymbol(currencyCode, 'narrow');
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  selectCCCExpense(cccExpense: CorporateCardExpense) {
    this.modalController.dismiss({
      selectedCCCExpense: cccExpense,
    });
  }

  selectNotInList() {
    if (this.mode === 'edit') {
      this.modalController.dismiss({
        unMatchedExpense: true,
      });
    } else {
      this.modalController.dismiss({
        selectedCCCExpense: null,
      });
    }
  }
}
