import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { finalize, map } from 'rxjs/operators';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { Observable } from 'rxjs';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

@Component({
  selector: 'app-expense-preview',
  templateUrl: './expense-preview.component.html',
  styleUrls: ['./expense-preview.component.scss'],
})
export class ExpensePreviewComponent implements OnInit {
  @Input() expenseId;

  @Input() card;

  @Input() cardTxnId;

  expenseDetails$: Observable<Expense>;

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
    private trackingService: TrackingService,
    private expensesService: ExpensesService
  ) {}

  ngOnInit(): void {
    this.isIos = this.platform.is('ios');
  }

  ionViewWillEnter() {
    const params = {
      split_group_id: `eq.${this.expenseId}`,
    };

    this.expenseDetails$ = this.expensesService.getExpenses(params).pipe(map((res) => res[0]));
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
