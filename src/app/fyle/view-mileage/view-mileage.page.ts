import { Component, EventEmitter, inject } from '@angular/core';
import { Observable, from, Subject, concat, noop, of, forkJoin } from 'rxjs';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { switchMap, finalize, shareReplay, map, takeUntil, take, filter } from 'rxjs/operators';
import { IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonRow, IonTitle, IonToolbar, ModalController, PopoverController } from '@ionic/angular/standalone';
import { NetworkService } from '../../core/services/network.service';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { getCurrencySymbol, NgClass, AsyncPipe, TitleCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { IndividualExpensePolicyState } from 'src/app/core/models/platform/platform-individual-expense-policy-state.model';
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { ExpenseDeletePopoverParams } from 'src/app/core/models/expense-delete-popover-params.model';
import { ExpensesService as ApproverExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { ExpensesService as SpenderExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { ExpenseState as ExpenseStateEnum } from 'src/app/core/models/expense-state.enum';
import { MileageRatesService } from 'src/app/core/services/mileage-rates.service';
import { PlatformMileageRates } from 'src/app/core/models/platform/platform-mileage-rates.model';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { ApproverFileService } from 'src/app/core/services/platform/v1/approver/file.service';
import { Expense as PlatformExpense } from 'src/app/core/models/platform/v1/expense.model';
import { PlatformFileGenerateUrlsResponse } from 'src/app/core/models/platform/platform-file-generate-urls-response.model';
import { ExpenseCommentService as SpenderExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { ExpenseCommentService as ApproverExpenseCommentService } from 'src/app/core/services/platform/v1/approver/expense-comment.service';
import { FyPolicyViolationInfoComponent } from '../../shared/components/fy-policy-violation-info/fy-policy-violation-info.component';
import { ReceiptPreviewThumbnailComponent } from '../../shared/components/receipt-preview-thumbnail/receipt-preview-thumbnail.component';
import { ViewDependentFieldsComponent } from '../../shared/components/view-dependent-fields/view-dependent-fields.component';
import { NavigationFooterComponent } from '../../shared/components/navigation-footer/navigation-footer.component';
import { ExactCurrencyPipe } from '../../shared/pipes/exact-currency.pipe';
import { SnakeCaseToSpaceCase } from '../../shared/pipes/snake-case-to-space-case.pipe';
import { ExpenseState as ExpenseStatePipe } from '../../shared/pipes/expense-state.pipe';
import { FyCurrencyPipe } from '../../shared/pipes/fy-currency.pipe';
import { MileageRateName } from '../../shared/pipes/mileage-rate-name.pipe';

@Component({
  selector: 'app-view-mileage',
  templateUrl: './view-mileage.page.html',
  styleUrls: ['./view-mileage.page.scss'],
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    ExactCurrencyPipe,
    ExpenseStatePipe,
    FyCurrencyPipe,
    FyPolicyViolationInfoComponent,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonRow,
    IonTitle,
    IonToolbar,
    MileageRateName,
    NavigationFooterComponent,
    NgClass,
    ReceiptPreviewThumbnailComponent,
    SnakeCaseToSpaceCase,
    TitleCasePipe,
    ViewDependentFieldsComponent
  ],
})
export class ViewMileagePage {
  private activatedRoute = inject(ActivatedRoute);

  private loaderService = inject(LoaderService);

  private customInputsService = inject(CustomInputsService);

  private policyService = inject(PolicyService);

  private popoverController = inject(PopoverController);

  private router = inject(Router);

  private networkService = inject(NetworkService);

  private modalController = inject(ModalController);

  private modalProperties = inject(ModalPropertiesService);

  private trackingService = inject(TrackingService);

  private expenseFieldsService = inject(ExpenseFieldsService);

  private orgSettingsService = inject(PlatformOrgSettingsService);

  private dependentFieldsService = inject(DependentFieldsService);

  private fileService = inject(FileService);

  private approverExpensesService = inject(ApproverExpensesService);

  private spenderExpensesService = inject(SpenderExpensesService);

  private mileageRatesService = inject(MileageRatesService);

  private approverReportsService = inject(ApproverReportsService);

  private spenderFileService = inject(SpenderFileService);

  private approverFileService = inject(ApproverFileService);

  private spenderExpenseCommentService = inject(SpenderExpenseCommentService);

  private approverExpenseCommentService = inject(ApproverExpenseCommentService);

  mileageExpense$: Observable<Expense>;

  orgSettings: OrgSettings;

  mileageCustomFields$: Observable<CustomField[]>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isAmountCapped$: Observable<boolean>;

  policyViloations$: Observable<IndividualExpensePolicyState[]>;

  canDelete$: Observable<boolean>;

  updateFlag$ = new Subject();

  expenseId: string;

  reportId: string;

  policyDetails: IndividualExpensePolicyState[] | [];

  isConnected$: Observable<boolean>;

  onPageExit$ = new Subject();

  comments$: Observable<ExtendedStatus[]>;

  isDeviceWidthSmall = window.innerWidth < 330;

  reportExpenseCount: number;

  activeExpenseIndex: number;

  paymentMode: string;

  paymentModeIcon: string;

  expenseCurrencySymbol: string;

  vehicleType: string;

  view: ExpenseView;

  isProjectShown: boolean;

  projectFieldName: string;

  isNewReportsFlowEnabled = false;

  expenseFields$: Observable<{ [key: string]: ExpenseField[] }>;

  projectDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  costCenterDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  mapAttachment$: Observable<FileObject>;

  mileageRate$: Observable<PlatformMileageRates>;

  commuteDeduction: string;

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
      shareReplay(1),
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

  setCommuteDeductionDetails(commuteDeduction: string): void {
    switch (commuteDeduction) {
      case 'ONE_WAY':
        this.commuteDeduction = 'One way';
        break;
      case 'ROUND_TRIP':
        this.commuteDeduction = 'Round trip';
        break;
      default:
        this.commuteDeduction = 'No deduction';
        break;
    }
  }

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();

    this.expenseId = this.activatedRoute.snapshot.params.id as string;
    this.view = this.activatedRoute.snapshot.params.view as ExpenseView;

    this.mileageExpense$ = this.updateFlag$.pipe(
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

    this.mapAttachment$ = this.mileageExpense$.pipe(
      take(1),
      switchMap((expense: PlatformExpense) => {
        if (expense.file_ids.length > 0) {
          if (this.view === ExpenseView.individual) {
            return this.spenderFileService.generateUrls(expense.file_ids[0]);
          } else {
            return this.approverFileService.generateUrls(expense.file_ids[0]);
          }
        } else {
          return of(null);
        }
      }),
      map((response: PlatformFileGenerateUrlsResponse) => {
        if (response !== null) {
          const details = this.fileService.getReceiptsDetails(response.name, response.download_url);

          const receipt: FileObject = {
            id: response.id,
            name: response.name,
            url: response.download_url,
            type: details.type,
            thumbnail: details.thumbnail,
          };

          return receipt;
        } else {
          return null;
        }
      }),
    );

    this.expenseFields$ = this.expenseFieldsService.getAllMap().pipe(shareReplay(1));

    this.projectDependentCustomProperties$ = forkJoin({
      expense: this.mileageExpense$.pipe(take(1)),
      expenseFields: this.expenseFields$.pipe(take(1)),
    }).pipe(
      filter(({ expense, expenseFields }) => expense.custom_fields && expenseFields.project_id?.length > 0),
      switchMap(({ expense, expenseFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          expense.custom_fields as Partial<CustomInput>[],
          expenseFields.project_id[0]?.id,
        ),
      ),
    );

    this.costCenterDependentCustomProperties$ = forkJoin({
      expense: this.mileageExpense$.pipe(take(1)),
      expenseFields: this.expenseFields$.pipe(take(1)),
    }).pipe(
      filter(({ expense, expenseFields }) => expense.custom_fields && expenseFields.cost_center_id?.length > 0),
      switchMap(({ expense, expenseFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          expense.custom_fields as Partial<CustomInput[]>,
          expenseFields.cost_center_id[0]?.id,
        ),
      ),
      shareReplay(1),
    );

    this.mileageExpense$.subscribe((expense) => {
      this.reportId = expense.report_id;

      if (expense.source_account.type === AccountType.PERSONAL_ADVANCE_ACCOUNT) {
        this.paymentMode = 'Paid from Advance';
        this.paymentModeIcon = 'cash-slash';
      } else if (!expense.is_reimbursable) {
        this.paymentMode = 'Paid by Company';
        this.paymentModeIcon = 'cash-slash';
      } else {
        this.paymentMode = 'Paid by Employee';
        this.paymentModeIcon = 'cash';
      }

      if (expense.mileage_rate) {
        const vehicleType = expense.mileage_rate.vehicle_type.toLowerCase();
        this.vehicleType = vehicleType.includes('four') || vehicleType.includes('car') ? 'car' : 'scooter';
      }

      if (expense.commute_deduction) {
        this.setCommuteDeductionDetails(expense.commute_deduction);
      }

      this.expenseCurrencySymbol = getCurrencySymbol(expense.currency, 'wide');
    });

    forkJoin([this.expenseFields$, this.mileageExpense$.pipe(take(1))])
      .pipe(
        map(([expenseFieldsMap, expense]) => {
          this.projectFieldName = expenseFieldsMap?.project_id && expenseFieldsMap.project_id[0]?.field_name;
          const isProjectMandatory = expenseFieldsMap?.project_id && expenseFieldsMap.project_id[0]?.is_mandatory;
          this.isProjectShown = this.orgSettings?.projects?.enabled && (!!expense.project?.name || isProjectMandatory);
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

    this.mileageCustomFields$ = this.mileageExpense$.pipe(
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

    this.mileageRate$ = this.mileageExpense$.pipe(
      switchMap((expense) => {
        const id = expense.mileage_rate_id;
        return this.view === ExpenseView.team
          ? this.mileageRatesService.getApproverMileageRateById(id)
          : this.mileageRatesService.getSpenderMileageRateById(id);
      }),
    );

    this.canDelete$ = this.mileageExpense$.pipe(
      take(1),
      filter(() => this.view === ExpenseView.team),
      switchMap((expense) =>
        this.approverReportsService.getReportById(expense.report_id).pipe(map((report) => ({ report, expense }))),
      ),
      map(({ report, expense }) =>
        report.num_expenses === 1
          ? false
          : ![ExpenseStateEnum.PAYMENT_PENDING, ExpenseStateEnum.PAYMENT_PROCESSING, ExpenseStateEnum.PAID].includes(expense.state),
      ),
    );

    if (this.expenseId) {
      this.policyViloations$ =
        this.view === ExpenseView.team
          ? this.policyService.getApproverExpensePolicyViolations(this.expenseId)
          : this.policyService.getSpenderExpensePolicyViolations(this.expenseId);
    } else {
      this.policyViloations$ = of(null);
    }

    this.comments$ =
      this.view === ExpenseView.team
        ? this.approverExpenseCommentService.getTransformedComments(this.expenseId)
        : this.spenderExpenseCommentService.getTransformedComments(this.expenseId);

    this.isCriticalPolicyViolated$ = this.mileageExpense$.pipe(
      map((expense) => this.isNumber(expense.policy_amount) && expense.policy_amount < 0.0001),
    );

    this.getPolicyDetails(this.expenseId);

    this.isAmountCapped$ = this.mileageExpense$.pipe(
      map((expense) => this.isNumber(expense.admin_amount) || this.isNumber(expense.policy_amount)),
    );

    this.updateFlag$.next(null);

    const expenseIds =
      this.activatedRoute.snapshot.params.txnIds &&
      (JSON.parse(this.activatedRoute.snapshot.params.txnIds as string) as string[]);
    this.reportExpenseCount = expenseIds.length;
    this.activeExpenseIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex as string, 10);
  }

  getDisplayValue(customProperties: CustomField): boolean | string {
    const displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
    return displayValue === '-' ? 'Not Added' : displayValue;
  }

  viewAttachment(): void {
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.mapAttachment$),
        finalize(() => from(this.loaderService.hideLoader())),
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
