import { Component, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, from, Subject, concat, noop, of, forkJoin } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { switchMap, finalize, shareReplay, map, concatMap, takeUntil, take, filter } from 'rxjs/operators';
import { ReportService } from 'src/app/core/services/report.service';
import { PopoverController, ModalController } from '@ionic/angular';
import { NetworkService } from '../../core/services/network.service';
import { StatusService } from 'src/app/core/services/status.service';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { getCurrencySymbol } from '@angular/common';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';

@Component({
  selector: 'app-view-mileage',
  templateUrl: './view-mileage.page.html',
  styleUrls: ['./view-mileage.page.scss'],
})
export class ViewMileagePage implements OnInit {
  @ViewChild('comments') commentsContainer: ElementRef;

  extendedMileage$: Observable<Expense>;

  orgSettings: any;

  mileageCustomFields$: Observable<CustomField[]>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isAmountCapped$: Observable<boolean>;

  policyViloations$: Observable<any>;

  canFlagOrUnflag$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  updateFlag$ = new Subject();

  reportId: string;

  policyDetails;

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  comments$: Observable<ExtendedStatus[]>;

  isDeviceWidthSmall = window.innerWidth < 330;

  isExpenseFlagged: boolean;

  numEtxnsInReport: number;

  activeEtxnIndex: number;

  paymentMode: string;

  paymentModeIcon: string;

  etxnCurrencySymbol: string;

  vehicleType: string;

  view: ExpenseView;

  isProjectShown: boolean;

  projectFieldName: string;

