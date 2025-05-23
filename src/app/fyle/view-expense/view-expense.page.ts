import { Component, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Observable, from, Subject, concat, noop, forkJoin, of } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { switchMap, shareReplay, concatMap, map, finalize, takeUntil, take, filter } from 'rxjs/operators';
import { FileService } from 'src/app/core/services/file.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { NetworkService } from '../../core/services/network.service';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { getCurrencySymbol } from '@angular/common';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { ExpensesService as ApproverExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { ExpensesService as SpenderExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ExpenseCommentService as SpenderExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { ExpenseCommentService as ApproverExpenseCommentService } from 'src/app/core/services/platform/v1/approver/expense-comment.service';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { TransactionStatusInfoPopoverComponent } from 'src/app/shared/components/transaction-status-info-popover/transaction-status-info-popover.component';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { ApproverFileService } from 'src/app/core/services/platform/v1/approver/file.service';
import { PlatformFileGenerateUrlsResponse } from 'src/app/core/models/platform/platform-file-generate-urls-response.model';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { CCExpenseMerchantInfoModalComponent } from 'src/app/shared/components/cc-expense-merchant-info-modal/cc-expense-merchant-info-modal.component';

@Component({
  selector: 'app-view-expense',
  templateUrl: './view-expense.page.html',
  styleUrls: ['./view-expense.page.scss'],
})
export class ViewExpensePage {
  @ViewChild('comments') commentsContainer: ElementRef;

  expense$: Observable<Expense>;

  policyViloations$: Observable<ExtendedStatus[]>;

  isAmountCapped$: Observable<boolean>;

  isCriticalPolicyViolated$: Observable<boolean>;

  customProperties$: Observable<CustomField[]>;

  expenseWithoutCustomProperties$: Observable<Expense>;

  canDelete$: Observable<boolean>;

  orgSettings: OrgSettings;

  expenseId: string;

  reportId: string;

  attachments$: Observable<FileObject[]>;

  updateFlag$ = new Subject();

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  comments$: Observable<ExtendedStatus[]>;

  policyDetails;

  isDeviceWidthSmall = window.innerWidth < 330;

  isSplitExpense: boolean;

  exchangeRate: number;

  paymentMode: string;

  isCCCTransaction = false;

  reportExpenseCount: number;

  activeExpenseIndex: number;

  paymentModeIcon: string;

  expenseCurrencySymbol: string;

  foreignCurrencySymbol: string;

  view: ExpenseView;

  isProjectShown: boolean;

  merchantFieldName: string;

  projectFieldName: string;

  isLoading = true;

  cardNumber: string;

  cardNickname: string;

  systemCategories: string[];

  travelSystemCategories: string[];

  flightSystemCategories: string[];

  breakfastSystemCategories: string[];

  systemCategoriesWithTaxi: string[];

  isNewReportsFlowEnabled = false;

  expenseFields$: Observable<{ [key: string]: ExpenseField[] }>;

  projectDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  costCenterDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  isRTFEnabled: boolean;

  constructor(
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private customInputsService: CustomInputsService,
    private fileService: FileService,
    private modalController: ModalController,
    private router: Router,
    private popoverController: PopoverController,
    private networkService: NetworkService,
    private policyService: PolicyService,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService,
    private expenseFieldsService: ExpenseFieldsService,
    private orgSettingsService: OrgSettingsService,
    private categoriesService: CategoriesService,
    private dependentFieldsService: DependentFieldsService,
    private spenderExpensesService: SpenderExpensesService,
    private approverExpensesService: ApproverExpensesService,
    private spenderFileService: SpenderFileService,
    private approverFileService: ApproverFileService,
    private approverReportsService: ApproverReportsService,
    private spenderExpenseCommentService: SpenderExpenseCommentService,
    private approverExpenseCommentService: ApproverExpenseCommentService
  ) {}

  get ExpenseView(): typeof ExpenseView {
    return ExpenseView;
  }

  ionViewWillLeave(): void {
    this.onPageExit.next(null);
  }

