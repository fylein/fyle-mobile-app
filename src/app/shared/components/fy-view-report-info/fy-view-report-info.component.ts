import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { Observable } from 'rxjs';
import { KeyValue, DatePipe } from '@angular/common';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';

@Component({
  selector: 'app-fy-view-report-info',
  templateUrl: './fy-view-report-info.component.html',
  styleUrls: ['./fy-view-report-info.component.scss'],
})
export class FyViewReportInfoComponent implements OnInit {
  @Input() erpt$: Observable<ExtendedReport>;

  @Input() etxns$: Observable<any[]>;

  @Input() isTeamReport: boolean;

  @ViewChild('ReportBtn') ReportBtn: ElementRef;

  @ViewChild('AmountBtn') AmountBtn: ElementRef;

  @ViewChild('EmployeeBtn') EmployeeBtn: ElementRef;

  isReportView = true;

  isEmployeeView = false;

  reportCurrency: string;

  isForeignCurrency = false;

  reportDetails = {};

  amountComponentWiseDetails = {};

  amountCurrencyWiseDetails = {};

  employeeDetails = {};

  constructor(
    private modalController: ModalController,
    private transactionService: TransactionService,
    private datePipe: DatePipe,
    private offlineService: OfflineService,
    private orgUserService: OrgUserService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.erpt$.subscribe((erpt) => {
      this.reportDetails = {
        'Report Name': erpt.rp_purpose,
        Owner: erpt.us_full_name,
        'Claim Number': erpt.rp_claim_number,
        'Created On': this.datePipe.transform(erpt.rp_created_at, 'MMM d, y'),
      };
      this.reportCurrency = erpt.rp_currency;

      // let allowedCostCenters;
      // this.offlineService.getOrgSettings().subscribe(orgSettings => {
      //   if(orgSettings.cost_centers.enabled) {
      //     this.offlineService.getOrgUserSettings().subscribe((orgUserSettings) => {
      //       console.log('Org user settings-------', orgUserSettings);
      //       this.offlineService.getAllowedCostCenters(orgUserSettings).subscribe((costCenters) => {
      //         console.log('Cost centers-------', costCenters);
      //         allowedCostCenters = costCenters;
      //       });
      //     });
      //   }
      // });

      if (this.isTeamReport) {
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
          'Allowed Cost Centers': 'This is yet to be done',
        };
      }
    });

    this.etxns$.subscribe((etxns) => {
      const paymentModeWiseData: any = this.transactionService.getPaymentModeWiseSummary(etxns);

      this.erpt$.subscribe((erpt) => {
        this.amountComponentWiseDetails = {
          'Total Amount': erpt.rp_amount,
          Reimbursable: paymentModeWiseData.reimbursable?.amount || 0,
          CCC: paymentModeWiseData.ccc?.amount || 0,
          Advance: paymentModeWiseData.advance?.amount || 0,
        };
      });

      this.amountCurrencyWiseDetails = this.transactionService.getCurrenyWiseSummary(etxns);
      this.isForeignCurrency = etxns.some((etxn) => !!etxn.tx_orig_currency);
    });
  }

  originalOrder = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => 0;

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
      } else if (this.isTeamReport && event.detail.value === 'employee') {
        this.isReportView = false;
        this.isEmployeeView = true;
      }
    }
  }

  onSwipeReport(event) {
    if (event && event.direction === 2) {
      this.AmountBtn.nativeElement.click();
    }
  }

  onSwipeAmount(event) {
    if (event && event.direction === 4) {
      this.ReportBtn.nativeElement.click();
    }

    if (this.isTeamReport && event && event.direction === 2) {
      this.EmployeeBtn.nativeElement.click();
    }
  }

  onSwipeEmployee(event) {
    if (event && event.direction === 4) {
      this.ReportBtn.nativeElement.click();
    }
  }
}
