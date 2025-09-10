import { Component, inject } from '@angular/core';
import { Observable, from, Subject, noop, of, forkJoin } from 'rxjs';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { switchMap, finalize, shareReplay, map, filter, take } from 'rxjs/operators';
import { PopoverController, ModalController } from '@ionic/angular/standalone';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { getCurrencySymbol, NgClass, AsyncPipe, TitleCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
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
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { ExpenseCommentService as SpenderExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { ExpenseCommentService as ApproverExpenseCommentService } from 'src/app/core/services/platform/v1/approver/expense-comment.service';
import { FyPolicyViolationInfoComponent } from '../../shared/components/fy-policy-violation-info/fy-policy-violation-info.component';
import { ViewDependentFieldsComponent } from '../../shared/components/view-dependent-fields/view-dependent-fields.component';
import { NavigationFooterComponent } from '../../shared/components/navigation-footer/navigation-footer.component';
import { ExactCurrencyPipe } from '../../shared/pipes/exact-currency.pipe';
import { SnakeCaseToSpaceCase } from '../../shared/pipes/snake-case-to-space-case.pipe';
import { ExpenseState as ExpenseState_1 } from '../../shared/pipes/expense-state.pipe';
import { FyCurrencyPipe } from '../../shared/pipes/fy-currency.pipe';

@Component({
  selector: 'app-view-per-diem',
  templateUrl: './view-per-diem.page.html',
  styleUrls: ['./view-per-diem.page.scss'],
  imports: [
    IonicModule,
    NgClass,
    FyPolicyViolationInfoComponent,
    ViewDependentFieldsComponent,
    NavigationFooterComponent,
    AsyncPipe,
    TitleCasePipe,
    CurrencyPipe,
    DatePipe,
    ExactCurrencyPipe,
    SnakeCaseToSpaceCase,
    ExpenseState_1,
    FyCurrencyPipe,
  ],
})
export class ViewPerDiemPage {
  private activatedRoute = inject(ActivatedRoute);

  private loaderService = inject(LoaderService);

  private customInputsService = inject(CustomInputsService);

  private perDiemService = inject(PerDiemService);

  private policyService = inject(PolicyService);

  private router = inject(Router);

  private popoverController = inject(PopoverController);

  private modalController = inject(ModalController);

  private modalProperties = inject(ModalPropertiesService);

  private trackingService = inject(TrackingService);

  private expenseFieldsService = inject(ExpenseFieldsService);

  private orgSettingsService = inject(OrgSettingsService);

  private dependentFieldsService = inject(DependentFieldsService);

  private spenderExpensesService = inject(SpenderExpensesService);

  private approverExpensesService = inject(ApproverExpensesService);

  private approverReportsService = inject(ApproverReportsService);

  private spenderExpenseCommentService = inject(SpenderExpenseCommentService);

  private approverExpenseCommentService = inject(ApproverExpenseCommentService);

  perDiemExpense$: Observable<Expense>;

  orgSettings: OrgSettings;

  perDiemCustomFields$: Observable<CustomField[]>;

  perDiemRate$: Observable<PerDiemRates>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isAmountCapped$: Observable<boolean>;

  policyViolations$: Observable<IndividualExpensePolicyState[]>;

  canDelete$: Observable<boolean>;

  expenseId: string;

  reportId: string;

  policyDetails;

  updateFlag$ = new Subject();

  comments$: Observable<ExtendedStatus[]>;

  isDeviceWidthSmall = window.innerWidth < 330;

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
        view: this.view,
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
              : this.spenderExpensesService.getExpenseById(this.expenseId),
          ),
        ),
      ),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1),
    );

    this.expenseFields$ = this.expenseFieldsService.getAllMap().pipe(shareReplay(1));

    this.projectDependentCustomProperties$ = forkJoin({
      perDiemExpense: this.perDiemExpense$.pipe(take(1)),
      expenseFields: this.expenseFields$.pipe(take(1)),
    }).pipe(
      filter(
        ({ perDiemExpense, expenseFields }) => perDiemExpense.custom_fields && expenseFields.project_id?.length > 0,
      ),
      switchMap(({ perDiemExpense, expenseFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          perDiemExpense.custom_fields as Partial<CustomInput>[],
          expenseFields.project_id[0]?.id,
        ),
      ),
    );

    this.costCenterDependentCustomProperties$ = forkJoin({
      perDiemExpense: this.perDiemExpense$.pipe(take(1)),
      expenseFields: this.expenseFields$.pipe(take(1)),
    }).pipe(
      filter(
        ({ perDiemExpense, expenseFields }) => perDiemExpense.custom_fields && expenseFields.cost_center_id?.length > 0,
      ),
      switchMap(({ perDiemExpense, expenseFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          perDiemExpense.custom_fields as Partial<CustomInput>[],
          expenseFields.cost_center_id[0]?.id,
        ),
      ),
      shareReplay(1),
    );

    this.perDiemExpense$.subscribe((perDiemExpense) => {
      this.reportId = perDiemExpense.report_id;

      if (perDiemExpense.source_account.type === AccountType.PERSONAL_ADVANCE_ACCOUNT) {
        this.paymentMode = 'Paid from Advance';
        this.paymentModeIcon = 'cash-slash';
      } else if (!perDiemExpense.is_reimbursable) {
        this.paymentMode = 'Paid by Company';
        this.paymentModeIcon = 'cash-slash';
      } else {
        this.paymentMode = 'Paid by Employee';
        this.paymentModeIcon = 'cash';
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
        }),
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
        this.customInputsService.fillCustomProperties(
          expense.category_id.toString(),
          expense.custom_fields as Partial<CustomInput>[],
        ),
      ),
      map((customProperties) =>
        customProperties.map((customProperty) => {
          customProperty.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperty);
          return customProperty;
        }),
      ),
    );

    this.perDiemRate$ = this.perDiemExpense$.pipe(
      switchMap((perDiemExpense) => {
        const perDiemRateId = perDiemExpense.per_diem_rate_id;
        return this.perDiemService.getRate(perDiemRateId);
      }),
    );

    this.canDelete$ = this.perDiemExpense$.pipe(
      filter(() => this.view === ExpenseView.team),
      switchMap((expense) =>
        this.approverReportsService.getReportById(expense.report_id).pipe(map((report) => ({ report, expense }))),
      ),
      map(({ report, expense }) =>
        report.num_expenses === 1
          ? false
          : ![ExpenseState.PAYMENT_PENDING, ExpenseState.PAYMENT_PROCESSING, ExpenseState.PAID].includes(expense.state),
      ),
    );

    if (this.expenseId) {
      this.policyViolations$ =
        this.view === ExpenseView.team
          ? this.policyService.getApproverExpensePolicyViolations(this.expenseId)
          : this.policyService.getSpenderExpensePolicyViolations(this.expenseId);
    } else {
      this.policyViolations$ = of(null);
    }

    this.comments$ =
      this.view === ExpenseView.team
        ? this.approverExpenseCommentService.getTransformedComments(this.expenseId)
        : this.spenderExpenseCommentService.getTransformedComments(this.expenseId);

    this.isCriticalPolicyViolated$ = this.perDiemExpense$.pipe(
      map((expense) => this.isNumber(expense.policy_amount) && expense.policy_amount < 0.0001),
    );

    this.getPolicyDetails(this.expenseId);

    this.isAmountCapped$ = this.perDiemExpense$.pipe(
      map((expense) => this.isNumber(expense.admin_amount) || this.isNumber(expense.policy_amount)),
    );

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
        header: 'Remove expense',
        body: 'Are you sure you want to remove this expense from the report?',
        infoMessage: 'The report amount will be adjusted accordingly.',
        ctaText: 'Remove',
        ctaLoadingText: 'Removing',
        deleteMethod: (): Observable<void> => this.approverReportsService.ejectExpenses(this.reportId, this.expenseId),
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

  getDisplayValue(customProperties: CustomField): string {
    const displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
    return displayValue === '-' ? 'Not Added' : displayValue;
  }
}
