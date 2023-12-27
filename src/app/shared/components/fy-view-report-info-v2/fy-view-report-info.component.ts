import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ExtendedReport } from 'src/app/core/models/report.model';
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

type AmountDetails = {
  'Total Amount': number;
  Reimbursable: number;
  CCC?: number;
  Advance?: number;
};

type PaymentMode = {
  [paymentMode: string]: {
    name: string;
    key: string;
    amount: number;
    count: number;
  };
};

@Component({
  selector: 'app-fy-view-report-info-v2',
  templateUrl: './fy-view-report-info.component.html',
  styleUrls: ['./fy-view-report-info.component.scss'],
})
export class FyViewReportInfoComponentV2 implements OnInit {
  @Input() erpt$: Observable<ExtendedReport>;

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

  get ExpenseView() {
    return ExpenseView;
  }

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.erpt$.pipe(filter((erpt) => !!erpt)).subscribe((erpt) => {
      this.reportDetails = {
        'Report Name': erpt.rp_purpose,
        Owner: erpt.us_full_name,
        'Report Number': erpt.rp_claim_number,
        'Created On': this.datePipe.transform(erpt.rp_created_at, 'MMM d, y'),
      };
      this.reportCurrency = erpt.rp_currency;

      if (this.view === ExpenseView.team) {
        this.createEmployeeDetails(erpt);
      }
    });

    const orgSettings$ = this.orgSettingsService.get();
    combineLatest([this.expenses$, this.erpt$, orgSettings$]).subscribe(([expenses, erpt, orgSettings]) => {
      const paymentModeWiseData: PaymentModeSummary = this.sharedExpensesService.getPaymentModeWiseSummary(expenses);
      this.amountComponentWiseDetails = {
        'Total Amount': erpt.rp_amount,
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

  originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => 0;

  closeModal() {
    this.modalController.dismiss();
  }

  segmentChanged(event) {
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

  onSwipeReport(event) {
    this.isSwipe = true;
    if (event && event.direction === 2) {
      this.elementRef.nativeElement.getElementsByClassName('view-info--segment-block-container__btn')[1].click();
      this.trackingService.viewReportInfo({
        view: this.view,
        action: 'swipe',
        segment: 'report',
      });
    }
  }

  onSwipeAmount(event) {
    this.isSwipe = true;
    if (event && event.direction === 4) {
      this.elementRef.nativeElement.getElementsByClassName('view-info--segment-block-container__btn')[0].click();
    }
    if (this.view === ExpenseView.team && event && event.direction === 2) {
      this.elementRef.nativeElement.getElementsByClassName('view-info--segment-block-container__btn')[2].click();
    }
    this.trackingService.viewReportInfo({
      view: this.view,
      action: 'swipe',
      segment: 'amount',
    });
  }

  onSwipeEmployee(event) {
    this.isSwipe = true;
    if (event && event.direction === 4) {
      this.elementRef.nativeElement.getElementsByClassName('view-info--segment-block-container__btn')[1].click();
      this.trackingService.viewReportInfo({
        view: this.view,
        action: 'swipe',
        segment: 'employee',
      });
    }
  }

  async createEmployeeDetails(erpt: ExtendedReport) {
    this.employeeDetails = {
      'Employee ID': erpt.ou_employee_id,
      Organization: erpt.ou_org_name,
      Department: erpt.ou_department,
      'Sub Department': erpt.ou_sub_department,
      Location: erpt.ou_location,
      Level: erpt.ou_level,
      'Employee Title': erpt.ou_title,
      'Business Unit': erpt.ou_business_unit,
      Mobile: erpt.ou_mobile,
    };
    try {
      const orgUser = await this.authService.getEou();
      if (erpt.ou_org_id === orgUser.ou.org_id) {
        this.orgUserSettingsService.getAllowedCostCentersByOuId(erpt.ou_id).subscribe((costCenters) => {
          const allowedCostCenters = costCenters.map((costCenter) => costCenter.name).join(', ');
          this.employeeDetails['Allowed Cost Centers'] = allowedCostCenters;
        });
      }
    } catch (err) {
      return;
    }
  }

  getCCCAdvanceSummary(paymentModeWiseData: PaymentMode, orgSettings: any) {
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
