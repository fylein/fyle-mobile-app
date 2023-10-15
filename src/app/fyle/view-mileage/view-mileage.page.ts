import { Component, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Observable, from, Subject, concat, noop, of, forkJoin } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
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
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { IndividualExpensePolicyState } from 'src/app/core/models/platform/platform-individual-expense-policy-state.model';
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { ExpenseDeletePopoverParams } from 'src/app/core/models/expense-delete-popover-params.model';
import { PlatformExpenseService } from 'src/app/core/services/platform-expense.service';
import { PlatformExpense } from 'src/app/core/models/platform/platform-expense.model';
import { MileageRatesService } from 'src/app/core/services/mileage-rates.service';
import { PlatformMileageRates } from 'src/app/core/models/platform/platform-mileage-rates.model';

@Component({
  selector: 'app-view-mileage',
  templateUrl: './view-mileage.page.html',
  styleUrls: ['./view-mileage.page.scss'],
})
export class ViewMileagePage {
  @ViewChild('comments') commentsContainer: ElementRef;

  mileageExpense$: Observable<PlatformExpense>;

  orgSettings: OrgSettings;

  mileageCustomFields$: Observable<CustomField[]>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isAmountCapped$: Observable<boolean>;

  policyViloations$: Observable<IndividualExpensePolicyState[]>;

  canFlagOrUnflag$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  updateFlag$ = new Subject();

  reportId: string;

  policyDetails: IndividualExpensePolicyState[] | [];

  isConnected$: Observable<boolean>;

  onPageExit$ = new Subject();

  comments$: Observable<ExtendedStatus[]>;

  isDeviceWidthSmall = window.innerWidth < 330;

  numEtxnsInReport: number;

  activeEtxnIndex: number;

  paymentMode: string;

  paymentModeIcon: string;

  etxnCurrencySymbol: string;

  vehicleType: string;

  view: ExpenseView;

  isProjectShown: boolean;

  projectFieldName: string;

  isNewReportsFlowEnabled = false;

  txnFields$: Observable<{ [key: string]: ExpenseField[] }>;

  projectDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  costCenterDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  mapAttachment$: Observable<FileObject>;

