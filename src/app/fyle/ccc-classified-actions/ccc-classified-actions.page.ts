import { Component, OnInit } from '@angular/core';
import { CorporateCreditCardExpenseService } from '../../core/services/corporate-credit-card-expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Observable } from 'rxjs';
import { CorporateCardExpense } from '../../core/models/v2/corporate-card-expense.model';
import { finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { TxnDetail } from '../../core/models/v2/txn-detail.model';
import { PopupService } from '../../core/services/popup.service';
import { LoaderService } from '../../core/services/loader.service';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-ccc-classified-actions',
  templateUrl: './ccc-classified-actions.page.html',
  styleUrls: ['./ccc-classified-actions.page.scss']
})
export class CccClassifiedActionsPage implements OnInit {
  cccExpense$: Observable<CorporateCardExpense>;

  matchedExpense$: Observable<TxnDetail[]>;

  isCCCMatched$: Observable<boolean>;

  canUnmatch$: Observable<boolean>;

  canUnmarkPersonal$: Observable<boolean>;

  canUndoDismissal$: Observable<boolean>;

  collectedBack$: Observable<boolean>;

  pageState: string;

  constructor(
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private activatedRoute: ActivatedRoute,
    private popupService: PopupService,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cccExpense$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() =>
        this.corporateCreditCardExpenseService.getv2CardTransaction(
          this.activatedRoute.snapshot.params.cccTransactionId
        )
      ),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.matchedExpense$ = this.cccExpense$.pipe(map((cccExpense) => cccExpense.txn_details));
    this.isCCCMatched$ = this.cccExpense$.pipe(map((cccExpense) => !!cccExpense.matched_by));
    this.canUnmatch$ = this.cccExpense$.pipe(
      switchMap((cccExpense) =>
        this.matchedExpense$.pipe(
          map(
            (matchedExpense) =>
              !!cccExpense.matched_by &&
              cccExpense.state !== 'SETTLED' &&
              cccExpense.state === 'IN_PROGRESS' &&
              matchedExpense.every((expense) => ['COMPLETE', 'DRAFT'].indexOf(expense.state) > -1)
          )
        )
      )
    );
    this.canUnmarkPersonal$ = this.cccExpense$.pipe(
      map((cccExpense) => !cccExpense.matched_by && cccExpense.state === 'IN_PROGRESS' && cccExpense.personal)
    );
    this.canUndoDismissal$ = this.cccExpense$.pipe(
      map(
        (cccExpense) =>
          !cccExpense.matched_by &&
          cccExpense.state === 'SETTLED' &&
          cccExpense.ignored &&
          !cccExpense.balance_transfer_id
      )
    );
    this.collectedBack$ = this.cccExpense$.pipe(
      map((cccExpense) => cccExpense.state === 'SETTLED' && !!cccExpense.balance_transfer_id)
    );
  }

  async unmarkExpense(cccExpense: CorporateCardExpense) {
    const popupResult = await this.popupService.showPopup({
      header: 'Are you sure you want to Unmark',
      // eslint-disable-next-line max-len
      message:
        'This transaction will be moved back to the <strong>Unclassified</strong> tab where you can classify it later. Are you sure you want to proceed?',
      primaryCta: {
        text: 'Yes, Unmark'
      },
      secondaryCta: {
        text: 'Cancel'
      },
      cssClass: 'ccc-popup',
      showCancelButton: false
    });

    if (popupResult === 'primary') {
      await this.loaderService.showLoader();
      await this.corporateCreditCardExpenseService.unmarkPersonal(cccExpense.group_id).toPromise();
      await this.loaderService.hideLoader();
      this.router.navigate(['/', 'enterprise', 'ccc_classify_actions', { cccTransactionId: cccExpense.id }]);
    }
  }

  async undoDismissal(cccExpense: CorporateCardExpense) {
    const popupResult = await this.popupService.showPopup({
      header: 'Are you sure you want to Undo',
      // eslint-disable-next-line max-len
      message:
        'This transaction will be moved back to the <strong>Unclassified</strong> tab where you can classify it later. Are you sure you want to proceed?',
      primaryCta: {
        text: 'Yes, Undo'
      },
      secondaryCta: {
        text: 'Cancel'
      },
      cssClass: 'ccc-popup',
      showCancelButton: false
    });

    if (popupResult === 'primary') {
      await this.loaderService.showLoader();
      await this.corporateCreditCardExpenseService.undoDismissedCreditTransaction(cccExpense.id).toPromise();
      await this.loaderService.hideLoader();
      this.router.navigate(['/', 'enterprise', 'ccc_classify_actions', { cccTransactionId: cccExpense.id }]);
    }
  }

  async unmatchExpense(cccExpense: CorporateCardExpense) {
    const popupResult = await this.popupService.showPopup({
      header: 'Are you sure you want to Unmatch ?',
      // eslint-disable-next-line max-len
      message:
        'This transaction will be moved to the Unclassified tab where you can classify it later. Are you sure you want to unmatch this transaction?',
      primaryCta: {
        text: 'Yes, Unmatch'
      },
      secondaryCta: {
        text: 'Cancel'
      },
      cssClass: 'ccc-popup',
      showCancelButton: false
    });

    if (popupResult === 'primary') {
      await this.loaderService.showLoader();
      await this.transactionService.unmatchCCCExpense(cccExpense.txn_details[0].id, cccExpense.id).toPromise();
      await this.loaderService.hideLoader();
      this.router.navigate(['/', 'enterprise', 'ccc_classify_actions', { cccTransactionId: cccExpense.id }]);
    }
  }
}
