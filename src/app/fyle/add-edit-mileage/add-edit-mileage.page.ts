// TODO: Very hard to fix this file without making massive changes
/* eslint-disable complexity */
import { Component, ElementRef, EventEmitter, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoaderService } from 'src/app/core/services/loader.service';
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
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { cloneDeep, intersection, isEmpty, isEqual, isNumber } from 'lodash';
import * as dayjs from 'dayjs';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MileageService } from 'src/app/core/services/mileage.service';
import { MileageRatesService } from 'src/app/core/services/mileage-rates.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { StatusService } from 'src/app/core/services/status.service';
import { DataTransformService } from 'src/app/core/services/data-transform.service';
import { ModalController, NavController, PopoverController, Platform } from '@ionic/angular';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { NetworkService } from 'src/app/core/services/network.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { DateService } from 'src/app/core/services/date.service';
import { TrackingService } from '../../core/services/tracking.service';
import { TokenService } from 'src/app/core/services/token.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { RecentlyUsed } from 'src/app/core/models/v1/recently_used.model';
import { PlatformMileageRates } from 'src/app/core/models/platform/platform-mileage-rates.model';
import { LocationService } from 'src/app/core/services/location.service';
import { Position } from '@capacitor/geolocation';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { ExtendedProject } from 'src/app/core/models/v2/extended-project.model';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { RouteSelectorComponent } from 'src/app/shared/components/route-selector/route-selector.component';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { FyPolicyViolationComponent } from 'src/app/shared/components/fy-policy-violation/fy-policy-violation.component';
import { AccountOption } from 'src/app/core/models/account-option.model';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { ExpenseType } from 'src/app/core/enums/expense-type.enum';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ExpensePolicy } from 'src/app/core/models/platform/platform-expense-policy.model';
import { FinalExpensePolicyState } from 'src/app/core/models/platform/platform-final-expense-policy-state.model';
import { PublicPolicyExpense } from 'src/app/core/models/public-policy-expense.model';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { StorageService } from 'src/app/core/services/storage.service';
import { DependentFieldsComponent } from 'src/app/shared/components/dependent-fields/dependent-fields.component';

@Component({
  selector: 'app-add-edit-mileage',
  templateUrl: './add-edit-mileage.page.html',
  styleUrls: ['./add-edit-mileage.page.scss'],
})
export class AddEditMileagePage implements OnInit {
  @ViewChild('duplicateInputContainer') duplicateInputContainer: ElementRef;

  @ViewChild('formContainer') formContainer: ElementRef;

  @ViewChild('comments') commentsContainer: ElementRef;

  @ViewChild(RouteSelectorComponent) routeSelector: RouteSelectorComponent;

  @ViewChild('projectDependentFieldsRef') projectDependentFieldsRef: DependentFieldsComponent;

  @ViewChild('costCenterDependentFieldsRef') costCenterDependentFieldsRef: DependentFieldsComponent;

  mode = 'add';

  title = 'edit';

  activeIndex: number;

  minDate: string;

  maxDate: string;

  reviewList: [];

  fg: FormGroup;

  txnFields$: Observable<any>;

  paymentModes$: Observable<AccountOption[]>;

  homeCurrency$: Observable<any>;

  subCategories$: Observable<any>;

  filteredCategories$: Observable<any>;

  etxn$: Observable<any>;

  isIndividualProjectsEnabled$: Observable<boolean>;

  individualProjectIds$: Observable<string[]>;

  isProjectsEnabled$: Observable<boolean>;

  isCostCentersEnabled$: Observable<boolean>;

  customInputs$: Observable<any>;

  costCenters$: Observable<any>;

  reports$: Observable<any>;

  isAmountCapped$: Observable<boolean>;

  isAmountDisabled$: Observable<boolean>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;

  amount$: Observable<number>;

  mileageConfig$: Observable<any>;

  individualMileageRatesEnabled$: Observable<boolean>;

  allMileageRates$: Observable<PlatformMileageRates[]>;

  mileageRates$: Observable<PlatformMileageRates[]>;

  mileageRatesOptions$: Observable<any>;

  rate$: Observable<number>;

  projectCategoryIds$: Observable<string[]>;

  isConnected$: Observable<boolean>;

  connectionStatus$: Observable<{ connected: boolean }>;

  isAdvancesEnabled$: Observable<boolean>;

  comments$: Observable<any>;

  expenseStartTime;

  policyDetails;

  navigateBack = false;

  saveMileageLoader = false;

  saveAndNewMileageLoader = false;

  saveAndNextMileageLoader = false;

  saveAndPrevMileageLoader = false;

  clusterDomain: string;

  recentlyUsedValues$: Observable<RecentlyUsed>;

  recentlyUsedMileageLocations$: Observable<{
    recent_start_locations?: string[];
    recent_end_locations?: string[];
    recent_locations?: string[];
  }>;

  recentProjects: { label: string; value: ExtendedProject; selected?: boolean }[];

  presetProjectId: number;

  recentlyUsedProjects$: Observable<ExtendedProject[]>;

  recentCostCenters: { label: string; value: CostCenter; selected?: boolean }[];

  presetCostCenterId: number;

  recentlyUsedCostCenters$: Observable<{ label: string; value: CostCenter; selected?: boolean }[]>;

  presetVehicleType: string;

  presetLocation: string;

  initialFetch;

  isProjectVisible$: Observable<boolean>;

  formInitializedFlag = false;

  invalidPaymentMode = false;

  billableDefaultValue: boolean;

  isRedirectedFromReport = false;

  canRemoveFromReport = false;

  autoSubmissionReportName$: Observable<string>;

  hardwareBackButtonAction: Subscription;

  isNewReportsFlowEnabled = false;

  onPageExit$: Subject<void>;

  dependentFields$: Observable<ExpenseField[]>;

  selectedProject$: BehaviorSubject<ExtendedProject>;

  selectedCostCenter$: BehaviorSubject<CostCenter>;

  loadDynamicMap = false;

