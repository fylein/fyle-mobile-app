import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgModel, FormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { Observable, Subscription, of } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { ExpensesCardComponent } from '../expenses-card-v2/expenses-card.component';
import { FormButtonValidationDirective } from '../../directive/form-button-validation.directive';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';

@Component({
  selector: 'app-create-new-report',
  templateUrl: './create-new-report.component.html',
  styleUrls: ['./create-new-report.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    MatIcon,
    NgClass,
    FormsModule,
    MatCheckbox,
    ExpensesCardComponent,
    FormButtonValidationDirective,
    TranslocoPipe,
    ExactCurrencyPipe,
  ],
})
export class CreateNewReportComponent implements OnInit {
  @Input() selectedExpensesToReport: Expense[];

  @ViewChild('reportTitleInput') reportTitleInput: NgModel;

  expenseFields$: Observable<Partial<ExpenseFieldsMap>>;

  selectedElements: Expense[];

  selectedTotalAmount: number;

  reportTitle: string;

  submitReportLoader: boolean;

  saveDraftReportLoader: boolean;

  homeCurrency: string;

  isSelectedAll: boolean;

  showReportNameError: boolean;

  constructor(
    private modalController: ModalController,
    private trackingService: TrackingService,
    private currencyService: CurrencyService,
    private expenseFieldsService: ExpenseFieldsService,
    private spenderReportsService: SpenderReportsService,
    private translocoService: TranslocoService
  ) {}

  getReportTitle(): Subscription {
    const txnIds = this.selectedElements.map((etxn) => etxn.id);
    this.selectedTotalAmount = this.selectedElements.reduce((acc, obj) => acc + obj.amount, 0);

    if (this.reportTitleInput && !this.reportTitleInput.dirty && txnIds.length > 0) {
      return this.spenderReportsService.suggestPurpose(txnIds).subscribe((res) => {
        this.reportTitle = res;
      });
    }
  }

  ngOnInit(): void {
    this.selectedTotalAmount = 0;
    this.submitReportLoader = false;
    this.saveDraftReportLoader = false;
    this.isSelectedAll = true;
    this.expenseFields$ = this.expenseFieldsService.getAllMap();
    this.selectedElements = this.selectedExpensesToReport;
    this.currencyService.getHomeCurrency().subscribe((homeCurrency) => {
      this.homeCurrency = homeCurrency;
    });
  }

  ionViewWillEnter(): void {
    this.getReportTitle();
  }

  selectExpense(expense: Expense): void {
    const isSelectedElementsIncludesExpense = this.selectedElements.some((txn) => expense.id === txn.id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter((txn) => txn.id !== expense.id);
    } else {
      this.selectedElements.push(expense);
    }
    this.getReportTitle();
    this.isSelectedAll = this.selectedElements.length === this.selectedExpensesToReport.length;
  }

  toggleSelectAll(value: boolean): void {
    if (value) {
      this.selectedElements = this.selectedExpensesToReport;
    } else {
      this.selectedElements = [];
    }
    this.getReportTitle();
  }

  closeEvent(): void {
    this.modalController.dismiss();
  }

  async ctaClickedEvent(reportActionType: string): Promise<void> {
    this.showReportNameError = false;
    if (!this.reportTitle || this.reportTitle.trim().length <= 0) {
      this.showReportNameError = true;
      return;
    }

    const report = {
      purpose: this.reportTitle,
      source: 'MOBILE',
    };

    const txnIds = this.selectedElements.map((expense) => expense.id);
    if (reportActionType === 'create_draft_report') {
      this.saveDraftReportLoader = true;
      this.spenderReportsService
        .createDraft({ data: report })
        .pipe(
          tap(() =>
            this.trackingService.createReport({
              Expense_Count: txnIds.length,
              Report_Value: this.selectedTotalAmount,
            })
          ),
          switchMap((report: Report) => {
            if (txnIds.length > 0) {
              return this.spenderReportsService.addExpenses(report.id, txnIds).pipe(map(() => report));
            } else {
              return of(report);
            }
          }),
          finalize(() => {
            this.saveDraftReportLoader = false;
          })
        )
        .subscribe((report) => {
          this.modalController.dismiss({
            report,
            message: this.translocoService.translate('createNewReport.draftSuccessMessage'),
          });
        });
    } else {
      this.submitReportLoader = true;
      this.spenderReportsService
        .create(report, txnIds)
        .pipe(
          tap(() => {
            this.trackingService.createReport({
              Expense_Count: txnIds.length,
              Report_Value: this.selectedTotalAmount,
            });
          }),
          finalize(() => {
            this.submitReportLoader = false;
          })
        )
        .subscribe((report) => {
          this.modalController.dismiss({
            report,
            message: this.translocoService.translate('createNewReport.submitSuccessMessage'),
          });
        });
    }
  }
}
