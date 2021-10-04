import { Component, OnInit } from '@angular/core';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { noop, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { map, tap } from 'lodash';

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

  matchedExpensesCount$;

  constructor(
    private personalCardsService: PersonalCardsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService
  ) {
    // this.txnDetails = this.router.getCurrentNavigation().extras.state.txnDetails;
    // console.log(this.txnDetails);

    const json = `{
      "_search_document": "'051':7 '200':1 'buffalo':3,8 'debit':11 'gs':6 'usd':2 'wild':4,9 'win':5 'wings':10",
      "ba_account_number": "xxxx4197",
      "ba_bank_name": "Dag Site",
      "ba_id": "baccU732N6WS7v",
      "ba_mask": "4197",
      "ba_nickname": "Robin",
      "btxn_amount": 200,
      "btxn_created_at": "2021-09-27T10:57:18.426303",
      "btxn_currency": "USD",
      "btxn_description": "BUFFALO WILD WIN GS 051",
      "btxn_external_id": "29792604",
      "btxn_id": "btxnzgTFWmuq1P",
      "btxn_orig_amount": null,
      "btxn_orig_currency": null,
      "btxn_status": "INITIALIZED",
      "btxn_transaction_dt": "2021-09-20T10:00:00",
      "btxn_transaction_type": "debit",
      "btxn_updated_at": "2021-09-27T10:57:20.426307",
      "btxn_vendor": "Buffalo Wild Wings",
      "tx_matched_at": null,
      "tx_split_group_id": null,
      "txn_details": null
  }`;

    this.txnDetails = JSON.parse(json);
    console.log(this.txnDetails);
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const txnDate = new Date(this.txnDetails.btxn_transaction_dt).toISOString().slice(0, 10);

    this.matchedExpensesCount$ = this.personalCardsService.getMatchedExpensesCount(
      this.txnDetails.btxn_amount,
      txnDate
    );

    this.matchedExpenses$ = this.personalCardsService.getMatchedExpenses(this.txnDetails.btxn_amount, txnDate);

    this.matchedExpenses$.subscribe(noop());
  }

  createExpense() {
    this.router.navigate([
      '/',
      'enterprise',
      'add_edit_expense',
      { bankTxn: JSON.stringify(this.txnDetails), navigate_back: true },
    ]);
  }
}