  private _isExpandedView = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private accountsService: AccountsService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private reportService: ReportService,
    private fb: FormBuilder,
    private projectService: ProjectsService,
    private mileageService: MileageService,
    private mileageRatesService: MileageRatesService,
    private transactionsOutboxService: TransactionsOutboxService,
    private policyService: PolicyService,
    private statusService: StatusService,
    private dataTransformService: DataTransformService,
    private modalController: ModalController,
    private networkService: NetworkService,
    private popupService: PopupService,
    private navController: NavController,
    private dateService: DateService,
    private trackingService: TrackingService,
    private tokenService: TokenService,
    private recentlyUsedItemsService: RecentlyUsedItemsService,
    private locationService: LocationService,
    private expenseFieldsService: ExpenseFieldsService,
    private popoverController: PopoverController,
    private modalProperties: ModalPropertiesService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private launchDarklyService: LaunchDarklyService,
    private paymentModesService: PaymentModesService,
    private currencyService: CurrencyService,
    private mileageRateService: MileageRatesService,
    private orgUserSettingsService: OrgUserSettingsService,
    private categoriesService: CategoriesService,
    private orgSettingsService: OrgSettingsService,
    private platform: Platform,
    private storageService: StorageService
  ) {}

  get showSaveAndNext() {
    return this.activeIndex !== null && this.reviewList !== null && +this.activeIndex === this.reviewList.length - 1;
  }

  get route() {
    return this.fg.controls.route;
  }

  get isExpandedView() {
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
  scrollInputIntoView() {
    const el = document.activeElement;
    if (el && el instanceof HTMLInputElement) {
      el.scrollIntoView({
        block: 'center',
      });
    }
  }

  ngOnInit() {
    this.isRedirectedFromReport = this.activatedRoute.snapshot.params.remove_from_report ? true : false;
    this.canRemoveFromReport = this.activatedRoute.snapshot.params.remove_from_report === 'true';

    this.launchDarklyService.getVariation('load_dynamic_map', false).subscribe((loadDynamicMap) => {
      this.loadDynamicMap = loadDynamicMap;
    });
  }

  goToPrev() {
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;

    if (this.reviewList[+this.activeIndex - 1]) {
      this.transactionService.getETxnUnflattened(this.reviewList[+this.activeIndex - 1]).subscribe((etxn) => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex - 1);
      });
    }
  }

  goToNext() {
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;

    if (this.reviewList[+this.activeIndex + 1]) {
      this.transactionService.getETxnUnflattened(this.reviewList[+this.activeIndex + 1]).subscribe((etxn) => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex + 1);
      });
    }
  }

  goToTransaction(expense, reviewList, activeIndex) {
    let category;

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

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
    this.connectionStatus$ = this.isConnected$.pipe(map((isConnected) => ({ connected: isConnected })));
  }

  getCalculateDistance() {
    return this.mileageService.getDistance(this.fg.controls.route.value?.mileageLocations).pipe(
      switchMap((distance) =>
        this.etxn$.pipe(
          map((etxn) => {
            const distanceInKm = distance / 1000;
            const finalDistance = etxn.tx.distance_unit === 'MILES' ? distanceInKm * 0.6213 : distanceInKm;
            return finalDistance;
          })
        )
      ),
      map((finalDistance) => {
        if (this.fg.value.route.roundTrip) {
          return (finalDistance * 2).toFixed(2);
        } else {
          return finalDistance.toFixed(2);
        }
      }),
      shareReplay(1)
    );
  }

  setupFilteredCategories(activeCategories$: Observable<any>) {
    this.filteredCategories$ = this.fg.controls.project.valueChanges.pipe(
      tap(() => {
        if (!this.fg.controls.project.value) {
          this.fg.patchValue({ billable: false });
        } else {
          this.fg.patchValue({ billable: this.billableDefaultValue });
        }
      }),
      startWith(this.fg.controls.project.value),
      concatMap((project) =>
        activeCategories$.pipe(
          map((activeCategories) => this.projectService.getAllowedOrgCategoryIds(project, activeCategories))
        )
      ),
      map((categories) => categories.map((category) => ({ label: category.sub_category, value: category })))
    );

    this.filteredCategories$.subscribe((categories) => {
      if (
        this.fg.value.sub_category &&
        this.fg.value.sub_category.id &&
        !categories.some(
          (category) => this.fg.value.sub_category && this.fg.value.sub_category.id === category.value.id
        )
      ) {
        this.fg.controls.sub_category.reset();
      }
    });
  }

  getProjectCategoryIds(): Observable<string[]> {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const mileageCategories = categories
          .filter((category) => ['Mileage'].indexOf(category.fyle_category) > -1)
          .map((category) => category?.id?.toString());

        return mileageCategories;
      })
    );
  }

  getMileageCategories() {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const orgCategoryName = 'mileage';

        const defaultMileageCategory = categories.find(
          (category) => category.name.toLowerCase() === orgCategoryName.toLowerCase()
        );

        const mileageCategories = categories.filter((category) => ['Mileage'].indexOf(category.fyle_category) > -1);

        return {
          defaultMileageCategory,
          mileageCategories,
        };
      })
    );
  }

  getTransactionFields() {
    return this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) =>
        forkJoin({
          expenseFieldsMap: this.expenseFieldsService.getAllMap(),
          mileageCategoriesContainer: this.getMileageCategories(),
        }).pipe(
          switchMap(({ expenseFieldsMap, mileageCategoriesContainer }) => {
            // skipped distance unit, location 1 and location 2 - confirm that these are not used at all
            const fields = ['purpose', 'txn_dt', 'cost_center_id', 'project_id', 'distance', 'billable'];

            return this.expenseFieldsService.filterByOrgCategoryId(
              expenseFieldsMap,
              fields,
              formValue.sub_category || mileageCategoriesContainer.defaultMileageCategory
            );
          })
        )
      ),
      map((expenseFieldsMap: any) => {
        if (expenseFieldsMap) {
          for (const tfc of Object.keys(expenseFieldsMap)) {
            if (expenseFieldsMap[tfc].options && expenseFieldsMap[tfc].options.length > 0) {
              expenseFieldsMap[tfc].options = expenseFieldsMap[tfc].options.map((value) => ({ label: value, value }));
            }
          }
        }

        return expenseFieldsMap;
      }),
      shareReplay(1)
    );
  }

  setupTfcDefaultValues() {
    const tfcValues$ = this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) =>
        forkJoin({
          expenseFieldsMap: this.expenseFieldsService.getAllMap(),
          mileageCategoriesContainer: this.getMileageCategories(),
        }).pipe(
          switchMap(({ expenseFieldsMap, mileageCategoriesContainer }) => {
            // skipped distance unit, location 1 and location 2 - confirm that these are not used at all
            const fields = ['purpose', 'txn_dt', 'cost_center_id', 'distance', 'billable'];

            return this.expenseFieldsService.filterByOrgCategoryId(
              expenseFieldsMap,
              fields,
              formValue.sub_category || mileageCategoriesContainer.defaultMileageCategory
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
            control.patchValue(defaultValues[defaultValueColumn]);
          }
        }
      }
    });
  }

  getPaymentModes(): Observable<AccountOption[]> {
    return forkJoin({
      accounts: this.accountsService.getEMyAccounts(),
      orgSettings: this.orgSettingsService.get(),
      etxn: this.etxn$,
      allowedPaymentModes: this.orgUserSettingsService.getAllowedPaymentModes(),
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

  getSubCategories() {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const parentCategoryName = 'mileage';
        return categories.filter(
          (orgCategory) =>
            parentCategoryName.toLowerCase() === orgCategory.name?.toLowerCase() &&
            parentCategoryName.toLowerCase() !== orgCategory.sub_category?.toLowerCase()
        );
      }),
      shareReplay(1)
    );
  }

  getCustomInputs() {
    this.initialFetch = true;

    const customExpenseFields$ = this.customInputsService.getAll(true).pipe(shareReplay(1));

    this.dependentFields$ = customExpenseFields$.pipe(
      map((customFields) => customFields.filter((customField) => customField.type === 'DEPENDENT_SELECT'))
    );

    return this.fg.controls.sub_category.valueChanges.pipe(
      startWith({}),
      switchMap((category) => {
        if (category && !isEmpty(category)) {
          return of(category);
        } else {
          return this.getMileageCategories().pipe(map((mileageContainer) => mileageContainer.defaultMileageCategory));
        }
      }),
      switchMap((category) => {
        const formValue = this.fg.value;
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
            customField.options = customField.options.map((option) => ({ label: option, value: option }));
          }
          return customField;
        })
      ),
      switchMap((customFields: any[]) =>
        this.isConnected$.pipe(
          take(1),
          map((isConnected) => {
            const customFieldsFormArray = this.fg.controls.custom_inputs as FormArray;
            customFieldsFormArray.clear();
            for (const customField of customFields) {
              customFieldsFormArray.push(
                this.fb.group({
                  name: [customField.name],
                  value: [
                    customField.type !== 'DATE' ? customField.value : dayjs(customField.value).format('YYYY-MM-DD'),
                    isConnected &&
                      customField.type !== 'BOOLEAN' &&
                      customField.type !== 'USER_LIST' &&
                      customField.mandatory &&
                      Validators.required,
                  ],
                })
              );
            }
            customFieldsFormArray.updateValueAndValidity();
            return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
          })
        )
      ),
      shareReplay(1)
    );
  }

  getRateByVehicleType(mileageRates, vehicle_type) {
    const filteredMileageRate = mileageRates.find((mileageRate) => mileageRate.vehicle_type === vehicle_type);

    return filteredMileageRate?.rate;
  }

  getMileageByVehicleType(mileageRates, vehicle_type) {
    const filteredMileageRate = mileageRates.find((mileageRate) => mileageRate.vehicle_type === vehicle_type);

    return filteredMileageRate;
  }

  getNewExpense() {
    const defaultVehicle$ = forkJoin({
      vehicleType: this.transactionService.getDefaultVehicleType(),
      orgUserMileageSettings: this.mileageService.getOrgUserMileageSettings(),
      orgSettings: this.orgSettingsService.get(),
      orgUserSettings: this.orgUserSettingsService.get(),
      recentValue: this.recentlyUsedValues$,
      mileageRates: this.mileageRates$,
      mileageConfig: this.mileageConfig$,
    }).pipe(
      map(
        ({
          vehicleType,
          orgUserMileageSettings,
          orgSettings,
          orgUserSettings,
          recentValue,
          mileageRates,
          mileageConfig,
        }) => {
          const isRecentVehicleTypePresent =
            orgSettings.org_expense_form_autofills &&
            orgSettings.org_expense_form_autofills.allowed &&
            orgSettings.org_expense_form_autofills.enabled &&
            orgUserSettings.expense_form_autofills.allowed &&
            orgUserSettings.expense_form_autofills.enabled &&
            recentValue &&
            recentValue.recent_vehicle_types &&
            recentValue.recent_vehicle_types.length > 0;
          if (isRecentVehicleTypePresent) {
            vehicleType = recentValue.recent_vehicle_types[0];
            this.presetVehicleType = recentValue.recent_vehicle_types[0];
          }

          // if any employee assigned mileage rate is present
          // -> the recently used mileage rate should be part of the allowed mileage rates.
          if (
            orgUserMileageSettings?.mileage_rate_labels?.length > 0 &&
            !orgUserMileageSettings.mileage_rate_labels.some((label) => vehicleType === label)
          ) {
            vehicleType = orgUserMileageSettings.mileage_rate_labels[0];
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

          return vehicleType as string;
        }
      )
    );

    const defaultMileage$ = forkJoin({
      defaultVehicle: defaultVehicle$,
      mileageRates: this.mileageRates$,
    }).pipe(map(({ defaultVehicle, mileageRates }) => this.getMileageByVehicleType(mileageRates, defaultVehicle)));

    type locationInfo = { recentStartLocation: string; eou: ExtendedOrgUser; currentLocation: Position };

    const autofillLocation$ = forkJoin({
      eou: this.authService.getEou(),
      currentLocation: this.locationService.getCurrentLocation(),
      orgUserSettings: this.orgUserSettingsService.get(),
      orgSettings: this.orgSettingsService.get(),
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      map(({ eou, currentLocation, orgUserSettings, orgSettings, recentValue }) => {
        const isRecentLocationPresent =
          orgSettings.org_expense_form_autofills &&
          orgSettings.org_expense_form_autofills.allowed &&
          orgSettings.org_expense_form_autofills.enabled &&
          orgUserSettings.expense_form_autofills.allowed &&
          orgUserSettings.expense_form_autofills.enabled &&
          recentValue &&
          recentValue.recent_start_locations &&
          recentValue.recent_start_locations.length > 0;
        if (isRecentLocationPresent) {
          const autocompleteLocationInfo = {
            recentStartLocation: recentValue.recent_start_locations[0],
            eou,
            currentLocation,
          };
          return autocompleteLocationInfo;
        } else {
          return of(null);
        }
      }),
      concatMap((info: locationInfo) => {
        if (info && info.recentStartLocation && info.eou && info.currentLocation) {
          return this.locationService.getAutocompletePredictions(
            info.recentStartLocation,
            info.eou.us.id,
            `${info.currentLocation.coords.latitude},${info.currentLocation.coords.longitude}`
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
              })
            );
        } else {
          return of(null);
        }
      })
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
              txn_dt: new Date(),
              org_category_id: mileageContainer.defaultMileageCategory && mileageContainer.defaultMileageCategory.id,
              org_category: mileageContainer.defaultMileageCategory && mileageContainer.defaultMileageCategory.name,
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
              fyle_category: 'Mileage',
              org_user_id: currentEou.ou.id,
              locations,
              custom_properties: [],
            },
          };
        }
      ),
      shareReplay(1)
    );
  }

  getEditExpense() {
    return this.transactionService.getETxnUnflattened(this.activatedRoute.snapshot.params.id).pipe(shareReplay(1));
  }

  customDateValidator(control: AbstractControl) {
    const today = new Date();
    const minDate = dayjs(new Date('Jan 1, 2001'));
    const maxDate = dayjs(new Date(today)).add(1, 'day');
    const passedInDate = control.value && dayjs(new Date(control.value));
    if (passedInDate) {
      return passedInDate.isBefore(maxDate) && passedInDate.isAfter(minDate)
        ? null
        : {
            invalidDateSelection: true,
          };
    }
  }

  customDistanceValidator(control: AbstractControl) {
    const passedInDistance = control.value && +control.value;
    if (passedInDistance !== null) {
      return passedInDistance > 0
        ? null
        : {
            invalidDistance: true,
          };
    }
  }

  ionViewWillEnter() {
    this.isNewReportsFlowEnabled = false;
    this.onPageExit$ = new Subject();
    this.projectDependentFieldsRef?.ngOnInit();
    this.costCenterDependentFieldsRef?.ngOnInit();
    this.selectedProject$ = new BehaviorSubject(null);
    this.selectedCostCenter$ = new BehaviorSubject(null);

    this.hardwareBackButtonAction = this.platform.backButton.subscribeWithPriority(
      BackButtonActionPriority.MEDIUM,
      () => {
        this.showClosePopup();
      }
    );

    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });

    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back;
    this.expenseStartTime = new Date().getTime();
    this.fg = this.fb.group({
      mileage_rate_name: [],
      dateOfSpend: [, this.customDateValidator],
      route: [],
      paymentMode: [, Validators.required],
      purpose: [],
      project: [],
      billable: [],
      sub_category: [, Validators.required],
      custom_inputs: new FormArray([]),
      costCenter: [],
      report: [],
      duplicate_detection_reason: [],
      project_dependent_fields: this.fb.array([]),
      cost_center_dependent_fields: this.fb.array([]),
    });

    const today = new Date();
    this.maxDate = dayjs(this.dateService.addDaysToDate(today, 1)).format('YYYY-MM-D');
    this.autoSubmissionReportName$ = this.reportService.getAutoSubmissionReportName();

    this.fg.controls.project.valueChanges
      .pipe(takeUntil(this.onPageExit$))
      .subscribe((project) => this.selectedProject$.next(project));

    this.fg.controls.costCenter.valueChanges
      .pipe(takeUntil(this.onPageExit$))
      .subscribe((costCenter) => this.selectedCostCenter$.next(costCenter));

    this.fg.reset();
    this.title = 'Add Mileage';

    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;
    this.reviewList =
      this.activatedRoute.snapshot.params.txnIds && JSON.parse(this.activatedRoute.snapshot.params.txnIds);

    this.title =
      this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    if (this.activatedRoute.snapshot.params.id) {
      this.mode = 'edit';
    }

    // If User has already clicked on See More he need not to click again and again
    from(this.storageService.get('isExpandedViewMileage')).subscribe((expandedView) => {
      this.isExpandedView = this.mode !== 'add' || expandedView;
    });

    const orgSettings$ = this.orgSettingsService.get();
    const orgUserSettings$ = this.orgUserSettingsService.get();

    this.mileageConfig$ = orgSettings$.pipe(map((orgSettings) => orgSettings.mileage));
    this.isAdvancesEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          (orgSettings.advances && orgSettings.advances.enabled) ||
          (orgSettings.advance_requests && orgSettings.advance_requests.enabled)
      )
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

    this.recentlyUsedMileageLocations$ = this.recentlyUsedValues$.pipe(
      map((recentlyUsedValues) => ({
        recent_start_locations: recentlyUsedValues?.recent_start_locations || [],
        recent_end_locations: recentlyUsedValues?.recent_end_locations || [],
        recent_locations: recentlyUsedValues?.recent_locations || [],
      }))
    );

    this.txnFields$ = this.getTransactionFields();
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    this.subCategories$ = this.getSubCategories();
    this.setupFilteredCategories(this.subCategories$);
    this.projectCategoryIds$ = this.getProjectCategoryIds();
    this.isProjectVisible$ = this.projectCategoryIds$.pipe(
      switchMap((projectCategoryIds) => this.projectService.getProjectCount({ categoryIds: projectCategoryIds })),
      map((projectCount) => projectCount > 0)
    );
    this.comments$ = this.statusService.find('transactions', this.activatedRoute.snapshot.params.id);

    this.filteredCategories$.subscribe((subCategories) => {
      if (subCategories.length) {
        this.fg.controls.sub_category.setValidators(Validators.required);
      } else {
        this.fg.controls.sub_category.clearValidators();
      }
      this.fg.controls.sub_category.updateValueAndValidity();
    });

    this.individualMileageRatesEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.mileage?.enable_individual_mileage_rates)
    );

    this.allMileageRates$ = this.mileageRateService.getAllMileageRates();

    this.mileageRates$ = forkJoin({
      orgUserMileageSettings: this.mileageService.getOrgUserMileageSettings(),
      allMileageRates: this.mileageRateService.getAllMileageRates(),
      mileageConfig: this.mileageConfig$,
    }).pipe(
      map(({ orgUserMileageSettings, allMileageRates, mileageConfig }) => {
        let enabledMileageRates = this.mileageRatesService.filterEnabledMileageRates(allMileageRates);
        const mileageRateSettings = orgUserMileageSettings?.mileage_rate_labels || [];
        if (mileageRateSettings.length > 0) {
          enabledMileageRates = enabledMileageRates.filter((rate) => mileageRateSettings.includes(rate.vehicle_type));
        }
        return enabledMileageRates;
      })
    );

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
        })
      )
    );

    this.etxn$ = iif(() => this.mode === 'add', this.getNewExpense(), this.getEditExpense());

    this.setupTfcDefaultValues();

    this.isAmountDisabled$ = this.etxn$.pipe(map((etxn) => !!etxn.tx.admin_amount));

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects)
    );

    this.individualProjectIds$ = orgUserSettings$.pipe(
      map((orgUserSettings: any) => orgUserSettings.project_ids || [])
    );

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.enabled)
    );

    this.customInputs$ = this.getCustomInputs();

    this.isCostCentersEnabled$ = orgSettings$.pipe(map((orgSettings) => orgSettings.cost_centers.enabled));

    this.paymentModes$ = this.getPaymentModes();

    this.costCenters$ = forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$,
    }).pipe(
      switchMap(({ orgSettings, orgUserSettings }) => {
        if (orgSettings.cost_centers.enabled) {
          return this.orgUserSettingsService.getAllowedCostCenters(orgUserSettings);
        } else {
          return of([]);
        }
      }),
      map((costCenters) =>
        costCenters.map((costCenter) => ({
          label: costCenter.name,
          value: costCenter,
        }))
      )
    );

    this.recentlyUsedCostCenters$ = forkJoin({
      costCenters: this.costCenters$,
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      concatMap(({ costCenters, recentValue }) =>
        this.recentlyUsedItemsService.getRecentCostCenters(costCenters, recentValue)
      )
    );

    this.reports$ = this.reportService
      .getFilteredPendingReports({ state: 'edit' })
      .pipe(map((reports) => reports.map((report) => ({ label: report.rp.purpose, value: report }))));

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
            }))
          )
        )
      )
      .subscribe(
        ({ isConnected, txnFields, costCenters, orgSettings, individualProjectIds, isIndividualProjectsEnabled }) => {
          const keyToControlMap: { [id: string]: AbstractControl } = {
            purpose: this.fg.controls.purpose,
            cost_center_id: this.fg.controls.costCenter,
            txn_dt: this.fg.controls.dateOfSpend,
            project_id: this.fg.controls.project,
            billable: this.fg.controls.billable,
          };

          for (const [key, control] of Object.entries(keyToControlMap)) {
            control.clearValidators();
            if (key === 'project_id') {
              control.updateValueAndValidity({
                emitEvent: false,
              });
            } else {
              control.updateValueAndValidity();
            }
          }

          for (const txnFieldKey of intersection(Object.keys(keyToControlMap), Object.keys(txnFields))) {
            const control = keyToControlMap[txnFieldKey];
            if (txnFields[txnFieldKey].is_mandatory) {
              if (txnFieldKey === 'txn_dt') {
                control.setValidators(
                  isConnected ? Validators.compose([Validators.required, this.customDateValidator]) : null
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
            }
            if (txnFieldKey === 'project_id') {
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
        }
      );

    this.isAmountCapped$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.admin_amount) || isNumber(etxn.tx.policy_amount))
    );

    this.isAmountDisabled$ = this.etxn$.pipe(map((etxn) => !!etxn.tx.admin_amount));

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.policy_amount) && etxn.tx.policy_amount < 0.0001)
    );

    this.getPolicyDetails();

    this.isBalanceAvailableInAnyAdvanceAccount$ = this.fg.controls.paymentMode.valueChanges.pipe(
      switchMap((paymentMode) => {
        if (paymentMode?.acc?.type === AccountType.PERSONAL) {
          return this.accountsService
            .getEMyAccounts()
            .pipe(
              map(
                (accounts) =>
                  accounts.filter(
                    (account) =>
                      account?.acc?.type === AccountType.ADVANCE && account?.acc?.tentative_balance_amount > 0
                  ).length > 0
              )
            );
        }
        return of(false);
      })
    );

    this.rate$ = iif(
      () => this.mode === 'edit',
      this.fg.valueChanges.pipe(
        map((formValue) => formValue.mileage_rate_name),
        switchMap((formValue) =>
          forkJoin({
            etxn: this.etxn$,
            mileageRates: this.mileageRates$,
          }).pipe(
            map(({ etxn, mileageRates }) => {
              if (formValue) {
                if (etxn.tx.mileage_rate && etxn.tx.mileage_vehicle_type === formValue?.vehicle_type) {
                  return etxn.tx.mileage_rate;
                } else {
                  return this.getRateByVehicleType(mileageRates, formValue?.vehicle_type);
                }
              }
            })
          )
        ),
        shareReplay(1)
      ),
      this.fg.valueChanges.pipe(
        map((formValue) => formValue.mileage_rate_name),
        switchMap((formValue) =>
          this.mileageRates$.pipe(
            map((mileageRates) => this.getRateByVehicleType(mileageRates, formValue && formValue.vehicle_type))
          )
        ),
        shareReplay(1)
      )
    );

    this.amount$ = combineLatest(this.fg.valueChanges, this.rate$).pipe(
      map(([formValue, mileageRate]) => {
        const distance = formValue.route?.distance || 0;
        return distance * mileageRate;
      }),
      shareReplay(1)
    );

    const selectedProject$ = this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.project_id) {
          return of(etxn.tx.project_id);
        } else {
          return forkJoin({
            orgSettings: this.orgSettingsService.get(),
            orgUserSettings: this.orgUserSettingsService.get(),
          }).pipe(
            map(({ orgSettings, orgUserSettings }) => {
              if (orgSettings.projects.enabled) {
                return orgUserSettings && orgUserSettings.preferences && orgUserSettings.preferences.default_project_id;
              }
            })
          );
        }
      }),
      switchMap((projectId) => {
        if (projectId) {
          return this.projectService.getbyId(projectId);
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
      mileageCategoryIds: this.projectCategoryIds$,
      eou: this.authService.getEou(),
    }).pipe(
      switchMap(({ recentValues, mileageCategoryIds, eou }) =>
        this.recentlyUsedItemsService.getRecentlyUsedProjects({
          recentValues,
          eou,
          categoryIds: mileageCategoryIds,
        })
      )
    );

    const selectedSubCategory$ = this.etxn$.pipe(
      switchMap((etxn) =>
        iif(
          () => etxn.tx.org_category_id,
          this.categoriesService
            .getAll()
            .pipe(
              map((subCategories) =>
                subCategories
                  .filter((subCategory) => subCategory.sub_category?.toLowerCase() !== subCategory?.name.toLowerCase())
                  .find((subCategory) => subCategory?.id === etxn.tx.org_category_id)
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
          return reportOptions.map((res) => res.value).find((reportOption) => reportOption.rp.id === etxn.tx.report_id);
        } else if (
          !autoSubmissionReportName &&
          reportOptions.length === 1 &&
          reportOptions[0].value.rp.state === 'DRAFT'
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

    from(this.loaderService.showLoader('Please wait...', 10000))
      .pipe(
        switchMap(() =>
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
            orgUserSettings: orgUserSettings$,
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
          txnFields,
          report,
          costCenter,
          customExpenseFields,
          allMileageRates,
          defaultPaymentMode,
          orgUserSettings,
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
                  value: (cpor && cpor.value && dayjs(new Date(cpor.value)).format('YYYY-MM-DD')) || null,
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
            orgSettings.org_expense_form_autofills &&
            orgSettings.org_expense_form_autofills.allowed &&
            orgSettings.org_expense_form_autofills.enabled &&
            orgUserSettings.expense_form_autofills.allowed &&
            orgUserSettings.expense_form_autofills.enabled;

          // Check if recent projects exist
          const doRecentProjectIdsExist =
            isAutofillsEnabled &&
            recentValue &&
            recentValue.recent_project_ids &&
            recentValue.recent_project_ids.length > 0;

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
            isAutofillsEnabled &&
            recentValue &&
            recentValue.recent_cost_center_ids &&
            recentValue.recent_cost_center_ids.length > 0;

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
            orgSettings.org_expense_form_autofills &&
            orgSettings.org_expense_form_autofills.allowed &&
            orgSettings.org_expense_form_autofills.enabled &&
            orgUserSettings.expense_form_autofills.allowed &&
            orgUserSettings.expense_form_autofills.enabled &&
            recentValue &&
            recentValue.recent_start_locations &&
            recentValue.recent_start_locations.length > 0;
          if (isRecentLocationPresent) {
            this.presetLocation = recentValue.recent_start_locations[0];
          }
          const mileage_rate_name = this.getMileageByVehicleType(allMileageRates, etxn.tx.mileage_vehicle_type);
          if (mileage_rate_name) {
            mileage_rate_name.readableRate = this.mileageRatesService.getReadableRate(
              etxn.tx.mileage_rate,
              etxn.tx.currency,
              etxn.tx.distance_unit
            );
          }
          this.fg.patchValue({
            mileage_rate_name,
            dateOfSpend: etxn.tx.txn_dt && dayjs(etxn.tx.txn_dt).format('YYYY-MM-DD'),
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
            duplicate_detection_reason: etxn.tx.user_reason_for_duplicate_expenses,
            report,
          });

          this.fg.patchValue({ project }, { emitEvent: false });

          this.initialFetch = false;

          setTimeout(() => {
            this.fg.controls.custom_inputs.patchValue(customInputValues);
            this.formInitializedFlag = true;
          }, 1000);
        }
      );
  }

  async showClosePopup() {
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

      const { data } = await unsavedChangesPopOver.onWillDismiss();

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

  close() {
    if (this.activatedRoute.snapshot.params.persist_filters || this.isRedirectedFromReport) {
      this.navController.back();
    } else {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    }
  }

  checkIfInvalidPaymentMode() {
    return forkJoin({
      amount: this.amount$.pipe(take(1)),
      etxn: this.etxn$,
    }).pipe(
      map(({ etxn, amount }) => {
        const paymentAccount = this.fg.value.paymentMode;
        const originalSourceAccountId = etxn && etxn.tx && etxn.tx.source_account_id;
        let isPaymentModeInvalid = false;
        if (paymentAccount?.acc?.type === AccountType.ADVANCE) {
          if (paymentAccount.acc.id !== originalSourceAccountId) {
            isPaymentModeInvalid = paymentAccount.acc.tentative_balance_amount < amount;
          } else {
            isPaymentModeInvalid = paymentAccount.acc.tentative_balance_amount + etxn.tx.amount < amount;
          }
        }
        if (isPaymentModeInvalid) {
          this.paymentModesService.showInvalidPaymentModeToast();
        }
        return isPaymentModeInvalid;
      })
    );
  }

  showAddToReportSuccessToast(reportId: string) {
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

  saveExpense() {
    const that = this;

    that
      .checkIfInvalidPaymentMode()
      .pipe(take(1))
      .subscribe((invalidPaymentMode) => {
        if (that.fg.valid && !invalidPaymentMode) {
          if (that.mode === 'add') {
            that.addExpense('SAVE_MILEAGE').subscribe(() => this.close());
          } else {
            // to do edit
            that.editExpense('SAVE_MILEAGE').subscribe(() => this.close());
          }
        } else {
          that.fg.markAllAsTouched();
          const formContainer = that.formContainer.nativeElement as HTMLElement;
          if (formContainer) {
            const invalidElement = formContainer.querySelector('.ng-invalid');
            if (invalidElement) {
              invalidElement.scrollIntoView({
                behavior: 'smooth',
              });
            }
          }
          if (invalidPaymentMode) {
            that.invalidPaymentMode = true;
            setTimeout(() => {
              that.invalidPaymentMode = false;
            }, 3000);
          }
        }
      });
  }

  async reloadCurrentRoute() {
    await this.router.navigateByUrl('/enterprise/my_expenses', { skipLocationChange: true });
    await this.router.navigate(['/', 'enterprise', 'add_edit_mileage']);
  }

  saveAndNewExpense() {
    const that = this;

    that
      .checkIfInvalidPaymentMode()
      .pipe(take(1))
      .subscribe((invalidPaymentMode) => {
        if (that.fg.valid && !invalidPaymentMode) {
          if (that.mode === 'add') {
            that.addExpense('SAVE_AND_NEW_MILEAGE').subscribe(() => {
              this.trackingService.clickSaveAddNew();
              this.reloadCurrentRoute();
            });
          } else {
            // to do edit
            that.editExpense('SAVE_AND_NEW_MILEAGE').subscribe(() => {
              that.close();
            });
          }
        } else {
          that.fg.markAllAsTouched();
          const formContainer = that.formContainer.nativeElement as HTMLElement;
          if (formContainer) {
            const invalidElement = formContainer.querySelector('.ng-invalid');
            if (invalidElement) {
              invalidElement.scrollIntoView({
                behavior: 'smooth',
              });
            }
          }
          if (invalidPaymentMode) {
            that.invalidPaymentMode = true;
            setTimeout(() => {
              that.invalidPaymentMode = false;
            }, 3000);
          }
        }
      });
  }

  saveExpenseAndGotoPrev() {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense('SAVE_AND_PREV_MILEAGE').subscribe(() => {
          if (+this.activeIndex === 0) {
            that.close();
          } else {
            that.goToPrev();
          }
        });
      } else {
        // to do edit
        that.editExpense('SAVE_AND_PREV_MILEAGE').subscribe(() => {
          if (+this.activeIndex === 0) {
            that.close();
          } else {
            that.goToPrev();
          }
        });
      }
    } else {
      that.fg.markAllAsTouched();
      const formContainer = that.formContainer.nativeElement as HTMLElement;
      if (formContainer) {
        const invalidElement = formContainer.querySelector('.ng-invalid');
        if (invalidElement) {
          invalidElement.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }
    }
  }

  saveExpenseAndGotoNext() {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense('SAVE_AND_NEXT_MILEAGE').subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.close();
          } else {
            that.goToNext();
          }
        });
      } else {
        // to do edit
        that.editExpense('SAVE_AND_NEXT_MILEAGE').subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.close();
          } else {
            that.goToNext();
          }
        });
      }
    } else {
      that.fg.markAllAsTouched();
      const formContainer = that.formContainer.nativeElement as HTMLElement;
      if (formContainer) {
        const invalidElement = formContainer.querySelector('.ng-invalid');
        if (invalidElement) {
          invalidElement.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }
    }
  }

  getCustomFields() {
    const dependentFieldsWithValue$ = this.dependentFields$.pipe(
      map((customFields) => {
        const allDependentFields = [
          ...this.fg.value.project_dependent_fields,
          ...this.fg.value.cost_center_dependent_fields,
        ];

        const mappedDependentFields = allDependentFields.map((dependentField) => ({
          name: dependentField.label,
          value: dependentField.value,
        }));
        return this.customFieldsService.standardizeCustomFields(mappedDependentFields || [], customFields);
      })
    );

    return forkJoin({
      customInputs: this.customInputs$.pipe(take(1)),
      dependentFieldsWithValue: dependentFieldsWithValue$.pipe(take(1)),
    }).pipe(
      map(({ customInputs, dependentFieldsWithValue }) => {
        const customInputsWithValue = customInputs.map((customInput, i) => ({
          id: customInput.id,
          mandatory: customInput.mandatory,
          name: customInput.name,
          options: customInput.options,
          placeholder: customInput.placeholder,
          prefix: customInput.prefix,
          type: customInput.type,
          value: this.fg.value.custom_inputs[i].value,
        }));
        return customInputsWithValue.concat(dependentFieldsWithValue);
      })
    );
  }

  checkPolicyViolation(etxn: { tx: PublicPolicyExpense; dataUrls: any[] }): Observable<ExpensePolicy> {
    return from(this.mileageRates$).pipe(
      switchMap((rates) => {
        const transactionCopy = cloneDeep(etxn.tx);
        const selectedMileageRate = this.getMileageByVehicleType(rates, etxn.tx.mileage_vehicle_type);
        transactionCopy.mileage_rate_id = selectedMileageRate.id;

        /* Expense creation has not moved to platform yet and since policy is moved to platform,
         * it expects the expense object in terms of platform world. Until then, the method
         * `transformTo` act as a bridge by translating the public expense object to platform
         * expense.
         */
        const policyExpense = this.policyService.transformTo(transactionCopy);
        return this.transactionService.checkPolicy(policyExpense);
      })
    );
  }

  async continueWithCriticalPolicyViolation(criticalPolicyViolations: string[]) {
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

    const { data } = await fyCriticalPolicyViolationPopOver.onWillDismiss();
    return !!data;
  }

  async continueWithPolicyViolations(policyViolations: string[], policyAction: FinalExpensePolicyState) {
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

    const { data } = await currencyModal.onWillDismiss();
    return data;
  }

  generateEtxnFromFg(etxn$, standardisedCustomProperties$, calculatedDistance$) {
    return forkJoin({
      etxn: etxn$.pipe(take(1)),
      customProperties: standardisedCustomProperties$.pipe(take(1)),
      calculatedDistance: calculatedDistance$.pipe(take(1)),
      amount: this.amount$.pipe(take(1)),
      homeCurrency: this.homeCurrency$.pipe(take(1)),
      mileageRates: this.mileageRates$,
      rate: this.rate$.pipe(take(1)),
    }).pipe(
      map((res) => {
        const etxn: any = res.etxn;
        let customProperties: any = res.customProperties;
        customProperties = customProperties.map((customProperty) => {
          if (customProperty.type === 'DATE') {
            customProperty.value = customProperty.value && this.dateService.getUTCDate(new Date(customProperty.value));
          }
          return customProperty;
        });
        const calculatedDistance = +res.calculatedDistance;
        const amount = res.amount;
        const skipReimbursement =
          this.fg.value.paymentMode.acc.type === AccountType.PERSONAL && !this.fg.value.paymentMode.acc.isReimbursable;
        const rate = res.rate;
        const formValue = this.fg.value;
        return {
          tx: {
            ...etxn.tx,
            mileage_vehicle_type: formValue.mileage_rate_name?.vehicle_type,
            mileage_is_round_trip: formValue.route.roundTrip,
            mileage_rate: rate || etxn.tx.mileage_rate,
            source_account_id: formValue.paymentMode.acc.id,
            billable: formValue.billable,
            distance: +formValue.route.distance,
            org_category_id: (formValue.sub_category && formValue.sub_category.id) || etxn.tx.org_category_id,
            txn_dt: this.dateService.getUTCDate(new Date(formValue.dateOfSpend)),
            skip_reimbursement: skipReimbursement,
            source: 'MOBILE',
            currency: res.homeCurrency,
            locations: formValue.route?.mileageLocations,
            amount,
            orig_currency: null,
            orig_amount: null,
            mileage_calculated_distance: calculatedDistance,
            mileage_calculated_amount:
              (rate ||
                etxn.tx.mileage_rate ||
                this.getRateByVehicleType(res.mileageRates, formValue.mileage_rate_name?.vehicle_type)) *
              calculatedDistance,
            project_id: formValue.project && formValue.project.project_id,
            purpose: formValue.purpose,
            custom_properties: customProperties || [],
            org_user_id: etxn.tx.org_user_id,
            category: null,
            cost_center_id: formValue.costCenter && formValue.costCenter.id,
            cost_center_name: formValue.costCenter && formValue.costCenter.name,
            cost_center_code: formValue.costCenter && formValue.costCenter.code,
            user_reason_for_duplicate_expenses: formValue.duplicate_detection_reason,
          },
          dataUrls: [],
          ou: etxn.ou,
        };
      })
    );
  }

  getTimeSpentOnPage() {
    const expenseEndTime = new Date().getTime();
    // Get time spent on page in seconds
    return (expenseEndTime - this.expenseStartTime) / 1000;
  }

  trackPolicyCorrections() {
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

  editExpense(redirectedFrom) {
    this.saveMileageLoader = redirectedFrom === 'SAVE_MILEAGE';
    this.saveAndNewMileageLoader = redirectedFrom === 'SAVE_AND_NEW_MILEAGE';
    this.saveAndNextMileageLoader = redirectedFrom === 'SAVE_AND_NEXT_MILEAGE';
    this.saveAndPrevMileageLoader = redirectedFrom === 'SAVE_AND_PREV_MILEAGE';

    const customFields$ = this.getCustomFields();

    this.trackPolicyCorrections();

    const calculatedDistance$ = this.mileageService.getDistance(this.fg.controls.route.value?.mileageLocations).pipe(
      switchMap((distance) =>
        this.etxn$.pipe(
          map((etxn) => {
            const distanceInKm = distance / 1000;
            const finalDistance = etxn.tx.distance_unit === 'MILES' ? distanceInKm * 0.6213 : distanceInKm;
            return finalDistance;
          })
        )
      ),
      map((finalDistance) => {
        if (this.fg.value.route.roundTrip) {
          return (finalDistance * 2).toFixed(2);
        } else {
          return finalDistance.toFixed(2);
        }
      }),
      shareReplay(1)
    );

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
                })
              );
            } else {
              return of({ etxn, comment: null });
            }
          })
        )
      ),
      catchError((err) => {
        if (err.status === 500) {
          return this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$).pipe(
            map((etxn) => ({ etxn }))
          );
        }
        if (err.type === 'criticalPolicyViolations') {
          return from(this.continueWithCriticalPolicyViolation(err.policyViolations)).pipe(
            switchMap((continueWithTransaction) => {
              if (continueWithTransaction) {
                return from(this.loaderService.showLoader()).pipe(switchMap(() => of({ etxn: err.etxn })));
              } else {
                return throwError('unhandledError');
              }
            })
          );
        } else if (err.type === 'policyViolations') {
          return from(this.continueWithPolicyViolations(err.policyViolations, err.policyAction)).pipe(
            switchMap((continueWithTransaction) => {
              if (continueWithTransaction) {
                return from(this.loaderService.showLoader()).pipe(
                  switchMap(() => of({ etxn: err.etxn, comment: continueWithTransaction.comment }))
                );
              } else {
                return throwError('unhandledError');
              }
            })
          );
        } else {
          return throwError(err);
        }
      }),
      switchMap(({ etxn, comment }: any) =>
        forkJoin({
          eou: from(this.authService.getEou()),
          txnCopy: this.etxn$,
        }).pipe(
          switchMap(({ eou, txnCopy }) => {
            if (!isEqual(etxn.tx, txnCopy)) {
              // only if the form is edited
              this.trackingService.editExpense({
                Type: 'Mileage',
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
                Used_Autofilled_VehicleType:
                  etxn.tx.mileage_vehicle_type &&
                  this.presetVehicleType &&
                  etxn.tx.mileage_vehicle_type === this.presetVehicleType,
                Used_Autofilled_StartLocation:
                  etxn.tx.locations &&
                  etxn.tx.locations.length > 0 &&
                  this.presetLocation &&
                  etxn.tx.locations[0] &&
                  etxn.tx.locations[0].display === this.presetLocation,
              });
            } else {
              // tracking expense closed without editing
              this.trackingService.viewExpense({ Type: 'Mileage' });
            }

            // NOTE: This double call is done as certain fields will not be present in return of upsert call. policy_amount in this case.
            return this.transactionService.upsert(etxn.tx).pipe(
              switchMap((txn) => this.transactionService.getETxnUnflattened(txn.id)),
              map((savedEtxn) => savedEtxn && savedEtxn.tx),
              switchMap((tx) => {
                const selectedReportId = this.fg.value.report && this.fg.value.report.rp && this.fg.value.report.rp.id;
                const criticalPolicyViolated = isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001;
                if (!criticalPolicyViolated) {
                  if (!txnCopy.tx.report_id && selectedReportId) {
                    return this.reportService.addTransactions(selectedReportId, [tx.id]).pipe(
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx)
                    );
                  }

                  if (txnCopy.tx.report_id && selectedReportId && txnCopy.tx.report_id !== selectedReportId) {
                    return this.reportService.removeTransaction(txnCopy.tx.report_id, tx.id).pipe(
                      switchMap(() => this.reportService.addTransactions(selectedReportId, [tx.id])),
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx)
                    );
                  }

                  if (txnCopy.tx.report_id && !selectedReportId) {
                    return this.reportService.removeTransaction(txnCopy.tx.report_id, tx.id).pipe(
                      tap(() => this.trackingService.removeFromExistingReportEditExpense()),
                      map(() => tx)
                    );
                  }
                }

                return of(null).pipe(map(() => tx));
              }),
              switchMap((tx) => {
                const criticalPolicyViolated = isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001;
                if (!criticalPolicyViolated && etxn.tx.user_review_needed) {
                  return this.transactionService.review(tx.id).pipe(map(() => tx));
                }

                return of(null).pipe(map(() => tx));
              })
            );
          }),
          switchMap((txn) => {
            if (comment) {
              return this.statusService.findLatestComment(txn.id, 'transactions', txn.org_user_id).pipe(
                switchMap((result) => {
                  if (result !== comment) {
                    return this.statusService.post('transactions', txn.id, { comment }, true).pipe(map(() => txn));
                  } else {
                    return of(txn);
                  }
                })
              );
            } else {
              return of(txn);
            }
          })
        )
      ),
      finalize(() => {
        this.saveMileageLoader = false;
        this.saveAndNewMileageLoader = false;
        this.saveAndNextMileageLoader = false;
        this.saveAndPrevMileageLoader = false;
      })
    );
  }

  addExpense(redirectedFrom) {
    this.saveMileageLoader = redirectedFrom === 'SAVE_MILEAGE';
    this.saveAndNewMileageLoader = redirectedFrom === 'SAVE_AND_NEW_MILEAGE';
    this.saveAndNextMileageLoader = redirectedFrom === 'SAVE_AND_NEXT_MILEAGE';
    this.saveAndPrevMileageLoader = redirectedFrom === 'SAVE_AND_PREV_MILEAGE';

    const customFields$ = this.getCustomFields();

    const calculatedDistance$ = this.isConnected$.pipe(
      take(1),
      switchMap((isConnected) => {
        if (isConnected) {
          return this.mileageService.getDistance(this.fg.controls.route.value?.mileageLocations).pipe(
            switchMap((distance) => {
              if (distance) {
                return this.etxn$.pipe(
                  map((etxn) => {
                    const distanceInKm = distance / 1000;
                    const finalDistance = etxn.tx.distance_unit === 'MILES' ? distanceInKm * 0.6213 : distanceInKm;
                    return finalDistance;
                  })
                );
              } else {
                return of(null);
              }
            }),
            map((finalDistance) => {
              if (finalDistance) {
                if (this.fg.value.route.roundTrip) {
                  return (finalDistance * 2).toFixed(2);
                } else {
                  return finalDistance.toFixed(2);
                }
              } else {
                return null;
              }
            })
          );
        } else {
          return of(null);
        }
      }),
      shareReplay(1)
    );

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
                })
              );
            } else {
              return of({ etxn });
            }
          })
        )
      ),
      catchError((err) => {
        if (err.status === 500) {
          return this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$).pipe(
            map((etxn) => ({ etxn }))
          );
        }
        if (err.type === 'criticalPolicyViolations') {
          return from(this.continueWithCriticalPolicyViolation(err.policyViolations)).pipe(
            switchMap((continueWithTransaction) => {
              if (continueWithTransaction) {
                return from(this.loaderService.showLoader()).pipe(switchMap(() => of({ etxn: err.etxn })));
              } else {
                return throwError('unhandledError');
              }
            })
          );
        } else if (err.type === 'policyViolations') {
          return from(this.continueWithPolicyViolations(err.policyViolations, err.policyAction)).pipe(
            switchMap((continueWithTransaction) => {
              if (continueWithTransaction) {
                return from(this.loaderService.showLoader()).pipe(
                  switchMap(() => of({ etxn: err.etxn, comment: continueWithTransaction.comment }))
                );
              } else {
                return throwError('unhandledError');
              }
            })
          );
        } else {
          return throwError(err);
        }
      }),
      switchMap(({ etxn, comment }: any) =>
        from(this.authService.getEou()).pipe(
          switchMap((eou) => {
            const comments = [];
            this.trackingService.createExpense({
              Type: 'Mileage',
              Amount: etxn.tx.amount,
              Currency: etxn.tx.currency,
              Category: etxn.tx.org_category,
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
                etxn.tx.locations[0] &&
                etxn.tx.locations[0].display === this.presetLocation,
            });

            if (comment) {
              comments.push(comment);
            }

            let reportId;
            if (
              this.fg.value.report &&
              (etxn.tx.policy_amount === null || (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))
            ) {
              reportId = this.fg.value.report.rp.id;
            }
            return of(this.transactionsOutboxService.addEntryAndSync(etxn.tx, etxn.dataUrls, comments, reportId)).pipe(
              switchMap((txnData: Promise<any>) => from(txnData)),
              map(() => etxn)
            );
          })
        )
      ),

      finalize(() => {
        this.saveMileageLoader = false;
        this.saveAndNewMileageLoader = false;
        this.saveAndNextMileageLoader = false;
        this.saveAndPrevMileageLoader = false;
      })
    );
  }

  async deleteExpense(reportId?: string) {
    const id = this.activatedRoute.snapshot.params.id;
    const removeMileageFromReport = reportId && this.isRedirectedFromReport;

    const header = removeMileageFromReport ? 'Remove Mileage' : 'Delete Mileage';
    const body = removeMileageFromReport
      ? 'Are you sure you want to remove this mileage expense from this report?'
      : 'Are you sure you want to delete this mileage expense?';
    const ctaText = removeMileageFromReport ? 'Remove' : 'Delete';
    const ctaLoadingText = removeMileageFromReport ? 'Removing' : 'Deleting';

    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header,
        body,
        ctaText,
        ctaLoadingText,
        deleteMethod: () => {
          if (removeMileageFromReport) {
            return this.reportService.removeTransaction(reportId, id);
          }
          return this.transactionService.delete(id);
        },
      },
    });

    await deletePopover.present();
    const { data } = await deletePopover.onDidDismiss();

    if (data && data.status === 'success') {
      if (this.reviewList && this.reviewList.length && +this.activeIndex < this.reviewList.length - 1) {
        this.reviewList.splice(+this.activeIndex, 1);
        this.transactionService.getETxnUnflattened(this.reviewList[+this.activeIndex]).subscribe((etxn) => {
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

  scrollCommentsIntoView() {
    if (this.commentsContainer) {
      const commentsContainer = this.commentsContainer.nativeElement as HTMLElement;
      if (commentsContainer) {
        commentsContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }
  }

  async onRouteVisualizerClick() {
    if (this.routeSelector) {
      await this.routeSelector.openModal();
    }
  }

  async openCommentsModal() {
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

    const { data } = await modal.onDidDismiss();

    if (data && data.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  hideFields() {
    this.trackingService.hideMoreClicked({
      source: 'Add Mileage page',
    });

    this.isExpandedView = false;
  }

  showFields() {
    this.trackingService.showMoreClicked({
      source: 'Add Mileage page',
    });

    this.isExpandedView = true;
  }

  getPolicyDetails() {
    const expenseId = this.activatedRoute.snapshot.params.id;
    if (expenseId) {
      from(this.policyService.getSpenderExpensePolicyViolations(expenseId))
        .pipe()
        .subscribe((policyDetails) => {
          this.policyDetails = policyDetails;
        });
    }
  }

  ionViewWillLeave() {
    this.hardwareBackButtonAction.unsubscribe();
    this.projectDependentFieldsRef?.ngOnDestroy();
    this.costCenterDependentFieldsRef?.ngOnDestroy();
    this.onPageExit$.next(null);
    this.onPageExit$.complete();
  }
}
