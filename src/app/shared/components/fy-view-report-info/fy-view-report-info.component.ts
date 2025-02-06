import { Component, Input, ElementRef } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';

import { Observable, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { KeyValue, DatePipe } from '@angular/common';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PaymentModeSummary } from 'src/app/core/models/payment-mode-summary.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpensesService as SharedExpensesService } from 'src/app/core/services/platform/v1/shared/expenses.service';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { AmountDetails } from 'src/app/core/models/amount-details.model';
import { ReportInfoPaymentMode } from 'src/app/core/models/report-info-payment-mode.model';

@Component({
  selector: 'app-fy-view-report-info-v2',
  templateUrl: './fy-view-report-info.component.html',
  styleUrls: ['./fy-view-report-info.component.scss'],
})
export class FyViewReportInfoComponent {
  @Input() report$: Observable<Report>;

  @Input() expenses$: Observable<Expense[]>;

  @Input() view: ExpenseView;

  isReportView = true;

  isEmployeeView = false;

  reportCurrency: string;

  isForeignCurrency = false;

  reportDetails = {};

  amountComponentWiseDetails: AmountDetails;

  amountCurrencyWiseDetails = {};

  employeeDetails = {};

  isSwipe = false;

  constructor(
    private modalController: ModalController,
    private sharedExpensesService: SharedExpensesService,
    private datePipe: DatePipe,
    private orgUserSettingsService: OrgUserSettingsService,
    public platform: Platform,
    private elementRef: ElementRef,
    private trackingService: TrackingService,
    private orgSettingsService: OrgSettingsService,
    private authService: AuthService
  ) {}

  get ExpenseView(): typeof ExpenseView {
    return ExpenseView;
  }

  ionViewWillEnter(): void {
    this.report$.pipe(filter((report) => !!report)).subscribe((report) => {
      const createdDate = this.datePipe.transform(report.created_at, 'MMM d, y');
      this.reportDetails = {
        'Report Name': report.purpose,
        Owner: report.employee.user.full_name,
        'Report Number': report.seq_num,
        'Created date': createdDate,
      };
      this.reportCurrency = report.currency;

      if (this.view === ExpenseView.team) {
        this.createEmployeeDetails(report);
      }
    });

    const orgSettings$ = this.orgSettingsService.get();
    combineLatest([this.expenses$, this.report$, orgSettings$]).subscribe(([expenses, report, orgSettings]) => {
      const paymentModeWiseData: PaymentModeSummary = this.sharedExpensesService.getPaymentModeWiseSummary(expenses);
      this.amountComponentWiseDetails = {
        'Total Amount': report.amount,
        Reimbursable: paymentModeWiseData.reimbursable?.amount || 0,
      };
      if (orgSettings) {
        this.getCCCAdvanceSummary(paymentModeWiseData, orgSettings);
      }
    });

    this.expenses$.subscribe((expenses) => {
      this.amountCurrencyWiseDetails = this.sharedExpensesService.getCurrenyWiseSummary(expenses);
      this.isForeignCurrency = expenses.some((expense) => !!expense.foreign_currency);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => 0;

  closeModal(): void {
    this.modalController.dismiss();
  }

  segmentChanged(event: { detail: { value: string } }): void {
    if (event && event.detail && event.detail.value) {
      if (event.detail.value === 'report') {
        this.isReportView = true;
        this.isEmployeeView = false;
      } else if (event.detail.value === 'amount') {
        this.isReportView = false;
        this.isEmployeeView = false;
      } else if (this.view === ExpenseView.team && event.detail.value === 'employee') {
        this.isReportView = false;
        this.isEmployeeView = true;
      }

      if (!this.isSwipe) {
        this.trackingService.viewReportInfo({
          view: this.view,
          action: 'click',
          segment: event.detail.value,
        });
      }
      this.isSwipe = false;
    }
  }

  onSwipeReport(event: { direction: number }): void {
    this.isSwipe = true;
    if (event && event.direction === 2) {
      const elementRef: HTMLElement = (this.elementRef.nativeElement as HTMLElement).getElementsByClassName(
        'view-info--segment-block-container__btn'
      )[1] as HTMLElement;
      elementRef.click();
      this.trackingService.viewReportInfo({
        view: this.view,
        action: 'swipe',
        segment: 'report',
      });
    }
  }

  onSwipeAmount(event: { direction: number }): void {
    this.isSwipe = true;

    if (event && event.direction === 4) {
      const elementRef: HTMLElement = (this.elementRef.nativeElement as HTMLElement).getElementsByClassName(
        'view-info--segment-block-container__btn'
      )[0] as HTMLElement;
      elementRef.click();
    }

    if (this.view === ExpenseView.team && event && event.direction === 2) {
      const elementRef: HTMLElement = (this.elementRef.nativeElement as HTMLElement).getElementsByClassName(
        'view-info--segment-block-container__btn'
      )[2] as HTMLElement;
      elementRef.click();
    }
    this.trackingService.viewReportInfo({
      view: this.view,
      action: 'swipe',
      segment: 'amount',
    });
  }

  onSwipeEmployee(event: { direction: number }): void {
    this.isSwipe = true;
    if (event && event.direction === 4) {
      const elementRef: HTMLElement = (this.elementRef.nativeElement as HTMLElement).getElementsByClassName(
        'view-info--segment-block-container__btn'
      )[1] as HTMLElement;
      elementRef.click();
      this.trackingService.viewReportInfo({
        view: this.view,
        action: 'swipe',
        segment: 'employee',
      });
    }
  }

  async createEmployeeDetails(report: Report): Promise<void> {
    this.employeeDetails = {
      'Employee ID': report.employee.code,
      Organization: report.employee.org_name,
      Department: report.employee.department?.name,
      'Sub Department': report.employee.department?.sub_department,
      Location: report.employee.location,
      Level: report.employee.level?.name,
      'Employee Title': report.employee.title,
      'Business Unit': report.employee.business_unit,
      Mobile: report.employee.mobile,
    };
    try {
      const orgUser = await this.authService.getEou();
      if (report.org_id === orgUser.ou.org_id) {
        this.orgUserSettingsService.getAllowedCostCentersByOuId(report.employee.id).subscribe((costCenters) => {
          const allowedCostCenters = costCenters.map((costCenter) => costCenter.name).join(', ');
          this.employeeDetails['Allowed Cost Centers'] = allowedCostCenters;
        });
      }
    } catch (err) {
      return;
    }
  }

  getCCCAdvanceSummary(paymentModeWiseData: ReportInfoPaymentMode, orgSettings: OrgSettings): void {
    if (orgSettings.corporate_credit_card_settings && orgSettings.corporate_credit_card_settings.enabled) {
      this.amountComponentWiseDetails.CCC = paymentModeWiseData.ccc?.amount || 0;
    }
    const isAdvancesEnabled = orgSettings.advances && orgSettings.advances.enabled;
    const isAdvanceRequestsEnabled = orgSettings.advance_requests && orgSettings.advance_requests.enabled;
    if (isAdvancesEnabled || isAdvanceRequestsEnabled) {
      this.amountComponentWiseDetails.Advance = paymentModeWiseData.advance?.amount || 0;
    }
  }
}
