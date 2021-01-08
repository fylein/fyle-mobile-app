import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {Observable, from, Subject, concat} from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import {switchMap, finalize, shareReplay, map, concatMap, tap, takeUntil} from 'rxjs/operators';
import { ReportService } from 'src/app/core/services/report.service';
import { RemoveExpenseReportComponent } from './remove-expense-report/remove-expense-report.component';
import { PopoverController } from '@ionic/angular';
import {NetworkService} from '../../core/services/network.service';

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
  updateFlag$ = new Subject();
  reportId;
  isConnected$: Observable<boolean>;
  onPageExit = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private offlineService: OfflineService,
    private customInputsService: CustomInputsService,
    private policyService: PolicyService,
    private reportService: ReportService,
    private popoverController: PopoverController,
    private router: Router,
    private networkService: NetworkService
  ) { }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay(1)
    );

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    });
  }

  isNumber(val) {
    return typeof val === 'number';
  }

  scrollToComments() {
    document.getElementById('commentsSection').scrollIntoView();
  }

  goBack() {
    this.router.navigate(['/', 'enterprise', 'view_team_report', {id: this.reportId}]);
  }

  onUpdateFlag(event) {
    if (event) {
      this.updateFlag$.next();
    }
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
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: etxn.tx_report_id}]);
    }
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    const id = this.activatedRoute.snapshot.params.id;

    this.extendedMileage$ = this.updateFlag$.pipe(
      switchMap(() => {
        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.transactionService.getExpenseV2(id);
          })
        );
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay()
    );

    this.extendedMileage$.subscribe(res => {
      this.reportId = res.tx_report_id;
    });

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

    this.updateFlag$.next();
  }


  ngOnInit() {
  }

}
