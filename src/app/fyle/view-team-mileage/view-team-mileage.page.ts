import { Component, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { switchMap, finalize, shareReplay, map, concatMap } from 'rxjs/operators';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
  selector: 'app-view-team-mileage',
  templateUrl: './view-team-mileage.page.html',
  styleUrls: ['./view-team-mileage.page.scss'],
})
export class ViewTeamMileagePage implements OnInit {

  extendedMileage$: Observable<Expense>;
  orgSettings$: Observable<any>;
  mileageCustomFields$: Observable<CustomField[]>;
  isCriticalPolicyViolated$: Observable<boolean>;
  isAmountCapped$: Observable<boolean>;
  policyViloations$: Observable<any>;
  canFlagOrUnflag$: Observable<boolean>;
  canDelete$: Observable<boolean>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private offlineService: OfflineService,
    private customInputsService: CustomInputsService,
    private policyService: PolicyService,
    private reportService: ReportService
  ) { }

  isNumber(val) {
    return typeof val === 'number';
  }

  scrollToComments() {
    document.getElementById('commentsSection').scrollIntoView();
  }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;

    this.extendedMileage$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.transactionService.getExpenseV2(id);
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay()
    );

    this.orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay()
    );

    this.mileageCustomFields$ = this.extendedMileage$.pipe(
      switchMap(res => {
        return this.customInputsService.fillCustomProperties(res.tx_org_category_id, res.tx_custom_properties, true);
      }),
      map(res => {
        return res.map(customProperties => {
          customProperties.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
          return customProperties;
        });
      })
    );

    this.canFlagOrUnflag$ = this.extendedMileage$.pipe(
      map(etxn => {
        return ['COMPLETE', 'POLICY_APPROVED', 'APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING'].indexOf(etxn.tx_state) > -1;
      })
    );

    this.canDelete$ = this.extendedMileage$.pipe(
      concatMap(etxn => {
        return this.reportService.getTeamReport(etxn.tx_report_id);
      }),
      map(report => {
        if (report.rp_num_transactions === 1) {
          return false;
        }
        return ['PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(report.tx_state) < 0;
      })
    );

    this.policyViloations$ = this.policyService.getPolicyRuleViolationsAndQueryParams(id);

    this.isCriticalPolicyViolated$ = this.extendedMileage$.pipe(
      map(res => {
        return this.isNumber(res.tx_policy_amount) && res.tx_policy_amount < 0.0001;
      })
    );

    this.isAmountCapped$ = this.extendedMileage$.pipe(
      map(res => {
        return this.isNumber(res.tx_admin_amount) || this.isNumber(res.tx_policy_amount);
      })
    );

  }


  ngOnInit() {
  }

}
