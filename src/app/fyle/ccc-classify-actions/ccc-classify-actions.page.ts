import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CorporateCardExpense} from '../../core/models/corporate-card-expense.model';
import {Observable} from 'rxjs';
import {CorporateCreditCardExpenseService} from '../../core/services/corporate-credit-card-expense.service';
import {ExpenseSuggestionsService} from '../../core/services/expense-suggestions.service';
import {switchMap} from 'rxjs/operators';
import {ExpenseSuggestion} from '../../core/models/expense-suggestion.model';
import {PopupService} from '../../core/services/popup.service';
import {TransactionService} from '../../core/services/transaction.service';
import {PopoverController} from '@ionic/angular';
import {MatchExpensePopoverComponent} from './match-expense-popover/match-expense-popover.component';
import {LoaderService} from '../../core/services/loader.service';

@Component({
  selector: 'app-ccc-classify-actions',
  templateUrl: './ccc-classify-actions.page.html',
  styleUrls: ['./ccc-classify-actions.page.scss'],
})
export class CccClassifyActionsPage implements OnInit {

  cccExpense$: Observable<CorporateCardExpense>;
  expenseSuggestions$: Observable<ExpenseSuggestion[]>;
  pageState: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private expenseSuggestionsService: ExpenseSuggestionsService,
    private router: Router,
    private popupService: PopupService,
    private popoverController: PopoverController,
    private transactionService: TransactionService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.activatedRoute.snapshot.params.pageState) {
      this.pageState = this.activatedRoute.snapshot.params.pageState;
    }

    this.cccExpense$ = this.corporateCreditCardExpenseService.getv2CardTransaction(this.activatedRoute.snapshot.params.cccTransactionId);
    this.expenseSuggestions$ = this.cccExpense$.pipe(
      switchMap(cccExpense => {
        return this.expenseSuggestionsService.getSuggestions({
          amount: cccExpense.amount,
          txn_dt: cccExpense.txn_dt
        });
      })
    );
  }

  addExpenseManually(cccTxn: CorporateCardExpense) {
    const bankTxn = {
      ccce: cccTxn,
      flow: 'newCCCFlow'
    };

    this.router.navigate(['/', 'enterprise', 'add_edit_expense', { bankTxn: JSON.stringify(bankTxn), navigate_back: true }]);
  }

  async openDismissalPopover(cccTxn: CorporateCardExpense) {
    const popupResult = await this.popupService.showPopup({
      header: 'Confirm Dismissal',
      message: 'Usually credit card payments are dismissed as they are paid by your company. Do you wish to dismiss this transaction?',
      primaryCta: {
        text: 'Yes, Dismiss'
      },
      secondaryCta: {
        text: 'Cancel'
      },
      cssClass: 'ccc-popup',
      showCancelButton: false
    });

    if (popupResult === 'primary') {
      await this.loaderService.showLoader();
      await this.corporateCreditCardExpenseService.dismissCreditTransaction(cccTxn.id).toPromise();
      await this.loaderService.hideLoader();
      this.router.navigate(['/', 'enterprise', 'corporate_card_expenses']);
    }
  }

  async openMarkPersonalPopover(cccTxn: CorporateCardExpense) {
    const popupResult = await this.popupService.showPopup({
      header: 'Confirm Marking Personal',
      message: 'A personal transaction made on the corporate card will not be paid by your company. Your finance team\n' +
        '        will collect this amount from you based on your company\'s policy. Do you wish to classify this as a\n' +
        '        personal transaction?',
      primaryCta: {
        text: 'Classify As Personal'
      },
      secondaryCta: {
        text: 'Cancel'
      },
      cssClass: 'ccc-popup',
      showCancelButton: false
    });

    console.log(popupResult);

    if (popupResult === 'primary') {
      await this.loaderService.showLoader();
      await this.corporateCreditCardExpenseService.markPersonal(cccTxn.id).toPromise();
      await this.loaderService.hideLoader();
      this.router.navigate(['/', 'enterprise', 'corporate_card_expenses']);
    }
  }

  async openMatchExpensePopover(expense: ExpenseSuggestion) {
    const cccExpense = await this.cccExpense$.toPromise();
    const popover = await this.popoverController.create({
      component: MatchExpensePopoverComponent,
      cssClass: 'dialog-popover',
      componentProps: {
        splitGroupId: expense.split_group_id,
        cccGroupId: cccExpense.group_id
      }
    });

    await popover.present();
  }
}
