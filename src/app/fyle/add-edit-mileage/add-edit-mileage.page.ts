import { CostCentersService } from 'src/app/core/services/cost-centers.service';
// TODO: Very hard to fix this file without making massive changes
/* eslint-disable complexity */
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  ViewChild,
  inject,
  viewChild,
} from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import dayjs from 'dayjs';
import { cloneDeep, intersection, isEmpty, isEqual, isNumber } from 'lodash';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest,
  concat,
  EMPTY,
  forkJoin,
  from,
  iif,
  of,
  throwError,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { ExpenseType } from 'src/app/core/enums/expense-type.enum';
import { AccountOption } from 'src/app/core/models/account-option.model';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { CostCenterOptions } from 'src/app/core/models/cost-center-options.model';
import { Destination } from 'src/app/core/models/destination.model';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { Location } from 'src/app/core/models/location.model';
import { MileageDetails } from 'src/app/core/models/mileage.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { ExpensePolicy } from 'src/app/core/models/platform/platform-expense-policy.model';
import { FinalExpensePolicyState } from 'src/app/core/models/platform/platform-final-expense-policy-state.model';
import { PlatformMileageRates } from 'src/app/core/models/platform/platform-mileage-rates.model';
import { PublicPolicyExpense } from 'src/app/core/models/public-policy-expense.model';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { TxnCustomProperties } from 'src/app/core/models/txn-custom-properties.model';
import { UnflattenedTransaction } from 'src/app/core/models/unflattened-transaction.model';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { ExpenseFieldsObj } from 'src/app/core/models/v1/expense-fields-obj.model';
import { OrgCategory, OrgCategoryListItem } from 'src/app/core/models/v1/org-category.model';
import { RecentlyUsed } from 'src/app/core/models/v1/recently_used.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { ProjectV2 } from 'src/app/core/models/v2/project-v2.model';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { DateService } from 'src/app/core/services/date.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { LocationService } from 'src/app/core/services/location.service';
import { MileageRatesService } from 'src/app/core/services/mileage-rates.service';
import { MileageService } from 'src/app/core/services/mileage.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { DependentFieldsComponent } from 'src/app/shared/components/dependent-fields/dependent-fields.component';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { FyPolicyViolationComponent } from 'src/app/shared/components/fy-policy-violation/fy-policy-violation.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { RouteSelectorComponent } from 'src/app/shared/components/route-selector/route-selector.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TrackingService } from '../../core/services/tracking.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { MileageRatesOptions } from 'src/app/core/models/mileage-rates-options.data';
import { CommuteDetails } from 'src/app/core/models/platform/v1/commute-details.model';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { FySelectCommuteDetailsComponent } from 'src/app/shared/components/fy-select-commute-details/fy-select-commute-details.component';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { CommuteDeductionOptions } from 'src/app/core/models/commute-deduction-options.model';
import { MileageFormValue } from 'src/app/core/models/mileage-form-value.model';
import { CommuteDetailsResponse } from 'src/app/core/models/platform/commute-details-response.model';
import { LocationInfo } from 'src/app/core/models/location-info.model';
import { ExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { MileageSettings } from 'src/app/core/models/mileage-settings.model';
import { Expense as PlatformExpense } from 'src/app/core/models/platform/v1/expense.model';

@Component({
  selector: 'app-add-edit-mileage',
  templateUrl: './add-edit-mileage.page.html',
  styleUrls: ['./add-edit-mileage.page.scss'],
  standalone: false,
})
export class AddEditMileagePage implements OnInit {
  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);

  private loaderService = inject(LoaderService);

  private transactionService = inject(TransactionService);

  private authService = inject(AuthService);

  private accountsService = inject(AccountsService);

  private customInputsService = inject(CustomInputsService);

  private customFieldsService = inject(CustomFieldsService);

  private reportService = inject(ReportService);

  private platformReportService = inject(SpenderReportsService);

  private fb = inject(UntypedFormBuilder);

  private projectsService = inject(ProjectsService);

  private mileageService = inject(MileageService);

  private mileageRatesService = inject(MileageRatesService);

  private transactionsOutboxService = inject(TransactionsOutboxService);

  private policyService = inject(PolicyService);

  private modalController = inject(ModalController);

  private networkService = inject(NetworkService);

  private navController = inject(NavController);

  private dateService = inject(DateService);

  private trackingService = inject(TrackingService);

  private tokenService = inject(TokenService);

  private recentlyUsedItemsService = inject(RecentlyUsedItemsService);

  private locationService = inject(LocationService);

  private expenseFieldsService = inject(ExpenseFieldsService);

  private popoverController = inject(PopoverController);

  private modalProperties = inject(ModalPropertiesService);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private paymentModesService = inject(PaymentModesService);

  private currencyService = inject(CurrencyService);

  private mileageRateService = inject(MileageRatesService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private costCentersService = inject(CostCentersService);

  private categoriesService = inject(CategoriesService);

  private orgSettingsService = inject(OrgSettingsService);

  private platformHandlerService = inject(PlatformHandlerService);

  private storageService = inject(StorageService);

  private employeesService = inject(EmployeesService);

  private expensesService = inject(ExpensesService);

  private changeDetectorRef = inject(ChangeDetectorRef);

  private expenseCommentService = inject(ExpenseCommentService);

  readonly formContainer = viewChild<ElementRef<HTMLFormElement>>('formContainer');

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild(RouteSelectorComponent) routeSelector: RouteSelectorComponent;

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('projectDependentFieldsRef') projectDependentFieldsRef: DependentFieldsComponent;

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('costCenterDependentFieldsRef') costCenterDependentFieldsRef: DependentFieldsComponent;

  mode = 'add';

  title = 'edit';

  activeIndex: number;

  minDate: string;

  maxDate: string;

  reviewList: string[];

  fg: UntypedFormGroup;

  txnFields$: Observable<Partial<ExpenseFieldsObj>>;

  paymentModes$: Observable<AccountOption[]>;

  homeCurrency$: Observable<string>;

  subCategories$: Observable<OrgCategory[]>;

  filteredCategories$: Observable<OrgCategoryListItem[]>;

  etxn$: Observable<Partial<UnflattenedTransaction>>;

  platformExpense$: Observable<PlatformExpense>;

  isIndividualProjectsEnabled$: Observable<boolean>;

  individualProjectIds$: Observable<number[]>;

  isProjectsEnabled$: Observable<boolean>;

  isProjectCategoryRestrictionsEnabled$: Observable<boolean>;

  isCostCentersEnabled$: Observable<boolean>;

  customInputs$: Observable<TxnCustomProperties[]>;

  costCenters$: Observable<CostCenterOptions[]>;

  reports$: Observable<{ label: string; value: Report }[]>;

  isAmountCapped$: Observable<boolean>;

  isAmountDisabled$: Observable<boolean>;

  isCriticalPolicyViolated$: Observable<boolean>;

  amount$: Observable<number>;

  mileageConfig$: Observable<MileageDetails>;

  individualMileageRatesEnabled$: Observable<boolean>;

  allMileageRates$: Observable<PlatformMileageRates[]>;

  mileageRates$: Observable<PlatformMileageRates[]>;

  mileageRatesOptions$: Observable<MileageRatesOptions[]>;

  rate$: Observable<number>;

  projectCategoryIds$: Observable<string[]>;

  projectCategories$: Observable<OrgCategory[]>;

  isConnected$: Observable<boolean>;

  connectionStatus$: Observable<{ connected: boolean }>;

  comments$: Observable<ExtendedStatus[]>;

  expenseStartTime;

  policyDetails;

  navigateBack = false;

  saveMileageLoader = false;

  saveAndNewMileageLoader = false;

  saveAndNextMileageLoader = false;

  saveAndPrevMileageLoader = false;

  showBillable = false;

  clusterDomain: string;

  recentlyUsedValues$: Observable<RecentlyUsed>;

  recentlyUsedMileageLocations$: Observable<{
    start_locations?: string[];
    end_locations?: string[];
    locations?: string[];
  }>;

  recentProjects: { label: string; value: ProjectV2; selected?: boolean }[];

  presetProjectId: number;

  recentlyUsedProjects$: Observable<ProjectV2[]>;

  recentCostCenters: { label: string; value: CostCenter; selected?: boolean }[];

  presetCostCenterId: number;

  recentlyUsedCostCenters$: Observable<{ label: string; value: CostCenter; selected?: boolean }[]>;

  presetVehicleType: string;

  presetLocation: string;

  initialFetch;

  isProjectVisible$: Observable<boolean>;

  formInitializedFlag = false;

  billableDefaultValue: boolean;

  isRedirectedFromReport = false;

  canRemoveFromReport = false;

  autoSubmissionReportName$: Observable<string>;

  hardwareBackButtonAction: Subscription;

  isNewReportsFlowEnabled = false;

  isLoading = true;

  onPageExit$: Subject<void>;

  dependentFields$: Observable<ExpenseField[]>;

  selectedProject$: BehaviorSubject<ProjectV2>;

  selectedCostCenter$: BehaviorSubject<CostCenter>;

  showCommuteDeductionField = false;

  commuteDetails: CommuteDetails;

  distanceUnit: string;

  commuteDeductionOptions: CommuteDeductionOptions[];

  initialDistance: number;

  previousCommuteDeductionType: string;

  previousRouteValue: { roundTrip: boolean; mileageLocations?: Location[]; distance?: number };

  existingCommuteDeduction: string;

  private _isExpandedView = false;

  get showSaveAndNext(): boolean {
    return this.activeIndex !== null && this.reviewList !== null && +this.activeIndex === this.reviewList.length - 1;
  }

  get route(): AbstractControl {
    return this.fg.controls.route;
  }

  get expenseId(): string {
    return this.activatedRoute.snapshot.params.id as string;
  }

  get isExpandedView(): boolean {
    return this._isExpandedView;
  }

  set isExpandedView(expandedView: boolean) {
    this._isExpandedView = expandedView;

    //Change the storage only in case of add expense
    if (this.mode === 'add') {
      this.storageService.set('isExpandedViewMileage', expandedView);
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

  getFormValues(): Partial<MileageFormValue> {
    return this.fg.value as Partial<MileageFormValue>;
  }

  getFormControl(name: string): AbstractControl {
    return this.fg.controls[name];
  }

  ngOnInit(): void {
    this.isRedirectedFromReport = this.activatedRoute.snapshot.params.remove_from_report ? true : false;
    this.canRemoveFromReport = this.activatedRoute.snapshot.params.remove_from_report === 'true';
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

  goToTransaction(expense: Partial<UnflattenedTransaction>, reviewList, activeIndex: number): void {
    let category: string;

    if (expense.tx.category?.name) {
      category = expense.tx.category.name.toLowerCase();
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
      shareReplay(1),
    );
    this.connectionStatus$ = this.isConnected$.pipe(map((isConnected) => ({ connected: isConnected })));
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
              isProjectCategoryRestrictionsEnabled,
            ),
          ),
        ),
      ),
      map((categories) =>
        categories.map((category: OrgCategory) => ({ label: category.sub_category, value: category })),
      ),
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

  getProjectCategories(): Observable<OrgCategory[]> {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const mileageCategories = categories.filter((category) => category.fyle_category === 'Mileage');

        return mileageCategories;
      }),
    );
  }

  getProjectCategoryIds(): Observable<string[]> {
    return this.projectCategories$.pipe(map((categories) => categories.map((category) => category?.id?.toString())));
  }

  getMileageCategories(): Observable<{ defaultMileageCategory: OrgCategory; mileageCategories: OrgCategory[] }> {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const orgCategoryName = 'mileage';

        const defaultMileageCategory = categories.find(
          (category) => category.name.toLowerCase() === orgCategoryName.toLowerCase(),
        );

        const mileageCategories = categories.filter((category) => ['Mileage'].indexOf(category.fyle_category) > -1);

        return {
          defaultMileageCategory,
          mileageCategories,
        };
      }),
    );
  }

  getTransactionFields(): Observable<Partial<ExpenseFieldsObj>> {
    return this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue: MileageFormValue) =>
        forkJoin({
          expenseFieldsMap: this.expenseFieldsService.getAllMap(),
          mileageCategoriesContainer: this.getMileageCategories(),
        }).pipe(
          switchMap(({ expenseFieldsMap, mileageCategoriesContainer }) => {
            // skipped distance unit, location 1 and location 2 - confirm this these are not used at all
            const fields = [
              'purpose',
              'txn_dt',
              'cost_center_id',
              'project_id',
              'distance',
              'billable',
              'commute_deduction',
            ];

            return this.expenseFieldsService.filterByOrgCategoryId(
              expenseFieldsMap,
              fields,
              formValue.sub_category || mileageCategoriesContainer.defaultMileageCategory,
            );
          }),
        ),
      ),
      map((expenseFieldsMap: Partial<ExpenseFieldsObj>) => {
        if (expenseFieldsMap) {
          this.showBillable = expenseFieldsMap.billable?.is_enabled;
          for (const tfc of Object.keys(expenseFieldsMap)) {
            const expenseField = expenseFieldsMap[tfc] as ExpenseField;
            const options = expenseField.options as string[];
            if (options && options.length > 0) {
              const newOptions: { label: string; value: string }[] = options.map((value: string) => ({
                label: value,
                value,
              }));
              expenseField.options = newOptions;
            }
          }
        }

        return expenseFieldsMap;
      }),
      shareReplay(1),
    );
  }

  setupTfcDefaultValues(): void {
    const tfcValues$ = this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue: MileageFormValue) =>
        forkJoin({
          expenseFieldsMap: this.expenseFieldsService.getAllMap(),
          mileageCategoriesContainer: this.getMileageCategories(),
        }).pipe(
          switchMap(({ expenseFieldsMap, mileageCategoriesContainer }) => {
            // skipped distance unit, location 1 and location 2 - confirm this these are not used at all
            const fields = ['purpose', 'txn_dt', 'cost_center_id', 'distance', 'billable'];

            return this.expenseFieldsService.filterByOrgCategoryId(
              expenseFieldsMap,
              fields,
              formValue.sub_category || mileageCategoriesContainer.defaultMileageCategory,
            );
          }),
        ),
      ),
      map((tfc) => this.expenseFieldsService.getDefaultTxnFieldValues(tfc)),
    );

    tfcValues$.subscribe((defaultValues) => {
      this.billableDefaultValue = defaultValues.billable;
      const keyToControlMap: { [id: string]: AbstractControl } = {
        purpose: this.fg.controls.purpose,
        cost_center_id: this.fg.controls.costCenter,
        txn_dt: this.fg.controls.dateOfSpend,
        billable: this.fg.controls.billable,
      };

      for (const defaultValueColumn in defaultValues) {
        if (defaultValues.hasOwnProperty(defaultValueColumn)) {
          const control = keyToControlMap[defaultValueColumn];
          if (!control.value && !control.touched && defaultValueColumn !== 'billable') {
            control.patchValue(defaultValues[defaultValueColumn]);
          } else if (
            !control.touched &&
            this.fg.controls.project.value &&
            defaultValueColumn === 'billable' &&
            (control.value === null || control.value === undefined)
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
      shareReplay(1),
    );
  }

  getSubCategories(): Observable<OrgCategory[]> {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const parentCategoryName = 'mileage';
        return categories.filter(
          (orgCategory) =>
            parentCategoryName.toLowerCase() === orgCategory.fyle_category?.toLowerCase() &&
            parentCategoryName.toLowerCase() !== orgCategory.sub_category?.toLowerCase(),
        );
      }),
      shareReplay(1),
    );
  }

  setupDependentFields(customExpenseFields$: Observable<ExpenseField[]>): void {
    this.dependentFields$ = customExpenseFields$.pipe(
      map((customFields) => customFields.filter((customField) => customField.type === 'DEPENDENT_SELECT')),
    );
  }

  checkMileageCategories(category: OrgCategory): Observable<OrgCategory> {
    if (category && !isEmpty(category)) {
      return of(category);
    } else {
      return this.getMileageCategories().pipe(map((mileageContainer) => mileageContainer.defaultMileageCategory));
    }
  }

  getCustomInputs(): Observable<TxnCustomProperties[]> {
    this.initialFetch = true;

    const customExpenseFields$ = this.customInputsService.getAll(true).pipe(shareReplay(1));

    this.setupDependentFields(customExpenseFields$);

    return this.fg.controls.sub_category.valueChanges.pipe(
      startWith({}),
      switchMap((category: OrgCategory) => this.checkMileageCategories(category)),
      switchMap((category: OrgCategory) => {
        const formValue = this.getFormValues();
        return customExpenseFields$.pipe(
          map((customFields) => customFields.filter((customField) => customField.type !== 'DEPENDENT_SELECT')),
          map((customFields) =>
            this.customFieldsService.standardizeCustomFields(
              formValue.custom_inputs || [],
              this.customInputsService.filterByCategory(customFields, category && category.id),
            ),
          ),
        );
      }),
      map((customFields) =>
        customFields.map((customField) => {
          if (customField.options) {
            const options = customField.options as string[];
            const newOptions = options.map((option) => ({ label: option, value: option }));
            customField.options = newOptions;
          }
          return customField;
        }),
      ),
      switchMap((customFields: TxnCustomProperties[]) =>
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
                }),
              );
            }
            customFieldsFormArray.updateValueAndValidity();
            return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
          }),
        ),
      ),
      shareReplay(1),
    );
  }

  getRateByVehicleType(mileageRates: PlatformMileageRates[], vehicle_type: string): number {
    const filteredMileageRate = mileageRates.find((mileageRate) => mileageRate.vehicle_type === vehicle_type);

    return filteredMileageRate?.rate;
  }

  getMileageByVehicleType(mileageRates: PlatformMileageRates[], vehicle_type: string): PlatformMileageRates {
    const filteredMileageRate = mileageRates.find((mileageRate) => mileageRate.vehicle_type === vehicle_type);

    return filteredMileageRate;
  }

  getNewExpense(): Observable<Partial<UnflattenedTransaction>> {
    const defaultVehicle$ = forkJoin({
      vehicleType: this.transactionService.getDefaultVehicleType(),
      employeeMileageSettings: this.mileageService.getEmployeeMileageSettings(),
      orgSettings: this.orgSettingsService.get(),
      employeeSettings: this.platformEmployeeSettingsService.get(),
      recentValue: this.recentlyUsedValues$,
      mileageRates: this.mileageRates$,
    }).pipe(
      map(
        ({
          vehicleType,
          employeeMileageSettings,
          orgSettings,
          employeeSettings,
          recentValue,
          mileageRates,
        }: {
          vehicleType: string;
          employeeMileageSettings: MileageSettings;
          orgSettings: OrgSettings;
          employeeSettings: EmployeeSettings;
          recentValue: RecentlyUsed;
          mileageRates: PlatformMileageRates[];
        }) => {
          const isRecentVehicleTypePresent =
            orgSettings?.org_expense_form_autofills?.allowed &&
            orgSettings?.org_expense_form_autofills?.enabled &&
            employeeSettings?.expense_form_autofills?.allowed &&
            employeeSettings?.expense_form_autofills?.enabled &&
            recentValue &&
            recentValue.vehicle_types &&
            recentValue.vehicle_types.length > 0;
          if (isRecentVehicleTypePresent) {
            vehicleType = recentValue.vehicle_types[0];
            this.presetVehicleType = recentValue.vehicle_types[0];
          }

          // if any employee assigned mileage rate is present
          // -> the recently used mileage rate should be part of the allowed mileage rates.
          const mileageRateLabels = employeeMileageSettings?.mileage_rate_labels;
          if (mileageRateLabels?.length > 0 && !mileageRateLabels.some((label) => vehicleType === label)) {
            vehicleType = mileageRateLabels[0];
          }

          const finalMileageRateNames = mileageRates.map((rate) => rate.vehicle_type);

          // if mileage_vehicle_type is not set or if the set mileage rate is not enabled; set the 1st from mileageRates
          // (when the org doesn't use employee restricted mileage rates)
          if (
            (!vehicleType || !finalMileageRateNames.includes(vehicleType)) &&
            mileageRates &&
            mileageRates.length > 0
          ) {
            vehicleType = mileageRates[0].vehicle_type;
          }

          return vehicleType;
        },
      ),
    );

    const defaultMileage$ = forkJoin({
      defaultVehicle: defaultVehicle$,
      mileageRates: this.mileageRates$,
    }).pipe(map(({ defaultVehicle, mileageRates }) => this.getMileageByVehicleType(mileageRates, defaultVehicle)));

    const autofillLocation$ = forkJoin({
      eou: this.authService.getEou(),
      currentLocation: this.locationService.getCurrentLocation({ enableHighAccuracy: true }),
      employeeSettings: this.platformEmployeeSettingsService.get(),
      orgSettings: this.orgSettingsService.get(),
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      map(({ eou, currentLocation, employeeSettings, orgSettings, recentValue }) => {
        const isRecentLocationPresent =
          orgSettings?.org_expense_form_autofills?.allowed &&
          orgSettings?.org_expense_form_autofills?.enabled &&
          employeeSettings?.expense_form_autofills?.allowed &&
          employeeSettings?.expense_form_autofills?.enabled &&
          recentValue &&
          recentValue.start_locations &&
          recentValue.start_locations.length > 0;
        if (isRecentLocationPresent) {
          const autocompleteLocationInfo = {
            recentStartLocation: recentValue.start_locations[0],
            eou,
            currentLocation,
          };
          return autocompleteLocationInfo;
        } else {
          return of(null);
        }
      }),
      concatMap((info: LocationInfo) => {
        if (info && info.recentStartLocation && info.eou && info.currentLocation) {
          return this.locationService.getAutocompletePredictions(
            info.recentStartLocation,
            info.eou.us.id,
            `${info.currentLocation.coords.latitude},${info.currentLocation.coords.longitude}`,
          );
        } else {
          return of(null);
        }
      }),
      concatMap((isPredictedLocation) => {
        if (isPredictedLocation && isPredictedLocation.length > 0) {
          return this.locationService
            .getGeocode(isPredictedLocation[0].place_id, isPredictedLocation[0].description)
            .pipe(
              map((location) => {
                if (location) {
                  return location;
                } else {
                  return of(null);
                }
              }),
            );
        } else {
          return of(null);
        }
      }),
    );

    return forkJoin({
      mileageContainer: this.getMileageCategories(),
      homeCurrency: this.homeCurrency$,
      orgSettings: this.orgSettingsService.get(),
      defaultVehicleType: defaultVehicle$,
      defaultMileageRate: defaultMileage$.pipe(take(1)),
      currentEou: this.authService.getEou(),
      autofillLocation: autofillLocation$,
    }).pipe(
      map(
        ({
          mileageContainer,
          homeCurrency,
          orgSettings,
          defaultVehicleType,
          defaultMileageRate,
          currentEou,
          autofillLocation,
        }) => {
          const distanceUnit = orgSettings.mileage.unit;
          const locations = [];
          if (autofillLocation) {
            locations.push(autofillLocation);
          }
          return {
            tx: {
              skip_reimbursement: false,
              source: 'MOBILE',
              state: 'COMPLETE',
              spent_at: new Date(),
              category_id: mileageContainer.defaultMileageCategory && mileageContainer.defaultMileageCategory.id,
              sub_category:
                mileageContainer.defaultMileageCategory && mileageContainer.defaultMileageCategory.sub_category,
              currency: homeCurrency,
              amount: 0,
              distance: null,
              mileage_calculated_amount: null,
              mileage_calculated_distance: null,
              policy_amount: null,
              mileage_vehicle_type: defaultVehicleType,
              mileage_rate: defaultMileageRate?.rate,
              distance_unit: distanceUnit,
              mileage_is_round_trip: false,
              org_user_id: currentEou.ou.id,
              locations,
              custom_properties: [],
            },
          };
        },
      ),
      shareReplay(1),
    );
  }

  getEditExpense(): Observable<Partial<UnflattenedTransaction>> {
    const expenseId = this.activatedRoute.snapshot.params.id as string;

    return this.expensesService.getExpenseById(expenseId).pipe(
      map((expense) => this.transactionService.transformExpense(expense)),
      shareReplay(1),
    );
  }

  customDateValidator(control: AbstractControl): null | { invalidDateSelection: boolean } {
    const today = new Date();
    const minDate = dayjs(new Date('Jan 1, 2001'));
    const maxDate = dayjs(new Date(today)).add(1, 'day');
    const passedInDate = control.value && dayjs(new Date(control.value as string));
    if (passedInDate) {
      return passedInDate.isBefore(maxDate) && passedInDate.isAfter(minDate)
        ? null
        : {
            invalidDateSelection: true,
          };
    }
  }

  getCategories(etxn: Partial<UnflattenedTransaction>): Observable<OrgCategory> {
    return this.categoriesService
      .getAll()
      .pipe(
        map((subCategories) =>
          subCategories
            .filter((subCategory) => subCategory.sub_category?.toLowerCase() !== subCategory.name?.toLowerCase())
            .find((subCategory) => subCategory.id === etxn.tx.category_id),
        ),
      );
  }

  initClassObservables(): void {
    this.isNewReportsFlowEnabled = false;
    this.onPageExit$ = new Subject();
    this.projectDependentFieldsRef?.ngOnInit();
    this.costCenterDependentFieldsRef?.ngOnInit();
    this.selectedProject$ = new BehaviorSubject<ProjectV2>(null);
    this.selectedCostCenter$ = new BehaviorSubject<CostCenter>(null);
    const fn = (): void => {
      this.showClosePopup();
    };
    const priority = BackButtonActionPriority.MEDIUM;
    this.hardwareBackButtonAction = this.platformHandlerService.registerBackButtonAction(priority, fn);
  }

  setupTxnFields(): void {
    this.txnFields$
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        switchMap((txnFields) =>
          forkJoin({
            isConnected: this.isConnected$.pipe(take(1)),
            orgSettings: this.orgSettingsService.get(),
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
            })),
          ),
        ),
      )
      .subscribe(
        ({ isConnected, txnFields, costCenters, orgSettings, individualProjectIds, isIndividualProjectsEnabled }) => {
          const keyToControlMap: { [id: string]: AbstractControl } = {
            purpose: this.fg.controls.purpose,
            cost_center_id: this.fg.controls.costCenter,
            txn_dt: this.fg.controls.dateOfSpend,
            project_id: this.fg.controls.project,
            billable: this.fg.controls.billable,
            commute_deduction: this.fg.controls.commuteDeduction,
          };

          for (const [key, control] of Object.entries(keyToControlMap)) {
            control.clearValidators();
            if (key === 'project_id' || key === 'commute_deduction') {
              control.updateValueAndValidity({
                emitEvent: false,
              });
            } else {
              control.updateValueAndValidity();
            }
          }

          for (const txnFieldKey of intersection(Object.keys(keyToControlMap), Object.keys(txnFields))) {
            const control = keyToControlMap[txnFieldKey];
            const field = txnFields[txnFieldKey] as ExpenseField;
            if (field.is_mandatory) {
              if (txnFieldKey === 'txn_dt') {
                control.setValidators(
                  isConnected ? Validators.compose([Validators.required, this.customDateValidator]) : null,
                );
              } else if (txnFieldKey === 'cost_center_id') {
                control.setValidators(
                  isConnected && costCenters && costCenters.length > 0 ? Validators.required : null,
                );
              } else if (txnFieldKey === 'project_id') {
                control.setValidators(
                  orgSettings.projects.enabled && isIndividualProjectsEnabled && individualProjectIds.length === 0
                    ? null
                    : Validators.required,
                );
              } else if (txnFieldKey === 'commute_deduction') {
                control.setValidators(orgSettings.commute_deduction_settings.enabled ? Validators.required : null);
              } else {
                control.setValidators(isConnected ? Validators.required : null);
              }
            } else {
              // set back the customDateValidator for spent_at field
              if (txnFieldKey === 'txn_dt' && isConnected) {
                control.setValidators(this.customDateValidator);
              }
            }

            if (txnFieldKey === 'project_id' || txnFieldKey === 'commute_deduction') {
              control.updateValueAndValidity({
                emitEvent: false,
              });
            } else {
              control.updateValueAndValidity();
            }
          }
          this.fg.updateValueAndValidity({
            emitEvent: false,
          });
        },
      );
  }

  setupSelectedProjects(): void {
    this.fg.controls.project.valueChanges
      .pipe(takeUntil(this.onPageExit$))
      .subscribe((project: ProjectV2) => this.selectedProject$.next(project));
  }

  setupSelectedCostCenters(): void {
    this.fg.controls.costCenter.valueChanges
      .pipe(takeUntil(this.onPageExit$))
      .subscribe((costCenter: CostCenter) => this.selectedCostCenter$.next(costCenter));
  }

  checkNewReportsFlow(orgSettings$: Observable<OrgSettings>): void {
    orgSettings$.subscribe((orgSettings) => {
      this.isNewReportsFlowEnabled = orgSettings?.simplified_report_closure_settings.enabled || false;
    });
  }

  getRecentlyUsedValues(): Observable<RecentlyUsed | null> {
    return this.isConnected$.pipe(
      take(1),
      switchMap((isConnected) => {
        if (isConnected) {
          return this.recentlyUsedItemsService.getRecentlyUsed();
        } else {
          return of(null);
        }
      }),
    );
  }

  checkIndividualMileageEnabled(orgSettings$: Observable<OrgSettings>): void {
    this.individualMileageRatesEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.mileage?.enable_individual_mileage_rates),
    );
  }

  getExpenseAmount(): Observable<number> {
    return combineLatest(this.fg.valueChanges, this.rate$).pipe(
      map(([formValue, mileageRate]) => {
        const value = formValue as MileageFormValue;
        const distance = value.route?.distance || 0;
        return distance * mileageRate;
      }),
      shareReplay(1),
    );
  }

  getProjects(): Observable<ProjectV2 | null> {
    return this.etxn$.pipe(
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
            }),
          );
        }
      }),
      switchMap((projectId) => {
        if (projectId) {
          return this.projectCategories$.pipe(
            switchMap((projectCategories) => this.projectsService.getbyId(projectId, projectCategories)),
          );
        } else {
          return of(null);
        }
      }),
    );
  }

  getReports(): Observable<Report | null> {
    return forkJoin({
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
      }),
    );
  }

  getCostCenters(orgSettings$: Observable<OrgSettings>): Observable<CostCenterOptions[]> {
    return orgSettings$.pipe(
      switchMap((orgSettings) => {
        if (orgSettings.cost_centers.enabled) {
          return this.costCentersService.getAllActive();
        } else {
          return of([]);
        }
      }),
      map((costCenters) =>
        costCenters.map((costCenter: CostCenter) => ({
          label: costCenter.name,
          value: costCenter,
        })),
      ),
    );
  }

  getEditRates(): Observable<number> {
    return this.fg.valueChanges.pipe(
      map((formValue: MileageFormValue) => formValue.mileage_rate_name),
      switchMap((formValue) =>
        forkJoin({
          etxn: this.etxn$,
          mileageRates: this.mileageRates$,
        }).pipe(
          map(
            ({
              etxn,
              mileageRates,
            }: {
              etxn: Partial<UnflattenedTransaction>;
              mileageRates: PlatformMileageRates[];
            }) => {
              if (formValue) {
                if (etxn.tx.mileage_rate && etxn.tx.mileage_vehicle_type === formValue.vehicle_type) {
                  return etxn.tx.mileage_rate;
                } else {
                  return this.getRateByVehicleType(mileageRates, formValue.vehicle_type);
                }
              }
            },
          ),
        ),
      ),
      shareReplay(1),
    );
  }

  getAddRates(): Observable<number> {
    return this.fg.valueChanges.pipe(
      map((formValue: MileageFormValue) => formValue.mileage_rate_name),
      switchMap((formValue) =>
        this.mileageRates$.pipe(
          map((mileageRates) => this.getRateByVehicleType(mileageRates, formValue && formValue.vehicle_type)),
        ),
      ),
      shareReplay(1),
    );
  }

  getSelectedCostCenters(): Observable<CostCenter | null> {
    return this.etxn$.pipe(
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
            }),
          );
        }
      }),
      switchMap((costCenterId) => {
        if (costCenterId) {
          return this.costCenters$.pipe(
            map((costCenters) =>
              costCenters.map((res) => res.value).find((costCenter) => costCenter.id === costCenterId),
            ),
          );
        } else {
          return of(null);
        }
      }),
    );
  }

  getMileageRatesOptions(): void {
    this.mileageRatesOptions$ = forkJoin({
      mileageRates: this.mileageRates$,
      homeCurrency: this.homeCurrency$,
    }).pipe(
      map(({ mileageRates, homeCurrency }) =>
        mileageRates.map((rate) => {
          rate.readableRate = this.mileageRatesService.getReadableRate(rate.rate, homeCurrency, rate.unit);
          return {
            label: this.mileageRatesService.formatMileageRateName(rate.vehicle_type) + ' (' + rate.readableRate + ')',
            value: rate,
          };
        }),
      ),
    );
  }

  updateDistanceOnRoundTripChange(): void {
    const distance = this.getFormValues().route?.distance;
    const commuteDeduction = this.getFormValues().commuteDeduction;
    const currentRoundTrip = (this.fg.controls.route.value as { roundTrip: boolean })?.roundTrip;
    const mileageLocations = this.getFormValues().route?.mileageLocations;

    if (
      distance !== null &&
      distance >= 0 &&
      commuteDeduction &&
      !isEqual(this.previousRouteValue?.roundTrip, currentRoundTrip)
    ) {
      const commuteDeductedDistance = this.commuteDeductionOptions.find(
        (option) => option.value === commuteDeduction,
      ).distance;

      /*
       * On changing route in commute deduction,
       * it shouldn't just double or half the distance,
       * rather it should first double the distance and then deduct commute from it
       */
      if (currentRoundTrip) {
        // Case when distance is zero and mileage locations are present, on changing roundTrip, it should calculate distance as per location
        if (distance === 0 && mileageLocations?.length > 1) {
          this.mileageService.getDistance(mileageLocations).subscribe((distance) => {
            const distanceInKm = parseFloat((distance / 1000).toFixed(2));
            const finalDistance =
              this.distanceUnit?.toLowerCase() === 'miles'
                ? parseFloat((distanceInKm * 0.6213).toFixed(2))
                : distanceInKm;
            let modifiedDistance = parseFloat((finalDistance * 2 - commuteDeductedDistance).toFixed(2));
            if (modifiedDistance < 0) {
              modifiedDistance = 0;
            }
            this.fg.controls.route.patchValue(
              { distance: modifiedDistance, roundTrip: currentRoundTrip },
              { emitEvent: false },
            );

            this.previousRouteValue = this.getFormValues().route;
          });
        } else if (distance !== 0) {
          const modifiedDistance = parseFloat((distance * 2 + commuteDeductedDistance).toFixed(2));
          this.fg.controls.route.patchValue(
            { distance: modifiedDistance, roundTrip: currentRoundTrip },
            { emitEvent: false },
          );

          // Only change the previous roundTrip and not mileageLocations
          const previousRouteValueCopy = cloneDeep(this.previousRouteValue);
          this.previousRouteValue = { ...previousRouteValueCopy, roundTrip: currentRoundTrip };
        }
      } else {
        let modifiedDistance = parseFloat(((distance - commuteDeductedDistance) / 2).toFixed(2));
        if (modifiedDistance < 0) {
          modifiedDistance = 0;
        }
        this.fg.controls.route.patchValue(
          { distance: modifiedDistance, roundTrip: currentRoundTrip },
          { emitEvent: false },
        );

        // Only change the previous roundTrip and not mileageLocations
        const previousRouteValueCopy = cloneDeep(this.previousRouteValue);
        this.previousRouteValue = { ...previousRouteValueCopy, roundTrip: currentRoundTrip };
      }
    }
  }

  calculateNetDistanceForDeduction(
    commuteDeductionType: string,
    selectedCommuteDeduction: CommuteDeductionOptions,
  ): void {
    const commuteDeductedDistance = parseFloat((this.initialDistance - selectedCommuteDeduction.distance).toFixed(2));
    const routeValue = this.getFormValues().route;

    if (commuteDeductedDistance <= 0) {
      if (this.getFormValues().route?.mileageLocations?.length > 1) {
        this.previousCommuteDeductionType = commuteDeductionType;
      }
      this.fg.controls.route.patchValue({ distance: 0, roundTrip: routeValue.roundTrip }, { emitEvent: false });
    } else {
      this.previousCommuteDeductionType = commuteDeductionType;
      this.fg.controls.route.patchValue(
        { distance: commuteDeductedDistance, roundTrip: routeValue.roundTrip },
        { emitEvent: false },
      );
    }
  }

  updateDistanceOnDeductionChange(commuteDeductionType: string): void {
    const distance = this.getFormValues().route?.distance;
    const mileageLocations = this.getFormValues().route?.mileageLocations;

    if (distance !== null && distance >= 0 && commuteDeductionType) {
      const selectedCommuteDeduction = this.commuteDeductionOptions.find(
        (option) => option.value === commuteDeductionType,
      );

      if (this.previousCommuteDeductionType) {
        // If there is a previous commute deduction type, add previously deducted distance to the distance
        const commuteDeduction = this.commuteDeductionOptions.find(
          (option) => option.value === this.previousCommuteDeductionType,
        );

        // If the distance is non-zero, correctly calculate what was the initial distance
        if (distance !== 0) {
          this.initialDistance = parseFloat((distance + commuteDeduction.distance).toFixed(2));
        }
      } else {
        // Prefill the initial distance with the distance from the transaction
        if (this.expenseId && this.existingCommuteDeduction) {
          const commuteDeduction = this.commuteDeductionOptions.find(
            (option) => option.value === this.existingCommuteDeduction,
          );
          this.initialDistance = parseFloat((distance + commuteDeduction.distance).toFixed(2));
        } else {
          // User choosing the commute deduction type for the first time in add mileage mode
          this.initialDistance = distance;
        }
      }
      /*
       * Edit case when mileage locations are present
       * and distance is 0
       * and commute deduction type is NO_DEDUCTION
       */

      if (mileageLocations?.length > 1 && distance === 0) {
        this.mileageService.getDistance(mileageLocations).subscribe((distance) => {
          this.previousCommuteDeductionType = commuteDeductionType;
          const distanceInKm = parseFloat((distance / 1000).toFixed(2));
          let finalDistance =
            this.distanceUnit?.toLowerCase() === 'miles'
              ? parseFloat((distanceInKm * 0.6213).toFixed(2))
              : distanceInKm;
          if (this.getFormValues().route?.roundTrip) {
            finalDistance = finalDistance * 2;
          }
          this.initialDistance = finalDistance;
          this.calculateNetDistanceForDeduction(commuteDeductionType, selectedCommuteDeduction);
        });
      } else {
        this.calculateNetDistanceForDeduction(commuteDeductionType, selectedCommuteDeduction);
      }
    }
  }

  updateDistanceOnLocationChange(distance: number): void {
    const commuteDeductionType = this.getFormValues().commuteDeduction;
    const currentRoundTrip = this.getFormValues().route?.roundTrip;

    if (
      distance !== null &&
      distance >= 0 &&
      commuteDeductionType &&
      !isEqual(this.previousRouteValue?.mileageLocations, this.getFormValues().route?.mileageLocations)
    ) {
      const selectedCommuteDeduction = this.commuteDeductionOptions.find(
        (option) => option.value === commuteDeductionType,
      );

      this.initialDistance = distance;

      const commuteDeductedDistance = parseFloat((this.initialDistance - selectedCommuteDeduction.distance).toFixed(2));
      const routeValue = this.getFormValues().route;
      if (commuteDeductedDistance <= 0) {
        if (this.getFormValues().route?.mileageLocations?.length > 1) {
          this.previousCommuteDeductionType = commuteDeductionType;
          this.previousRouteValue = routeValue;
        }
        this.fg.controls.route.patchValue({ distance: 0, roundTrip: routeValue.roundTrip }, { emitEvent: false });
      } else {
        if (this.getFormValues().route?.mileageLocations?.length > 1) {
          this.previousRouteValue = routeValue;
        }
        this.previousCommuteDeductionType = commuteDeductionType;
        this.fg.controls.route.patchValue(
          { distance: commuteDeductedDistance, roundTrip: routeValue.roundTrip },
          { emitEvent: false },
        );
      }
    } else if (
      distance !== null &&
      distance >= 0 &&
      !isEqual(this.previousRouteValue?.mileageLocations, this.getFormValues().route?.mileageLocations)
    ) {
      this.fg.controls.route.patchValue({ distance, roundTrip: currentRoundTrip }, { emitEvent: false });
    }
  }

  ionViewWillEnter(): void {
    this.subCategories$ = this.getSubCategories().pipe(shareReplay(1));
    this.initClassObservables();

    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });

    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back as boolean;
    this.expenseStartTime = new Date().getTime();
    this.fg = this.fb.group({
      mileage_rate_name: [],
      commuteDeduction: [],
      dateOfSpend: [, this.customDateValidator],
      route: [],
      paymentMode: [, Validators.required],
      purpose: [],
      project: [],
      billable: [],
      sub_category: [, Validators.required],
      custom_inputs: new UntypedFormArray([]),
      costCenter: [],
      report: [],
      project_dependent_fields: this.fb.array([]),
      cost_center_dependent_fields: this.fb.array([]),
    });

    const today = new Date();
    this.maxDate = dayjs(this.dateService.addDaysToDate(today, 1)).format('YYYY-MM-D');
    this.autoSubmissionReportName$ = this.reportService.getAutoSubmissionReportName();

    this.setupSelectedProjects();

    this.setupSelectedCostCenters();

    this.fg.reset();
    this.title = 'Add mileage';

    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex as number;
    this.reviewList = (this.activatedRoute.snapshot.params.txnIds &&
      JSON.parse(this.activatedRoute.snapshot.params.txnIds as string)) as string[];

    this.title =
      this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    if (this.activatedRoute.snapshot.params.id) {
      this.mode = 'edit';
    }

    // If User has already clicked on See More he need not to click again and again
    from(this.storageService.get<boolean>('isExpandedViewMileage')).subscribe((expandedView) => {
      this.isExpandedView = this.mode !== 'add' || expandedView;
    });

    const orgSettings$ = this.orgSettingsService.get();
    const employeeSettings$ = this.platformEmployeeSettingsService.get().pipe(shareReplay(1));

    this.mileageConfig$ = orgSettings$.pipe(map((orgSettings) => orgSettings.mileage));
    this.isProjectCategoryRestrictionsEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.advanced_projects?.allowed && orgSettings.advanced_projects.enable_category_restriction,
      ),
    );

    this.checkNewReportsFlow(orgSettings$);

    this.setupNetworkWatcher();

    this.recentlyUsedValues$ = this.getRecentlyUsedValues();

    this.recentlyUsedMileageLocations$ = this.recentlyUsedValues$.pipe(
      map((recentlyUsedValues) => ({
        start_locations: recentlyUsedValues?.start_locations || [],
        end_locations: recentlyUsedValues?.end_locations || [],
        locations: recentlyUsedValues?.locations || [],
      })),
    );

    this.txnFields$ = this.getTransactionFields();
    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    this.setupFilteredCategories();
    this.projectCategories$ = this.getProjectCategories();
    this.projectCategoryIds$ = this.getProjectCategoryIds();

    this.isProjectVisible$ = combineLatest([this.projectCategoryIds$, this.projectCategories$]).pipe(
      switchMap(([projectCategoryIds, projectCategories]) =>
        this.projectsService.getProjectCount({ categoryIds: projectCategoryIds }, projectCategories),
      ),
      map((projectCount) => projectCount > 0),
    );
    this.comments$ = this.expenseCommentService.getTransformedComments(
      this.activatedRoute.snapshot.params.id as string,
    );

    this.filteredCategories$.subscribe((subCategories) => {
      if (subCategories.length) {
        this.fg.controls.sub_category.setValidators(Validators.required);
      } else {
        this.fg.controls.sub_category.clearValidators();
      }
      this.fg.controls.sub_category.updateValueAndValidity();
    });

    this.checkIndividualMileageEnabled(orgSettings$);

    this.allMileageRates$ = this.mileageRateService.getAllMileageRates();

    this.mileageRates$ = forkJoin({
      employeeMileageSettings: this.mileageService.getEmployeeMileageSettings(),
      allMileageRates: this.mileageRateService.getAllMileageRates(),
      orgSettings: orgSettings$,
    }).pipe(
      map(({ employeeMileageSettings, allMileageRates, orgSettings }) => {
        let enabledMileageRates = this.mileageRatesService.filterEnabledMileageRates(allMileageRates);
        const mileageRateSettings = employeeMileageSettings?.mileage_rate_labels || [];
        if (orgSettings.mileage?.enable_individual_mileage_rates && mileageRateSettings.length > 0) {
          enabledMileageRates = enabledMileageRates.filter((rate) => mileageRateSettings.includes(rate.vehicle_type));
        }
        return enabledMileageRates;
      }),
    );

    this.getMileageRatesOptions();

    this.etxn$ = iif(() => this.mode === 'add', this.getNewExpense(), this.getEditExpense());

    this.platformExpense$ = this.etxn$.pipe(
      switchMap((etxn) => (etxn.tx.id ? this.expensesService.getExpenseById(etxn.tx.id) : EMPTY)),
    );

    this.setupTfcDefaultValues();

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => !!orgSettings.advanced_projects?.enable_individual_projects),
    );

    this.individualProjectIds$ = employeeSettings$.pipe(
      map((employeeSettings: EmployeeSettings) => employeeSettings.project_ids?.map((id) => Number(id)) || []),
    );

    this.isProjectsEnabled$ = orgSettings$.pipe(map((orgSettings) => !!orgSettings.projects?.enabled));

    this.customInputs$ = this.getCustomInputs();

    this.isCostCentersEnabled$ = orgSettings$.pipe(map((orgSettings) => orgSettings.cost_centers.enabled));

    this.paymentModes$ = this.getPaymentModes();

    this.costCenters$ = this.getCostCenters(orgSettings$);

    this.recentlyUsedCostCenters$ = forkJoin({
      costCenters: this.costCenters$,
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      concatMap(({ costCenters, recentValue }) =>
        this.recentlyUsedItemsService.getRecentCostCenters(costCenters, recentValue),
      ),
    );

    this.reports$ = this.platformReportService
      .getAllReportsByParams({ state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' })
      .pipe(
        // Filter out partially approved reports
        map((reports) =>
          reports.filter((report) => !report.approvals.some((approval) => approval.state === 'APPROVAL_DONE')),
        ),
        map((reports: Report[]) => reports.map((report) => ({ label: report.purpose, value: report }))),
        shareReplay(1),
      );

    this.setupTxnFields();

    this.isAmountCapped$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.admin_amount) || isNumber(etxn.tx.policy_amount)),
    );

    this.isAmountDisabled$ = this.etxn$.pipe(
      map((etxn) => !!etxn.tx.admin_amount),
      tap(() => {
        this.changeDetectorRef.detectChanges();
      }),
    );

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.policy_amount) && etxn.tx.policy_amount < 0.0001),
    );

    this.getPolicyDetails();

    this.rate$ = iif(() => this.mode === 'edit', this.getEditRates(), this.getAddRates());

    this.amount$ = this.getExpenseAmount();

    const selectedProject$ = this.getProjects();

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
          }),
      ),
    );

    const eou$ = from(this.authService.getEou()).pipe(shareReplay(1));

    this.recentlyUsedProjects$ = forkJoin({
      recentValues: this.recentlyUsedValues$,
      mileageCategoryIds: this.projectCategoryIds$,
      eou: eou$,
      projectCategories: this.projectCategories$,
      isProjectCategoryRestrictionsEnabled: this.isProjectCategoryRestrictionsEnabled$,
    }).pipe(
      switchMap(({ recentValues, mileageCategoryIds, eou, projectCategories, isProjectCategoryRestrictionsEnabled }) =>
        this.recentlyUsedItemsService.getRecentlyUsedProjects({
          recentValues,
          eou,
          categoryIds: mileageCategoryIds,
          isProjectCategoryRestrictionsEnabled,
          activeCategoryList: projectCategories,
        }),
      ),
    );

    const selectedSubCategory$ = this.etxn$.pipe(
      switchMap((etxn: Partial<UnflattenedTransaction>) =>
        iif(() => !!etxn.tx.category_id, this.getCategories(etxn), of(null)),
      ),
    );

    const selectedReport$ = this.getReports();

    const selectedCostCenter$ = this.getSelectedCostCenters();
    const customExpenseFields$ = this.customInputsService.getAll(true).pipe(shareReplay(1));

    const commuteDeductionDetails$ = forkJoin({
      eou: eou$,
      orgSettings: orgSettings$,
    }).pipe(
      switchMap(({ eou, orgSettings }) => {
        if (this.mileageService.isCommuteDeductionEnabled(orgSettings)) {
          return this.employeesService
            .getCommuteDetails(eou)
            .pipe(map((commuteDetailsResponse) => commuteDetailsResponse?.data?.[0]));
        } else {
          return of(null);
        }
      }),
    );

    this.fg.controls.commuteDeduction.valueChanges.subscribe((commuteDeductionType: string) => {
      if (this.commuteDetails?.id) {
        this.updateDistanceOnDeductionChange(commuteDeductionType);
      } else {
        if (!(commuteDeductionType === 'NO_DEDUCTION')) {
          this.openCommuteDetailsModal();
        }
      }
    });

    this.fg.controls.route.valueChanges.pipe(distinctUntilKeyChanged('roundTrip')).subscribe(() => {
      this.updateDistanceOnRoundTripChange();
    });

    this.isLoading = true;

    forkJoin({
      etxn: this.etxn$,
      paymentMode: selectedPaymentMode$,
      project: selectedProject$,
      subCategory: selectedSubCategory$,
      txnFields: this.txnFields$.pipe(take(1)),
      report: selectedReport$,
      costCenter: selectedCostCenter$,
      customExpenseFields: customExpenseFields$,
      allMileageRates: this.allMileageRates$,
      defaultPaymentMode: defaultPaymentMode$,
      employeeSettings: employeeSettings$,
      orgSettings: orgSettings$,
      recentValue: this.recentlyUsedValues$,
      recentProjects: this.recentlyUsedProjects$,
      recentCostCenters: this.recentlyUsedCostCenters$,
      commuteDeductionDetails: commuteDeductionDetails$,
    })
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe(
        ({
          etxn,
          paymentMode,
          project,
          subCategory,
          report,
          costCenter,
          customExpenseFields,
          allMileageRates,
          defaultPaymentMode,
          employeeSettings,
          orgSettings,
          recentValue,
          recentProjects,
          recentCostCenters,
          commuteDeductionDetails,
        }) => {
          if (project) {
            this.selectedProject$.next(project);
          }

          if (costCenter) {
            this.selectedCostCenter$.next(costCenter);
          }

          const customInputs = this.customFieldsService.standardizeCustomFields(
            [],
            this.customInputsService.filterByCategory(customExpenseFields, etxn.tx.category_id),
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

          this.showCommuteDeductionField = this.mileageService.isCommuteDeductionEnabled(orgSettings);

          if (this.showCommuteDeductionField) {
            this.distanceUnit = orgSettings.mileage?.unit === 'MILES' ? 'Miles' : 'km';

            this.commuteDetails = commuteDeductionDetails?.commute_details || null;

            this.commuteDeductionOptions = this.mileageService.getCommuteDeductionOptions(
              this.commuteDetails?.distance,
            );

            if (this.expenseId) {
              /**
               * If we are editing an expense, then
               * 1. Fetch the expense details
               * 2. Take the commute details from the expense, if present.
               * 3. Setup the commute deduction field options.
               * 4. Select the commute deduction field value, if present.
               */
              this.existingCommuteDeduction = etxn.tx?.commute_deduction;

              if (this.existingCommuteDeduction) {
                // If its edit case, we don't need to update the distance on route change
                this.previousCommuteDeductionType = this.existingCommuteDeduction;

                this.fg.patchValue(
                  {
                    commuteDeduction: this.existingCommuteDeduction,
                  },
                  { emitEvent: false },
                );
              }
            }
          }

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
            (!etxn.tx.id || (etxn.tx.id && etxn.tx.state === 'DRAFT' && !etxn.tx.project_id))
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
            (!etxn.tx.id || (etxn.tx.id && etxn.tx.state === 'DRAFT' && !etxn.tx.cost_center_id))
          ) {
            const autoFillCostCenter = recentCostCenters && recentCostCenters.length > 0 && recentCostCenters[0];

            if (autoFillCostCenter) {
              costCenter = autoFillCostCenter.value;
              this.presetCostCenterId = autoFillCostCenter.value.id;
              this.fg.patchValue({ costCenter });
            }
          }

          // Check if recent location exists
          const isRecentLocationPresent =
            orgSettings.org_expense_form_autofills?.allowed &&
            orgSettings.org_expense_form_autofills?.enabled &&
            employeeSettings.expense_form_autofills?.allowed &&
            employeeSettings.expense_form_autofills?.enabled &&
            recentValue &&
            recentValue.start_locations &&
            recentValue.start_locations.length > 0;
          if (isRecentLocationPresent) {
            this.presetLocation = recentValue.start_locations[0];
          }
          const mileage_rate_name = this.getMileageByVehicleType(allMileageRates, etxn.tx.mileage_vehicle_type);
          if (mileage_rate_name) {
            mileage_rate_name.readableRate = this.mileageRatesService.getReadableRate(
              etxn.tx.mileage_rate,
              etxn.tx.currency,
              etxn.tx.distance_unit,
            );
          }
          this.fg.patchValue({
            mileage_rate_name,
            dateOfSpend: etxn.tx.spent_at && dayjs(etxn.tx.spent_at).format('YYYY-MM-DD'),
            paymentMode: paymentMode || defaultPaymentMode,
            purpose: etxn.tx.purpose,
            route: {
              mileageLocations: etxn.tx.locations,
              distance: etxn.tx.distance,
              roundTrip: etxn.tx.mileage_is_round_trip,
            },
            billable: etxn.tx.billable,
            sub_category: subCategory,
            costCenter,
            report,
          });

          this.fg.patchValue({ project }, { emitEvent: false });

          this.initialFetch = false;

          if (this.existingCommuteDeduction) {
            this.previousRouteValue = this.getFormValues().route;
          }

          setTimeout(() => {
            this.fg.controls.custom_inputs.patchValue(customInputValues);
            this.formInitializedFlag = true;
          }, 1000);
        },
      );
  }

  async showClosePopup(): Promise<void> {
    const isAutofilled =
      this.presetProjectId || this.presetCostCenterId || this.presetVehicleType || this.presetLocation;
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

      const { data } = (await unsavedChangesPopOver.onWillDismiss()) as {
        data: {
          action: string;
        };
      };

      if (data && data.action === 'continue') {
        if (this.navigateBack) {
          this.navController.back();
        } else {
          this.close();
        }
      }
    } else {
      if (this.activatedRoute.snapshot.params.id) {
        this.trackingService.viewExpense({ Type: 'Mileage' });
      }

      if (this.navigateBack) {
        this.navController.back();
      } else {
        this.close();
      }
    }
  }

  close(): void {
    if (this.activatedRoute.snapshot.params.persist_filters || this.isRedirectedFromReport) {
      this.navController.back();
    } else {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    }
  }

  showAddToReportSuccessToast(reportId: string): void {
    const toastMessageData = {
      message: 'Mileage expense added to report successfully',
      redirectionText: 'View Report',
    };
    const expensesAddedToReportSnackBar = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
      panelClass: ['msb-success-with-camera-icon'],
    });
    this.trackingService.showToastMessage({ ToastContent: toastMessageData.message });

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId, navigateBack: true }]);
    });
  }

  showFormValidationErrors(): void {
    this.fg.markAllAsTouched();
    const formContainer = this.formContainer().nativeElement;
    if (formContainer) {
      const invalidElement = formContainer.querySelector('.ng-invalid');
      if (invalidElement) {
        invalidElement.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }
  }

  saveExpense(): void {
    if (this.fg.valid) {
      if (this.mode === 'add') {
        this.addExpense('SAVE_MILEAGE').subscribe(() => this.close());
      } else {
        // to do edit
        this.editExpense('SAVE_MILEAGE').subscribe(() => this.close());
      }
    } else {
      this.showFormValidationErrors();
    }
  }

  async reloadCurrentRoute(): Promise<void> {
    await this.router.navigateByUrl('/enterprise/my_expenses', { skipLocationChange: true });
    await this.router.navigate(['/', 'enterprise', 'add_edit_mileage']);
  }

  saveAndNewExpense(): void {
    if (this.fg.valid) {
      if (this.mode === 'add') {
        this.addExpense('SAVE_AND_NEW_MILEAGE').subscribe(() => {
          this.trackingService.clickSaveAddNew();
          this.reloadCurrentRoute();
        });
      } else {
        // to do edit
        this.editExpense('SAVE_AND_NEW_MILEAGE').subscribe(() => {
          this.close();
        });
      }
    } else {
      this.showFormValidationErrors();
    }
  }

  saveExpenseAndGotoPrev(): void {
    if (this.fg.valid) {
      if (this.mode === 'add') {
        this.addExpense('SAVE_AND_PREV_MILEAGE').subscribe(() => {
          if (+this.activeIndex === 0) {
            this.close();
          } else {
            this.goToPrev();
          }
        });
      } else {
        // to do edit
        this.editExpense('SAVE_AND_PREV_MILEAGE').subscribe(() => {
          if (+this.activeIndex === 0) {
            this.close();
          } else {
            this.goToPrev();
          }
        });
      }
    } else {
      this.showFormValidationErrors();
    }
  }

  saveExpenseAndGotoNext(): void {
    if (this.fg.valid) {
      if (this.mode === 'add') {
        this.addExpense('SAVE_AND_NEXT_MILEAGE').subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            this.close();
          } else {
            this.goToNext();
          }
        });
      } else {
        // to do edit
        this.editExpense('SAVE_AND_NEXT_MILEAGE').subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            this.close();
          } else {
            this.goToNext();
          }
        });
      }
    } else {
      this.showFormValidationErrors();
    }
  }

  getProjectDependentFields(): TxnCustomProperties[] {
    const projectDependentFieldsControl = this.fg.value as {
      project_dependent_fields: TxnCustomProperties[];
    };
    return projectDependentFieldsControl.project_dependent_fields;
  }

  getCostCenterDependentFields(): TxnCustomProperties[] {
    const CCDependentFieldsControl = this.fg.value as {
      cost_center_dependent_fields: TxnCustomProperties[];
    };
    return CCDependentFieldsControl.cost_center_dependent_fields;
  }

  getCustomFields(): Observable<TxnCustomProperties[]> {
    const dependentFieldsWithValue$ = this.dependentFields$.pipe(
      map((customFields) => {
        const allDependentFields = [
          ...this.getProjectDependentFields(),
          ...this.getCostCenterDependentFields(),
        ] as TxnCustomProperties[];
        const mappedDependentFields = allDependentFields.map((dependentField) => ({
          ...(dependentField.id && { id: dependentField.id }),
          name: dependentField.label,
          value: dependentField.value,
        }));
        return this.customFieldsService.standardizeCustomFields(mappedDependentFields || [], customFields);
      }),
    );

    return forkJoin({
      customInputs: this.customInputs$.pipe(take(1)),
      dependentFieldsWithValue: dependentFieldsWithValue$.pipe(take(1)),
    }).pipe(
      map(
        ({
          customInputs,
          dependentFieldsWithValue,
        }: {
          customInputs: TxnCustomProperties[];
          dependentFieldsWithValue: TxnCustomProperties[];
        }) => {
          const customInpustWithValue: TxnCustomProperties[] = customInputs.map((customInput, i: number) => ({
            id: customInput.id,
            mandatory: customInput.mandatory,
            name: customInput.name,
            options: customInput.options,
            placeholder: customInput.placeholder,
            prefix: customInput.prefix,
            type: customInput.type,
            value: this.getFormValues()?.custom_inputs[i]?.value,
          }));
          return [...customInpustWithValue, ...dependentFieldsWithValue];
        },
      ),
    );
  }

  checkPolicyViolation(
    etxn: { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] } | Partial<UnflattenedTransaction>,
  ): Observable<ExpensePolicy> {
    return from(this.mileageRates$).pipe(
      switchMap((rates) => {
        const transactionCopy = cloneDeep(etxn.tx) as PublicPolicyExpense;
        const selectedMileageRate = this.getMileageByVehicleType(rates, etxn.tx.mileage_vehicle_type);
        transactionCopy.mileage_rate_id = selectedMileageRate?.id;

        /* Expense creation has not moved to platform yet and since policy is moved to platform,
         * it expects the expense object in terms of platform world. Until then, the method
         * `transformTo` act as a bridge by translating the public expense object to platform
         * expense.
         */
        const policyExpense = this.policyService.transformTo(transactionCopy);
        return this.transactionService.checkPolicy(policyExpense);
      }),
    );
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

    const { data } = (await fyCriticalPolicyViolationPopOver.onWillDismiss()) as {
      data: string;
    };
    return !!data;
  }

  async continueWithPolicyViolations(
    policyViolations: string[],
    policyAction: FinalExpensePolicyState,
  ): Promise<{ comment: string }> {
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

    const { data } = (await currencyModal.onWillDismiss()) as {
      data: { comment: string };
    };
    return data;
  }

  generateEtxnFromFg(
    etxn$: Observable<Partial<UnflattenedTransaction>>,
    standardisedCustomProperties$: Observable<TxnCustomProperties[]>,
    calculatedDistance$: Observable<number | string>,
  ): Observable<Partial<UnflattenedTransaction>> {
    return forkJoin({
      etxn: etxn$.pipe(take(1)),
      customProperties: standardisedCustomProperties$.pipe(take(1)),
      calculatedDistance: calculatedDistance$.pipe(take(1)),
      amount: this.amount$.pipe(take(1)),
      homeCurrency: this.homeCurrency$.pipe(take(1)),
      mileageRates: this.mileageRates$,
      rate: this.rate$.pipe(take(1)),
      orgSettings: this.orgSettingsService.get(),
    }).pipe(
      map((res) => {
        const etxn: Partial<UnflattenedTransaction> = res.etxn;
        const formValue = this.getFormValues();
        let customProperties = res.customProperties;
        customProperties = customProperties?.map((customProperty) => {
          if (!customProperty.value) {
            this.customFieldsService.setDefaultValue(customProperty, customProperty.type);
          }
          if (customProperty.type === 'DATE') {
            customProperty.value =
              customProperty.value && this.dateService.getUTCDate(new Date(customProperty.value as string));
          }
          return customProperty;
        });
        const calculatedDistance = +res.calculatedDistance;

        const amount = parseFloat(res.amount.toFixed(2));
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

        const rate = res.rate;
        return {
          tx: {
            ...etxn.tx,
            mileage_rate_id: formValue.mileage_rate_name?.id,
            mileage_is_round_trip: formValue.route.roundTrip,
            mileage_rate: rate || etxn.tx.mileage_rate,
            source_account_id: sourceAccountId,
            skip_reimbursement: skipReimbursement,
            billable: formValue.billable,
            distance: +formValue.route.distance,
            category_id: (formValue.sub_category && formValue.sub_category.id) || etxn.tx.category_id,
            spent_at: this.dateService.getUTCDate(new Date(formValue.dateOfSpend)),
            source: 'MOBILE',
            currency: res.homeCurrency,
            locations: formValue.route?.mileageLocations,
            amount,
            orig_currency: null,
            orig_amount: null,
            mileage_calculated_distance: calculatedDistance,
            mileage_calculated_amount: parseFloat(
              (
                (rate ||
                  etxn.tx.mileage_rate ||
                  this.getRateByVehicleType(res.mileageRates, formValue.mileage_rate_name?.vehicle_type)) *
                calculatedDistance
              ).toFixed(2),
            ),
            project_id: formValue.project && formValue.project.project_id,
            purpose: formValue.purpose,
            custom_properties: customProperties || [],
            org_user_id: etxn.tx.org_user_id,
            category: null,
            cost_center_id: formValue.costCenter && formValue.costCenter.id,
            commute_deduction: this.showCommuteDeductionField ? formValue.commuteDeduction : null,
            commute_details_id:
              this.showCommuteDeductionField && formValue.commuteDeduction ? this.commuteDetails?.id : null,
          },
          dataUrls: [],
          ou: etxn.ou,
        };
      }),
    );
  }

  getTimeSpentOnPage(): number {
    const expenseEndTime = new Date().getTime();
    // Get time spent on page in seconds
    return (expenseEndTime - this.expenseStartTime) / 1000;
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
        map((policyViolationComments) => policyViolationComments.length > 0),
      )
      .subscribe((policyViolated) => {
        if (policyViolated && this.fg.dirty) {
          this.trackingService.policyCorrection({ Violation: 'Regular', Mode: 'Edit Expense' });
        }
      });
  }

  getIsPolicyExpense(tx: Partial<Transaction>): boolean {
    return isNumber(tx.policy_amount) && tx.policy_amount < 0.0001;
  }

  trackEditExpense(etxn: Partial<UnflattenedTransaction>): void {
    const location = etxn.tx.locations[0] as unknown as Destination;
    this.trackingService.editExpense({
      Type: 'Mileage',
      Amount: etxn.tx.amount,
      Currency: etxn.tx.currency,
      Category: etxn.tx.category?.name,
      Time_Spent: this.getTimeSpentOnPage() + ' secs',
      Used_Autofilled_Project:
        etxn.tx.project_id && this.presetProjectId && etxn.tx.project_id === this.presetProjectId,
      Used_Autofilled_CostCenter:
        etxn.tx.cost_center_id && this.presetCostCenterId && etxn.tx.cost_center_id === this.presetCostCenterId,
      Used_Autofilled_VehicleType:
        etxn.tx.mileage_vehicle_type &&
        this.presetVehicleType &&
        etxn.tx.mileage_vehicle_type === this.presetVehicleType,
      Used_Autofilled_StartLocation:
        etxn.tx.locations &&
        etxn.tx.locations.length > 0 &&
        this.presetLocation &&
        location &&
        location.display === this.presetLocation,
    });
  }

  getEditCalculatedDistance(mileageLocations: {
    value: { mileageLocations: Location[] };
  }): Observable<number | string> {
    return this.mileageService.getDistance(mileageLocations.value?.mileageLocations).pipe(
      switchMap((distance) =>
        this.etxn$.pipe(
          map((etxn) => {
            const distanceInKm = parseFloat((distance / 1000).toFixed(2));
            const finalDistance =
              etxn.tx.distance_unit === 'MILES' ? parseFloat((distanceInKm * 0.6213).toFixed(2)) : distanceInKm;
            return finalDistance;
          }),
        ),
      ),
      map((finalDistance) => {
        if (this.getFormValues()?.route?.roundTrip) {
          return parseFloat((finalDistance * 2).toFixed(2));
        } else {
          return parseFloat(finalDistance.toFixed(2));
        }
      }),
      shareReplay(1),
    );
  }

  editExpense(redirectedFrom): Observable<Partial<Transaction>> {
    this.saveMileageLoader = redirectedFrom === 'SAVE_MILEAGE';
    this.saveAndNewMileageLoader = redirectedFrom === 'SAVE_AND_NEW_MILEAGE';
    this.saveAndNextMileageLoader = redirectedFrom === 'SAVE_AND_NEXT_MILEAGE';
    this.saveAndPrevMileageLoader = redirectedFrom === 'SAVE_AND_PREV_MILEAGE';

    const customFields$ = this.getCustomFields();

    this.trackPolicyCorrections();

    const mileageLocations = this.getFormControl('route') as { value: { mileageLocations: Location[] } };
    const calculatedDistance$ = this.getEditCalculatedDistance(mileageLocations);

    return from(this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$)).pipe(
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
                }),
              );
            } else {
              return of({ etxn, comment: null });
            }
          }),
        ),
      ),
      catchError(
        (err: {
          status?: number;
          type?: string;
          policyViolations: string[];
          etxn: Partial<UnflattenedTransaction>;
          policyAction: FinalExpensePolicyState;
        }) => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$).pipe(
              map((etxn) => ({ etxn })),
            );
          }
          if (err.type === 'criticalPolicyViolations') {
            return this.criticalPolicyViolationHandler(err);
          } else if (err.type === 'policyViolations') {
            return this.policyViolationHandler(err);
          } else {
            return throwError(err);
          }
        },
      ),
      switchMap(({ etxn, comment }: { etxn: Partial<UnflattenedTransaction>; comment: string }) =>
        forkJoin({
          eou: from(this.authService.getEou()),
          txnCopy: this.etxn$,
        }).pipe(
          switchMap(({ txnCopy }) => {
            if (!isEqual(etxn.tx, txnCopy)) {
              // only if the form is edited
              this.trackEditExpense(etxn);
            } else {
              // tracking expense closed without editing
              this.trackingService.viewExpense({ Type: 'Mileage' });
            }

            // NOTE: This double call is done as certain fields will not be present in return of upsert call. policy_amount in this case.
            return this.transactionService.upsert(etxn.tx as Transaction).pipe(
              catchError((error: Error) => {
                this.trackingService.editMileageError({ label: error });
                return throwError(() => error);
              }),
              switchMap((txn) => this.expensesService.getExpenseById(txn.id)),
              map((expense) => this.transactionService.transformExpense(expense).tx),
              switchMap((tx) => {
                const formValue = this.getFormValues();
                const selectedReportId = formValue.report?.id;
                const criticalPolicyViolated = this.getIsPolicyExpense(tx);
                if (!criticalPolicyViolated) {
                  if (!txnCopy.tx.report_id && selectedReportId) {
                    return this.platformReportService.addExpenses(selectedReportId, [tx.id]).pipe(
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx),
                    );
                  }

                  if (txnCopy.tx.report_id && selectedReportId && txnCopy.tx.report_id !== selectedReportId) {
                    return this.platformReportService.ejectExpenses(txnCopy.tx.report_id, tx.id).pipe(
                      switchMap(() => this.platformReportService.addExpenses(selectedReportId, [tx.id])),
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx),
                    );
                  }

                  if (txnCopy.tx.report_id && !selectedReportId) {
                    return this.platformReportService.ejectExpenses(txnCopy.tx.report_id, tx.id).pipe(
                      tap(() => this.trackingService.removeFromExistingReportEditExpense()),
                      map(() => tx),
                    );
                  }
                }

                return of(null).pipe(map(() => tx));
              }),
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
                }),
              );
            } else {
              return of(txn);
            }
          }),
          switchMap((txn) => {
            if (txn.id && txn.advance_wallet_id !== etxn.tx.advance_wallet_id) {
              const expense = {
                id: txn.id,
                advance_wallet_id: etxn.tx.advance_wallet_id,
              };
              return this.expensesService.post(expense).pipe(map(() => txn));
            } else {
              return of(txn);
            }
          }),
        ),
      ),
      finalize(() => {
        this.saveMileageLoader = false;
        this.saveAndNewMileageLoader = false;
        this.saveAndNextMileageLoader = false;
        this.saveAndPrevMileageLoader = false;
      }),
    );
  }

  getCalculatedDistance(): Observable<number | string> {
    return this.isConnected$.pipe(
      take(1),
      switchMap((isConnected) => {
        if (isConnected) {
          const routeControl = this.getFormControl('route') as { value: { mileageLocations: Location[] } };
          return this.mileageService.getDistance(routeControl.value?.mileageLocations).pipe(
            switchMap((distance) => {
              if (distance) {
                return this.etxn$.pipe(
                  map((etxn) => {
                    const distanceInKm = parseFloat((distance / 1000).toFixed(2));
                    const finalDistance =
                      etxn.tx.distance_unit === 'MILES' ? parseFloat((distanceInKm * 0.6213).toFixed(2)) : distanceInKm;
                    return finalDistance;
                  }),
                );
              } else {
                return of(null);
              }
            }),
            map((finalDistance) => {
              if (finalDistance) {
                if (this.getFormValues().route.roundTrip) {
                  return (finalDistance * 2).toFixed(2);
                } else {
                  return finalDistance.toFixed(2);
                }
              } else {
                return null;
              }
            }),
          );
        } else {
          return of(null);
        }
      }),
      shareReplay(1),
    );
  }

  trackCreateExpense(etxn: Partial<UnflattenedTransaction>): void {
    const location = etxn.tx.locations[0] as unknown as Destination;
    this.trackingService.createExpense({
      Type: 'Mileage',
      Amount: etxn.tx.amount,
      Currency: etxn.tx.currency,
      Category: etxn.tx.category?.name,
      Time_Spent: this.getTimeSpentOnPage() + ' secs',
      Used_Autofilled_Project:
        etxn.tx.project_id && this.presetProjectId && etxn.tx.project_id === this.presetProjectId,
      Used_Autofilled_CostCenter:
        etxn.tx.cost_center_id && this.presetCostCenterId && etxn.tx.cost_center_id === this.presetCostCenterId,
      Used_Autofilled_VehicleType:
        etxn.tx.mileage_vehicle_type &&
        this.presetVehicleType &&
        etxn.tx.mileage_vehicle_type === this.presetVehicleType,
      Used_Autofilled_StartLocation:
        etxn.tx.locations &&
        etxn.tx.locations.length > 0 &&
        this.presetLocation &&
        location &&
        location.display === this.presetLocation,
    });
  }

  criticalPolicyViolationHandler(err: {
    policyViolations: string[];
    etxn: Partial<UnflattenedTransaction>;
    type?: string;
  }): Observable<{ etxn: Partial<UnflattenedTransaction> }> {
    return from(this.continueWithCriticalPolicyViolation(err.policyViolations)).pipe(
      switchMap((continueWithTransaction) => {
        if (continueWithTransaction) {
          return from(this.loaderService.showLoader()).pipe(switchMap(() => of({ etxn: err.etxn })));
        } else {
          return throwError('unhandledError');
        }
      }),
    );
  }

  policyViolationHandler(err: {
    policyViolations: string[];
    etxn: Partial<UnflattenedTransaction>;
    policyAction: FinalExpensePolicyState;
    type?: string;
  }): Observable<{ etxn: Partial<UnflattenedTransaction>; comment: string }> {
    return from(this.continueWithPolicyViolations(err.policyViolations, err.policyAction)).pipe(
      switchMap((continueWithTransaction: { comment: string }) => {
        if (continueWithTransaction) {
          if (continueWithTransaction.comment === '' || continueWithTransaction.comment === null) {
            continueWithTransaction.comment = 'No policy violation explanation provided';
          }
          return from(this.loaderService.showLoader()).pipe(
            switchMap(() => of({ etxn: err.etxn, comment: continueWithTransaction.comment })),
          );
        } else {
          return throwError('unhandledError');
        }
      }),
    );
  }

  addExpense(redirectedFrom): Observable<unknown | null> {
    this.saveMileageLoader = redirectedFrom === 'SAVE_MILEAGE';
    this.saveAndNewMileageLoader = redirectedFrom === 'SAVE_AND_NEW_MILEAGE';
    this.saveAndNextMileageLoader = redirectedFrom === 'SAVE_AND_NEXT_MILEAGE';
    this.saveAndPrevMileageLoader = redirectedFrom === 'SAVE_AND_PREV_MILEAGE';

    const customFields$ = this.getCustomFields();

    const calculatedDistance$ = this.getCalculatedDistance();

    return from(this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$)).pipe(
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
                }),
              );
            } else {
              return of({ etxn });
            }
          }),
        ),
      ),
      catchError(
        (err: {
          status?: number;
          type?: string;
          policyViolations: string[];
          etxn: Partial<UnflattenedTransaction>;
          policyAction: FinalExpensePolicyState;
        }) => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$).pipe(
              map((etxn) => ({ etxn })),
            );
          }
          if (err.type === 'criticalPolicyViolations') {
            return this.criticalPolicyViolationHandler(err);
          } else if (err.type === 'policyViolations') {
            return this.policyViolationHandler(err);
          } else {
            return throwError(err);
          }
        },
      ),
      switchMap(({ etxn, comment }: { etxn: Partial<UnflattenedTransaction>; comment: string }) =>
        from(this.authService.getEou()).pipe(
          switchMap(() => {
            const comments: string[] = [];

            this.trackCreateExpense(etxn);

            if (comment) {
              comments.push(comment);
            }

            const reportValue = this.getFormValues();

            if (
              reportValue?.report &&
              (etxn.tx.policy_amount === null || (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))
            ) {
              etxn.tx.report_id = reportValue.report?.id;
            }
            return of(
              this.transactionsOutboxService.addEntryAndSync(
                etxn.tx,
                etxn.dataUrls as { url: string; type: string }[],
                comments,
              ),
            ).pipe(
              switchMap((txnData: Promise<unknown>) => from(txnData)),
              map(() => etxn),
            );
          }),
        ),
      ),

      finalize(() => {
        this.saveMileageLoader = false;
        this.saveAndNewMileageLoader = false;
        this.saveAndNextMileageLoader = false;
        this.saveAndPrevMileageLoader = false;
      }),
    );
  }

  getDeleteReportParams(config: {
    header: string;
    body: string;
    ctaText: string;
    ctaLoadingText: string;
    reportId?: string;
    id?: string;
    removeMileageFromReport?: boolean;
  }): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
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
        header: config.header,
        body: config.body,
        ctaText: config.ctaText,
        ctaLoadingText: config.ctaLoadingText,
        deleteMethod: (): Observable<void> => {
          if (config.removeMileageFromReport) {
            return this.platformReportService.ejectExpenses(config.reportId, config.id);
          }
          return this.expensesService.deleteExpenses([config.id]);
        },
      },
    };
  }

  async deleteExpense(reportId?: string): Promise<void> {
    const id = this.activatedRoute.snapshot.params.id as string;
    const removeMileageFromReport = reportId && this.isRedirectedFromReport;

    const header = removeMileageFromReport ? 'Remove Mileage' : 'Delete Mileage';
    const body = removeMileageFromReport
      ? 'Are you sure you want to remove this mileage expense from this report?'
      : 'Are you sure you want to delete this mileage expense?';
    const ctaText = removeMileageFromReport ? 'Remove' : 'Delete';
    const ctaLoadingText = removeMileageFromReport ? 'Removing' : 'Deleting';

    const config = {
      header,
      body,
      ctaText,
      ctaLoadingText,
      reportId,
      removeMileageFromReport,
      id,
    };

    const deletePopover = await this.popoverController.create(this.getDeleteReportParams(config));

    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as {
      data: {
        status: string;
      };
    };

    if (data && data.status === 'success') {
      if (this.reviewList && this.reviewList.length && +this.activeIndex < this.reviewList.length - 1) {
        this.reviewList.splice(+this.activeIndex, 1);
        this.expensesService.getExpenseById(this.reviewList[+this.activeIndex]).subscribe((expense) => {
          const etxn = this.transactionService.transformExpense(expense);
          this.goToTransaction(etxn, this.reviewList, +this.activeIndex);
        });
      } else if (removeMileageFromReport) {
        this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId }]);
      } else {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    } else {
      this.trackingService.clickDeleteExpense({ Type: 'Mileage' });
    }
  }

  async onRouteVisualizerClick(): Promise<void> {
    if (this.routeSelector) {
      await this.routeSelector.openModal();
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

    const { data } = (await modal.onDidDismiss()) as {
      data: {
        updated: string;
      };
    };

    if (data && data.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  hideFields(): void {
    this.trackingService.hideMoreClicked({
      source: 'Add Mileage page',
    });

    this.isExpandedView = false;
  }

  showFields(): void {
    this.trackingService.showMoreClicked({
      source: 'Add Mileage page',
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

  getCommuteUpdatedTextBody(): string {
    return `<div>
              <p>Your Commute Details have been successfully added to your Profile
              Settings.</p>
              <p>You can now easily deduct commute from your Mileage expenses.<p>  
            </div>`;
  }

  async showCommuteUpdatedPopover(): Promise<void> {
    const sizeLimitExceededPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Commute Updated',
        message: this.getCommuteUpdatedTextBody(),
        primaryCta: {
          text: 'Proceed',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await sizeLimitExceededPopover.present();
  }

  async openCommuteDetailsModal(): Promise<Subscription> {
    this.trackingService.commuteDeductionAddLocationOptionClicked();

    const commuteDetailsModal = await this.modalController.create({
      component: FySelectCommuteDetailsComponent,
      mode: 'ios',
    });

    await commuteDetailsModal.present();

    const { data } = (await commuteDetailsModal.onWillDismiss()) as OverlayResponse<{
      action: string;
      commuteDetails: CommuteDetailsResponse;
    }>;

    if (data.action === 'save') {
      this.trackingService.commuteDeductionDetailsAddedFromMileageForm(data.commuteDetails);

      return from(this.authService.getEou())
        .pipe(
          concatMap((eou) =>
            this.employeesService.getCommuteDetails(eou).pipe(map((response) => response?.data?.[0] || null)),
          ),
        )
        .subscribe((commuteDetailsResponse) => {
          this.commuteDetails = commuteDetailsResponse?.commute_details || null;
          this.commuteDeductionOptions = this.mileageService.getCommuteDeductionOptions(this.commuteDetails?.distance);
          // If the user has saved the commute details, update the commute deduction field to no deduction
          this.fg.patchValue({ commuteDeduction: 'NO_DEDUCTION' });
          this.showCommuteUpdatedPopover();
        });
    } else {
      // If user closes the modal without saving the commute details, reset the commute deduction field to null
      this.fg.patchValue({ commuteDeduction: null }, { emitEvent: false });
    }
  }
}
