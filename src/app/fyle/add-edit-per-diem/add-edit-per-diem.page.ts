import {Component, ElementRef, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, concat, forkJoin, from, iif, noop, Observable, of, throwError} from 'rxjs';
import {OfflineService} from 'src/app/core/services/offline.service';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {AccountsService} from 'src/app/core/services/accounts.service';
import {DateService} from 'src/app/core/services/date.service';
import * as moment from 'moment';
import {CustomInputsService} from 'src/app/core/services/custom-inputs.service';
import {CustomFieldsService} from 'src/app/core/services/custom-fields.service';
import {cloneDeep, isEmpty, isEqual, isNumber} from 'lodash';
import {CurrencyService} from 'src/app/core/services/currency.service';
import {ReportService} from 'src/app/core/services/report.service';
import {ProjectsService} from 'src/app/core/services/projects.service';
import {TransactionService} from 'src/app/core/services/transaction.service';
import {LoaderService} from 'src/app/core/services/loader.service';
import {AuthService} from 'src/app/core/services/auth.service';
import {PolicyService} from 'src/app/core/services/policy.service';
import {DataTransformService} from 'src/app/core/services/data-transform.service';
import {CriticalPolicyViolationComponent} from './critical-policy-violation/critical-policy-violation.component';
import {ModalController, NavController} from '@ionic/angular';
import {TransactionsOutboxService} from 'src/app/core/services/transactions-outbox.service';
import {PolicyViolationComponent} from './policy-violation/policy-violation.component';
import {StatusService} from 'src/app/core/services/status.service';
import {NetworkService} from 'src/app/core/services/network.service';
import {PopupService} from 'src/app/core/services/popup.service';
import {DuplicateDetectionService} from 'src/app/core/services/duplicate-detection.service';
import {TrackingService} from '../../core/services/tracking.service';
import {CurrencyPipe} from '@angular/common';
import {TokenService} from 'src/app/core/services/token.service';
import {RecentlyUsedItemsService} from 'src/app/core/services/recently-used-items.service';
import {RecentlyUsed} from 'src/app/core/models/v1/recently_used.model';
import {ExtendedProject} from 'src/app/core/models/v2/extended-project.model';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-add-edit-per-diem',
  templateUrl: './add-edit-per-diem.page.html',
  styleUrls: ['./add-edit-per-diem.page.scss'],
})
export class AddEditPerDiemPage implements OnInit {
  title: string;
  activeIndex: number;
  reviewList: string[];
  mode = 'add';
  canCreatePerDiem$: Observable<boolean>;
  allowedPerDiemRateOptions$: Observable<any[]>;
  paymentModes$: Observable<any[]>;
  homeCurrency$: Observable<string>;
  fg: FormGroup;
  minDate: string;
  maxDate: string;
  txnFields$: Observable<any>;
  subCategories$: Observable<any[]>;
  isAmountDisabled = false;
  etxn$: Observable<any>;
  transactionMandatoyFields$: Observable<any>;
  isIndividualProjectsEnabled$: Observable<boolean>;
  individualProjectIds$: Observable<[]>;
  isProjectsEnabled$: Observable<boolean>;
  customInputs$: Observable<any>;
  costCenters$: Observable<any>;
  reports$: Observable<any[]>;
  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;
  paymentModeInvalid$: Observable<boolean>;
  isAmountCapped$: Observable<boolean>;
  isAmountDisabled$: Observable<boolean>;
  isCriticalPolicyViolated$: Observable<boolean>;
  projectCategoryIds$: Observable<string[]>;
  filteredCategories$: Observable<any>;
  isConnected$: Observable<boolean>;
  invalidPaymentMode = false;
  duplicates$: Observable<any>;
  duplicateBoxOpen = false;
  pointToDuplicates = false;
  isAdvancesEnabled$: Observable<boolean>;
  comments$: Observable<any>;
  expenseStartTime;
  navigateBack = false;
  savePerDiemLoader = false;
  saveAndNextPerDiemLoader = false;
  clusterDomain: string;
  initialFetch;
  individualPerDiemRatesEnabled$: Observable<boolean>;
  recentlyUsedValues$: Observable<RecentlyUsed>;
  recentProjects: { label: string, value: ExtendedProject, selected?: boolean }[];
  recentlyUsedProjects$: Observable<ExtendedProject[]>;
  presetProjectId: number;
  recentCostCenters: { label: string, value: CostCenter, selected?: boolean }[];
  presetCostCenterId: number;
  recentlyUsedCostCenters$: Observable<{ label: string, value: CostCenter, selected?: boolean }[]>;
  isProjectVisible$: Observable<boolean>;

  @ViewChild('duplicateInputContainer') duplicateInputContainer: ElementRef;
  @ViewChild('formContainer') formContainer: ElementRef;
  @ViewChild('comments') commentsContainer: ElementRef;

  duplicateDetectionReasons = [
    {label: 'Different expense', value: 'Different expense'},
    {label: 'Other', value: 'Other'}
  ];


  constructor(
    private activatedRoute: ActivatedRoute,
    private offlineService: OfflineService,
    private fb: FormBuilder,
    private dateService: DateService,
    private accountsService: AccountsService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private currencyService: CurrencyService,
    private reportService: ReportService,
    private projectService: ProjectsService,
    private transactionsOutboxService: TransactionsOutboxService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private policyService: PolicyService,
    private dataTransformService: DataTransformService,
    private loaderService: LoaderService,
    private router: Router,
    private modalController: ModalController,
    private statusService: StatusService,
    private networkService: NetworkService,
    private popupService: PopupService,
    private duplicateDetectionService: DuplicateDetectionService,
    private navController: NavController,
    private trackingService: TrackingService,
    private currencyPipe: CurrencyPipe,
    private tokenService: TokenService,
    private recentlyUsedItemsService: RecentlyUsedItemsService,
    private expenseFieldsService: ExpenseFieldsService,
    private modalProperties: ModalPropertiesService
  ) {
  }

  ngOnInit() {
  }

  get minPerDiemDate() {
    return this.fg.controls.from_dt.value && moment(this.fg.controls.from_dt.value).subtract(1, 'day').format('y-MM-D');
  }

  get showSaveAndNext() {
    return this.activeIndex !== null &&
      this.reviewList !== null &&
      +this.activeIndex === (this.reviewList.length - 1);
  }

  async closePopup() {
    if (this.fg.touched) {
      const popupResults = await this.popupService.showPopup({
        header: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure, you want to abandon this expense?',
        primaryCta: {
          text: 'Discard Changes'
        }
      });

      if (popupResults === 'primary') {
        this.goBack();
      }
    } else {
      if (this.activatedRoute.snapshot.params.id) {
        this.trackingService.viewExpense({Asset: 'Mobile', Type: 'Per Diem'});
      }
      if (this.navigateBack) {
        this.navController.back();
      } else {
        this.goBack();
      }
    }
  }

  goBack() {
    if (this.activatedRoute.snapshot.params.persist_filters) {
      this.navController.back();
    } else {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    }
  }

  canGetDuplicates() {
    return this.offlineService.getOrgSettings().pipe(
      map(orgSettings => {
        const isAmountPresent = isNumber(this.fg.controls.currencyObj.value && this.fg.controls.currencyObj.value.amount);
        return this.fg.valid && orgSettings.policies.duplicate_detection_enabled && isAmountPresent;
      })
    );
  }

