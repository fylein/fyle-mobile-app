import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, from, Subject } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { switchMap, finalize, shareReplay, map, concatMap } from 'rxjs/operators';
import { ReportService } from 'src/app/core/services/report.service';
import { PopoverController } from '@ionic/angular';
import { RemoveExpenseReportComponent } from './remove-expense-report/remove-expense-report.component';
import { StatusService } from 'src/app/core/services/status.service';

@Component({
    selector: 'app-view-team-per-diem',
    templateUrl: './view-team-per-diem.page.html',
    styleUrls: ['./view-team-per-diem.page.scss'],
})
export class ViewTeamPerDiemPage implements OnInit {

  @ViewChild('comments') commentsContainer: ElementRef;

  extendedPerDiem$: Observable<Expense>;
  orgSettings$: Observable<any>;
  perDiemCustomFields$: Observable<CustomField[]>;
  perDiemRate$: Observable<any>;
  isCriticalPolicyViolated$: Observable<boolean>;
  isAmountCapped$: Observable<boolean>;
  policyViloations$: Observable<any>;
  canFlagOrUnflag$: Observable<any>;
  canDelete$: Observable<any>;
  reportId;
  updateFlag$ = new Subject();
  comments$: Observable<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private loaderService: LoaderService,
    private offlineService: OfflineService,
    private customInputsService: CustomInputsService,
    private perDiemService: PerDiemService,
    private policyService: PolicyService,
    private reportService: ReportService,
    private router: Router,
    private popoverController: PopoverController,
    private statusService: StatusService
  ) { }

  isNumber(val) {
      return typeof val === 'number';
  }

  goBack() {
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.reportId }]);
  }

  onUpdateFlag(event) {
      if (event) {
          this.updateFlag$.next();
      }
  }

  scrollCommentsIntoView() {
      if (this.commentsContainer) {
          const commentsContainer = this.commentsContainer.nativeElement as HTMLElement;
          if (commentsContainer) {
              commentsContainer.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'start'
              });
          }
      }
  }

  ionViewWillEnter() {
      const id = this.activatedRoute.snapshot.params.id;

      this.extendedPerDiem$ = this.updateFlag$.pipe(
          switchMap(() => from(this.loaderService.showLoader()).pipe(
              switchMap(() => this.transactionService.getExpenseV2(id))
          )),
          finalize(() => from(this.loaderService.hideLoader())),
          shareReplay(1)
      );

      this.extendedPerDiem$.subscribe(res => {
          this.reportId = res.tx_report_id;
      });

      this.orgSettings$ = this.offlineService.getOrgSettings().pipe(
          shareReplay(1)
      );

      this.perDiemCustomFields$ = this.extendedPerDiem$.pipe(
          switchMap(res => this.customInputsService.fillCustomProperties(res.tx_org_category_id, res.tx_custom_properties, true)),
          map(res => res.map(customProperties => {
              customProperties.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
              return customProperties;
          }))
      );

      this.perDiemRate$ = this.extendedPerDiem$.pipe(
          switchMap(res => {
              const perDiemRateId = parseInt(res.tx_per_diem_rate_id);
              return this.perDiemService.getRate(perDiemRateId);
          })
      );

      this.canFlagOrUnflag$ = this.extendedPerDiem$.pipe(
          map(etxn => ['COMPLETE', 'POLICY_APPROVED', 'APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING'].indexOf(etxn.tx_state) > -1)
      );

      this.canDelete$ = this.extendedPerDiem$.pipe(
          concatMap(etxn => this.reportService.getTeamReport(etxn.tx_report_id)),
          map(report => {
              if (report.rp_num_transactions === 1) {
                  return false;
              }
              return ['PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(report.tx_state) < 0;
          })
      );

      this.policyViloations$ = this.policyService.getPolicyRuleViolationsAndQueryParams(id);
      this.comments$ = this.statusService.find('transactions', id);

      // this.policyViloations$.subscribe(res => {
      //   debugger;
      // })

      this.isCriticalPolicyViolated$ = this.extendedPerDiem$.pipe(
          map(res => this.isNumber(res.tx_policy_amount) && res.tx_policy_amount < 0.0001)
      );

      this.isAmountCapped$ = this.extendedPerDiem$.pipe(
          map(res => this.isNumber(res.tx_admin_amount) || this.isNumber(res.tx_policy_amount))
      );

      this.updateFlag$.next();
  }

  async removeExpenseFromReport() {
      const etxn = await this.transactionService.getEtxn(this.activatedRoute.snapshot.params.id).toPromise();
      const popover = await this.popoverController.create({
          component: RemoveExpenseReportComponent,
          componentProps: {
              etxn
          },
          cssClass: 'dialog-popover'
      });

      await popover.present();

      const { data } = await popover.onWillDismiss();

      if (data && data.goBack) {
          this.router.navigate(['/', 'enterprise', 'view_team_report', { id: etxn.tx_report_id }]);
      }
  }

  ngOnInit() {
  }

}
