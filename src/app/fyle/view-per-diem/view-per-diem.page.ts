import { Component, ViewChild, ElementRef } from '@angular/core';
import { Observable, from, Subject, noop, of, forkJoin } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { switchMap, finalize, shareReplay, map, concatMap, filter, take } from 'rxjs/operators';
import { ReportService } from 'src/app/core/services/report.service';
import { PopoverController, ModalController } from '@ionic/angular';
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
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { PerDiemRates } from 'src/app/core/models/v1/per-diem-rates.model';
import { IndividualExpensePolicyState } from 'src/app/core/models/platform/platform-individual-expense-policy-state.model';
import { ExpenseDeletePopoverParams } from 'src/app/core/models/expense-delete-popover-params.model';

@Component({
  selector: 'app-view-per-diem',
  templateUrl: './view-per-diem.page.html',
  styleUrls: ['./view-per-diem.page.scss'],
})
export class ViewPerDiemPage {
  @ViewChild('comments') commentsContainer: ElementRef;

  extendedPerDiem$: Observable<Expense>;

  orgSettings: OrgSettings;

  perDiemCustomFields$: Observable<CustomField[]>;

  perDiemRate$: Observable<PerDiemRates>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isAmountCapped$: Observable<boolean>;

  policyViolations$: Observable<IndividualExpensePolicyState[]>;

  canFlagOrUnflag$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  reportId: string;

  policyDetails;

  updateFlag$ = new Subject();

  comments$: Observable<ExtendedStatus[]>;

  isDeviceWidthSmall = window.innerWidth < 330;

  isExpenseFlagged: boolean;

  numEtxnsInReport: number;

  activeEtxnIndex: number;

  paymentMode: string;

  paymentModeIcon: string;

  etxnCurrencySymbol: string;

  view: ExpenseView;

  isProjectShown: boolean;

  projectFieldName: string;

  isNewReportsFlowEnabled = false;

  txnFields$: Observable<{ [key: string]: ExpenseField[] }>;

  projectDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  costCenterDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private loaderService: LoaderService,
    private customInputsService: CustomInputsService,
    private perDiemService: PerDiemService,
    private policyService: PolicyService,
    private reportService: ReportService,
    private router: Router,
    private popoverController: PopoverController,
    private statusService: StatusService,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService,
    private expenseFieldsService: ExpenseFieldsService,
    private orgSettingsService: OrgSettingsService,
    private dependentFieldsService: DependentFieldsService
  ) {}

  get ExpenseView(): typeof ExpenseView {
    return ExpenseView;
  }

  isNumber(val): boolean {
    return typeof val === 'number';
  }

  goBack(): void {
    if (this.view === ExpenseView.team) {
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.reportId, navigate_back: true }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.reportId, navigate_back: true }]);
    }
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

  ionViewWillEnter(): void {
    const id = this.activatedRoute.snapshot.params.id as string;

    this.extendedPerDiem$ = this.updateFlag$.pipe(
      switchMap(() =>
        from(this.loaderService.showLoader()).pipe(switchMap(() => this.transactionService.getExpenseV2(id)))
      ),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.txnFields$ = this.expenseFieldsService.getAllMap().pipe(shareReplay(1));

    this.projectDependentCustomProperties$ = forkJoin({
      extendedPerDiem: this.extendedPerDiem$.pipe(take(1)),
      txnFields: this.txnFields$.pipe(take(1)),
    }).pipe(
      filter(
        ({ extendedPerDiem, txnFields }) => extendedPerDiem.tx_custom_properties && txnFields.project_id?.length > 0
      ),
      switchMap(({ extendedPerDiem, txnFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          extendedPerDiem.tx_custom_properties,
          txnFields.project_id[0]?.id
        )
      )
    );

    this.costCenterDependentCustomProperties$ = forkJoin({
      extendedPerDiem: this.extendedPerDiem$.pipe(take(1)),
      txnFields: this.txnFields$.pipe(take(1)),
    }).pipe(
      filter(
        ({ extendedPerDiem, txnFields }) => extendedPerDiem.tx_custom_properties && txnFields.cost_center_id?.length > 0
      ),
      switchMap(({ extendedPerDiem, txnFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          extendedPerDiem.tx_custom_properties,
          txnFields.cost_center_id[0]?.id
        )
      ),
      shareReplay(1)
    );

    this.extendedPerDiem$.subscribe((extendedPerDiem) => {
      this.reportId = extendedPerDiem.tx_report_id;

      if (extendedPerDiem.source_account_type === AccountType.ADVANCE) {
        this.paymentMode = 'Paid from Advance';
        this.paymentModeIcon = 'fy-non-reimbursable';
      } else if (extendedPerDiem.tx_skip_reimbursement) {
        this.paymentMode = 'Paid by Company';
        this.paymentModeIcon = 'fy-non-reimbursable';
      } else {
        this.paymentMode = 'Paid by Employee';
        this.paymentModeIcon = 'fy-reimbursable';
      }

      this.etxnCurrencySymbol = getCurrencySymbol(extendedPerDiem.tx_currency, 'wide');
    });

    forkJoin([this.txnFields$, this.extendedPerDiem$.pipe(take(1))])
      .pipe(
        map(([expenseFieldsMap, extendedPerDiem]) => {
          this.projectFieldName = expenseFieldsMap?.project_id && expenseFieldsMap.project_id[0]?.field_name;
          const isProjectMandatory = expenseFieldsMap?.project_id && expenseFieldsMap.project_id[0]?.is_mandatory;
          this.isProjectShown =
            this.orgSettings?.projects?.enabled && (!!extendedPerDiem.tx_project_name || isProjectMandatory);
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

    this.perDiemCustomFields$ = this.extendedPerDiem$.pipe(
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

    this.perDiemRate$ = this.extendedPerDiem$.pipe(
      switchMap((res) => {
        const perDiemRateId = parseInt(res.tx_per_diem_rate_id, 10);
        return this.perDiemService.getRate(perDiemRateId);
      })
    );

    this.view = this.activatedRoute.snapshot.params.view as ExpenseView;

    this.canFlagOrUnflag$ = this.extendedPerDiem$.pipe(
      filter(() => this.view === ExpenseView.team),
      map((etxn) =>
        ['COMPLETE', 'POLICY_APPROVED', 'APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING'].includes(etxn.tx_state)
      )
    );

    this.canDelete$ = this.extendedPerDiem$.pipe(
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
      this.policyViolations$ =
        this.view === ExpenseView.team
          ? this.policyService.getApproverExpensePolicyViolations(id)
          : this.policyService.getSpenderExpensePolicyViolations(id);
    } else {
      this.policyViolations$ = of(null);
    }

    this.comments$ = this.statusService.find('transactions', id);

    this.isCriticalPolicyViolated$ = this.extendedPerDiem$.pipe(
      map((res) => this.isNumber(res.tx_policy_amount) && res.tx_policy_amount < 0.0001)
    );

    this.getPolicyDetails(id);

    this.isAmountCapped$ = this.extendedPerDiem$.pipe(
      map((res) => this.isNumber(res.tx_admin_amount) || this.isNumber(res.tx_policy_amount))
    );

    this.extendedPerDiem$.subscribe((etxn) => {
      this.isExpenseFlagged = etxn.tx_manual_flag;
    });

    this.updateFlag$.next(null);

    const etxnIds =
      this.activatedRoute.snapshot.params.txnIds &&
      (JSON.parse(this.activatedRoute.snapshot.params.txnIds as string) as string[]);
    this.numEtxnsInReport = etxnIds.length;
    this.activeEtxnIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex as string, 10);
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
        deleteMethod: () => this.reportService.removeTransaction(etxn.tx_report_id, etxn.tx_id),
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

  async flagUnflagExpense(): Promise<void> {
    const id = this.activatedRoute.snapshot.params.id as string;
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
    this.isExpenseFlagged = etxn.tx_manual_flag;
    this.trackingService.expenseFlagUnflagClicked({ action: title });
  }

  getDisplayValue(customProperties: CustomField): string {
    const displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
    return displayValue === '-' ? 'Not Added' : displayValue;
  }
}
