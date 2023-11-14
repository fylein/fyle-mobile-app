import { Component, ViewChild, ElementRef } from '@angular/core';
import { Observable, from, Subject, noop, of, forkJoin } from 'rxjs';
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
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { PerDiemRates } from 'src/app/core/models/v1/per-diem-rates.model';
import { IndividualExpensePolicyState } from 'src/app/core/models/platform/platform-individual-expense-policy-state.model';
import { ExpenseDeletePopoverParams } from 'src/app/core/models/expense-delete-popover-params.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpensesService as ApproverExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { ExpensesService as SpenderExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';

@Component({
  selector: 'app-view-per-diem',
  templateUrl: './view-per-diem.page.html',
  styleUrls: ['./view-per-diem.page.scss'],
})
export class ViewPerDiemPage {
  @ViewChild('comments') commentsContainer: ElementRef;

  perDiemExpense$: Observable<Expense>;

  orgSettings: OrgSettings;

  perDiemCustomFields$: Observable<CustomField[]>;

  perDiemRate$: Observable<PerDiemRates>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isAmountCapped$: Observable<boolean>;

  policyViolations$: Observable<IndividualExpensePolicyState[]>;

  canFlagOrUnflag$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  expenseId: string;

  reportId: string;

  policyDetails;

  updateFlag$ = new Subject();

  comments$: Observable<ExtendedStatus[]>;

  isDeviceWidthSmall = window.innerWidth < 330;

  isExpenseFlagged: boolean;

  reportExpenseCount: number;

  activeExpenseIndex: number;

  paymentMode: string;

  paymentModeIcon: string;

  expenseCurrencySymbol: string;

  view: ExpenseView;

  isProjectShown: boolean;

  projectFieldName: string;

  isNewReportsFlowEnabled = false;

  expenseFields$: Observable<{ [key: string]: ExpenseField[] }>;

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
    private dependentFieldsService: DependentFieldsService,
    private spenderExpensesService: SpenderExpensesService,
    private approverExpensesService: ApproverExpensesService
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
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'transactions',
        objectId: this.expenseId,
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
    this.expenseId = this.activatedRoute.snapshot.params.id as string;
    this.view = this.activatedRoute.snapshot.params.view as ExpenseView;

