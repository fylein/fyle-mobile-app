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
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-expense-preview',
  templateUrl: './expense-preview.component.html',
  styleUrls: ['./expense-preview.component.scss'],
})
export class ExpensePreviewComponent implements OnInit {
  @Input() expenseId: string;

  @Input() card: string;

  @Input() cardTxnId: string;

  expenseDetails$: Observable<Expense>;

  loading = false;

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
    private expensesService: ExpensesService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.isIos = this.platform.is('ios');
  }

  ionViewWillEnter(): void {
    const params = {
      split_group_id: `eq.${this.expenseId}`,
    };

    this.expenseDetails$ = this.expensesService.getExpenses(params).pipe(map((res) => res[0]));
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

  matchExpense(): void {
    this.loading = true;
    this.personalCardsService
      .matchExpense(this.expenseId, this.cardTxnId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.modalController.dismiss();
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', {
            message: this.translocoService.translate('expensePreview.successfullyMatched'),
          }),
          panelClass: ['msb-success'],
        });
        this.router.navigate(['/', 'enterprise', 'personal_cards'], { queryParams: { refresh: true } });
        this.trackingService.oldExpensematchedFromPersonalCard();
      });
  }

  editExpense(): void {
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
