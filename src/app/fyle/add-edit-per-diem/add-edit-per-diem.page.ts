// TODO: Very hard to fix this file without making massive changes
/* eslint-disable complexity */

import { Component, ElementRef, EventEmitter, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  concat,
  forkJoin,
  from,
  iif,
  Observable,
  of,
  Subject,
  Subscription,
  throwError,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { DateService } from 'src/app/core/services/date.service';
import dayjs from 'dayjs';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { cloneDeep, isEmpty, isEqual, isNumber } from 'lodash';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { ModalController, NavController, PopoverController, Platform } from '@ionic/angular';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { TokenService } from 'src/app/core/services/token.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { RecentlyUsed } from 'src/app/core/models/v1/recently_used.model';
import { ProjectV2 } from 'src/app/core/models/v2/project-v2.model';
import { CostCenter, CostCenters } from 'src/app/core/models/v1/cost-center.model';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { FyPolicyViolationComponent } from 'src/app/shared/components/fy-policy-violation/fy-policy-violation.component';
import { AccountOption } from 'src/app/core/models/account-option.model';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { ExpenseType } from 'src/app/core/enums/expense-type.enum';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ExpensePolicy } from 'src/app/core/models/platform/platform-expense-policy.model';
import { FinalExpensePolicyState } from 'src/app/core/models/platform/platform-final-expense-policy-state.model';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { StorageService } from 'src/app/core/services/storage.service';
import { DependentFieldsComponent } from 'src/app/shared/components/dependent-fields/dependent-fields.component';
import { PerDiemRates } from 'src/app/core/models/v1/per-diem-rates.model';
import { OrgCategory } from 'src/app/core/models/v1/org-category.model';
import { ExpenseFieldsObj } from 'src/app/core/models/v1/expense-fields-obj.model';
import { UnflattenedTransaction } from 'src/app/core/models/unflattened-transaction.model';
import { PerDiemFormValue } from 'src/app/core/models/per-diem-form-value.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { TxnCustomProperties } from 'src/app/core/models/txn-custom-properties.model';
import { CurrencyObj } from 'src/app/core/models/currency-obj.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { OrgUser } from 'src/app/core/models/org-user.model';
import { PerDiemCustomInputs } from 'src/app/core/models/per-diem-custom-inputs.model';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { OutboxQueue } from 'src/app/core/models/outbox-queue.model';
import { AllowedPerDiemRateOptions } from 'src/app/core/models/allowed-per-diem-rate-options.model';
import { PerDiemReports } from 'src/app/core/models/per-diem-reports.model';
import { TransactionState } from 'src/app/core/models/transaction-state.enum';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { Expense } from 'src/app/core/models/expense.model';
import { PerDiemRedirectedFrom } from 'src/app/core/models/per-diem-redirected-from.enum';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { CostCentersService } from 'src/app/core/services/cost-centers.service';
import { ExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';

@Component({
  selector: 'app-add-edit-per-diem',
  templateUrl: './add-edit-per-diem.page.html',
  styleUrls: ['./add-edit-per-diem.page.scss'],
})
export class AddEditPerDiemPage implements OnInit {
  @ViewChild('duplicateInputContainer') duplicateInputContainer: ElementRef;

  @ViewChild('formContainer') formContainer: ElementRef;

  @ViewChild('comments') commentsContainer: ElementRef;

  @ViewChild('projectDependentFieldsRef') projectDependentFieldsRef: DependentFieldsComponent;

  @ViewChild('costCenterDependentFieldsRef') costCenterDependentFieldsRef: DependentFieldsComponent;

  title: string;

  activeIndex: number;

  reviewList: string[];

  mode = 'add';

  canCreatePerDiem$: Observable<boolean>;

  allowedPerDiemRateOptions$: Observable<AllowedPerDiemRateOptions[]>;

  paymentModes$: Observable<AccountOption[]>;

  homeCurrency$: Observable<string>;

  fg: UntypedFormGroup;

  minDate: string;

  maxDate: string;

  txnFields$: Observable<Partial<ExpenseFieldsObj>>;

  subCategories$: Observable<OrgCategory[]>;

  isAmountDisabled = false;

  etxn$: Observable<Partial<UnflattenedTransaction>>;

  isIndividualProjectsEnabled$: Observable<boolean>;

  individualProjectIds$: Observable<number[]>;

  isProjectsEnabled$: Observable<boolean>;

  isProjectCategoryRestrictionsEnabled$: Observable<boolean>;

  isCostCentersEnabled$: Observable<boolean>;

  customInputs$: Observable<PerDiemCustomInputs[]>;

  costCenters$: Observable<CostCenters[]>;

  reports$: Observable<PerDiemReports[]>;

  isAmountCapped$: Observable<boolean>;

  isAmountDisabled$: Observable<boolean>;

  isCriticalPolicyViolated$: Observable<boolean>;

  projectCategoryIds$: Observable<string[]>;

  projectCategories$: Observable<OrgCategory[]>;

  filteredCategories$: Observable<{ label: string; value: OrgCategory }[]>;

  isConnected$: Observable<boolean>;

  invalidPaymentMode = false;

  comments$: Observable<ExtendedStatus[]>;

  expenseStartTime;

  policyDetails;

  navigateBack = false;

  savePerDiemLoader = false;

  saveAndNextPerDiemLoader = false;

  saveAndPrevPerDiemLoader = false;

  clusterDomain: string;

  initialFetch;

  individualPerDiemRatesEnabled$: Observable<boolean>;

  recentlyUsedValues$: Observable<RecentlyUsed>;

  recentProjects: { label: string; value: ProjectV2; selected?: boolean }[];

  recentlyUsedProjects$: Observable<ProjectV2[]>;

  presetProjectId: number;

  recentCostCenters: { label: string; value: CostCenter; selected?: boolean }[];

  presetCostCenterId: number;

  recentlyUsedCostCenters$: Observable<{ label: string; value: CostCenter; selected?: boolean }[]>;

  isProjectVisible$: Observable<boolean>;

  billableDefaultValue: boolean;

  showBillable = false;

  isRedirectedFromReport = false;

  canRemoveFromReport = false;

  autoSubmissionReportName$: Observable<string>;

  hardwareBackButtonAction: Subscription;

  isNewReportsFlowEnabled = false;

  onPageExit$: Subject<void>;

  dependentFields$: Observable<ExpenseField[]>;

  selectedProject$: BehaviorSubject<ProjectV2>;

  selectedCostCenter$: BehaviorSubject<CostCenter>;

  private _isExpandedView = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private dateService: DateService,
    private accountsService: AccountsService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private currencyService: CurrencyService,
    private reportService: ReportService,
    private platformReportService: SpenderReportsService,
    private projectsService: ProjectsService,
    private transactionsOutboxService: TransactionsOutboxService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private policyService: PolicyService,
    private loaderService: LoaderService,
    private router: Router,
    private modalController: ModalController,
    private networkService: NetworkService,
    private navController: NavController,
    private trackingService: TrackingService,
    private fyCurrencyPipe: FyCurrencyPipe,
    private tokenService: TokenService,
    private recentlyUsedItemsService: RecentlyUsedItemsService,
    private expenseFieldsService: ExpenseFieldsService,
    private popoverController: PopoverController,
    private modalProperties: ModalPropertiesService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private paymentModesService: PaymentModesService,
    private perDiemService: PerDiemService,
    private categoriesService: CategoriesService,
    private costCentersService: CostCentersService,
    private platformEmployeeSettingsService: PlatformEmployeeSettingsService,
    private orgSettingsService: OrgSettingsService,
    private platform: Platform,
    private storageService: StorageService,
    private expensesService: ExpensesService,
    private expenseCommentService: ExpenseCommentService
  ) {}

  get minPerDiemDate(): string {
    return (
      this.fg.controls.from_dt.value &&
      dayjs(this.fg.controls.from_dt.value as string)
        .subtract(1, 'day')
        .format('YYYY-MM-D')
    );
  }

  get isExpandedView(): boolean {
    return this._isExpandedView;
  }

  set isExpandedView(expandedView: boolean) {
    this._isExpandedView = expandedView;

    //Change the storage only in case of add expense
    if (this.mode === 'add') {
      this.storageService.set('isExpandedViewPerDiem', expandedView);
    }
  }

  @HostListener('keydown')
  scrollInputIntoView(): void {
    const el = this.getActiveElement();
    if (el && el instanceof HTMLInputElement) {
      el.scrollIntoView({
        block: 'center',
      });
    }
  }

  getActiveElement(): Element {
    return document.activeElement;
  }

  getFormValues(): PerDiemFormValue {
    return this.fg.value as PerDiemFormValue;
  }

  ngOnInit(): void {
    this.isRedirectedFromReport = this.activatedRoute.snapshot.params.remove_from_report ? true : false;
    this.canRemoveFromReport = this.activatedRoute.snapshot.params.remove_from_report === 'true';
  }

  async showClosePopup(): Promise<void> {
    const isAutofilled = this.presetProjectId || this.presetCostCenterId;
    if (this.fg.touched || isAutofilled) {
      const unsavedChangesPopOver = await this.popoverController.create({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Unsaved Changes',
          message: 'You have unsaved information that will be lost if you discard this expense.',
          primaryCta: {
            text: 'Discard',
            action: 'continue',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });

      await unsavedChangesPopOver.present();

      const { data } = (await unsavedChangesPopOver.onWillDismiss()) as { data: { action: string } };

      if (data && data.action === 'continue') {
        if (this.navigateBack) {
          this.navController.back();
        } else {
          this.goBack();
        }
      }
    } else {
      if (this.activatedRoute.snapshot.params.id) {
        this.trackingService.viewExpense({ Type: 'Per Diem' });
      }

      if (this.navigateBack) {
        this.navController.back();
      } else {
        this.goBack();
      }
    }
  }

  goBack(): void {
    if (this.activatedRoute.snapshot.params.persist_filters || this.isRedirectedFromReport) {
      this.navController.back();
    } else {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    }
  }

  goToPrev(): void {
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex as number;

    if (this.reviewList[+this.activeIndex - 1]) {
      this.expensesService.getExpenseById(this.reviewList[+this.activeIndex - 1]).subscribe((expense) => {
        const etxn = this.transactionService.transformExpense(expense);
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex - 1);
      });
    }
  }

  goToNext(): void {
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex as number;

    if (this.reviewList[+this.activeIndex + 1]) {
      this.expensesService.getExpenseById(this.reviewList[+this.activeIndex + 1]).subscribe((expense) => {
        const etxn = this.transactionService.transformExpense(expense);
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex + 1);
      });
    }
  }

  goToTransaction(expense: Partial<UnflattenedTransaction>, reviewList: string[], activeIndex: number): void {
    let category: string;

    if (expense.tx.org_category) {
      category = expense.tx.org_category.toLowerCase();
    }

    if (category === 'mileage') {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_mileage',
        {
          id: expense.tx.id,
          txnIds: JSON.stringify(reviewList),
          activeIndex,
        },
      ]);
    } else if (category === 'per diem') {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_per_diem',
        {
          id: expense.tx.id,
          txnIds: JSON.stringify(reviewList),
          activeIndex,
        },
      ]);
    } else {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_expense',
        {
          id: expense.tx.id,
          txnIds: JSON.stringify(reviewList),
          activeIndex,
        },
      ]);
    }
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  getTransactionFields(): Observable<Partial<ExpenseFieldsObj>> {
    return this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue: { sub_category: OrgCategory }) =>
        forkJoin({
          expenseFieldsMap: this.expenseFieldsService.getAllMap(),
          perDiemCategoriesContainer: this.getPerDiemCategories(),
        }).pipe(
          switchMap(({ expenseFieldsMap, perDiemCategoriesContainer }) => {
            const fields = ['purpose', 'cost_center_id', 'project_id', 'from_dt', 'to_dt', 'num_days', 'billable'];
            return this.expenseFieldsService.filterByOrgCategoryId(
              expenseFieldsMap,
              fields,
              formValue.sub_category || perDiemCategoriesContainer.defaultPerDiemCategory
            );
          })
        )
      ),
      map((expenseFieldsMap) => {
        if (expenseFieldsMap) {
          this.showBillable = expenseFieldsMap.billable?.is_enabled;
          for (const tfc of Object.keys(expenseFieldsMap)) {
            const expenseField = expenseFieldsMap[tfc] as ExpenseField;
            const options = expenseField.options as string[];
            if (expenseField.options && options.length > 0) {
              expenseField.options = options.map((value) => ({ label: value, value }));
            }
          }
        }

        return expenseFieldsMap;
      }),
      shareReplay(1)
    );
  }

  setupTfcDefaultValues(): void {
    const tfcValues$ = this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue: { sub_category: OrgCategory }) =>
        forkJoin({
          expenseFieldsMap: this.expenseFieldsService.getAllMap(),
          perDiemCategoriesContainer: this.getPerDiemCategories(),
        }).pipe(
          switchMap(({ expenseFieldsMap, perDiemCategoriesContainer }) => {
            const fields = ['purpose', 'cost_center_id', 'from_dt', 'to_dt', 'num_days', 'billable'];
            return this.expenseFieldsService.filterByOrgCategoryId(
              expenseFieldsMap,
              fields,
              formValue.sub_category || perDiemCategoriesContainer.defaultPerDiemCategory
            );
          })
        )
      ),
      map((tfc) => this.expenseFieldsService.getDefaultTxnFieldValues(tfc))
    );

    tfcValues$.subscribe((defaultValues) => {
      this.billableDefaultValue = defaultValues.billable;
      const keyToControlMap: { [id: string]: AbstractControl } = {
        purpose: this.fg.controls.purpose,
        cost_center_id: this.fg.controls.costCenter,
        from_dt: this.fg.controls.from_dt,
        to_dt: this.fg.controls.to_dt,
        num_days: this.fg.controls.num_days,
        billable: this.fg.controls.billable,
      };

      for (const defaultValueColumn in defaultValues) {
        if (defaultValues.hasOwnProperty(defaultValueColumn)) {
          const control = keyToControlMap[defaultValueColumn];
          if (!control.value && !control.touched && defaultValueColumn !== 'billable') {
            control.patchValue(defaultValues[defaultValueColumn]);
          } else if (
            defaultValueColumn === 'billable' &&
            this.fg.controls.project.value &&
            (control.value === undefined || control.value === null) &&
            !control.touched
          ) {
            control.patchValue(this.showBillable ? defaultValues[defaultValueColumn] : false);
          }
        }
      }
    });
  }

  getPaymentModes(): Observable<AccountOption[]> {
    return forkJoin({
      accounts: this.accountsService.getMyAccounts(),
      orgSettings: this.orgSettingsService.get(),
      etxn: this.etxn$,
      allowedPaymentModes: this.platformEmployeeSettingsService.getAllowedPaymentModes(),
      isPaymentModeConfigurationsEnabled: this.paymentModesService.checkIfPaymentModeConfigurationsIsEnabled(),
    }).pipe(
      map(({ accounts, orgSettings, etxn, allowedPaymentModes, isPaymentModeConfigurationsEnabled }) => {
        const config = {
          etxn,
          orgSettings,
          expenseType: ExpenseType.MILEAGE,
          isPaymentModeConfigurationsEnabled,
        };

        return this.accountsService.getPaymentModes(accounts, allowedPaymentModes, config);
      }),
      shareReplay(1)
    );
  }

  getSubCategories(): Observable<OrgCategory[]> {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const parentCategoryName = 'per diem';
        return categories.filter(
          (orgCategory) =>
            parentCategoryName.toLowerCase() === orgCategory.fyle_category?.toLowerCase() &&
            parentCategoryName.toLowerCase() !== orgCategory.sub_category?.toLowerCase()
        );
      }),
      shareReplay(1)
    );
  }

  getProjectCategories(): Observable<OrgCategory[]> {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const perDiemCategories = categories.filter((category) => category.fyle_category === 'Per Diem');

        return perDiemCategories;
      })
    );
  }

  getProjectCategoryIds(): Observable<string[]> {
    return this.projectCategories$.pipe(map((categories) => categories.map((category) => category?.id?.toString())));
  }

  getPerDiemCategories(): Observable<{
    defaultPerDiemCategory: OrgCategory;
    perDiemCategories: OrgCategory[];
  }> {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const orgCategoryName = 'per diem';
        const defaultPerDiemCategory = categories.find(
          (category) => category.name.toLowerCase() === orgCategoryName.toLowerCase()
        );

        const perDiemCategories = categories.filter((category) => ['Per Diem'].indexOf(category.fyle_category) > -1);

        return {
          defaultPerDiemCategory,
          perDiemCategories,
        };
      })
    );
  }

  getNewExpense(): Observable<Partial<UnflattenedTransaction>> {
    return forkJoin({
      categoryContainer: this.getPerDiemCategories(),
      homeCurrency: this.currencyService.getHomeCurrency(),
      currentEou: this.authService.getEou(),
    }).pipe(
      map(({ categoryContainer, homeCurrency, currentEou }) => ({
        tx: {
          skip_reimbursement: false,
          source: 'MOBILE',
          org_category_id: categoryContainer.defaultPerDiemCategory && categoryContainer.defaultPerDiemCategory.id,
          org_category: categoryContainer.defaultPerDiemCategory && categoryContainer.defaultPerDiemCategory.name,
          sub_category:
            categoryContainer.defaultPerDiemCategory && categoryContainer.defaultPerDiemCategory.sub_category,
          amount: 0,
          currency: homeCurrency,
          state: 'COMPLETE',
          txn_dt: new Date(),
          from_dt: null,
          to_dt: null,
          per_diem_rate_id: null,
          num_days: null,
          policy_amount: null,
          custom_properties: [],
          org_user_id: currentEou.ou.id,
        },
      }))
    );
  }

  getEditExpense(): Observable<Partial<UnflattenedTransaction>> {
    const expenseId = this.activatedRoute.snapshot.params.id as string;

    return this.expensesService.getExpenseById(expenseId).pipe(
      switchMap((expense) => of(this.transactionService.transformExpense(expense))),
      shareReplay(1)
    );
  }

  setupFilteredCategories(): void {
    this.filteredCategories$ = this.fg.controls.project.valueChanges.pipe(
      tap(() => {
        if (!this.fg.controls.project.value) {
          this.fg.patchValue({ billable: false });
        } else {
          this.fg.patchValue({ billable: this.showBillable ? this.billableDefaultValue : false });
        }
      }),
      startWith(this.fg.controls.project.value),
      concatMap((project: ProjectV2) =>
        combineLatest([this.subCategories$, this.isProjectCategoryRestrictionsEnabled$]).pipe(
          map(([allActiveSubCategories, isProjectCategoryRestrictionsEnabled]) =>
            this.projectsService.getAllowedOrgCategoryIds(
              project,
              allActiveSubCategories,
              isProjectCategoryRestrictionsEnabled
            )
          )
        )
      ),
      map((categories) => categories.map((category) => ({ label: category.sub_category, value: category })))
    );

    this.filteredCategories$.subscribe((categories) => {
      const formValue = this.getFormValues();

      if (
        formValue.sub_category &&
        formValue.sub_category.id &&
        !categories.some((category) => formValue.sub_category && formValue.sub_category.id === category.value.id)
      ) {
        this.fg.controls.sub_category.reset();
      }
    });
  }

  getTimeSpentOnPage(): number {
    const expenseEndTime = new Date().getTime();
    // Get time spent on page in seconds
    return (expenseEndTime - this.expenseStartTime) / 1000;
  }

  getCustomInputs(): Observable<PerDiemCustomInputs[]> {
    this.initialFetch = true;

    const customExpenseFields$ = this.customInputsService.getAll(true).pipe(shareReplay(1));

    this.dependentFields$ = customExpenseFields$.pipe(
      map((customFields) => customFields.filter((customField) => customField.type === 'DEPENDENT_SELECT'))
    );
    return this.fg.controls.sub_category.valueChanges.pipe(
      startWith({}),
      switchMap(() => {
        this.fg.updateValueAndValidity({
          emitEvent: false,
        });
        const category = this.getFormValues().sub_category;
        if (this.initialFetch) {
          return this.etxn$.pipe(
            switchMap((etxn) =>
              iif(
                () => !!etxn.tx.org_category_id,
                this.categoriesService
                  .getAll()
                  .pipe(map((categories) => categories.find((category) => category.id === etxn.tx.org_category_id))),
                this.getPerDiemCategories().pipe(map((perDiemContainer) => perDiemContainer.defaultPerDiemCategory))
              )
            )
          );
        }

        if (category && !isEmpty(category)) {
          return of(category);
        } else {
          return this.getPerDiemCategories().pipe(map((perDiemContainer) => perDiemContainer.defaultPerDiemCategory));
        }
      }),
      switchMap((category) => {
        this.fg.updateValueAndValidity({
          emitEvent: false,
        });
        const formValue = this.getFormValues();
        return customExpenseFields$.pipe(
          map((customFields) => customFields.filter((customField) => customField.type !== 'DEPENDENT_SELECT')),
          map((customFields) =>
            this.customFieldsService.standardizeCustomFields(
              formValue.custom_inputs || [],
              this.customInputsService.filterByCategory(customFields, category && category.id)
            )
          )
        );
      }),
      map((customFields) =>
        customFields.map((customField) => {
          if (customField.options) {
            const customFieldsOptions = customField.options as string[];
            customField.options = customFieldsOptions.map((option) => ({ label: option, value: option }));
          }
          return customField;
        })
      ),
      switchMap((customFields) =>
        this.isConnected$.pipe(
          take(1),
          map((isConnected) => {
            const customFieldsFormArray = this.fg.controls.custom_inputs as UntypedFormArray;
            customFieldsFormArray.clear();
            for (const customField of customFields) {
              customFieldsFormArray.push(
                this.fb.group({
                  name: [customField.name],
                  value: [
                    customField.type !== 'DATE'
                      ? customField.value
                      : dayjs(customField.value as string).format('YYYY-MM-DD'),
                    isConnected &&
                      customField.type !== 'BOOLEAN' &&
                      customField.type !== 'USER_LIST' &&
                      customField.mandatory &&
                      Validators.required,
                  ],
                })
              );
            }
            return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
          })
        )
      ),
      shareReplay(1)
    );
  }

  customDateValidator(control: AbstractControl): ValidationErrors {
    if (!this.fg) {
      return;
    }
    const formValue = this.getFormValues();
    const fromDt = dayjs(new Date(formValue.from_dt));
    const passedInDate = control.value && dayjs(new Date(control.value as string));
    if (passedInDate) {
      return passedInDate.isSame(fromDt) || passedInDate.isAfter(fromDt)
        ? null
        : {
            invalidDateSelection: true,
          };
    }
  }

  ionViewWillEnter(): void {
    this.subCategories$ = this.getSubCategories().pipe(shareReplay(1));
    this.isNewReportsFlowEnabled = false;
    this.onPageExit$ = new Subject();
    this.projectDependentFieldsRef?.ngOnInit();
    this.costCenterDependentFieldsRef?.ngOnInit();
    this.selectedProject$ = new BehaviorSubject<ProjectV2>(null);
    this.selectedCostCenter$ = new BehaviorSubject<CostCenter>(null);

    this.hardwareBackButtonAction = this.platform.backButton.subscribeWithPriority(
      BackButtonActionPriority.MEDIUM,
      () => {
        this.showClosePopup();
      }
    );

    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back as boolean;
    this.expenseStartTime = new Date().getTime();
    const today = new Date();
    this.minDate = dayjs(new Date('Jan 1, 2001')).format('YYYY-MM-D');
    this.maxDate = dayjs(this.dateService.addDaysToDate(today, 1)).format('YYYY-MM-D');

    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });

    this.fg = this.fb.group({
      currencyObj: [
        {
          value: null,
          disabled: true,
        },
      ],
      paymentMode: [, Validators.required],
      project: [],
      sub_category: [],
      per_diem_rate: [, Validators.required],
      purpose: [],
      num_days: [null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      report: [],
      from_dt: [],
      to_dt: [, this.customDateValidator.bind(this)],
      custom_inputs: new UntypedFormArray([]),
      billable: [],
      costCenter: [],
      project_dependent_fields: this.fb.array([]),
      cost_center_dependent_fields: this.fb.array([]),
    });

    this.title = 'Add expense';
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex as number;
    this.reviewList =
      this.activatedRoute.snapshot.params.txnIds &&
      (JSON.parse(this.activatedRoute.snapshot.params.txnIds as string) as string[]);
    this.title =
      this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    if (this.activatedRoute.snapshot.params.id) {
      this.mode = 'edit';
    }

    this.fg.controls.project.valueChanges
      .pipe(takeUntil(this.onPageExit$))
      .subscribe((project: ProjectV2) => this.selectedProject$.next(project));

    this.fg.controls.costCenter.valueChanges
      .pipe(takeUntil(this.onPageExit$))
      .subscribe((costCenter: CostCenter) => this.selectedCostCenter$.next(costCenter));

    // If User has already clicked on See More he need not to click again and again
    from(this.storageService.get<boolean>('isExpandedViewPerDiem')).subscribe((expandedView) => {
      this.isExpandedView = this.mode !== 'add' || expandedView;
    });

    const orgSettings$ = this.orgSettingsService.get();
    const perDiemRates$ = this.perDiemService.getRates();
    const employeeSettings$ = this.platformEmployeeSettingsService.get().pipe(shareReplay(1));
    this.autoSubmissionReportName$ = this.reportService.getAutoSubmissionReportName();

    this.isProjectCategoryRestrictionsEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.advanced_projects.allowed && orgSettings.advanced_projects.enable_category_restriction
      )
    );

    this.individualPerDiemRatesEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.advanced_per_diems_settings?.enable_employee_restriction)
    );

    orgSettings$.subscribe((orgSettings) => {
      this.isNewReportsFlowEnabled = orgSettings?.simplified_report_closure_settings?.enabled || false;
    });

    this.setupNetworkWatcher();

    this.recentlyUsedValues$ = this.isConnected$.pipe(
      take(1),
      switchMap((isConnected) => {
        if (isConnected) {
          return this.recentlyUsedItemsService.getRecentlyUsed();
        } else {
          return of(null);
        }
      })
    );

    const allowedPerDiemRates$ = from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          forkJoin({
            orgSettings: orgSettings$,
            allowedPerDiemRates: perDiemRates$.pipe(
              switchMap((perDiemRates) => this.perDiemService.getAllowedPerDiems(perDiemRates))
            ),
          })
        ),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .pipe(
        switchMap(({ orgSettings, allowedPerDiemRates }) =>
          iif(
            () =>
              allowedPerDiemRates.length > 0 || orgSettings.advanced_per_diems_settings?.enable_employee_restriction,
            of(allowedPerDiemRates),
            perDiemRates$
          )
        ),
        map((rates) => rates.filter((rate) => rate.active)),
        map((rates) =>
          rates.map((rate) => {
            rate.full_name = `${rate.name} (${rate.rate} ${rate.currency} per day)`;
            return rate;
          })
        )
      );

    this.canCreatePerDiem$ = from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          forkJoin({
            orgSettings: orgSettings$,
            perDiemRates: perDiemRates$,
            allowedPerDiemRates: allowedPerDiemRates$,
          })
        ),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .pipe(
        map(({ orgSettings, perDiemRates, allowedPerDiemRates }) => {
          if (orgSettings.advanced_per_diems_settings?.enable_employee_restriction) {
            if (allowedPerDiemRates.length > 0 && perDiemRates.length > 0) {
              return true;
            } else {
              return false;
            }
          } else {
            return perDiemRates.length > 0;
          }
        })
      );

    this.txnFields$ = this.getTransactionFields();
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    this.setupFilteredCategories();

    this.projectCategories$ = this.getProjectCategories();
    this.projectCategoryIds$ = this.getProjectCategoryIds();

    this.isProjectVisible$ = combineLatest([this.projectCategoryIds$, this.projectCategories$]).pipe(
      switchMap(([projectCategoryIds, projectCategories]) =>
        this.projectsService.getProjectCount({ categoryIds: projectCategoryIds }, projectCategories)
      ),
      map((projectCount) => projectCount > 0)
    );
    this.comments$ = this.expenseCommentService.getTransformedComments(
      this.activatedRoute.snapshot.params.id as string
    );

    combineLatest([this.isConnected$, this.filteredCategories$])
      .pipe(distinctUntilChanged((a, b) => isEqual(a, b)))
      .subscribe(([isConnected, filteredCategories]) => {
        this.fg.controls.sub_category.clearValidators();
        if (isConnected && filteredCategories && filteredCategories.length) {
          this.fg.controls.sub_category.setValidators(Validators.required);
        }
        this.fg.controls.sub_category.updateValueAndValidity();
      });

    this.allowedPerDiemRateOptions$ = allowedPerDiemRates$.pipe(
      map((allowedPerDiemRates) =>
        allowedPerDiemRates.map((rate) => {
          rate.readableRate = this.fyCurrencyPipe.transform(rate.rate, rate.currency) + ' per day';
          return { label: rate.name, value: rate };
        })
      )
    );

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects)
    );

    this.individualProjectIds$ = employeeSettings$.pipe(
      map((employeeSettings) => employeeSettings.project_ids?.map((id) => Number(id)) || [])
    );

    this.etxn$ = iif(() => this.mode === 'add', this.getNewExpense(), this.getEditExpense());

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.enabled)
    );

    this.customInputs$ = this.getCustomInputs();

    this.isCostCentersEnabled$ = orgSettings$.pipe(map((orgSettings) => orgSettings.cost_centers.enabled));

    this.paymentModes$ = this.getPaymentModes();

    this.costCenters$ = orgSettings$.pipe(
      switchMap((orgSettings) => {
        if (orgSettings.cost_centers.enabled) {
          return this.costCentersService.getAllActive();
        } else {
          return of([]);
        }
      }),
      map((costCenters: CostCenter[]) =>
        costCenters.map((costCenter) => ({
          label: costCenter.name,
          value: costCenter,
        }))
      ),
      shareReplay(1)
    );

    this.recentlyUsedCostCenters$ = forkJoin({
      costCenters: this.costCenters$,
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      concatMap(({ costCenters, recentValue }) =>
        this.recentlyUsedItemsService.getRecentCostCenters(costCenters, recentValue)
      )
    );

    this.reports$ = this.platformReportService
      .getAllReportsByParams({ state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' })
      .pipe(
        // Filter out partially approved reports
        map((reports) =>
          reports
            .filter((report) => !report.approvals.some((approval) => approval.state === 'APPROVAL_DONE'))
            .map((report) => ({ label: report.purpose, value: report }))
        ),
        shareReplay(1)
      );

    this.txnFields$
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        switchMap((txnFields) =>
          forkJoin({
            isConnected: this.isConnected$.pipe(take(1)),
            orgSettings: orgSettings$,
            costCenters: this.costCenters$,
            isIndividualProjectsEnabled: this.isIndividualProjectsEnabled$,
            individualProjectIds: this.individualProjectIds$,
          }).pipe(
            map(({ isConnected, orgSettings, costCenters, isIndividualProjectsEnabled, individualProjectIds }) => ({
              isConnected,
              txnFields,
              orgSettings,
              costCenters,
              isIndividualProjectsEnabled,
              individualProjectIds,
            }))
          )
        )
      )
      .subscribe(
        ({ isConnected, txnFields, costCenters, orgSettings, individualProjectIds, isIndividualProjectsEnabled }) => {
          const keyToControlMap: { [id: string]: AbstractControl } = {
            purpose: this.fg.controls.purpose,
            cost_center_id: this.fg.controls.costCenter,
            from_dt: this.fg.controls.from_dt,
            to_dt: this.fg.controls.to_dt,
            num_days: this.fg.controls.num_days,
            project_id: this.fg.controls.project,
            billable: this.fg.controls.billable,
          };

          for (const control of Object.values(keyToControlMap)) {
            control.clearValidators();
            control.updateValueAndValidity();
          }

          for (const txnFieldKey of Object.keys(txnFields)) {
            const control = keyToControlMap[txnFieldKey];
            const expenseField = txnFields[txnFieldKey] as ExpenseField;

            if (expenseField.is_mandatory) {
              if (txnFieldKey === 'num_days') {
                control.setValidators([Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]);
              } else if (txnFieldKey === 'to_dt') {
                control.setValidators(
                  isConnected
                    ? Validators.compose([this.customDateValidator.bind(this) as ValidatorFn, Validators.required])
                    : null
                );
              } else if (txnFieldKey === 'cost_center_id') {
                control.setValidators(
                  isConnected && costCenters && costCenters.length > 0 ? Validators.required : null
                );
              } else if (txnFieldKey === 'project_id') {
                control.setValidators(
                  orgSettings.projects.enabled && isIndividualProjectsEnabled && individualProjectIds.length === 0
                    ? null
                    : Validators.required
                );
              } else {
                control.setValidators(isConnected ? Validators.required : null);
              }
            } else {
              if (txnFieldKey === 'num_days') {
                control.setValidators([Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]);
              }
              if (txnFieldKey === 'to_dt') {
                control.setValidators(isConnected ? (this.customDateValidator.bind(this) as ValidatorFn) : null);
              }
            }
            control.updateValueAndValidity();
          }

          this.fg.updateValueAndValidity();
        }
      );

    this.setupTfcDefaultValues();

    this.isAmountCapped$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.admin_amount) || isNumber(etxn.tx.policy_amount))
    );

    this.isAmountDisabled$ = this.etxn$.pipe(map((etxn) => !!etxn.tx.admin_amount));

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.policy_amount) && etxn.tx.policy_amount < 0.0001)
    );

    this.getPolicyDetails();

    combineLatest(this.fg.controls.from_dt.valueChanges, this.fg.controls.to_dt.valueChanges)
      .pipe(distinctUntilChanged((a, b) => isEqual(a, b)))
      .subscribe(([fromDt, toDt]) => {
        if (fromDt && toDt) {
          const fromDate = dayjs(new Date(fromDt as string));
          const toDate = dayjs(new Date(toDt as string));
          if (toDate.isSame(fromDate)) {
            this.fg.controls.num_days.setValue(1);
          } else if (toDate.isAfter(fromDate)) {
            this.fg.controls.num_days.setValue(toDate.diff(fromDate, 'day') + 1);
          }
        }
      });

    combineLatest(this.fg.controls.from_dt.valueChanges, this.fg.controls.num_days.valueChanges)
      .pipe(distinctUntilChanged((a, b) => isEqual(a, b)))
      .subscribe(([fromDt, numDays]) => {
        if (fromDt && numDays && numDays > 0) {
          const fromDate = dayjs(this.dateService.getUTCDate(new Date(fromDt as string)));
          this.fg.controls.to_dt.setValue(fromDate.add(+numDays - 1, 'day').format('YYYY-MM-DD'), {
            emitEvent: false,
          });
        }
      });

    combineLatest(
      this.fg.controls.per_diem_rate.valueChanges as Observable<PerDiemRates>,
      this.fg.controls.num_days.valueChanges,
      this.homeCurrency$
    )
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        filter(([perDiemRate, numDays, homeCurrency]) => !!perDiemRate && !!numDays && !!homeCurrency),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        filter(([perDiemRate, numDays, homeCurrency]) => perDiemRate.currency === homeCurrency)
      )
      .subscribe(([perDiemRate, numDays, homeCurrency]) => {
        if (perDiemRate && numDays && homeCurrency) {
          if (perDiemRate.currency === homeCurrency) {
            this.fg.controls.currencyObj.setValue({
              currency: perDiemRate.currency,
              amount: this.currencyService.getAmountWithCurrencyFraction(
                perDiemRate.rate * numDays,
                perDiemRate.currency
              ),
              orig_currency: null,
              orig_amount: null,
            });
          }
        }
      });

    combineLatest(
      this.fg.controls.per_diem_rate.valueChanges as Observable<PerDiemRates>,
      this.fg.controls.num_days.valueChanges as Observable<number>,
      this.homeCurrency$
    )
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        filter(([perDiemRate, numDays, homeCurrency]) => !!perDiemRate && !!numDays && !!homeCurrency),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        filter(([perDiemRate, numDays, homeCurrency]) => perDiemRate.currency !== homeCurrency),
        switchMap(([perDiemRate, numDays, homeCurrency]) =>
          this.currencyService
            .getExchangeRate(perDiemRate.currency, homeCurrency)
            .pipe(map((res) => [perDiemRate, numDays, homeCurrency, res]))
        )
      )
      .subscribe(([perDiemRate, numDays, homeCurrency, exchangeRate]: [PerDiemRates, number, string, number]) => {
        this.fg.controls.currencyObj.setValue({
          currency: homeCurrency,
          amount: this.currencyService.getAmountWithCurrencyFraction(
            perDiemRate.rate * numDays * exchangeRate,
            homeCurrency
          ),
          orig_currency: perDiemRate.currency,
          orig_amount: this.currencyService.getAmountWithCurrencyFraction(
            perDiemRate.rate * numDays,
            perDiemRate.currency
          ),
        });
      });

    const selectedProject$ = this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.project_id) {
          return of(etxn.tx.project_id);
        } else {
          return forkJoin({
            orgSettings: this.orgSettingsService.get(),
            employeeSettings: this.platformEmployeeSettingsService.get(),
          }).pipe(
            map(({ orgSettings, employeeSettings }) => {
              if (orgSettings.projects.enabled) {
                return employeeSettings?.default_project_id;
              }
            })
          );
        }
      }),
      switchMap((projectId) => {
        if (projectId) {
          return this.projectCategories$.pipe(
            switchMap((projectCategories) => this.projectsService.getbyId(projectId, projectCategories))
          );
        } else {
          return of(null);
        }
      })
    );

    const selectedPaymentMode$ = forkJoin({
      etxn: this.etxn$,
      paymentModes: this.paymentModes$,
    }).pipe(map(({ etxn, paymentModes }) => this.accountsService.getEtxnSelectedPaymentMode(etxn, paymentModes)));

    const defaultPaymentMode$ = this.paymentModes$.pipe(
      map((paymentModes) =>
        paymentModes
          .map((extendedPaymentMode) => extendedPaymentMode.value)
          .find((paymentMode) => {
            const accountType = this.accountsService.getAccountTypeFromPaymentMode(paymentMode);
            return accountType === AccountType.PERSONAL;
          })
      )
    );

    this.recentlyUsedProjects$ = forkJoin({
      recentValues: this.recentlyUsedValues$,
      perDiemCategoryIds: this.projectCategoryIds$,
      perDiemCategories: this.projectCategories$,
      eou: this.authService.getEou(),
      isProjectCategoryRestrictionsEnabled: this.isProjectCategoryRestrictionsEnabled$,
    }).pipe(
      switchMap(({ recentValues, perDiemCategoryIds, perDiemCategories, eou, isProjectCategoryRestrictionsEnabled }) =>
        this.recentlyUsedItemsService.getRecentlyUsedProjects({
          recentValues,
          eou,
          categoryIds: perDiemCategoryIds,
          isProjectCategoryRestrictionsEnabled,
          activeCategoryList: perDiemCategories,
        })
      )
    );

    const selectedSubCategory$ = this.etxn$.pipe(
      switchMap((etxn) =>
        iif(
          () => !!etxn.tx.org_category_id,
          this.subCategories$.pipe(
            map((allActiveSubCategories) =>
              allActiveSubCategories.find((subCategory) => subCategory.id === etxn.tx.org_category_id)
            )
          ),
          of(null)
        )
      )
    );

    const selectedPerDiemOption$ = this.etxn$.pipe(
      switchMap((etxn) =>
        iif(
          () => !!etxn.tx.per_diem_rate_id,
          this.allowedPerDiemRateOptions$.pipe(
            map((perDiemOptions) =>
              perDiemOptions
                .map((res) => res.value)
                .find((perDiemOption) => perDiemOption.id === etxn.tx.per_diem_rate_id)
            )
          ),
          of(null)
        )
      )
    );

    const selectedReport$ = forkJoin({
      autoSubmissionReportName: this.autoSubmissionReportName$,
      etxn: this.etxn$,
      reportOptions: this.reports$,
    }).pipe(
      map(({ autoSubmissionReportName, etxn, reportOptions }) => {
        if (etxn.tx.report_id) {
          return reportOptions.map((res) => res.value).find((reportOption) => reportOption.id === etxn.tx.report_id);
        } else if (
          !autoSubmissionReportName &&
          reportOptions.length === 1 &&
          reportOptions[0].value.state === 'DRAFT'
        ) {
          return reportOptions[0].value;
        } else {
          return null;
        }
      })
    );

    const selectedCostCenter$ = this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.cost_center_id) {
          return of(etxn.tx.cost_center_id);
        } else {
          return forkJoin({
            orgSettings: this.orgSettingsService.get(),
            costCenters: this.costCenters$,
          }).pipe(
            map(({ orgSettings, costCenters }) => {
              if (orgSettings.cost_centers.enabled) {
                if (costCenters.length === 1 && this.mode === 'add') {
                  return costCenters[0].value.id;
                }
              }
            })
          );
        }
      }),
      switchMap((costCenterId) => {
        if (costCenterId) {
          return this.costCenters$.pipe(
            map((costCenters) =>
              costCenters.map((res) => res.value).find((costCenter) => costCenter.id === costCenterId)
            )
          );
        } else {
          return of(null);
        }
      })
    );

    const customExpenseFields$ = this.customInputsService.getAll(true).pipe(shareReplay(1));

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          forkJoin({
            etxn: this.etxn$,
            paymentMode: selectedPaymentMode$,
            project: selectedProject$,
            subCategory: selectedSubCategory$,
            perDiemRate: selectedPerDiemOption$,
            report: selectedReport$,
            costCenter: selectedCostCenter$,
            customExpenseFields: customExpenseFields$,
            defaultPaymentMode: defaultPaymentMode$,
            employeeSettings: employeeSettings$,
            orgSettings: orgSettings$,
            recentValue: this.recentlyUsedValues$,
            recentProjects: this.recentlyUsedProjects$,
            recentCostCenters: this.recentlyUsedCostCenters$,
          })
        ),
        take(1),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(
        ({
          etxn,
          paymentMode,
          project,
          subCategory,
          perDiemRate,
          report,
          costCenter,
          customExpenseFields,
          defaultPaymentMode,
          employeeSettings,
          orgSettings,
          recentValue,
          recentProjects,
          recentCostCenters,
        }) => {
          if (project) {
            this.selectedProject$.next(project);
          }

          if (costCenter) {
            this.selectedCostCenter$.next(costCenter);
          }

          const customInputs = this.customFieldsService.standardizeCustomFields(
            [],
            this.customInputsService.filterByCategory(customExpenseFields, etxn.tx.org_category_id)
          );

          const customInputValues = customInputs
            .filter((customInput) => customInput.type !== 'DEPENDENT_SELECT')
            .map((customInput) => {
              const cpor =
                etxn.tx.custom_properties &&
                etxn.tx.custom_properties.find((customProp) => customProp.name === customInput.name);
              if (customInput.type === 'DATE') {
                return {
                  name: customInput.name,
                  value: (cpor && cpor.value && dayjs(new Date(cpor.value as string)).format('YYYY-MM-DD')) || null,
                };
              } else {
                return {
                  name: customInput.name,
                  value: (cpor && cpor.value) || null,
                };
              }
            });

          // Check if auto-fills is enabled
          const isAutofillsEnabled =
            orgSettings?.org_expense_form_autofills?.allowed &&
            orgSettings?.org_expense_form_autofills?.enabled &&
            employeeSettings?.expense_form_autofills?.allowed &&
            employeeSettings?.expense_form_autofills?.enabled;

          // Check if recent projects exist
          const doRecentProjectIdsExist =
            isAutofillsEnabled && recentValue && recentValue.project_ids && recentValue.project_ids.length > 0;

          if (recentProjects && recentProjects.length > 0) {
            this.recentProjects = recentProjects.map((item) => ({ label: item.project_name, value: item }));
          }

          /* Autofill project during these cases:
           * 1. Autofills is allowed and enabled
           * 2. During add expense - When project field is empty
           * 3. During edit expense - When the expense is in draft state and there is no project already added
           * 4. When there exists recently used project ids to auto-fill
           */
          if (
            doRecentProjectIdsExist &&
            (!etxn.tx.id || (etxn.tx.id && etxn.tx.state === TransactionState.DRAFT && !etxn.tx.project_id))
          ) {
            const autoFillProject = recentProjects && recentProjects.length > 0 && recentProjects[0];

            if (autoFillProject) {
              project = autoFillProject;
              this.presetProjectId = project.project_id;

              //Patch project value to trigger valueChanges which shows dependent field if present
              this.fg.patchValue({ project });
            }
          }

          // Check if recent cost centers exist
          const doRecentCostCenterIdsExist =
            isAutofillsEnabled && recentValue && recentValue.cost_center_ids && recentValue.cost_center_ids.length > 0;

          if (recentCostCenters && recentCostCenters.length > 0) {
            this.recentCostCenters = recentCostCenters;
          }

          /* Autofill cost center during these cases:
           * 1. Autofills is allowed and enabled
           * 2. During add expense - When cost center field is empty
           * 3. During edit expense - When the expense is in draft state and there is no cost center already added - optional
           * 4. When there exists recently used cost center ids to auto-fill
           */
          if (
            doRecentCostCenterIdsExist &&
            (!etxn.tx.id || (etxn.tx.id && etxn.tx.state === TransactionState.DRAFT && !etxn.tx.cost_center_id))
          ) {
            const autoFillCostCenter = recentCostCenters && recentCostCenters.length > 0 && recentCostCenters[0];

            if (autoFillCostCenter) {
              costCenter = autoFillCostCenter.value;
              this.presetCostCenterId = autoFillCostCenter.value.id;
              this.fg.patchValue({ costCenter });
            }
          }

          this.fg.patchValue({
            paymentMode: paymentMode || defaultPaymentMode,
            sub_category: subCategory,
            per_diem_rate: perDiemRate,
            purpose: etxn.tx.purpose,
            num_days: etxn.tx.num_days,
            report,
            from_dt: etxn.tx.from_dt ? dayjs(new Date(etxn.tx.from_dt)).format('YYYY-MM-DD') : null,
            to_dt: etxn.tx.to_dt ? dayjs(new Date(etxn.tx.to_dt)).format('YYYY-MM-DD') : null,
            billable: etxn.tx.billable,
            costCenter,
          });

          this.fg.patchValue({ project }, { emitEvent: false });

          this.initialFetch = false;

          setTimeout(() => {
            this.fg.controls.custom_inputs.patchValue(customInputValues);
          }, 1000);
        }
      );
  }

  generateEtxnFromFg(
    etxn$: Observable<Partial<UnflattenedTransaction>>,
    standardisedCustomProperties$: Observable<TxnCustomProperties[]>
  ): Observable<{ tx: Partial<Transaction>; dataUrls: FileObject[]; ou: Partial<OrgUser> }> {
    return forkJoin({
      etxn: etxn$,
      customProperties: standardisedCustomProperties$,
      orgSettings: this.orgSettingsService.get(),
    }).pipe(
      map((res) => {
        const formValue = this.getFormValues();
        const etxn = res.etxn;
        let customProperties = res.customProperties;
        customProperties = customProperties.map((customProperty) => {
          if (!customProperty.value) {
            this.customFieldsService.setDefaultValue(customProperty, customProperty.type);
          }
          if (customProperty.type === 'DATE') {
            customProperty.value =
              customProperty.value && this.dateService.getUTCDate(new Date(customProperty.value as string));
          }
          return customProperty;
        });

        const currencyObj = this.fg.controls.currencyObj.value as CurrencyObj;
        const amountData = {
          currency: currencyObj.currency,
          amount: currencyObj.amount,
          orig_currency: currencyObj.orig_currency,
          orig_amount: currencyObj.orig_amount,
        };

        let skipReimbursement =
          (formValue?.paymentMode?.type === AccountType.PERSONAL && !formValue?.paymentMode?.isReimbursable) ||
          !!formValue?.paymentMode?.id;

        // Handle payment mode type and source account
        const paymentMode = formValue.paymentMode;
        let sourceAccountId: string | null = null;

        if (paymentMode) {
          if (paymentMode.type === 'PERSONAL_CASH_ACCOUNT') {
            sourceAccountId = paymentMode.id;
            if (!paymentMode.isReimbursable) {
              skipReimbursement = true;
            } else {
              skipReimbursement = false;
            }
          }
        }

        return {
          tx: {
            ...etxn.tx,
            source_account_id: sourceAccountId,
            billable: formValue.billable,
            org_category_id: (formValue.sub_category && formValue.sub_category.id) || etxn.tx.org_category_id,
            skip_reimbursement: skipReimbursement,
            per_diem_rate_id: formValue.per_diem_rate.id,
            source: 'MOBILE',
            currency: amountData.currency,
            amount: parseFloat(amountData.amount?.toString()),
            orig_currency: amountData.orig_currency,
            orig_amount: amountData.orig_amount,
            project_id: formValue.project && formValue.project.project_id,
            purpose: formValue.purpose,
            custom_properties: customProperties || [],
            org_user_id: etxn.tx.org_user_id,
            from_dt: formValue.from_dt && this.dateService.getUTCDate(new Date(formValue.from_dt)),
            to_dt: formValue.from_dt && this.dateService.getUTCDate(new Date(formValue.to_dt)),
            category: null,
            num_days: formValue.num_days,
            cost_center_id: formValue.costCenter && formValue.costCenter.id,
            cost_center_name: formValue.costCenter && formValue.costCenter.name,
            cost_center_code: formValue.costCenter && formValue.costCenter.code,
          },
          dataUrls: [],
          ou: etxn.ou,
        };
      })
    );
  }

  getCustomFields(): Observable<TxnCustomProperties[]> {
    const dependentFieldsWithValue$ = this.dependentFields$.pipe(
      map((customFields) => {
        const formValue = this.getFormValues();
        const allDependentFields = [...formValue.project_dependent_fields, ...formValue.cost_center_dependent_fields];
        const mappedDependentFields = allDependentFields.map((dependentField) => ({
          name: dependentField.label,
          value: dependentField.value,
        }));
        return this.customFieldsService.standardizeCustomFields(mappedDependentFields, customFields);
      })
    );

    return forkJoin({
      customInputs: this.customInputs$.pipe(take(1)),
      dependentFieldsWithValue: dependentFieldsWithValue$.pipe(take(1)),
    }).pipe(
      map(({ customInputs, dependentFieldsWithValue }) => {
        const formValue = this.getFormValues();
        const customInputsWithValue: TxnCustomProperties[] = customInputs.map((customInput, i) => ({
          id: customInput.id,
          mandatory: customInput.mandatory,
          name: customInput.name,
          options: customInput.options,
          placeholder: customInput.placeholder,
          prefix: customInput.prefix,
          type: customInput.type,
          value: formValue.custom_inputs[i].value,
        }));
        return customInputsWithValue.concat(dependentFieldsWithValue);
      })
    );
  }

  checkPolicyViolation(etxn: {
    tx: Partial<Transaction>;
    dataUrls: FileObject[];
    ou: Partial<OrgUser>;
  }): Observable<ExpensePolicy> {
    const transactionCopy = cloneDeep(etxn.tx);

    /* Expense creation has not moved to platform yet and since policy is moved to platform,
     * it expects the expense object in terms of platform world. Until then, the method
     * `transformTo` act as a bridge by translating the public expense object to platform
     * expense.
     */
    const policyExpense = this.policyService.transformTo(transactionCopy);
    return this.transactionService.checkPolicy(policyExpense);
  }

  async continueWithCriticalPolicyViolation(criticalPolicyViolations: string[]): Promise<boolean> {
    const fyCriticalPolicyViolationPopOver = await this.modalController.create({
      component: FyCriticalPolicyViolationComponent,
      componentProps: {
        criticalViolationMessages: criticalPolicyViolations,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await fyCriticalPolicyViolationPopOver.present();

    const { data } = (await fyCriticalPolicyViolationPopOver.onWillDismiss()) as { data: boolean };
    return !!data;
  }

  async continueWithPolicyViolations(
    policyViolations: string[],
    policyAction: FinalExpensePolicyState
  ): Promise<{
    comment: string;
  }> {
    const currencyModal = await this.modalController.create({
      component: FyPolicyViolationComponent,
      componentProps: {
        policyViolationMessages: policyViolations,
        policyAction,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await currencyModal.present();

    const { data } = (await currencyModal.onWillDismiss()) as { data: { comment: string } };
    return data;
  }

  criticalPolicyViolationErrorHandler(err: {
    status?: number;
    type?: string;
    policyViolations?: string[];
    policyAction?: FinalExpensePolicyState;
    etxn?: Partial<UnflattenedTransaction>;
  }): Observable<{ etxn: Partial<UnflattenedTransaction> }> {
    return from(this.loaderService.hideLoader()).pipe(
      switchMap(() => this.continueWithCriticalPolicyViolation(err.policyViolations)),
      switchMap((continueWithTransaction) => {
        if (continueWithTransaction) {
          return from(this.loaderService.showLoader()).pipe(switchMap(() => of({ etxn: err.etxn })));
        } else {
          return throwError('unhandledError');
        }
      })
    );
  }

  policyViolationErrorHandler(err: {
    status?: number;
    type?: string;
    policyViolations?: string[];
    policyAction?: FinalExpensePolicyState;
    etxn?: Partial<UnflattenedTransaction>;
  }): Observable<{ etxn: Partial<UnflattenedTransaction>; comment: string }> {
    return from(this.loaderService.hideLoader()).pipe(
      switchMap(() => this.continueWithPolicyViolations(err.policyViolations, err.policyAction)),
      switchMap((continueWithTransaction) => {
        if (continueWithTransaction) {
          if (continueWithTransaction.comment === '' || continueWithTransaction.comment === null) {
            continueWithTransaction.comment = 'No policy violation explanation provided';
          }
          return from(this.loaderService.showLoader()).pipe(
            switchMap(() => of({ etxn: err.etxn, comment: continueWithTransaction.comment }))
          );
        } else {
          return throwError('unhandledError');
        }
      })
    );
  }

  addExpense(redirectedFrom: PerDiemRedirectedFrom): Observable<OutboxQueue> {
    this.savePerDiemLoader = redirectedFrom === PerDiemRedirectedFrom.SAVE_PER_DIEM;
    this.saveAndNextPerDiemLoader = redirectedFrom === PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM;
    this.saveAndPrevPerDiemLoader = redirectedFrom === PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM;

    const customFields$ = this.getCustomFields();

    return from(this.generateEtxnFromFg(this.etxn$, customFields$)).pipe(
      switchMap((etxn) =>
        this.isConnected$.pipe(
          take(1),
          switchMap((isConnected) => {
            if (isConnected) {
              const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay(1));
              return policyViolations$.pipe(
                map(this.policyService.getCriticalPolicyRules),
                switchMap((criticalPolicyViolations) => {
                  if (criticalPolicyViolations.length > 0) {
                    return throwError({
                      type: 'criticalPolicyViolations',
                      policyViolations: criticalPolicyViolations,
                      etxn,
                    });
                  } else {
                    return policyViolations$;
                  }
                }),
                map((policyViolations: ExpensePolicy): [string[], FinalExpensePolicyState] => [
                  this.policyService.getPolicyRules(policyViolations),
                  policyViolations?.data?.final_desired_state,
                ]),
                switchMap(([policyViolations, policyAction]: [string[], FinalExpensePolicyState]) => {
                  if (policyViolations.length > 0) {
                    return throwError({
                      type: 'policyViolations',
                      policyViolations,
                      policyAction,
                      etxn,
                    });
                  } else {
                    return of({ etxn, comment: null });
                  }
                })
              );
            } else {
              return of({ etxn, comment: null });
            }
          })
        )
      ),
      catchError(
        (err: {
          status?: number;
          type: string;
          policyViolations: string[];
          policyAction: FinalExpensePolicyState;
          etxn: Partial<UnflattenedTransaction>;
        }) => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(map((etxn) => ({ etxn })));
          }
          if (err.type === 'criticalPolicyViolations') {
            return this.criticalPolicyViolationErrorHandler(err);
          } else if (err.type === 'policyViolations') {
            return this.policyViolationErrorHandler(err);
          } else {
            return throwError(err);
          }
        }
      ),
      switchMap(({ etxn, comment }: { etxn: Partial<UnflattenedTransaction>; comment: string }) =>
        from(this.authService.getEou()).pipe(
          switchMap(() => {
            const comments: string[] = [];
            this.trackingService.createExpense({
              Type: 'Receipt',
              Amount: etxn.tx.amount,
              Currency: etxn.tx.currency,
              Category: etxn.tx.org_category,
              Time_Spent: this.getTimeSpentOnPage() + ' secs',
              Used_Autofilled_Project:
                etxn.tx.project_id && this.presetProjectId && etxn.tx.project_id === this.presetProjectId,
              Used_Autofilled_CostCenter:
                etxn.tx.cost_center_id && this.presetCostCenterId && etxn.tx.cost_center_id === this.presetCostCenterId,
            });

            if (comment) {
              comments.push(comment);
            }

            const formValue = this.getFormValues();
            const transaction = cloneDeep(etxn.tx);
            if (
              formValue.report &&
              (etxn.tx.policy_amount === null || (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))
            ) {
              transaction.report_id = formValue.report.id;
            }
            return of(
              this.transactionsOutboxService.addEntryAndSync(
                transaction,
                etxn.dataUrls as { url: string; type: string }[],
                comments
              )
            ).pipe(switchMap((txnData) => from(txnData)));
          })
        )
      ),
      finalize(() => {
        this.savePerDiemLoader = false;
        this.saveAndNextPerDiemLoader = false;
        this.saveAndPrevPerDiemLoader = false;
      })
    );
  }

  trackPolicyCorrections(): void {
    this.isCriticalPolicyViolated$.subscribe((isCriticalPolicyViolated) => {
      if (isCriticalPolicyViolated && this.fg.dirty) {
        this.trackingService.policyCorrection({ Violation: 'Critical', Mode: 'Edit Expense' });
      }
    });

    this.comments$
      .pipe(
        map((estatuses) => estatuses.filter((estatus) => estatus.st_org_user_id === 'POLICY')),
        map((policyViolationComments) => policyViolationComments.length > 0)
      )
      .subscribe((policyViolated) => {
        if (policyViolated && this.fg.dirty) {
          this.trackingService.policyCorrection({ Violation: 'Regular', Mode: 'Edit Expense' });
        }
      });
  }

  editExpenseCriticalPolicyViolationHandler(err: {
    status?: number;
    type?: string;
    policyViolations?: string[];
    policyAction?: FinalExpensePolicyState;
    etxn?: Partial<UnflattenedTransaction>;
  }): Observable<{ etxn: Partial<UnflattenedTransaction> }> {
    return from(this.continueWithCriticalPolicyViolation(err.policyViolations)).pipe(
      switchMap((continueWithTransaction) => {
        if (continueWithTransaction) {
          return from(this.loaderService.showLoader()).pipe(switchMap(() => of({ etxn: err.etxn })));
        } else {
          return throwError('unhandledError');
        }
      })
    );
  }

  editExpensePolicyViolationHandler(err: {
    status?: number;
    type?: string;
    policyViolations?: string[];
    policyAction?: FinalExpensePolicyState;
    etxn?: Partial<UnflattenedTransaction>;
  }): Observable<{ etxn: Partial<UnflattenedTransaction>; comment: string }> {
    return from(this.continueWithPolicyViolations(err.policyViolations, err.policyAction)).pipe(
      switchMap((continueWithTransaction) => {
        if (continueWithTransaction) {
          if (continueWithTransaction.comment === '' || continueWithTransaction.comment === null) {
            continueWithTransaction.comment = 'No policy violation explanation provided';
          }
          return from(this.loaderService.showLoader()).pipe(
            switchMap(() => of({ etxn: err.etxn, comment: continueWithTransaction.comment }))
          );
        } else {
          return throwError('unhandledError');
        }
      })
    );
  }

  editExpense(redirectedFrom: PerDiemRedirectedFrom): Observable<Partial<Transaction>> {
    this.savePerDiemLoader = redirectedFrom === PerDiemRedirectedFrom.SAVE_PER_DIEM;
    this.saveAndNextPerDiemLoader = redirectedFrom === PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM;
    this.saveAndPrevPerDiemLoader = redirectedFrom === PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM;

    this.trackPolicyCorrections();

    const customFields$ = this.getCustomFields();

    return from(this.generateEtxnFromFg(this.etxn$, customFields$)).pipe(
      switchMap((etxn) => {
        const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay(1));
        return policyViolations$.pipe(
          map(this.policyService.getCriticalPolicyRules),
          switchMap((policyViolations) => {
            if (policyViolations.length > 0) {
              return throwError({
                type: 'criticalPolicyViolations',
                policyViolations,
                etxn,
              });
            } else {
              return policyViolations$;
            }
          }),
          map((policyViolations: ExpensePolicy): [string[], FinalExpensePolicyState] => [
            this.policyService.getPolicyRules(policyViolations),
            policyViolations?.data?.final_desired_state,
          ]),
          switchMap(([policyViolations, policyAction]: [string[], FinalExpensePolicyState]) => {
            if (policyViolations.length > 0) {
              return throwError({
                type: 'policyViolations',
                policyViolations,
                policyAction,
                etxn,
              });
            } else {
              return of({ etxn });
            }
          })
        );
      }),
      catchError(
        (err: {
          status: number;
          policyViolations: string[];
          etxn: Partial<UnflattenedTransaction>;
          type: string;
          policyAction: FinalExpensePolicyState;
        }) => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(map((etxn) => ({ etxn })));
          }
          if (err.type === 'criticalPolicyViolations') {
            return this.editExpenseCriticalPolicyViolationHandler(err);
          } else if (err.type === 'policyViolations') {
            return this.editExpensePolicyViolationHandler(err);
          } else {
            return throwError(err);
          }
        }
      ),
      switchMap(({ etxn, comment }: { etxn: Partial<UnflattenedTransaction>; comment: string }) =>
        this.etxn$.pipe(
          switchMap((txnCopy) => {
            if (!isEqual(etxn.tx, txnCopy.tx)) {
              // only if the form is edited
              this.trackingService.editExpense({
                Type: 'Per Diem',
                Amount: etxn.tx.amount,
                Currency: etxn.tx.currency,
                Category: etxn.tx.org_category,
                Time_Spent: this.getTimeSpentOnPage() + ' secs',
                Used_Autofilled_Project:
                  etxn.tx.project_id && this.presetProjectId && etxn.tx.project_id === this.presetProjectId,
                Used_Autofilled_CostCenter:
                  etxn.tx.cost_center_id &&
                  this.presetCostCenterId &&
                  etxn.tx.cost_center_id === this.presetCostCenterId,
              });
            } else {
              // tracking expense closed without editing
              this.trackingService.viewExpense({ Type: 'Per Diem' });
            }

            return this.transactionService.upsert(etxn.tx).pipe(
              catchError((error: Error) => {
                this.trackingService.editPerDiemError({ label: error });
                return throwError(() => error);
              }),
              switchMap((txn) => this.expensesService.getExpenseById(txn.id)),
              map((expense) => this.transactionService.transformExpense(expense).tx),
              switchMap((tx) => {
                const formValue = this.getFormValues();
                const selectedReportId = formValue.report?.id;
                const criticalPolicyViolated = isNumber(etxn.tx.policy_amount) && etxn.tx.policy_amount < 0.0001;
                if (!criticalPolicyViolated) {
                  if (!txnCopy.tx.report_id && selectedReportId) {
                    return this.platformReportService.addExpenses(selectedReportId, [tx.id]).pipe(
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx)
                    );
                  }

                  if (txnCopy.tx.report_id && selectedReportId && selectedReportId !== txnCopy.tx.report_id) {
                    return this.platformReportService.ejectExpenses(txnCopy.tx.report_id, tx.id).pipe(
                      switchMap(() => this.platformReportService.addExpenses(selectedReportId, [tx.id])),
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx)
                    );
                  }

                  if (txnCopy.tx.report_id && !selectedReportId) {
                    return this.platformReportService.ejectExpenses(txnCopy.tx.report_id, tx.id).pipe(
                      tap(() => this.trackingService.removeFromExistingReportEditExpense()),
                      map(() => tx)
                    );
                  }
                }
                return of(null).pipe(map(() => tx));
              })
            );
          }),
          switchMap((txn) => {
            if (comment) {
              return this.expenseCommentService.findLatestExpenseComment(txn.id, txn.creator_id).pipe(
                switchMap((result) => {
                  if (result !== comment) {
                    const commentsPayload = [
                      {
                        expense_id: txn.id,
                        comment,
                        notify: true,
                      },
                    ];
                    return this.expenseCommentService.post(commentsPayload).pipe(map(() => txn));
                  } else {
                    return of(txn);
                  }
                })
              );
            } else {
              return of(txn);
            }
          }),
          switchMap((txn) => of(txn))
        )
      ),
      finalize(() => {
        this.savePerDiemLoader = false;
        this.saveAndNextPerDiemLoader = false;
        this.saveAndPrevPerDiemLoader = false;
      })
    );
  }

  showAddToReportSuccessToast(reportId: string): void {
    const toastMessageData = {
      message: 'Per diem expense added to report successfully',
      redirectionText: 'View Report',
    };
    const expensesAddedToReportSnackBar = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(ToastType.SUCCESS, toastMessageData),
      panelClass: ['msb-success-with-camera-icon'],
    });
    this.trackingService.showToastMessage({ ToastContent: toastMessageData.message });

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId, navigateBack: true }]);
    });
  }

  showFormValidationErrors(): void {
    this.fg.markAllAsTouched();
    const formContainer = this.formContainer.nativeElement as HTMLElement;
    if (formContainer) {
      const invalidElement = formContainer.querySelector('.ng-invalid');
      if (invalidElement) {
        invalidElement.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }
  }

  savePerDiem(): void {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM).subscribe(() => this.goBack());
      } else {
        that.editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM).subscribe(() => this.goBack());
      }
    } else {
      this.showFormValidationErrors();
    }
  }

  async reloadCurrentRoute(): Promise<void> {
    await this.router.navigateByUrl('/enterprise/my_expenses', { skipLocationChange: true });
    await this.router.navigate(['/', 'enterprise', 'add_edit_per_diem']);
  }

  saveAndNewExpense(): void {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense(PerDiemRedirectedFrom.SAVE_AND_NEW_PER_DIEM).subscribe(() => {
          this.reloadCurrentRoute();
        });
      } else {
        that.editExpense(PerDiemRedirectedFrom.SAVE_AND_NEW_PER_DIEM).subscribe(() => {
          that.goBack();
        });
      }
    } else {
      this.showFormValidationErrors();
    }
  }

  saveExpenseAndGotoPrev(): void {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM).subscribe(() => {
          if (+this.activeIndex === 0) {
            that.close();
          } else {
            that.goToPrev();
          }
        });
      } else {
        // to do edit
        that.editExpense(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM).subscribe(() => {
          if (+this.activeIndex === 0) {
            that.close();
          } else {
            that.goToPrev();
          }
        });
      }
    } else {
      this.showFormValidationErrors();
    }
  }

  saveExpenseAndGotoNext(): void {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM).subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.close();
          } else {
            that.goToNext();
          }
        });
      } else {
        // to do edit
        that.editExpense(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM).subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.close();
          } else {
            that.goToNext();
          }
        });
      }
    } else {
      this.showFormValidationErrors();
    }
  }

  close(): void {
    this.router.navigate(['/', 'enterprise', 'my_expenses']);
  }

  getDeleteReportParams(
    config: { header: string; body: string; ctaText: string; ctaLoadingText: string },
    removePerDiemFromReport: boolean,
    id: string,
    reportId?: string
  ): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      ctaText: string;
      ctaLoadingText: string;
      deleteMethod: () => Observable<Expense | void>;
    };
  } {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: config.header,
        body: config.body,
        ctaText: config.ctaText,
        ctaLoadingText: config.ctaLoadingText,
        deleteMethod: (): Observable<Expense | void> => {
          if (removePerDiemFromReport) {
            return this.platformReportService.ejectExpenses(reportId, id);
          }
          return this.expensesService.deleteExpenses([id]);
        },
      },
    };
  }

  async deleteExpense(reportId?: string): Promise<void> {
    const id = this.activatedRoute.snapshot.params.id as string;
    const removePerDiemFromReport = reportId && this.isRedirectedFromReport;

    const header = removePerDiemFromReport ? 'Remove Per Diem' : 'Delete Per Diem';
    const body = removePerDiemFromReport
      ? 'Are you sure you want to remove this Per Diem expense from this report?'
      : 'Are you sure you want to delete this Per Diem expense?';
    const ctaText = removePerDiemFromReport ? 'Remove' : 'Delete';
    const ctaLoadingText = removePerDiemFromReport ? 'Removing' : 'Deleting';

    const deletePopover = await this.popoverController.create(
      this.getDeleteReportParams(
        {
          header,
          body,
          ctaText,
          ctaLoadingText,
        },
        removePerDiemFromReport,
        id,
        reportId
      )
    );

    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as { data: { status: string } };

    if (data && data.status === 'success') {
      if (this.reviewList && this.reviewList.length && +this.activeIndex < this.reviewList.length - 1) {
        this.reviewList.splice(+this.activeIndex, 1);
        this.expensesService.getExpenseById(this.reviewList[+this.activeIndex]).subscribe((expense) => {
          const etxn = this.transactionService.transformExpense(expense);
          this.goToTransaction(etxn, this.reviewList, +this.activeIndex);
        });
      } else if (removePerDiemFromReport) {
        this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId }]);
      } else {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    } else {
      if (this.mode === 'add') {
        this.trackingService.clickDeleteExpense({ Type: 'Per Diem' });
      }
    }
  }

  async openCommentsModal(): Promise<void> {
    const etxn = await this.etxn$.toPromise();

    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'transactions',
        objectId: etxn.tx.id,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();

    const { data } = (await modal.onDidDismiss()) as { data: { updated: boolean } };

    if (data && data.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  hideFields(): void {
    this.trackingService.hideMoreClicked({
      source: 'Add Edit Per Diem page',
    });

    this.isExpandedView = false;
  }

  showFields(): void {
    this.trackingService.showMoreClicked({
      source: 'Add Edit Per Diem page',
    });

    this.isExpandedView = true;
  }

  getPolicyDetails(): void {
    const expenseId = this.activatedRoute.snapshot.params.id as string;
    if (expenseId) {
      from(this.policyService.getSpenderExpensePolicyViolations(expenseId))
        .pipe()
        .subscribe((policyDetails) => {
          this.policyDetails = policyDetails;
        });
    }
  }

  ionViewWillLeave(): void {
    this.hardwareBackButtonAction.unsubscribe();
    this.projectDependentFieldsRef?.ngOnDestroy();
    this.costCenterDependentFieldsRef?.ngOnDestroy();
    this.onPageExit$.next(null);
    this.onPageExit$.complete();
  }
}