    this.perDiemExpense$ = this.updateFlag$.pipe(
      switchMap(() =>
        from(this.loaderService.showLoader()).pipe(
          switchMap(() =>
            this.view === ExpenseView.team
              ? this.approverExpensesService.getExpenseById(this.expenseId)
              : this.spenderExpensesService.getExpenseById(this.expenseId)
          )
        )
      ),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.expenseFields$ = this.expenseFieldsService.getAllMap().pipe(shareReplay(1));

    this.projectDependentCustomProperties$ = forkJoin({
      perDiemExpense: this.perDiemExpense$.pipe(take(1)),
      expenseFields: this.expenseFields$.pipe(take(1)),
    }).pipe(
      filter(
        ({ perDiemExpense, expenseFields }) => perDiemExpense.custom_fields && expenseFields.project_id?.length > 0
      ),
      switchMap(({ perDiemExpense, expenseFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          perDiemExpense.custom_fields,
          expenseFields.project_id[0]?.id
        )
      )
    );

    this.costCenterDependentCustomProperties$ = forkJoin({
      perDiemExpense: this.perDiemExpense$.pipe(take(1)),
      expenseFields: this.expenseFields$.pipe(take(1)),
    }).pipe(
      filter(
        ({ perDiemExpense, expenseFields }) => perDiemExpense.custom_fields && expenseFields.cost_center_id?.length > 0
      ),
      switchMap(({ perDiemExpense, expenseFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          perDiemExpense.custom_fields,
          expenseFields.cost_center_id[0]?.id
        )
      ),
      shareReplay(1)
    );

    this.perDiemExpense$.subscribe((perDiemExpense) => {
      this.reportId = perDiemExpense.report_id;

      if (perDiemExpense.source_account.type === AccountType.PERSONAL_ADVANCE_ACCOUNT) {
        this.paymentMode = 'Paid from Advance';
        this.paymentModeIcon = 'fy-non-reimbursable';
      } else if (!perDiemExpense.is_reimbursable) {
        this.paymentMode = 'Paid by Company';
        this.paymentModeIcon = 'fy-non-reimbursable';
      } else {
        this.paymentMode = 'Paid by Employee';
        this.paymentModeIcon = 'fy-reimbursable';
      }

      this.expenseCurrencySymbol = getCurrencySymbol(perDiemExpense.currency, 'wide');
    });

    forkJoin([this.expenseFields$, this.perDiemExpense$.pipe(take(1))])
      .pipe(
        map(([expenseFieldsMap, perDiemExpense]) => {
          this.projectFieldName = expenseFieldsMap?.project_id && expenseFieldsMap?.project_id[0]?.field_name;
          const isProjectMandatory = expenseFieldsMap?.project_id && expenseFieldsMap?.project_id[0]?.is_mandatory;
          this.isProjectShown =
            this.orgSettings?.projects?.enabled && (!!perDiemExpense.project?.name || isProjectMandatory);
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

    this.perDiemCustomFields$ = this.perDiemExpense$.pipe(
      switchMap((expense) =>
        this.customInputsService.fillCustomProperties(expense.category_id, expense.custom_fields, true)
      ),
      map((customProperties) =>
        customProperties.map((customProperty) => {
          customProperty.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperty);
          return customProperty;
        })
      )
    );

    this.perDiemRate$ = this.perDiemExpense$.pipe(
      switchMap((perDiemExpense) => {
        const perDiemRateId = perDiemExpense.per_diem_rate_id;
        return this.perDiemService.getRate(perDiemRateId);
      })
    );

    this.canFlagOrUnflag$ = this.perDiemExpense$.pipe(
      filter(() => this.view === ExpenseView.team),
      map((expense) =>
        [
          ExpenseState.COMPLETE,
          ExpenseState.APPROVER_PENDING,
          ExpenseState.APPROVED,
          ExpenseState.PAYMENT_PENDING,
        ].includes(expense.state)
      )
    );

    this.canDelete$ = this.perDiemExpense$.pipe(
      filter(() => this.view === ExpenseView.team),
      switchMap((expense) =>
        this.reportService.getTeamReport(expense.report_id).pipe(map((report) => ({ report, expense })))
      ),
      map(({ report, expense }) =>
        report.rp_num_transactions === 1
          ? false
          : ![ExpenseState.PAYMENT_PENDING, ExpenseState.PAYMENT_PROCESSING, ExpenseState.PAID].includes(expense.state)
      )
    );

    if (this.expenseId) {
      this.policyViolations$ =
        this.view === ExpenseView.team
          ? this.policyService.getApproverExpensePolicyViolations(this.expenseId)
          : this.policyService.getSpenderExpensePolicyViolations(this.expenseId);
    } else {
      this.policyViolations$ = of(null);
    }

    this.comments$ = this.statusService.find('transactions', this.expenseId);

    this.isCriticalPolicyViolated$ = this.perDiemExpense$.pipe(
      map((expense) => this.isNumber(expense.policy_amount) && expense.policy_amount < 0.0001)
    );

    this.getPolicyDetails(this.expenseId);

    this.isAmountCapped$ = this.perDiemExpense$.pipe(
      map((expense) => this.isNumber(expense.admin_amount) || this.isNumber(expense.policy_amount))
    );

    this.perDiemExpense$.subscribe((expense) => {
      this.isExpenseFlagged = !!expense.is_manually_flagged;
    });

    this.updateFlag$.next(null);

    const expenseIds =
      this.activatedRoute.snapshot.params.txnIds &&
      (JSON.parse(this.activatedRoute.snapshot.params.txnIds as string) as string[]);
    this.reportExpenseCount = expenseIds.length;
    this.activeExpenseIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex as string, 10);
  }

  getDeleteDialogProps(): ExpenseDeletePopoverParams {
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
        deleteMethod: (): Observable<void> => this.reportService.removeTransaction(this.reportId, this.expenseId),
      },
    };
  }

  async removeExpenseFromReport(): Promise<void> {
    const deletePopover = await this.popoverController.create(this.getDeleteDialogProps());

    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as { data: { status: string } };

    if (data && data.status === 'success') {
      this.trackingService.expenseRemovedByApprover();
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.reportId, navigate_back: true }]);
    }
  }

  async flagUnflagExpense(): Promise<void> {
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
            return this.statusService.post('transactions', this.expenseId, comment, true);
          }),
          concatMap(() =>
            this.isExpenseFlagged
              ? this.transactionService.manualUnflag(this.expenseId)
              : this.transactionService.manualFlag(this.expenseId)
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

  getDisplayValue(customProperties: CustomField): string {
    const displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
    return displayValue === '-' ? 'Not Added' : displayValue;
  }
}