  get ExpenseView() {
    return ExpenseView;
  }

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
    private networkService: NetworkService,
    private statusService: StatusService,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService
  ) {}

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
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  isNumber(val) {
    return typeof val === 'number';
  }

  getPolicyDetails(txId: string) {
    if (txId) {
      from(this.policyService.getPolicyViolationRules(txId))
        .pipe()
        .subscribe((details) => {
          this.policyDetails = details;
        });
    }
  }

  goBack() {
    if (this.view === ExpenseView.team) {
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.reportId, navigate_back: true }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.reportId, navigate_back: true }]);
    }
  }

  async openCommentsModal() {
    const etxn = await this.transactionService.getEtxn(this.activatedRoute.snapshot.params.id).toPromise();
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'transactions',
        objectId: etxn.tx_id,
      },
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data && data.updated) {
      this.trackingService.addComment({ view: this.view });
    } else {
      this.trackingService.viewComment({ view: this.view });
    }
  }

  async removeExpenseFromReport() {
    const etxn = await this.transactionService.getEtxn(this.activatedRoute.snapshot.params.id).toPromise();

    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Remove Expense',
        body: 'Are you sure you want to remove this expense from the report?',
        infoMessage: 'The report amount will be adjusted accordingly.',
        ctaText: 'Remove',
        ctaLoadingText: 'Removing',
        deleteMethod: () => this.reportService.removeTransaction(etxn.tx_report_id, etxn.tx_id),
      },
    });

    await deletePopover.present();
    const { data } = await deletePopover.onDidDismiss();

    if (data && data.status === 'success') {
      this.trackingService.expenseRemovedByApprover();
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: etxn.tx_report_id, navigate_back: true }]);
    }
  }

  async flagUnflagExpense() {
    const id = this.activatedRoute.snapshot.params.id;
    const etxn = await this.transactionService.getEtxn(id).toPromise();

    const title = this.isExpenseFlagged ? 'Unflag' : 'Flag';
    const flagUnflagModal = await this.popoverController.create({
      component: FyPopoverComponent,
      componentProps: {
        title,
        formLabel: `Reason for ${title.toLowerCase()}ing expense`,
      },
      cssClass: 'fy-dialog-popover',
    });

    await flagUnflagModal.present();
    const { data } = await flagUnflagModal.onWillDismiss();

    if (data && data.comment) {
      from(this.loaderService.showLoader('Please wait'))
        .pipe(
          switchMap(() => {
            const comment = {
              comment: data.comment,
            };
            return this.statusService.post('transactions', etxn.tx_id, comment, true);
          }),
          concatMap(() =>
            etxn.tx_manual_flag
              ? this.transactionService.manualUnflag(etxn.tx_id)
              : this.transactionService.manualFlag(etxn.tx_id)
          ),
          finalize(() => {
            this.updateFlag$.next();
            this.loaderService.hideLoader();
          })
        )
        .subscribe(noop);
    }
    this.isExpenseFlagged = etxn.tx_manual_flag;
    this.trackingService.expenseFlagUnflagClicked({ action: title });
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    const id = this.activatedRoute.snapshot.params.id;

    this.extendedMileage$ = this.updateFlag$.pipe(
      switchMap(() =>
        from(this.loaderService.showLoader()).pipe(switchMap(() => this.transactionService.getExpenseV2(id)))
      ),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.extendedMileage$.subscribe((extendedMileage) => {
      this.reportId = extendedMileage.tx_report_id;

      if (extendedMileage.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT') {
        this.paymentMode = 'Paid from Advance';
        this.paymentModeIcon = 'fy-non-reimbursable';
      } else if (extendedMileage.tx_skip_reimbursement) {
        this.paymentMode = 'Paid by Company';
        this.paymentModeIcon = 'fy-non-reimbursable';
      } else {
        this.paymentMode = 'Paid by Employee';
        this.paymentModeIcon = 'fy-reimbursable';
      }

      if (
        extendedMileage.tx_mileage_vehicle_type.indexOf('four') > -1 ||
        extendedMileage.tx_mileage_vehicle_type.indexOf('car') > -1
      ) {
        this.vehicleType = 'car';
      } else {
        this.vehicleType = 'bike';
      }

      this.etxnCurrencySymbol = getCurrencySymbol(extendedMileage.tx_currency, 'wide');
    });

    forkJoin([this.offlineService.getExpenseFieldsMap(), this.extendedMileage$.pipe(take(1))])
      .pipe(
        map(([expenseFieldsMap, extendedMileage]) => {
          this.projectFieldName = expenseFieldsMap?.project_id && expenseFieldsMap?.project_id[0]?.field_name;
          const isProjectMandatory = expenseFieldsMap?.project_id && expenseFieldsMap?.project_id[0]?.is_mandatory;
          this.isProjectShown =
            this.orgSettings?.projects?.enabled && (extendedMileage.tx_project_name || isProjectMandatory);
        })
      )
      .subscribe(noop);

    this.offlineService
      .getOrgSettings()
      .pipe(shareReplay(1))
      .subscribe((orgSettings) => {
        this.orgSettings = orgSettings;
      });

    this.mileageCustomFields$ = this.extendedMileage$.pipe(
      switchMap((res) =>
        this.customInputsService.fillCustomProperties(res.tx_org_category_id, res.tx_custom_properties, true)
      ),
      map((res) =>
        res.map((customProperties) => {
          customProperties.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
          return customProperties;
        })
      )
    );

    this.view = this.activatedRoute.snapshot.params.view;

    this.canFlagOrUnflag$ = this.extendedMileage$.pipe(
      filter(() => this.view === ExpenseView.team),
      map(
        (etxn) =>
          ['COMPLETE', 'POLICY_APPROVED', 'APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING'].indexOf(etxn.tx_state) > -1
      )
    );

    this.canDelete$ = this.extendedMileage$.pipe(
      filter(() => this.view === ExpenseView.team),
      switchMap((etxn) =>
        this.reportService.getTeamReport(etxn.tx_report_id).pipe(map((report) => ({ report, etxn })))
      ),
      map(({ report, etxn }) => {
        if (report.rp_num_transactions === 1) {
          return false;
        }
        return ['PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(etxn.tx_state) < 0;
      })
    );

    if (id) {
      this.policyViloations$ = this.policyService.getPolicyViolationRules(id);
    } else {
      this.policyViloations$ = of(null);
    }

    this.comments$ = this.statusService.find('transactions', id);

    this.isCriticalPolicyViolated$ = this.extendedMileage$.pipe(
      map((res) => this.isNumber(res.tx_policy_amount) && res.tx_policy_amount < 0.0001)
    );

    this.getPolicyDetails(id);

    this.isAmountCapped$ = this.extendedMileage$.pipe(
      map((res) => this.isNumber(res.tx_admin_amount) || this.isNumber(res.tx_policy_amount))
    );

    this.extendedMileage$.subscribe((etxn) => {
      this.isExpenseFlagged = etxn.tx_manual_flag;
    });

    this.updateFlag$.next();

    const etxnIds =
      this.activatedRoute.snapshot.params.txnIds && JSON.parse(this.activatedRoute.snapshot.params.txnIds);
    this.numEtxnsInReport = etxnIds.length;
    this.activeEtxnIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex, 10);
  }

  getDisplayValue(customProperties) {
    const displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
    return displayValue === '-' ? 'Not Added' : displayValue;
  }

  ngOnInit() {}
}
