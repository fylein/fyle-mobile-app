import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-expense-preview',
  templateUrl: './expense-preview.component.html',
  styleUrls: ['./expense-preview.component.scss'],
})
export class ExpensePreviewComponent implements OnInit {
  @Input() expenseId;

  @Input() card;

  @Input() cardTxnId;

  expenseDetails$;

  loading = false;

  unMatching = false;

  type: string;

  isIos = false;

  constructor(
    private modalController: ModalController,
    private personalCardsService: PersonalCardsService,
    private router: Router,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private platform: Platform,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    this.isIos = this.platform.is('ios');
  }

  ionViewWillEnter() {
    this.expenseDetails$ = this.personalCardsService.getExpenseDetails(this.expenseId);
  }

  closeModal() {
    this.modalController.dismiss();
  }

  matchExpense() {
    this.loading = true;
    this.personalCardsService
      .matchExpense(this.expenseId, this.cardTxnId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.modalController.dismiss();
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message: 'Successfully matched the expense.' }),
          panelClass: ['msb-success'],
        });
        this.router.navigate(['/', 'enterprise', 'personal_cards']);
        this.trackingService.oldExpensematchedFromPersonalCard();
      });
  }

  unmatchExpense() {
    this.unMatching = true;
    this.personalCardsService
      .unmatchExpense(this.expenseId, this.cardTxnId)
      .pipe(finalize(() => (this.unMatching = false)))
      .subscribe(() => {
        this.modalController.dismiss();
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', {
            message: 'Successfully unmatched the expense.',
          }),
          panelClass: ['msb-success'],
        });
        this.router.navigate(['/', 'enterprise', 'personal_cards']);
        this.trackingService.unmatchedExpensesFromPersonalCard();
      });
  }

  editExpense() {
    this.modalController.dismiss();
    this.router.navigate([
      '/',
      'enterprise',
      'add_edit_expense',
      {
        id: this.expenseId,
        navigate_back: true,
      },
    ]);
  }
}