  mileageRate$: Observable<PlatformMileageRates>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private platformExpenseService: PlatformExpenseService,
    private customInputsService: CustomInputsService,
    private policyService: PolicyService,
    private reportService: ReportService,
    private popoverController: PopoverController,
    private router: Router,
    private networkService: NetworkService,
    private statusService: StatusService,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService,
    private expenseFieldsService: ExpenseFieldsService,
    private orgSettingsService: OrgSettingsService,
    private dependentFieldsService: DependentFieldsService,
    private fileService: FileService,
    private mileageRatesService: MileageRatesService
  ) {}

  get ExpenseView(): typeof ExpenseView {
    return ExpenseView;
  }

  ionViewWillLeave(): void {
    this.onPageExit$.next(null);
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit$),
      shareReplay(1)
    );

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  isNumber(val: string | number): boolean {
    return typeof val === 'number';
  }

  getPolicyDetails(expenseId: string): void {
    if (expenseId) {
      if (this.view === ExpenseView.team) {
        from(this.policyService.getApproverExpensePolicyViolations(expenseId))
          .pipe()
          .subscribe((policyDetails) => {
            this.policyDetails = policyDetails;
          });
      } else {
        from(this.policyService.getSpenderExpensePolicyViolations(expenseId))
          .pipe()
          .subscribe((policyDetails) => {
            this.policyDetails = policyDetails;
          });
      }
    }
  }

  goBack(): void {
    if (this.view === ExpenseView.team) {
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.reportId, navigate_back: true }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.reportId, navigate_back: true }]);
    }
  }

  async openCommentsModal(): Promise<void> {
    const etxn = await this.transactionService.getEtxn(this.activatedRoute.snapshot.params.id as string).toPromise();
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'transactions',
        objectId: etxn.tx_id,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();
    const { data } = (await modal.onDidDismiss()) as { data: { updated: boolean } };

    if (data && data.updated) {
      this.trackingService.addComment({ view: this.view });
    } else {
      this.trackingService.viewComment({ view: this.view });
    }
  }

  getDeleteDialogProps(etxn: Expense): ExpenseDeletePopoverParams {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Remove Expense',
        body: 'Are you sure you want to remove this expense from the report?',
        infoMessage: 'The report amount will be adjusted accordingly.',
        ctaText: 'Remove',
        ctaLoadingText: 'Removing',
        deleteMethod: (): Observable<void> => this.reportService.removeTransaction(etxn.tx_report_id, etxn.tx_id),
      },
    };
  }

  async removeExpenseFromReport(): Promise<void> {
    const etxn = await this.transactionService.getEtxn(this.activatedRoute.snapshot.params.id as string).toPromise();

    const deletePopover = await this.popoverController.create(this.getDeleteDialogProps(etxn));

    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as { data: { status: string } };

    if (data && data.status === 'success') {
      this.trackingService.expenseRemovedByApprover();
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: etxn.tx_report_id, navigate_back: true }]);
    }
  }

  async flagUnflagExpense(isExpenseFlagged: boolean): Promise<void> {
    const id = this.activatedRoute.snapshot.params.id as string;
    const etxn = await this.transactionService.getEtxn(id).toPromise();

    const title = isExpenseFlagged ? 'Unflag' : 'Flag';
    const flagUnflagModal = await this.popoverController.create({
      component: FyPopoverComponent,
      componentProps: {
        title,
        formLabel: `Reason for ${title.toLowerCase()}ing expense`,
      },
      cssClass: 'fy-dialog-popover',
    });

    await flagUnflagModal.present();
    const { data } = (await flagUnflagModal.onWillDismiss()) as { data: { comment: string } };

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
            this.updateFlag$.next(null);
            this.loaderService.hideLoader();
          })
        )
        .subscribe(noop);
    }
    this.trackingService.expenseFlagUnflagClicked({ action: title });
  }

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();
    const id = this.activatedRoute.snapshot.params.id as string;

    this.mileageExpense$ = this.updateFlag$.pipe(
      switchMap(() =>
        from(this.loaderService.showLoader()).pipe(switchMap(() => this.platformExpenseService.getExpense(id)))
      ),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.mapAttachment$ = this.mileageExpense$.pipe(
      take(1),
      map((expense) => expense.files),
      map((fileObjs) => fileObjs[0]),
      concatMap((fileObj) =>
        this.fileService.downloadUrl(fileObj.id).pipe(
          map((downloadUrl) => {
            const details = this.fileService.getReceiptsDetails(fileObj.name, downloadUrl);
            const fileObjWithDetails: FileObject = {
              url: downloadUrl,
              type: details.type,
              thumbnail: details.thumbnail,
            };

            return fileObjWithDetails;
          })
        )
      )
    );

    this.txnFields$ = this.expenseFieldsService.getAllMap().pipe(shareReplay(1));

    this.projectDependentCustomProperties$ = forkJoin({
      mileageExpense: this.mileageExpense$.pipe(take(1)),
      txnFields: this.txnFields$.pipe(take(1)),
    }).pipe(
      filter(({ mileageExpense, txnFields }) => mileageExpense.custom_fields && txnFields.project_id?.length > 0),
      switchMap(({ mileageExpense, txnFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          mileageExpense.custom_fields,
          txnFields.project_id[0]?.id
        )
      )
    );

    this.costCenterDependentCustomProperties$ = forkJoin({
      mileageExpense: this.mileageExpense$.pipe(take(1)),
      txnFields: this.txnFields$.pipe(take(1)),
    }).pipe(
      filter(({ mileageExpense, txnFields }) => mileageExpense.custom_fields && txnFields.cost_center_id?.length > 0),
      switchMap(({ mileageExpense, txnFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          mileageExpense.custom_fields,
          txnFields.cost_center_id[0]?.id
        )
      ),
      shareReplay(1)
    );

    this.mileageExpense$.subscribe((mileageExpense) => {
      this.reportId = mileageExpense.report_id;

      if (mileageExpense.source_account.type === AccountType.ADVANCE) {
        this.paymentMode = 'Paid from Advance';
        this.paymentModeIcon = 'fy-non-reimbursable';
      } else if (!mileageExpense.is_reimbursable) {
        this.paymentMode = 'Paid by Company';
        this.paymentModeIcon = 'fy-non-reimbursable';
      } else {
        this.paymentMode = 'Paid by Employee';
        this.paymentModeIcon = 'fy-reimbursable';
      }

      if (
        mileageExpense.mileage_rate.vehicle_type?.toLowerCase().indexOf('four') > -1 ||
        mileageExpense.mileage_rate.vehicle_type?.toLowerCase().indexOf('car') > -1
      ) {
        this.vehicleType = 'car';
      } else {
        this.vehicleType = 'bike';
      }

      this.etxnCurrencySymbol = getCurrencySymbol(mileageExpense.currency, 'wide');
    });

    forkJoin([this.txnFields$, this.mileageExpense$.pipe(take(1))])
      .pipe(
        map(([expenseFieldsMap, mileageExpense]) => {
          this.projectFieldName = expenseFieldsMap?.project_id && expenseFieldsMap?.project_id[0]?.field_name;
          const isProjectMandatory = expenseFieldsMap?.project_id && expenseFieldsMap?.project_id[0]?.is_mandatory;
          this.isProjectShown =
            this.orgSettings?.projects?.enabled && (!!mileageExpense.project.name || isProjectMandatory);
        })
      )
      .subscribe(noop);

    this.orgSettingsService
      .get()
      .pipe(shareReplay(1))
      .subscribe((orgSettings) => {
        this.orgSettings = orgSettings;
        this.isNewReportsFlowEnabled = orgSettings?.simplified_report_closure_settings?.enabled || false;
      });

    this.mileageCustomFields$ = this.mileageExpense$.pipe(
      switchMap((res) => this.customInputsService.fillCustomProperties(res.category_id, res.custom_fields, true)),
      map((res) =>
        res.map((customProperties) => {
          customProperties.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
          return customProperties;
        })
      )
    );

    this.mileageRate$ = this.mileageExpense$.pipe(
      switchMap((mileageExpense) => this.mileageRatesService.getRate(mileageExpense.mileage_rate_id))
    );

    this.view = this.activatedRoute.snapshot.params.view as ExpenseView;

    this.canFlagOrUnflag$ = this.mileageExpense$.pipe(
      take(1),
      filter(() => this.view === ExpenseView.team),
      map(
        (expense) =>
          ['COMPLETE', 'POLICY_APPROVED', 'APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING'].indexOf(expense.state) > -1
      )
    );

    this.canDelete$ = this.mileageExpense$.pipe(
      take(1),
      filter(() => this.view === ExpenseView.team),
      switchMap((expense) =>
        this.reportService.getTeamReport(expense.report_id).pipe(map((report) => ({ report, expense })))
      ),
      map(({ report, expense }) => {
        if (report.rp_num_transactions === 1) {
          return false;
        }
        return ['PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(expense.state) < 0;
      })
    );

    if (id) {
      this.policyViloations$ =
        this.view === ExpenseView.team
          ? this.policyService.getApproverExpensePolicyViolations(id)
          : this.policyService.getSpenderExpensePolicyViolations(id);
    } else {
      this.policyViloations$ = of(null);
    }

    this.comments$ = this.statusService.find('transactions', id);

    this.isCriticalPolicyViolated$ = this.mileageExpense$.pipe(
      map((res) => this.isNumber(res.policy_amount) && res.policy_amount < 0.0001)
    );

    this.getPolicyDetails(id);

    this.isAmountCapped$ = this.mileageExpense$.pipe(
      map((res) => this.isNumber(res.admin_amount) || this.isNumber(res.policy_amount))
    );

    this.updateFlag$.next(null);

    const etxnIds =
      this.activatedRoute.snapshot.params.txnIds &&
      (JSON.parse(this.activatedRoute.snapshot.params.txnIds as string) as string[]);
    this.numEtxnsInReport = etxnIds.length;
    this.activeEtxnIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex as string, 10);
  }

  getDisplayValue(customProperties: CustomField): boolean | string {
    const displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
    return displayValue === '-' ? 'Not Added' : displayValue;
  }

  viewAttachment(): void {
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.mapAttachment$),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(async (mapAttachment) => {
        const attachmentsModal = await this.modalController.create({
          component: FyViewAttachmentComponent,
          componentProps: {
            attachments: [mapAttachment],
            canEdit: false,
            isMileageExpense: true,
          },
        });

        await attachmentsModal.present();
      });
  }
}
