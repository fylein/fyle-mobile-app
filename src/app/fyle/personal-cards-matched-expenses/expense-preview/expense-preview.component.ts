import { Component, Input, OnInit, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular/standalone';
import { finalize, map } from 'rxjs/operators';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { Observable } from 'rxjs';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { ExpensePreviewShimmerComponent } from '../expense-preview-shimmer/expense-preview-shimmer.component';
import { FormButtonValidationDirective } from '../../../shared/directive/form-button-validation.directive';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FyCurrencyPipe } from '../../../shared/pipes/fy-currency.pipe';

@Component({
  selector: 'app-expense-preview',
  templateUrl: './expense-preview.component.html',
  styleUrls: ['./expense-preview.component.scss'],
  imports: [
    IonicModule,
    MatIcon,
    ExpensePreviewShimmerComponent,
    FormButtonValidationDirective,
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    FyCurrencyPipe,
    TranslocoPipe,
  ],
})
export class ExpensePreviewComponent implements OnInit {
  private modalController = inject(ModalController);

  private personalCardsService = inject(PersonalCardsService);

  private router = inject(Router);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private platform = inject(Platform);

  private trackingService = inject(TrackingService);

  private expensesService = inject(ExpensesService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() expenseId: string;

  readonly card = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() cardTxnId: string;

  expenseDetails$: Observable<Expense>;

  loading = false;

  type: string;

  isIos = false;

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