  setupNetworkWatcher(): void {
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

  isNumber(val: string | number): boolean {
    return typeof val === 'number';
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

  isPolicyComment(estatus: ExtendedStatus): boolean {
    return estatus.st_org_user_id === 'POLICY';
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

  getDisplayValue(customProperties: CustomField): boolean | string {
    const displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
    return displayValue === '-' ? 'Not Added' : displayValue;
  }

  goBack(): void {
    if (this.view === ExpenseView.team) {
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.reportId, navigate_back: true }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.reportId, navigate_back: true }]);
    }
  }

  setPaymentModeandIcon(expense: Expense): void {
    if (expense.source_account.type === AccountType.PERSONAL_ADVANCE_ACCOUNT) {
      this.paymentMode = 'Advance';
      this.paymentModeIcon = 'cash-slash';
    } else if (expense.source_account.type === AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT) {
      this.paymentMode = 'Corporate Card';
      this.paymentModeIcon = 'card';
      this.isCCCTransaction = true;
    } else if (!expense.is_reimbursable) {
      this.paymentMode = 'Paid by Company';
      this.paymentModeIcon = 'cash-slash';
    } else {
      this.paymentMode = 'Paid by Employee';
      this.paymentModeIcon = 'cash';
    }
  }

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();

    this.expenseId = this.activatedRoute.snapshot.params.id as string;
    this.view = this.activatedRoute.snapshot.params.view as ExpenseView;

    this.systemCategories = this.categoriesService.getSystemCategories();
    this.systemCategoriesWithTaxi = this.categoriesService.getSystemCategoriesWithTaxi();
    this.breakfastSystemCategories = this.categoriesService.getBreakfastSystemCategories();
    this.travelSystemCategories = this.categoriesService.getTravelSystemCategories();
    this.flightSystemCategories = this.categoriesService.getFlightSystemCategories();

    this.expenseWithoutCustomProperties$ = this.updateFlag$.pipe(
      switchMap(() =>
        this.view === ExpenseView.team
          ? this.approverExpensesService.getExpenseById(this.expenseId)
          : this.spenderExpensesService.getExpenseById(this.expenseId)
      ),
      shareReplay(1)
    );

    this.expenseWithoutCustomProperties$.subscribe((res) => {
      this.reportId = res.report_id;
    });

    this.customProperties$ = this.expenseWithoutCustomProperties$.pipe(
      concatMap((expense) =>
        this.customInputsService.fillCustomProperties(
          expense.category_id,
          expense.custom_fields as Partial<CustomInput>[]
        )
      ),
      shareReplay(1)
    );

    this.expense$ = this.expenseWithoutCustomProperties$.pipe(
      finalize(() => this.loaderService.hideLoader()),
      shareReplay(1)
    );

    this.expenseFields$ = this.expenseFieldsService.getAllMap().pipe(shareReplay(1));

    this.projectDependentCustomProperties$ = forkJoin({
      expense: this.expense$.pipe(take(1)),
      expenseFields: this.expenseFields$.pipe(take(1)),
    }).pipe(
      filter(({ expense, expenseFields }) => expense.custom_fields && expenseFields.project_id?.length > 0),
      switchMap(({ expense, expenseFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          expense.custom_fields as Partial<CustomInput>[],
          expenseFields.project_id[0]?.id
        )
      )
    );

    this.costCenterDependentCustomProperties$ = forkJoin({
      expense: this.expense$.pipe(take(1)),
      expenseFields: this.expenseFields$.pipe(take(1)),
    }).pipe(
      filter(({ expense, expenseFields }) => expense.custom_fields && expenseFields.cost_center_id?.length > 0),
      switchMap(({ expense, expenseFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          expense.custom_fields as Partial<CustomInput>[],
          expenseFields.cost_center_id[0]?.id
        )
      ),
      shareReplay(1)
    );

    this.expense$.subscribe((expense) => {
      this.isSplitExpense = expense.is_split;

      if (expense.amount && expense.foreign_amount) {
        this.exchangeRate = expense.amount / expense.foreign_amount;
      }

      this.setPaymentModeandIcon(expense);

      if (this.isCCCTransaction && expense.matched_corporate_card_transactions[0]) {
        this.paymentModeIcon = 'card';

        const matchedCCCTransaction = expense.matched_corporate_card_transactions[0];
        this.cardNumber = matchedCCCTransaction.corporate_card_number;
        this.cardNickname = matchedCCCTransaction.corporate_card_nickname;
      }
      this.foreignCurrencySymbol = getCurrencySymbol(expense.foreign_currency, 'wide');
      this.expenseCurrencySymbol = getCurrencySymbol(expense.currency, 'wide');
    });

    forkJoin([this.expenseFields$, this.expense$.pipe(take(1))])
      .pipe(
        map(([expenseFieldsMap, expense]) => {
          this.projectFieldName = expenseFieldsMap?.project_id[0]?.field_name;
          const isProjectMandatory = expenseFieldsMap?.project_id && expenseFieldsMap?.project_id[0]?.is_mandatory;
          this.isProjectShown = this.orgSettings.projects?.enabled && (!!expense.project?.name || isProjectMandatory);
        })
      )
      .subscribe(noop);

    this.policyViloations$ = this.expenseWithoutCustomProperties$.pipe(
      concatMap((expense) =>
        this.view === ExpenseView.team
          ? this.approverExpenseCommentService.getTransformedComments(expense.id)
          : this.spenderExpenseCommentService.getTransformedComments(expense.id)
      ),
      map((comments) => comments.filter(this.isPolicyComment))
    );

    this.comments$ =
      this.view === ExpenseView.team
        ? this.approverExpenseCommentService.getTransformedComments(this.expenseId)
        : this.spenderExpenseCommentService.getTransformedComments(this.expenseId);

    this.canDelete$ = this.expenseWithoutCustomProperties$.pipe(
      filter(() => this.view === ExpenseView.team),
      switchMap((expense) =>
        this.approverReportsService.getReportById(expense.report_id).pipe(map((report) => ({ report, expense })))
      ),
      map(({ report, expense }) =>
        report.num_expenses === 1
          ? false
          : ![ExpenseState.PAYMENT_PENDING, ExpenseState.PAYMENT_PROCESSING, ExpenseState.PAID].includes(expense.state)
      )
    );

    this.isAmountCapped$ = this.expense$.pipe(
      map((expense) => this.isNumber(expense.admin_amount) || this.isNumber(expense.policy_amount))
    );

    this.orgSettingsService.get().subscribe((orgSettings) => {
      this.orgSettings = orgSettings;
      this.isRTFEnabled =
        (orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled) ||
        (orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled);
      this.isNewReportsFlowEnabled = orgSettings.simplified_report_closure_settings?.enabled || false;
    });

    this.expenseFieldsService
      .getAllMap()
      .pipe(
        map((expenseFieldsMap) => {
          this.merchantFieldName = expenseFieldsMap.vendor_id[0]?.field_name;
        })
      )
      .subscribe(noop);

    this.isCriticalPolicyViolated$ = this.expense$.pipe(
      map((expense) => this.isNumber(expense.policy_amount) && expense.policy_amount < 0.0001)
    );

    this.getPolicyDetails(this.expenseId);

    const editExpenseAttachments = this.expense$.pipe(
      take(1),
      switchMap((expense) => {
        if (expense.file_ids.length > 0) {
          if (this.view === ExpenseView.individual) {
            return this.spenderFileService.generateUrlsBulk(expense.file_ids);
          } else {
            return this.approverFileService.generateUrlsBulk(expense.file_ids);
          }
        } else {
          return of([]);
        }
      }),
      map((response: PlatformFileGenerateUrlsResponse[]) => {
        const files = response.filter((file) => file.content_type !== 'text/html');
        const fileObjs = files.map((obj) => {
          const details = this.fileService.getReceiptsDetails(obj.name, obj.download_url);

          const fileObj: FileObject = {
            url: obj.download_url,
            type: details.type,
            thumbnail: details.thumbnail,
          };

          return fileObj;
        });

        return fileObjs;
      })
    );

    this.attachments$ = editExpenseAttachments;
    this.updateFlag$.next(null);
    this.attachments$.subscribe(noop, noop, () => {
      this.isLoading = false;
    });

    if (this.activatedRoute.snapshot.params.txnIds) {
      const expenseIds = JSON.parse(this.activatedRoute.snapshot.params.txnIds as string) as string[];
      this.reportExpenseCount = expenseIds.length;
      this.activeExpenseIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex as string, 10);
    }
  }

  getDeleteDialogProps(): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      infoMessage: string;
      ctaText: string;
      ctaLoadingText: string;
      deleteMethod: () => Observable<void>;
    };
  } {
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

  viewAttachments(): void {
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.attachments$),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(async (attachments) => {
        const attachmentsModal = await this.modalController.create({
          component: FyViewAttachmentComponent,
          componentProps: {
            attachments,
            canEdit: false,
          },
        });

        await attachmentsModal.present();
      });
  }

  async openTransactionStatusInfoModal(transactionStatus: ExpenseTransactionStatus): Promise<void> {
    const popover = await this.popoverController.create({
      component: TransactionStatusInfoPopoverComponent,
      componentProps: {
        transactionStatus,
      },
      cssClass: 'fy-dialog-popover',
    });

    await popover.present();
  }

  async openCCExpenseMerchantInfoModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: CCExpenseMerchantInfoModalComponent,
      ...this.modalProperties.getModalDefaultProperties('merchant-info'),
    });

    await modal.present();
  }
}