  checkForDuplicates() {
    const customFields$ = this.customInputs$.pipe(
      take(1),
      map(customInputs => {
        return customInputs.map((customInput, i) => {
          return {
            id: customInput.id,
            mandatory: customInput.mandatory,
            name: customInput.name,
            options: customInput.options,
            placeholder: customInput.placeholder,
            prefix: customInput.prefix,
            type: customInput.type,
            value: this.fg.value.custom_inputs[i].value
          };
        });
      })
    );

    return this.canGetDuplicates().pipe(
      switchMap((canGetDuplicates) => {
        return iif(
          () => canGetDuplicates,
          this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
            switchMap(etxn => this.duplicateDetectionService.getPossibleDuplicates(etxn.tx))
          ),
          of(null)
        );
      })
    );
  }

  getPossibleDuplicates() {
    return this.checkForDuplicates();
  }

  setupDuplicateDetection() {
    this.duplicates$ = this.fg.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged((a, b) => isEqual(a, b)),
      switchMap(() => {
        return this.getPossibleDuplicates();
      })
    );

    this.duplicates$.pipe(
      filter(duplicates => duplicates && duplicates.length),
      take(1)
    ).subscribe((res) => {
      this.pointToDuplicates = true;
      setTimeout(() => {
        this.pointToDuplicates = false;
      }, 3000);
    });
  }


  showDuplicates() {
    const duplicateInputContainer = this.duplicateInputContainer.nativeElement as HTMLElement;
    if (duplicateInputContainer) {
      duplicateInputContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });

      this.pointToDuplicates = false;
    }
  }

  goToPrev() {
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;

    if (this.reviewList[+this.activeIndex - 1]) {
      this.transactionService.getETxn(this.reviewList[+this.activeIndex - 1]).subscribe(etxn => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex - 1);
      });
    }
  }

  goToNext() {
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;

    if (this.reviewList[+this.activeIndex + 1]) {
      this.transactionService.getETxn(this.reviewList[+this.activeIndex + 1]).subscribe(etxn => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex + 1);
      });
    }
  }

  async showCannotEditActivityDialog() {
    const popupResult = await this.popupService.showPopup({
      header: 'Cannot Edit Activity Expense!',
      message: `To edit this activity expense, you need to login to web version of Fyle app at <a href="${this.clusterDomain}">${this.clusterDomain}</a>`,
      primaryCta: {
        text: 'Close'
      },
      showCancelButton: false
    });
  }

  goToTransaction(expense, reviewList, activeIndex) {
    let category;

    if (expense.tx.org_category) {
      category = expense.tx.org_category.toLowerCase();
    }

    if (category === 'activity') {
      this.showCannotEditActivityDialog();

      return;
    }

    if (category === 'mileage') {
      this.router.navigate(['/', 'enterprise', 'add_edit_mileage', {
        id: expense.tx.id, txnIds: JSON.stringify(reviewList), activeIndex
      }]);
    } else if (category === 'per diem') {
      this.router.navigate(['/', 'enterprise', 'add_edit_per_diem', {
        id: expense.tx.id, txnIds: JSON.stringify(reviewList), activeIndex
      }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'add_edit_expense', {
        id: expense.tx.id, txnIds: JSON.stringify(reviewList), activeIndex
      }]);
    }
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(shareReplay(1));
  }

  checkIfInvalidPaymentMode() {
    return this.etxn$.pipe(
      map(etxn => {
        const paymentAccount = this.fg.value.paymentMode;
        const originalSourceAccountId = etxn && etxn.tx && etxn.tx.source_account_id;
        let isPaymentModeInvalid = false;
        if (paymentAccount && paymentAccount.acc && paymentAccount.acc.type === 'PERSONAL_ADVANCE_ACCOUNT') {
          if (paymentAccount.acc.id !== originalSourceAccountId) {
            isPaymentModeInvalid = paymentAccount.acc.tentative_balance_amount < (this.fg.controls.currencyObj.value && this.fg.controls.currencyObj.value.amount);
          } else {
            isPaymentModeInvalid = (paymentAccount.acc.tentative_balance_amount + etxn.tx.amount) < (this.fg.controls.currencyObj.value && this.fg.controls.currencyObj.value.amount);
          }
        }
        return isPaymentModeInvalid;
      })
    );
  }

  getTransactionFields() {
    return this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) => {
        return forkJoin({
          expenseFieldsMap: this.offlineService.getExpenseFieldsMap(),
          perDiemCategoriesContainer: this.getPerDiemCategories()
        }).pipe(
          switchMap(({expenseFieldsMap, perDiemCategoriesContainer}) => {
            const fields = ['purpose', 'cost_center_id', 'from_dt', 'to_dt', 'num_days'];
            return this.expenseFieldsService
              .filterByOrgCategoryId(
                expenseFieldsMap, fields, formValue.sub_category || perDiemCategoriesContainer.defaultPerDiemCategory
              );
          })
        );
      }),
      map((expenseFieldsMap: any) => {
        if (expenseFieldsMap) {
          for (const tfc of Object.keys(expenseFieldsMap)) {
            if (expenseFieldsMap[tfc].options && expenseFieldsMap[tfc].options.length > 0) {
              expenseFieldsMap[tfc].options = expenseFieldsMap[tfc].options.map(value => ({label: value, value}));
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
      switchMap((formValue) => {
        return forkJoin({
          expenseFieldsMap: this.offlineService.getExpenseFieldsMap(),
          perDiemCategoriesContainer: this.getPerDiemCategories()
        }).pipe(
          switchMap(({expenseFieldsMap, perDiemCategoriesContainer}) => {
            const fields = ['purpose', 'cost_center_id', 'from_dt', 'to_dt', 'num_days'];
            return this.expenseFieldsService
              .filterByOrgCategoryId(
                expenseFieldsMap, fields, formValue.sub_category || perDiemCategoriesContainer.defaultPerDiemCategory
              );
          })
        );
      }),
      map(tfc => this.expenseFieldsService.getDefaultTxnFieldValues(tfc))
    );

    tfcValues$.subscribe(defaultValues => {
      const keyToControlMap: { [id: string]: AbstractControl; } = {
        purpose: this.fg.controls.purpose,
        cost_center_id: this.fg.controls.costCenter,
        from_dt: this.fg.controls.from_dt,
        to_dt: this.fg.controls.to_dt,
        num_days: this.fg.controls.num_days
      };

      for (const defaultValueColumn in defaultValues) {
        if (defaultValues.hasOwnProperty(defaultValueColumn)) {
          const control = keyToControlMap[defaultValueColumn];
          if (!control.value) {
            control.patchValue(defaultValues[defaultValueColumn]);
          }
        }
      }
    });
  }

  getPaymentModes() {
    const orgSettings$ = this.offlineService.getOrgSettings();
    const accounts$ = this.offlineService.getAccounts();

    return forkJoin({
      accounts: accounts$,
      orgSettings: orgSettings$
    }).pipe(
      map(({accounts, orgSettings}) => {
        const isAdvanceEnabled = (orgSettings.advances && orgSettings.advances.enabled) ||
          (orgSettings.advance_requests && orgSettings.advance_requests.enabled);
        const isMultipleAdvanceEnabled = orgSettings && orgSettings.advance_account_settings &&
          orgSettings.advance_account_settings.multiple_accounts;
        const userAccounts = this.accountsService
          .filterAccountsWithSufficientBalance(accounts.filter(account => account.acc.type), isAdvanceEnabled)
          .filter(userAccount => ['PERSONAL_ACCOUNT', 'PERSONAL_ADVANCE_ACCOUNT'].includes(userAccount.acc.type));

        return this.accountsService.constructPaymentModes(userAccounts, isMultipleAdvanceEnabled);
      }),
      map(paymentModes => paymentModes.map((paymentMode: any) => ({label: paymentMode.acc.displayName, value: paymentMode})))
    );
  }

  getSubCategories() {
    return this.offlineService.getAllCategories().pipe(
      map(categories => {
        const parentCategoryName = 'per diem';
        return categories
          .filter((orgCategory) => (parentCategoryName.toLowerCase() === orgCategory.name.toLowerCase())
            && (parentCategoryName.toLowerCase() !== orgCategory.sub_category.toLowerCase()))
          .filter(category => category.enabled);
      }),
      shareReplay(1)
    );
  }

  getProjectCategoryIds() {
    return this.offlineService.getAllCategories().pipe(
      map(categories => {

        const perDiemCategories = categories
          .filter(category => category.enabled)
          .filter((category) => ['Per Diem'].indexOf(category.fyle_category) > -1)
          .map(category => category.id as string);

        return perDiemCategories;
      })
    );
  }

  getPerDiemCategories() {
    return this.offlineService.getAllCategories().pipe(
      map(categories => {
        const orgCategoryName = 'per diem';
        const defaultPerDiemCategory = categories.find(category => category.name.toLowerCase() === orgCategoryName.toLowerCase());

        const perDiemCategories = categories
          .filter(category => category.enabled)
          .filter((category) => ['Per Diem'].indexOf(category.fyle_category) > -1);

        return {
          defaultPerDiemCategory,
          perDiemCategories
        };
      })
    );
  }

  getNewExpense() {
    return forkJoin({
      categoryContainer: this.getPerDiemCategories(),
      homeCurrency: this.offlineService.getHomeCurrency(),
      currentEou: this.authService.getEou()
    }).pipe(
      map(({categoryContainer, homeCurrency, currentEou}) => {
        return {
          tx: {
            billable: false,
            skip_reimbursement: false,
            source: 'MOBILE',
            org_category_id: categoryContainer.defaultPerDiemCategory && categoryContainer.defaultPerDiemCategory.id,
            org_category: categoryContainer.defaultPerDiemCategory && categoryContainer.defaultPerDiemCategory.name,
            sub_category: categoryContainer.defaultPerDiemCategory && categoryContainer.defaultPerDiemCategory.sub_category,
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
            org_user_id: currentEou.ou.id
          }
        };
      })
    );
  }

  getEditExpense() {
    return this.transactionService.getETxn(this.activatedRoute.snapshot.params.id).pipe(
      shareReplay(1)
    );
  }

  setupFilteredCategories(activeCategories$: Observable<any>) {
    this.filteredCategories$ = this.fg.controls.project.valueChanges.pipe(
      startWith(this.fg.controls.project.value),
      concatMap(project => {
        return activeCategories$.pipe(
          map(activeCategories =>
            this.projectService.getAllowedOrgCategoryIds(project, activeCategories)
          )
        );
      }),
      map(
        categories => categories.map(category => ({label: category.sub_category, value: category}))
      )
    );

    this.filteredCategories$.subscribe(categories => {
      if (this.fg.value.sub_category
        && this.fg.value.sub_category.id
        && !categories.some(category => this.fg.value.sub_category && this.fg.value.sub_category.id === category.value.id)) {
        this.fg.controls.sub_category.reset();
      }
    });
  }

  getTimeSpentOnPage() {
    const expenseEndTime = new Date().getTime();
    // Get time spent on page in seconds
    return (expenseEndTime - this.expenseStartTime) / 1000;
  }

  getCustomInputs() {
    this.initialFetch = true;
    return this.fg.controls.sub_category.valueChanges
      .pipe(
        startWith({}),
        switchMap(() => {
          let category = this.fg.controls.sub_category.value;
          if (this.initialFetch) {
            return this.etxn$.pipe(switchMap(etxn => {
              return iif(() => etxn.tx.org_category_id,
                this.offlineService.getAllCategories().pipe(
                  map(categories => categories
                    .find(category => category.id === etxn.tx.org_category_id))), this.getPerDiemCategories().pipe(
                      map(perDiemContainer => perDiemContainer.defaultPerDiemCategory)
                    ));
            }));
          }

          if (category && !isEmpty(category)) {
            return of(category);
          } else {
            return this.getPerDiemCategories().pipe(
              map(perDiemContainer => perDiemContainer.defaultPerDiemCategory)
            );
          }
        }),
        switchMap((category: any) => {
          const formValue = this.fg.value;
          return this.offlineService.getCustomInputs().pipe(
            map((customFields: any) => {
              return this.customFieldsService
                .standardizeCustomFields(
                  formValue.custom_inputs || [],
                  this.customInputsService.filterByCategory(customFields, category && category.id)
                );
            })
          );
        }),
        map(customFields => {
          return customFields.map(customField => {
            if (customField.options) {
              customField.options = customField.options.map(option => ({label: option, value: option}));
            }
            return customField;
          });
        }),
        switchMap((customFields: any[]) => {
          return this.isConnected$.pipe(
            take(1),
            map(isConnected => {
              const customFieldsFormArray = this.fg.controls.custom_inputs as FormArray;
              customFieldsFormArray.clear();
              for (const customField of customFields) {
                customFieldsFormArray.push(
                  this.fb.group({
                    name: [customField.name],
                    value: [
                      customField.type !== 'DATE' ? customField.value : moment(customField.value).format('y-MM-DD'),
                      isConnected && customField.type !== 'BOOLEAN' && customField.type !== 'USER_LIST' && customField.mandatory && Validators.required]
                  })
                );
              }
              return customFields.map((customField, i) => ({...customField, control: customFieldsFormArray.at(i)}));
            })
          );
        }),
        shareReplay(1)
      );
  }

  customDateValidator(control: AbstractControl) {
    if (!this.fg) {
      return;
    }
    const fromDt = moment(new Date(this.fg.value.from_dt));
    const passedInDate = control.value && moment(new Date(control.value));
    if (passedInDate) {
      return (passedInDate.isSame(fromDt) || passedInDate.isAfter(fromDt)) ? null : {
        invalidDateSelection: true
      };
    }
  }

  ionViewWillEnter() {
    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back;
    this.expenseStartTime = new Date().getTime();
    const today = new Date();
    this.minDate = moment(new Date('Jan 1, 2001')).format('y-MM-D');
    this.maxDate = moment(this.dateService.addDaysToDate(today, 1)).format('y-MM-D');

    from(this.tokenService.getClusterDomain()).subscribe(clusterDomain => {
      this.clusterDomain = clusterDomain;
    });

    this.fg = this.fb.group({
      currencyObj: [{
        value: null,
        disabled: true
      }],
      paymentMode: [, Validators.required],
      project: [],
      sub_category: [],
      per_diem_rate: [, Validators.required],
      purpose: [],
      num_days: [, Validators.compose([Validators.required, Validators.min(0)])],
      report: [],
      from_dt: [],
      to_dt: [, this.customDateValidator.bind(this)],
      custom_inputs: new FormArray([]),
      add_to_new_report: [],
      duplicate_detection_reason: [],
      billable: [],
      costCenter: []
    });

    this.title = 'Add Expense';
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;
    this.reviewList = this.activatedRoute.snapshot.params.txnIds && JSON.parse(this.activatedRoute.snapshot.params.txnIds);
    this.title = this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    if (this.activatedRoute.snapshot.params.id) {
      this.mode = 'edit';
    }

    const orgSettings$ = this.offlineService.getOrgSettings();
    const perDiemRates$ = this.offlineService.getPerDiemRates();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();

    this.isAdvancesEnabled$ = orgSettings$.pipe(map(orgSettings => {
      return (orgSettings.advances && orgSettings.advances.enabled) ||
        (orgSettings.advance_requests && orgSettings.advance_requests.enabled);
    }));

    this.individualPerDiemRatesEnabled$ = orgSettings$.pipe(
      map(orgSettings => {
        return orgSettings.per_diem.enable_individual_per_diem_rates;
      })
    );

    this.setupNetworkWatcher();

    this.recentlyUsedValues$ = this.isConnected$.pipe(
      take(1),
      switchMap(isConnected => {
        if (isConnected) {
          return this.recentlyUsedItemsService.getRecentlyUsed();
        } else {
          return of(null);
        }
      })
    );

    const allowedPerDiemRates$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return forkJoin({
          orgSettings: orgSettings$,
          allowedPerDiemRates: perDiemRates$.pipe(switchMap(perDiemRates => this.offlineService.getAllowedPerDiems(perDiemRates)))
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).pipe(
      switchMap(({orgSettings, allowedPerDiemRates}) => {
        return iif(
          () => allowedPerDiemRates.length > 0 || orgSettings.per_diem.enable_individual_per_diem_rates,
          of(allowedPerDiemRates),
          perDiemRates$);
      }),
      map(rates => {
        return rates.filter(rate => rate.active);
      }),
      map(rates => rates.map(rate => {
        rate.full_name = `${rate.name} (${rate.rate} ${rate.currency} per day)`;
        return rate;
      }))
    );

    this.canCreatePerDiem$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return forkJoin({
          orgSettings: orgSettings$,
          perDiemRates: perDiemRates$,
          allowedPerDiemRates: allowedPerDiemRates$
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).pipe(
      map(({orgSettings, perDiemRates, allowedPerDiemRates}) => {
        if (orgSettings.per_diem.enable_individual_per_diem_rates) {
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
    this.paymentModes$ = this.getPaymentModes();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    this.subCategories$ = this.getSubCategories();
    this.setupFilteredCategories(this.subCategories$);

    this.projectCategoryIds$ = this.getProjectCategoryIds();
    this.isProjectVisible$ = this.projectCategoryIds$.pipe(
      switchMap(projectCategoryIds => {
        return this.offlineService.getProjectCount({categoryIds: projectCategoryIds});
      })
    );
    this.comments$ = this.statusService.find('transactions', this.activatedRoute.snapshot.params.id);

    combineLatest([
      this.isConnected$,
      this.filteredCategories$,
    ]).pipe(
      distinctUntilChanged((a, b) => isEqual(a, b)),
    ).subscribe(([isConnected, filteredCategories]) => {
      this.fg.controls.sub_category.clearValidators();
      if (isConnected && filteredCategories && filteredCategories.length) {
        this.fg.controls.sub_category.setValidators(Validators.required);
      }
      this.fg.controls.sub_category.updateValueAndValidity();
    });

    this.allowedPerDiemRateOptions$ = allowedPerDiemRates$.pipe(
      map(allowedPerDiemRates => allowedPerDiemRates.map(rate => {
          const rateName = rate.name + ' (' + this.currencyPipe.transform(rate.rate, rate.currency, 'symbol', '1.2-2') + 'per day )';
          return ({label: rateName, value: rate});
        })
      )
    );

    this.transactionMandatoyFields$ = this.isConnected$.pipe(
      filter(isConnected => !!isConnected),
      switchMap(() => {
        return this.offlineService.getOrgSettings();
      }),
      map(orgSettings => orgSettings.transaction_fields_settings.transaction_mandatory_fields || {})
    );

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects)
    );

    this.individualProjectIds$ = orgUserSettings$.pipe(
      map((orgUserSettings: any) => orgUserSettings.project_ids || [])
    );

    this.transactionMandatoyFields$
      .pipe(
        filter(transactionMandatoyFields => !isEqual(transactionMandatoyFields, {})),
        switchMap((transactionMandatoyFields) => {
          return forkJoin({
            individualProjectIds: this.individualProjectIds$,
            isIndividualProjectsEnabled: this.isIndividualProjectsEnabled$,
            orgSettings: this.offlineService.getOrgSettings()
          }).pipe(map(({individualProjectIds, isIndividualProjectsEnabled, orgSettings}) => {
            return {
              transactionMandatoyFields,
              individualProjectIds,
              isIndividualProjectsEnabled,
              orgSettings
            };
          }));
        })
      )
      .subscribe(({transactionMandatoyFields, individualProjectIds, isIndividualProjectsEnabled, orgSettings}) => {
        if (orgSettings.projects.enabled) {
          if (isIndividualProjectsEnabled) {
            if (transactionMandatoyFields.project && individualProjectIds.length > 0) {
              this.fg.controls.project.setValidators(Validators.required);
              this.fg.controls.project.updateValueAndValidity();
            }
          } else {
            if (transactionMandatoyFields.project) {
              this.fg.controls.project.setValidators(Validators.required);
              this.fg.controls.project.updateValueAndValidity();
            }
          }
        }
      });


    this.etxn$ = iif(() => this.mode === 'add', this.getNewExpense(), this.getEditExpense());

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.projects && orgSettings.projects.enabled)
    );

    this.customInputs$ = this.getCustomInputs();

    this.costCenters$ = forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$
    }).pipe(
      switchMap(({orgSettings, orgUserSettings}) => {
        if (orgSettings.cost_centers.enabled) {
          return this.offlineService.getAllowedCostCenters(orgUserSettings);
        } else {
          return of([]);
        }
      }),
      map(costCenters => {
        return costCenters.map(costCenter => ({
          label: costCenter.name,
          value: costCenter
        }));
      })
    );

    this.recentlyUsedCostCenters$ = forkJoin({
      costCenters: this.costCenters$,
      recentValue: this.recentlyUsedValues$
    }).pipe(
      concatMap(({costCenters, recentValue}) => {
        return this.recentlyUsedItemsService.getRecentCostCenters(costCenters, recentValue);
      })
    );

    this.reports$ = this.reportService.getFilteredPendingReports({state: 'edit'}).pipe(
      map(reports => reports.map(report => ({label: report.rp.purpose, value: report})))
    );

    this.txnFields$.pipe(
      distinctUntilChanged((a, b) => isEqual(a, b)),
      switchMap(txnFields => {
        return this.isConnected$.pipe(
          take(1),
          withLatestFrom(this.costCenters$),
          map(([isConnected, costCenters]) => ({
            isConnected,
            txnFields,
            costCenters
          }))
        );
      })
    ).subscribe(({isConnected, txnFields, costCenters}) => {
      const keyToControlMap: { [id: string]: AbstractControl; } = {
        purpose: this.fg.controls.purpose,
        cost_center_id: this.fg.controls.costCenter,
        from_dt: this.fg.controls.from_dt,
        to_dt: this.fg.controls.to_dt,
        num_days: this.fg.controls.num_days
      };

      for (const control of Object.values(keyToControlMap)) {
        control.clearValidators();
        control.updateValueAndValidity();
      }

      for (const txnFieldKey of Object.keys(txnFields)) {
        const control = keyToControlMap[txnFieldKey];

        if (txnFields[txnFieldKey].is_mandatory) {
          if (txnFieldKey === 'num_days') {
            control.setValidators(Validators.compose([Validators.required, Validators.min(0)]));
          } else if (txnFieldKey === 'to_dt') {
            control.setValidators(isConnected ? Validators.compose([this.customDateValidator.bind(this), Validators.required]) : null);
          } else if (txnFieldKey === 'cost_center_id') {
            control.setValidators((isConnected && costCenters && costCenters.length > 0 )? Validators.required : null);
          } else {
            control.setValidators(isConnected ? Validators.required : null);
          }
        } else {
          if (txnFieldKey === 'num_days') {
            control.setValidators(Validators.compose([Validators.required, Validators.min(0)]));
          }
          if (txnFieldKey === 'to_dt') {
            control.setValidators(isConnected ? this.customDateValidator.bind(this) : null);
          }
        }
        control.updateValueAndValidity();
      }

      this.fg.updateValueAndValidity();
    });


    this.setupTfcDefaultValues();

    this.isAmountCapped$ = this.etxn$.pipe(
      map(
        etxn => isNumber(etxn.tx.admin_amount) || isNumber(etxn.tx.policy_amount)
      )
    );

    this.isAmountDisabled$ = this.etxn$.pipe(
      map(
        etxn => !!etxn.tx.admin_amount
      )
    );

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map(
        etxn => isNumber(etxn.tx.policy_amount) && (etxn.tx.policy_amount < 0.0001)
      )
    );

    combineLatest(
      this.fg.controls.from_dt.valueChanges,
      this.fg.controls.to_dt.valueChanges
    )
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b))
      )
      .subscribe(([fromDt, toDt]) => {
        if (fromDt && toDt) {
          const fromDate = moment(new Date(fromDt));
          const toDate = moment(new Date(toDt));
          if (toDate.isSame(fromDate)) {
            this.fg.controls.num_days.setValue(1);
          } else if (toDate.isAfter(fromDate)){
            this.fg.controls.num_days.setValue(toDate.diff(fromDate, 'day') + 1);
          }
        }
      });

    combineLatest(
      this.fg.controls.from_dt.valueChanges,
      this.fg.controls.num_days.valueChanges
    )
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b))
      )
      .subscribe(([fromDt, numDays]) => {
        if (fromDt && numDays && numDays > 0) {
          const fromDate = moment(this.dateService.getUTCDate(new Date(fromDt)));
          this.fg.controls.to_dt.setValue(fromDate.add((+numDays - 1), 'day').format('y-MM-DD'),{
            emitEvent: false
          });
        }
      });

    combineLatest(
      this.fg.controls.per_diem_rate.valueChanges,
      this.fg.controls.num_days.valueChanges,
      this.homeCurrency$
    )
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        filter(([perDiemRate, numDays, homeCurrency]) => !!perDiemRate && !!numDays && !!homeCurrency),
        filter(([perDiemRate, numDays, homeCurrency]) => perDiemRate.currency === homeCurrency)
      )
      .subscribe(([perDiemRate, numDays, homeCurrency]) => {
        if (perDiemRate && numDays && homeCurrency) {
          if (perDiemRate.currency === homeCurrency) {
            this.fg.controls.currencyObj.setValue({
              currency: perDiemRate.currency,
              amount: (perDiemRate.rate * numDays).toFixed(2),
              orig_currency: null,
              orig_amount: null
            });
          }
        }
      });

    combineLatest(
      this.fg.controls.per_diem_rate.valueChanges,
      this.fg.controls.num_days.valueChanges,
      this.homeCurrency$
    )
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        filter(([perDiemRate, numDays, homeCurrency]) => !!perDiemRate && !!numDays && !!homeCurrency),
        filter(([perDiemRate, numDays, homeCurrency]) => perDiemRate.currency !== homeCurrency),
        switchMap(([perDiemRate, numDays, homeCurrency]) => {
          return this.currencyService.getExchangeRate(perDiemRate.currency, homeCurrency).pipe(map(
            res => [perDiemRate, numDays, homeCurrency, res]
          ));
        })
      )
      .subscribe(([perDiemRate, numDays, homeCurrency, exchangeRate]) => {
        this.fg.controls.currencyObj.setValue({
          currency: homeCurrency,
          amount: (perDiemRate.rate * numDays * exchangeRate).toFixed(2),
          orig_currency: perDiemRate.currency,
          orig_amount: (perDiemRate.rate * numDays).toFixed(2)
        });
      });

    this.setupDuplicateDetection();

    this.isBalanceAvailableInAnyAdvanceAccount$ = this.fg.controls.paymentMode.valueChanges.pipe(
      switchMap((paymentMode) => {
        if (paymentMode && paymentMode.acc && paymentMode.acc.type === 'PERSONAL_ACCOUNT') {
          return this.offlineService.getAccounts().pipe(
            map(accounts => {
              return accounts.filter(account => account &&
                account.acc &&
                account.acc.type === 'PERSONAL_ADVANCE_ACCOUNT' &&
                account.acc.tentative_balance_amount > 0).length > 0;
            })
          );
        }
        return of(false);
      })
    );

    const selectedProject$ = this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.project_id) {
          return of(etxn.tx.project_id);
        } else {
          return forkJoin({
            orgSettings: this.offlineService.getOrgSettings(),
            orgUserSettings: this.offlineService.getOrgUserSettings()
          }).pipe(
            map(({orgSettings, orgUserSettings}) => {
              if (orgSettings.projects.enabled) {
                return orgUserSettings && orgUserSettings.preferences && orgUserSettings.preferences.default_project_id;
              }
            })
          );
        }
      }),
      switchMap(projectId => {
        if (projectId) {
          return this.projectService.getbyId(projectId);
        } else {
          return of(null);
        }
      })
    );

    const selectedPaymentMode$ = this.etxn$.pipe(
      switchMap(etxn => {
        return iif(() => etxn.tx.source_account_id, this.paymentModes$.pipe(
          map(paymentModes => paymentModes
            .map(res => res.value)
            .find(paymentMode => {
              if (paymentMode.acc.displayName === 'Paid by Me') {
                return paymentMode.acc.id === etxn.tx.source_account_id && !etxn.tx.skip_reimbursement;
              } else {
                return paymentMode.acc.id === etxn.tx.source_account_id;
              }
            }))
        ), of(null));
      })
    );

    const defaultPaymentMode$ = this.paymentModes$.pipe(
      map(paymentModes => paymentModes
        .map(res => res.value)
        .find(paymentMode => paymentMode.acc.displayName === 'Paid by Me')
      )
    );

    this.recentlyUsedProjects$ = forkJoin({
      recentValues: this.recentlyUsedValues$,
      perDiemCategoryIds: this.projectCategoryIds$,
      eou: this.authService.getEou()
    }).pipe(
        switchMap(({recentValues, perDiemCategoryIds, eou}) => {
          return this.recentlyUsedItemsService.getRecentlyUsedProjects({
            recentValues,
            eou,
            categoryIds: perDiemCategoryIds
          });
        })
    );

    const selectedSubCategory$ = this.etxn$.pipe(
      switchMap(etxn => {
        return iif(() => etxn.tx.org_category_id,
          this.subCategories$.pipe(
            map(subCategories => subCategories
              .find(subCategory => subCategory.id === etxn.tx.org_category_id))
          ),
          of(null)
        );
      })
    );

    const selectedPerDiemOption$ = this.etxn$.pipe(
      switchMap(etxn => {
        return iif(() => etxn.tx.per_diem_rate_id,
          this.allowedPerDiemRateOptions$.pipe(
            map(perDiemOptions => perDiemOptions
              .map(res => res.value)
              .find(perDiemOption => perDiemOption.id === etxn.tx.per_diem_rate_id))
          ),
          of(null)
        );
      })
    );

    const selectedReport$ = this.etxn$.pipe(
      switchMap(etxn => {
        return iif(() => etxn.tx.report_id,
          this.reports$.pipe(
            map(reportOptions => reportOptions
              .map(res => res.value)
              .find(reportOption => reportOption.rp.id === etxn.tx.report_id))
          ),
          of(null)
        );
      })
    );

    const selectedCostCenter$ = this.etxn$.pipe(
      switchMap(etxn => {
        if (etxn.tx.cost_center_id) {
          return of(etxn.tx.cost_center_id);
        } else {
          return forkJoin({
            orgSettings: this.offlineService.getOrgSettings(),
            costCenters: this.costCenters$
          }).pipe(
            map(({orgSettings, costCenters}) => {
              if (orgSettings.cost_centers.enabled) {
                if (costCenters.length === 1 && this.mode === 'add') {
                  return costCenters[0].value.id;
                }
              }
            })
          );
        }
      }),
      switchMap(costCenterId => {
        if (costCenterId) {
          return this.costCenters$.pipe(
            map(costCenters => costCenters.map(res => res.value).find(costCenter => costCenter.id === costCenterId)));
        } else {
          return of(null);
        }
      })
    );

    const selectedCustomInputs$ = this.etxn$.pipe(
      switchMap(etxn => {
        return this.offlineService.getCustomInputs().pipe(map(customFields => {
          return this.customFieldsService
            .standardizeCustomFields([], this.customInputsService.filterByCategory(customFields, etxn.tx.org_category_id));
        }));
      })
    );

    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return combineLatest([
          this.etxn$,
          selectedPaymentMode$,
          selectedProject$,
          selectedSubCategory$,
          selectedPerDiemOption$,
          this.txnFields$,
          selectedReport$,
          selectedCostCenter$,
          selectedCustomInputs$,
          defaultPaymentMode$,
          orgUserSettings$,
          this.recentlyUsedValues$,
          this.recentlyUsedProjects$,
          this.recentlyUsedCostCenters$
        ]);
      }),
      take(1),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(([
                   etxn, paymentMode, project, subCategory, perDiemRate, txnFields, report, costCenter, customInputs, defaultPaymentMode,
                   orgUserSettings, recentValue, recentProjects, recentCostCenters]) => {
      const customInputValues = customInputs
        .map(customInput => {
          const cpor = etxn.tx.custom_properties && etxn.tx.custom_properties.find(customProp => customProp.name === customInput.name);
          if (customInput.type === 'DATE') {
            return {
              name: customInput.name,
              value: (cpor && cpor.value && moment(new Date(cpor.value)).format('y-MM-DD')) || null
            };
          } else {
            return {
              name: customInput.name,
              value: (cpor && cpor.value) || null
            };
          }
        });

      // Check if auto-fills is enabled
      const isAutofillsEnabled = orgUserSettings.expense_form_autofills.allowed && orgUserSettings.expense_form_autofills.enabled;

      // Check if recent projects exist
      const doRecentProjectIdsExist = isAutofillsEnabled && recentValue && recentValue.recent_project_ids && recentValue.recent_project_ids.length > 0;

      if (recentProjects && recentProjects.length > 0) {
        this.recentProjects = recentProjects.map(item => ({label: item.project_name, value: item}));
      }

      /* Autofill project during these cases:
      * 1. Autofills is allowed and enabled
      * 2. During add expense - When project field is empty
      * 3. During edit expense - When the expense is in draft state and there is no project already added
      * 4. When there exists recently used project ids to auto-fill
      */
      if (doRecentProjectIdsExist && (!etxn.tx.id || (etxn.tx.id && etxn.tx.state === 'DRAFT' && !etxn.tx.project_id))) {
        const autoFillProject = recentProjects && recentProjects.length > 0 && recentProjects[0];

        if (autoFillProject) {
          project = autoFillProject;
          this.presetProjectId = project.project_id;
        }
      }

      // Check if recent cost centers exist
      const doRecentCostCenterIdsExist = isAutofillsEnabled && recentValue && recentValue.recent_cost_center_ids && recentValue.recent_cost_center_ids.length > 0;

      if (recentCostCenters && recentCostCenters.length > 0) {
        this.recentCostCenters = recentCostCenters;
      }

      /* Autofill cost center during these cases:
       * 1. Autofills is allowed and enabled
       * 2. During add expense - When cost center field is empty
       * 3. During edit expense - When the expense is in draft state and there is no cost center already added - optional
       * 4. When there exists recently used cost center ids to auto-fill
       */
      if (doRecentCostCenterIdsExist && (!etxn.tx.id || (etxn.tx.id && etxn.tx.state === 'DRAFT' && !etxn.tx.cost_center_id))) {
        const autoFillCostCenter = recentCostCenters && recentCostCenters.length > 0 && recentCostCenters[0];

        if (autoFillCostCenter) {
          costCenter = autoFillCostCenter.value;
          this.presetCostCenterId = autoFillCostCenter.value.id;
        }
      }

      this.fg.patchValue({
        paymentMode: paymentMode || defaultPaymentMode,
        project,
        sub_category: subCategory,
        per_diem_rate: perDiemRate,
        purpose: etxn.tx.purpose,
        num_days: etxn.tx.num_days,
        report,
        from_dt: etxn.tx.from_dt ? moment(new Date(etxn.tx.from_dt)).format('y-MM-DD') : null,
        to_dt: etxn.tx.to_dt ? moment(new Date(etxn.tx.to_dt)).format('y-MM-DD') : null,
        billable: etxn.tx.billable,
        duplicate_detection_reason: etxn.tx.user_reason_for_duplicate_expenses,
        costCenter
      });

      this.initialFetch = false;

      setTimeout(() => {
        this.fg.controls.custom_inputs.patchValue(customInputValues);
      }, 1000);
    });

    this.paymentModeInvalid$ = iif(() => this.activatedRoute.snapshot.params.id, this.etxn$, of(null)).pipe(
      map(etxn => {
        if (this.fg.value.paymentMode.acc.type === 'PERSONAL_ADVANCE_ACCOUNT') {
          if (etxn && etxn.id && this.fg.value.paymentMode.acc.id === etxn.source_account_id && etxn.state !== 'DRAFT') {
            return (this.fg.value.paymentMode.acc.tentative_balance_amount + etxn.amount) < this.fg.value.currencyObj.amount;
          } else {
            return this.fg.value.paymentMode.acc.tentative_balance_amount < this.fg.value.currencyObj.amount;
          }
        } else {
          return false;
        }
      })
    );
  }

  generateEtxnFromFg(etxn$, standardisedCustomProperties$) {
    return forkJoin({
      etxn: etxn$,
      customProperties: standardisedCustomProperties$
    }).pipe(
      map((res) => {
        const etxn: any = res.etxn;
        let customProperties: any = res.customProperties;
        customProperties = customProperties.map(customProperty => {
          if (customProperty.type === 'DATE') {
            customProperty.value = customProperty.value && this.dateService.getUTCDate(new Date(customProperty.value));
          }
          return customProperty;
        });
        const skipReimbursement = this.fg.value.paymentMode.acc.type === 'PERSONAL_ACCOUNT'
          && !this.fg.value.paymentMode.acc.isReimbursable;

        const formValue = this.fg.value;
        const currencyObj = this.fg.controls.currencyObj.value;
        const amountData: any = {
          currency: currencyObj.currency,
          amount: currencyObj.amount,
          orig_currency: currencyObj.orig_currency,
          orig_amount: currencyObj.orig_amount,
        };

        return {
          tx: {
            ...etxn.tx,
            source_account_id: formValue.paymentMode.acc.id,
            billable: formValue.billable,
            org_category_id: (formValue.sub_category && formValue.sub_category.id) || etxn.tx.org_category_id,
            skip_reimbursement: skipReimbursement,
            per_diem_rate_id: formValue.per_diem_rate.id,
            source: 'MOBILE',
            currency: amountData.currency,
            amount: amountData.amount,
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
            user_reason_for_duplicate_expenses: formValue.duplicate_detection_reason
          },
          dataUrls: [],
          ou: etxn.ou
        };
      })
    );
  }

  checkPolicyViolation(etxn) {
    // Prepare etxn object with just tx and ou object required for test call
    return from(this.authService.getEou()).pipe(
      switchMap(currentEou => {
        const policyETxn = {
          tx: cloneDeep(etxn.tx),
          ou: cloneDeep(etxn.ou)
        };

        if (!etxn.tx.id) {
          policyETxn.ou = currentEou.ou;
        }
        /* Adding number of attachements and sending in test call as tx_num_files
         * If editing an expense with receipts, check for already uploaded receipts
         */
        if (etxn.tx) {
          policyETxn.tx.num_files = etxn.tx.num_files;

          // Check for receipts uploaded from mobile
          if (etxn.dataUrls && etxn.dataUrls.length > 0) {
            policyETxn.tx.num_files = etxn.tx.num_files + etxn.dataUrls.length;
          }
        }

        return this.offlineService.getAllCategories().pipe(
          map((categories: any[]) => {
            // policy engine expects org_category and sub_category fields
            if (policyETxn.tx.org_category_id) {
              const orgCategory = categories.find(cat => cat.id === policyETxn.tx.org_category_id);
              policyETxn.tx.org_category = orgCategory && orgCategory.name;
              policyETxn.tx.sub_category = orgCategory && orgCategory.sub_category;
            } else {
              policyETxn.tx.org_category_id = null;
              policyETxn.tx.sub_category = null;
              policyETxn.tx.org_category = null;
            }

            // Flatten the etxn obj
            return this.dataTransformService.etxnRaw(policyETxn);

          })
        );
      }),
      switchMap((policyETxn) => {
        return this.transactionService.testPolicy(policyETxn);
      })
    );
  }

  async continueWithCriticalPolicyViolation(criticalPolicyViolations: string[]) {
    const currencyModal = await this.modalController.create({
      component: CriticalPolicyViolationComponent,
      componentProps: {
        criticalViolationMessages: criticalPolicyViolations
      }
    });

    await currencyModal.present();

    const {data} = await currencyModal.onWillDismiss();
    return !!data;
  }

  async continueWithPolicyViolations(policyViolations: string[], policyActionDescription: string) {
    const currencyModal = await this.modalController.create({
      component: PolicyViolationComponent,
      componentProps: {
        policyViolationMessages: policyViolations,
        policyActionDescription
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
    });

    await currencyModal.present();

    const {data} = await currencyModal.onWillDismiss();
    return data;
  }

  addExpense(redirectedFrom) {
    this.savePerDiemLoader = redirectedFrom === 'SAVE_PER_DIEM';
    this.saveAndNextPerDiemLoader = redirectedFrom === 'SAVE_AND_NEXT_PERDIEM';

    const customFields$ = this.customInputs$.pipe(
      take(1),
      map(customInputs => {
        return customInputs.map((customInput, i) => {
          return {
            id: customInput.id,
            mandatory: customInput.mandatory,
            name: customInput.name,
            options: customInput.options,
            placeholder: customInput.placeholder,
            prefix: customInput.prefix,
            type: customInput.type,
            value: this.fg.value.custom_inputs[i].value
          };
        });
      })
    );

    return from(this.generateEtxnFromFg(this.etxn$, customFields$))
      .pipe(
        switchMap(etxn => {
          return this.isConnected$.pipe(
            take(1),
            switchMap(isConnected => {
              if (isConnected) {
                const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay(1));
                return policyViolations$.pipe(
                  map(this.policyService.getCriticalPolicyRules),
                  switchMap(criticalPolicyViolations => {
                    if (criticalPolicyViolations.length > 0) {
                      return throwError({
                        type: 'criticalPolicyViolations',
                        policyViolations: criticalPolicyViolations,
                        etxn
                      });
                    } else {
                      return policyViolations$;
                    }
                  }),
                  map((policyViolations: any) =>
                    [this.policyService.getPolicyRules(policyViolations),
                      policyViolations &&
                      policyViolations.transaction_desired_state &&
                      policyViolations.transaction_desired_state.action_description]),
                  switchMap(([policyViolations, policyActionDescription]) => {
                    if (policyViolations.length > 0) {
                      return throwError({
                        type: 'policyViolations',
                        policyViolations,
                        policyActionDescription,
                        etxn
                      });
                    } else {
                      return of({etxn, comment: null});
                    }
                  })
                );
              } else {
                return of({etxn, comment: null});
              }
            }));
        }),
        catchError(err => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
              map(etxn => ({ etxn }))
            );
          }
          if (err.type === 'criticalPolicyViolations') {
            return from(this.loaderService.hideLoader()).pipe(
              switchMap(() => {
                return this.continueWithCriticalPolicyViolation(err.policyViolations);
              }),
              switchMap((continueWithTransaction) => {
                if (continueWithTransaction) {
                  return from(this.loaderService.showLoader()).pipe(
                    switchMap(() => {
                      return of({etxn: err.etxn});
                    })
                  );
                } else {
                  return throwError('unhandledError');
                }
              })
            );
          } else if (err.type === 'policyViolations') {
            return from(this.loaderService.hideLoader()).pipe(
              switchMap(() => {
                return this.continueWithPolicyViolations(err.policyViolations, err.policyActionDescription);
              }),
              switchMap((continueWithTransaction) => {
                if (continueWithTransaction) {
                  return from(this.loaderService.showLoader()).pipe(
                    switchMap(() => {
                      return of({etxn: err.etxn, comment: continueWithTransaction.comment});
                    })
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
        switchMap(({etxn, comment}: any) => {
          return from(this.authService.getEou())
            .pipe(
              switchMap(eou => {

                const comments = [];
                this.trackingService.createExpense(
                  {
                  Asset: 'Mobile',
                    Type: 'Receipt',
                    Amount: etxn.tx.amount,
                    Currency: etxn.tx.currency,
                    Category: etxn.tx.org_category,
                    Time_Spent: this.getTimeSpentOnPage() + ' secs',
                    Used_Autofilled_Project: (etxn.tx.project_id && this.presetProjectId && (etxn.tx.project_id === this.presetProjectId)),
                    Used_Autofilled_CostCenter: (etxn.tx.cost_center_id && this.presetCostCenterId && (etxn.tx.cost_center_id === this.presetCostCenterId))
                });

                if (comment) {
                  comments.push(comment);
                }

                let reportId;
                if (this.fg.value.report &&
                    (etxn.tx.policy_amount === null ||
                      (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))) {
                  reportId = this.fg.value.report.rp.id;
                }
                let entry;
                if (this.fg.value.add_to_new_report) {
                  entry = {
                    comments,
                    reportId
                  };
                }
                if (entry) {
                  return from(this.transactionsOutboxService.addEntryAndSync(etxn.tx, etxn.dataUrls, entry.comments, entry.reportId));
                } else {
                  return of(this.transactionsOutboxService.addEntry(etxn.tx, etxn.dataUrls, comments, reportId, null, null));
                }

              }));
        }),
        finalize(() => {
          this.savePerDiemLoader = false;
          this.saveAndNextPerDiemLoader = false;
        })
      );
  }

  trackPolicyCorrections() {
    this.isCriticalPolicyViolated$.subscribe(isCriticalPolicyViolated => {
      if (isCriticalPolicyViolated && this.fg.dirty) {
        this.trackingService.policyCorrection({Asset: 'Mobile', Violation: 'Critical', Mode: 'Edit Expense'});
      }
    });

    this.comments$.pipe(
      map(
        estatuses => estatuses.filter((estatus) => {
          return estatus.st_org_user_id === 'POLICY';
        })
      ),
      map(policyViolationComments => policyViolationComments.length > 0)
    ).subscribe(policyViolated => {
      if (policyViolated && this.fg.dirty) {
        this.trackingService.policyCorrection({Asset: 'Mobile', Violation: 'Regular', Mode: 'Edit Expense'});
      }
    });
  }

  editExpense(redirectedFrom) {

    this.savePerDiemLoader = redirectedFrom === 'SAVE_PER_DIEM';
    this.saveAndNextPerDiemLoader = redirectedFrom === 'SAVE_AND_NEXT_PERDIEM';

    this.trackPolicyCorrections();

    const customFields$ = this.customInputs$.pipe(
      take(1),
      map(customInputs => {
        return customInputs.map((customInput, i) => {
          return {
            id: customInput.id,
            mandatory: customInput.mandatory,
            name: customInput.name,
            options: customInput.options,
            placeholder: customInput.placeholder,
            prefix: customInput.prefix,
            type: customInput.type,
            value: this.fg.value.custom_inputs[i].value
          };
        });
      })
    );

    return from(this.generateEtxnFromFg(this.etxn$, customFields$))
      .pipe(
        switchMap(etxn => {
          const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay(1));
          return policyViolations$.pipe(
            map(this.policyService.getCriticalPolicyRules),
            switchMap(policyViolations => {
              if (policyViolations.length > 0) {
                return throwError({
                  type: 'criticalPolicyViolations',
                  policyViolations,
                  etxn
                });
              } else {
                return policyViolations$;
              }
            }),
            map((policyViolations: any) =>
              [this.policyService.getPolicyRules(policyViolations),
                policyViolations &&
                policyViolations.transaction_desired_state &&
                policyViolations.transaction_desired_state.action_description]),
            switchMap(([policyViolations, policyActionDescription]) => {
              if (policyViolations.length > 0) {
                return throwError({
                  type: 'policyViolations',
                  policyViolations,
                  policyActionDescription,
                  etxn
                });
              } else {
                return of({etxn});
              }
            })
          );
        }),
        catchError(err => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
              map(etxn => ({ etxn }))
            );
          }
          if (err.type === 'criticalPolicyViolations') {
            return from(this.continueWithCriticalPolicyViolation(err.policyViolations)).pipe(
              switchMap((continueWithTransaction) => {
                if (continueWithTransaction) {
                  return from(this.loaderService.showLoader()).pipe(
                    switchMap(() => {
                      return of({etxn: err.etxn});
                    })
                  );
                } else {
                  return throwError('unhandledError');
                }
              })
            );
          } else if (err.type === 'policyViolations') {
            return from(this.continueWithPolicyViolations(err.policyViolations, err.policyActionDescription)).pipe(
              switchMap((continueWithTransaction) => {
                if (continueWithTransaction) {
                  return from(this.loaderService.showLoader()).pipe(
                    switchMap(() => {
                      return of({etxn: err.etxn, comment: continueWithTransaction.comment});
                    })
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
        switchMap(({etxn, comment}: any) => {
          return this.etxn$.pipe(
            switchMap((txnCopy) => {
              if (!isEqual(etxn.tx, txnCopy)) {
                // only if the form is edited
                this.trackingService.editExpense({
                  Asset: 'Mobile',
                  Type: 'Per Diem',
                  Amount: etxn.tx.amount,
                  Currency: etxn.tx.currency,
                  Category: etxn.tx.org_category,
                  Time_Spent: this.getTimeSpentOnPage() + ' secs',
                  Used_Autofilled_Project: (etxn.tx.project_id && this.presetProjectId && (etxn.tx.project_id === this.presetProjectId)),
                  Used_Autofilled_CostCenter: (etxn.tx.cost_center_id && this.presetCostCenterId && (etxn.tx.cost_center_id === this.presetCostCenterId))
                });
              } else {
                // tracking expense closed without editing
                this.trackingService.viewExpense({Asset: 'Mobile', Type: 'Per Diem'});
              }

              return this.transactionService.upsert(etxn.tx).pipe(
                switchMap((txn) => {
                  return this.transactionService.getETxn(txn.id);
                }),
                map(savedEtxn => savedEtxn && savedEtxn.tx),
                switchMap((tx) => {
                  const selectedReportId = this.fg.value.report && this.fg.value.report.rp && this.fg.value.report.rp.id;
                  const criticalPolicyViolated = isNumber(etxn.tx_policy_amount) && (etxn.tx_policy_amount < 0.0001);
                  if (!criticalPolicyViolated) {
                    if (!txnCopy.tx.report_id && selectedReportId) {
                      return this.reportService.addTransactions(selectedReportId, [tx.id]).pipe(
                        tap(() => this.trackingService.addToExistingReportAddEditExpense({Asset: 'Mobile'})),
                        map(() => tx)
                      );
                    }

                    if (txnCopy.tx.report_id && selectedReportId && selectedReportId !== txnCopy.tx.report_id) {
                      return this.reportService.removeTransaction(txnCopy.tx.report_id, tx.id).pipe(
                        switchMap(() => this.reportService.addTransactions(selectedReportId, [tx.id])),
                        tap(() => this.trackingService.addToExistingReportAddEditExpense({Asset: 'Mobile'})),
                        map(() => tx)
                      );
                    }

                    if (txnCopy.tx.report_id && !selectedReportId) {
                      return this.reportService.removeTransaction(txnCopy.tx.report_id, tx.id).pipe(
                        tap(() => this.trackingService.removeFromExistingReportEditExpense({Asset: 'Mobile'})),
                        map(() => tx)
                      );
                    }
                  }


                  return of(null).pipe(map(() => tx));

                }),
                switchMap(tx => {
                  const criticalPolicyViolated = isNumber(etxn.tx_policy_amount) && (etxn.tx_policy_amount < 0.0001);
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
                      return this.statusService.post('transactions', txn.id, {comment}, true).pipe(
                        map(() => txn)
                      );
                    } else {
                      return of(txn);
                    }
                  })
                );
              } else {
                return of(txn);
              }
            }),
          );
        }),
        finalize(() => {
          this.savePerDiemLoader = false;
          this.saveAndNextPerDiemLoader = false;
        })
      );
  }

  addToNewReport(txnId: string) {
    const that = this;
    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.transactionService.getEtxn(txnId);
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(etxn => {
      const criticalPolicyViolated = isNumber(etxn.tx_policy_amount) && (etxn.tx_policy_amount < 0.0001);
      if (!criticalPolicyViolated) {
        that.router.navigate(['/', 'enterprise', 'my_create_report', {txn_ids: JSON.stringify([txnId])}]);
      } else {
        that.goBack();
      }
    });
  }

  savePerDiem() {
    const that = this;

    that.checkIfInvalidPaymentMode().pipe(
      take(1)
    ).subscribe(invalidPaymentMode => {
      if (that.fg.valid && !invalidPaymentMode) {
        if (that.mode === 'add') {
          that.addExpense('SAVE_PER_DIEM').subscribe((res: any) => {
            if (that.fg.controls.add_to_new_report.value && res && res.transaction) {
              this.addToNewReport(res.transaction.id);
            } else {
              that.goBack();
            }
          });
        } else {
          that.editExpense('SAVE_PER_DIEM').subscribe((res) => {
            if (that.fg.controls.add_to_new_report.value && res && res.id) {
              this.addToNewReport(res.id);
            } else {
              that.goBack();
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
              behavior: 'smooth'
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
    await this.router.navigateByUrl('/enterprise/my_expenses', {skipLocationChange: true});
    await this.router.navigate(['/', 'enterprise', 'add_edit_per_diem']);
  }

  saveAndNewExpense() {
    const that = this;

    that.checkIfInvalidPaymentMode().pipe(
      take(1)
    ).subscribe(invalidPaymentMode => {
      if (that.fg.valid && !invalidPaymentMode) {
        if (that.mode === 'add') {
          that.addExpense('SAVE_AND_NEW_PER_DIEM').subscribe(() => {
            this.reloadCurrentRoute();
          });
        } else {
          // to do edit
          that.editExpense('SAVE_AND_NEW_PER_DIEM').subscribe(() => {
            that.goBack();
          });
        }
      } else {
        that.fg.markAllAsTouched();
        const formContainer = that.formContainer.nativeElement as HTMLElement;
        if (formContainer) {
          const invalidElement = formContainer.querySelector('.ng-invalid');
          if (invalidElement) {
            invalidElement.scrollIntoView({
              behavior: 'smooth'
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

  saveExpenseAndGotoNext() {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense('SAVE_AND_NEXT_PERDIEM').subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.close();
          } else {
            that.goToNext();
          }
        });
      } else {
        // to do edit
        that.editExpense('SAVE_AND_NEXT_PERDIEM').subscribe(() => {
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
            behavior: 'smooth'
          });
        }
      }
    }
  }

  close() {
    this.router.navigate(['/', 'enterprise', 'my_expenses']);
  }

  // getFormValidationErrors() {
  //   Object.keys(this.fg.controls).forEach(key => {

  //     const controlErrors: ValidationErrors = this.fg.get(key).errors;
  //     if (controlErrors != null) {
  //       Object.keys(controlErrors).forEach(keyError => {
  //         console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
  //       });
  //     }
  //   });
  // }

  async deleteExpense() {
    const id = this.activatedRoute.snapshot.params.id;

    const popupResult = await this.popupService.showPopup({
      header: 'Confirm',
      message: 'Are you sure you want to delete this Expense?',
      primaryCta: {
        text: 'Delete Expense'
      }
    });

    if (popupResult === 'primary') {
      from(this.loaderService.showLoader('Deleting Expense...')).pipe(
        switchMap(() => {
          return this.transactionService.delete(id);
        }),
        tap(() => this.trackingService.deleteExpense({Asset: 'Mobile', Type: 'Per Diem'})),
        finalize(() => from(this.loaderService.hideLoader()))
      ).subscribe(() => {
        if (this.reviewList && this.reviewList.length && +this.activeIndex < this.reviewList.length - 1) {
          this.reviewList.splice(+this.activeIndex, 1);
          this.transactionService.getETxn(this.reviewList[+this.activeIndex]).subscribe(etxn => {
            this.goToTransaction(etxn, this.reviewList, +this.activeIndex);
          });
        } else {
          this.router.navigate(['/', 'enterprise', 'my_expenses']);
        }
      });
    } else {
      if (this.mode === 'add') {
        this.trackingService.clickDeleteExpense({Asset: 'Mobile', Type: 'Per Diem'});
      }
    }
  }

  scrollCommentsIntoView() {
    if (this.commentsContainer) {
      const commentsContainer = this.commentsContainer.nativeElement as HTMLElement;
      if (commentsContainer) {
        commentsContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    }
  }

  getFormValidationErrors() {
    Object.keys(this.fg.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.fg.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
        });
      }
    });
  }
}

