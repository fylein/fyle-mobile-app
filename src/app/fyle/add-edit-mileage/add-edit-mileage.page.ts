import { Component, OnInit, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import { OfflineService } from 'src/app/core/services/offline.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from, forkJoin, iif, of, combineLatest, Observable, throwError, concat } from 'rxjs';
import { switchMap, finalize, map, filter, distinctUntilChanged, take, startWith, shareReplay, tap, concatMap, catchError, debounceTime } from 'rxjs/operators';
import { isEqual, isNumber, cloneDeep } from 'lodash';
import * as moment from 'moment';
import { TransactionFieldConfigurationsService } from 'src/app/core/services/transaction-field-configurations.service';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MileageService } from 'src/app/core/services/mileage.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { StatusService } from 'src/app/core/services/status.service';
import { DataTransformService } from 'src/app/core/services/data-transform.service';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { CriticalPolicyViolationComponent } from './critical-policy-violation/critical-policy-violation.component';
import { PolicyViolationComponent } from './policy-violation/policy-violation.component';
import { DuplicateDetectionService } from 'src/app/core/services/duplicate-detection.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { DateService } from 'src/app/core/services/date.service';
import {TrackingService} from '../../core/services/tracking.service';

@Component({
  selector: 'app-add-edit-mileage',
  templateUrl: './add-edit-mileage.page.html',
  styleUrls: ['./add-edit-mileage.page.scss'],
})
export class AddEditMileagePage implements OnInit {

  mode = 'add';
  title = 'edit';
  activeIndex: number;
  minDate: string;
  maxDate: string;
  reviewList: [];
  fg: FormGroup;
  txnFields$: Observable<any>;
  paymentModes$: Observable<any>;
  homeCurrency$: Observable<any>;
  subCategories$: Observable<any>;
  filteredCategories$: Observable<any>;
  transactionMandatoyFields$: Observable<any>;
  etxn$: Observable<any>;
  isIndividualProjectsEnabled$: Observable<boolean>;
  individualProjectIds$: Observable<string[]>;
  isProjectsEnabled$: Observable<boolean>;
  customInputs$: Observable<any>;
  costCenters$: Observable<any>;
  reports$: Observable<any>;
  isAmountCapped$: Observable<boolean>;
  isAmountDisabled$: Observable<boolean>;
  isCriticalPolicyViolated$: Observable<boolean>;
  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;
  amount$: Observable<number>;
  mileageConfig$: Observable<any>;
  rate$: Observable<number>;
  projectCategoryIds$: Observable<string[]>;
  duplicates$: Observable<any>;
  duplicateBoxOpen = false;
  isConnected$: Observable<boolean>;
  pointToDuplicates = false;
  isAdvancesEnabled$: Observable<boolean>;
  comments$: Observable<any>;
  expenseStartTime;
  navigateBack = false;

  @ViewChild('duplicateInputContainer') duplicateInputContainer: ElementRef;
  @ViewChild('formContainer') formContainer: ElementRef;
  @ViewChild('comments') commentsContainer: ElementRef;

  formInitializedFlag = false;
  invalidPaymentMode = false;

  duplicateDetectionReasons = [
    { label: 'Different expense', value: 'Different expense' },
    { label: 'Other', value: 'Other' }
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private offlineService: OfflineService,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private transactionFieldConfigurationService: TransactionFieldConfigurationsService,
    private accountsService: AccountsService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private reportService: ReportService,
    private fb: FormBuilder,
    private projectService: ProjectsService,
    private mileageService: MileageService,
    private transactionsOutboxService: TransactionsOutboxService,
    private policyService: PolicyService,
    private statusService: StatusService,
    private dataTransformService: DataTransformService,
    private duplicateDetectionService: DuplicateDetectionService,
    private modalController: ModalController,
    private networkService: NetworkService,
    private popupService: PopupService,
    private navController: NavController,
    private dateService: DateService,
    private trackingService: TrackingService
  ) { }

  ngOnInit() {
  }



  get mileage_locations() {
    return this.fg.controls.mileage_locations as FormArray;
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
      message: 'To edit this activity expense, you need to login to web version of Fyle app at <a href=""https://in1.fylehq.com>https://in1.fylehq.com</a>',
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

  getCalculateDistance() {
    return this.mileageService.getDistance(this.fg.controls.mileage_locations.value).pipe(
      switchMap((distance) => {
        return this.etxn$.pipe(map(etxn => {
          const distanceInKm = distance / 1000;
          const finalDistance = (etxn.tx.distance_unit === 'MILES') ? (distanceInKm * 0.6213) : distanceInKm;
          return finalDistance;
        }));
      }),
      map(finalDistance => {
        if (this.fg.value.round_trip) {
          return (finalDistance * 2).toFixed(2);
        } else {
          return (finalDistance).toFixed(2);
        }
      }),
      shareReplay(1)
    );
  }

  canGetDuplicates() {
    return this.offlineService.getOrgSettings().pipe(
      map(orgSettings => {
        const isAmountCurrencyTxnDtPresent =
          this.fg.value.distance && !!this.fg.value.dateOfSpend && (this.fg.value.mileage_locations && this.fg.value.mileage_locations.filter(l => !!l).length);
        return this.fg.valid && orgSettings.policies.duplicate_detection_enabled && isAmountCurrencyTxnDtPresent;
      })
    );
  }

  checkForDuplicates() {
    return this.canGetDuplicates().pipe(
      switchMap((canGetDuplicates) => {
        const customFields$ = this.getCustomFields();
        return iif(
          () => canGetDuplicates,
          this.generateEtxnFromFg(this.etxn$, customFields$, this.getCalculateDistance()).pipe(
            switchMap(etxn => this.duplicateDetectionService.getPossibleDuplicates(etxn.tx))
          ),
          of(null)
        );
      })
    );
  }

  getDuplicates() {
    return this.etxn$.pipe(
      switchMap(etxn => {
        return this.duplicateDetectionService.getDuplicates(etxn.tx.id);
      })
    );
  }

  getPossibleDuplicates() {
    const currentTxn$ = this.generateEtxnFromFg(this.etxn$, this.getCustomFields(), this.getCalculateDistance());
    const isSameTxn$ = forkJoin({
      oldTxn: this.etxn$,
      currentTxn: currentTxn$
    }).pipe(
      map(({ oldTxn, currentTxn }) => {
        const oldTxnClone = cloneDeep(oldTxn);
        const currentTxnClone = cloneDeep(currentTxn);
        // safe hack - can clean off later on
        oldTxnClone.tx.custom_properties = null;
        currentTxnClone.tx.custom_properties = null;
        oldTxnClone.tx.locations = null;
        currentTxnClone.tx.locations = null;
        oldTxnClone.tx.txn_dt = oldTxnClone.tx.txn_dt && moment(oldTxnClone.tx.txn_dt).format('y-MM-DD');
        currentTxnClone.tx.txn_dt = currentTxnClone.tx.txn_dt && moment(currentTxnClone.tx.txn_dt).format('y-MM-DD');

        return isEqual(oldTxnClone.tx, currentTxnClone.tx);
      })
    );

    // TODO: Verify with policy team - getDuplicates never executes in old mobile app
    // return isSameTxn$.pipe(
    //   switchMap((isSameTxn) => {
    //     return iif(() => isSameTxn, this.getDuplicates(), this.checkForDuplicates());
    //   })
    // );

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

  setupFilteredCategories(activeCategories$: Observable<any>) {
    this.filteredCategories$ = this.fg.controls.project.valueChanges.pipe(
      startWith(this.fg.controls.project.value),
      concatMap(project => {
        return activeCategories$.pipe(
          map(activeCategories =>
            this.projectService.getAllowedOrgCategoryIds(project, activeCategories)));
      }),
      map(categories => categories.map(category => ({ label: category.sub_category, value: category }))));

    this.filteredCategories$.subscribe(categories => {
      if (this.fg.value.sub_category
        && this.fg.value.sub_category.id
        && !categories.some(category => this.fg.value.sub_category && this.fg.value.sub_category.id === category.value.id)) {
        this.fg.controls.sub_category.reset();
      }
    });
  }

  getProjectCategoryIds(): Observable<string[]> {
    return this.offlineService.getAllCategories().pipe(
      map((categories) => {

        const mileageCategories = categories
          .filter(category => category.enabled)
          .filter((category) => ['Mileage'].indexOf(category.fyle_category) > -1)
          .map(category => category.id as string);

        return mileageCategories;
      })
    );
  }

  getMileageCategories() {
    return this.offlineService.getAllCategories().pipe(
      map((categories) => {
        const orgCategoryName = 'mileage';

        const defaultMileageCategory = categories.find(category => category.name.toLowerCase() === orgCategoryName.toLowerCase());

        const mileageCategories = categories
          .filter(category => category.enabled)
          .filter((category) => ['Mileage'].indexOf(category.fyle_category) > -1);

        return {
          defaultMileageCategory,
          mileageCategories
        };
      })
    );
  }

  getTransactionFields() {
    return this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) => {
        return forkJoin({
          tfcMap: this.offlineService.getTransactionFieldConfigurationsMap(),
          mileageCategoriesContainer: this.getMileageCategories()
        }).pipe(
          switchMap(({ tfcMap, mileageCategoriesContainer }) => {
            // skipped distance unit, location 1 and location 2 - confirm that these are not used at all
            const fields = ['purpose', 'txn_dt', 'cost_center_id', 'distance'];

            return this.transactionFieldConfigurationService
              .filterByOrgCategoryIdProjectId(
                tfcMap, fields, formValue.sub_category || mileageCategoriesContainer.defaultMileageCategory, formValue.project
              );
          })
        );
      }),
      map((tfcMap: any) => {
        if (tfcMap) {
          for (const tfc of Object.keys(tfcMap)) {
            if (tfcMap[tfc].values && tfcMap[tfc].values.length > 0) {
              tfcMap[tfc].values = tfcMap[tfc].values.map(value => ({ label: value, value }));
            }
          }
        }

        return tfcMap;
      }),
      shareReplay(1)
    );
  }

  setupTfcDefaultValues() {
    const tfcValues$ = this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) => {
        return forkJoin({
          tfcMap: this.offlineService.getTransactionFieldConfigurationsMap(),
          mileageCategoriesContainer: this.getMileageCategories()
        }).pipe(
          switchMap(({ tfcMap, mileageCategoriesContainer }) => {
            const fields = ['purpose', 'txn_dt', 'cost_center_id', 'distance'];
            return this.transactionFieldConfigurationService
              .filterByOrgCategoryIdProjectId(
                tfcMap, fields, formValue.sub_category || mileageCategoriesContainer.defaultMileageCategory, formValue.project
              );
          })
        );
      }),
      map(tfc => this.transactionFieldConfigurationService.getDefaultTxnFieldValues(tfc))
    );

    tfcValues$.subscribe(defaultValues => {
      const keyToControlMap: { [id: string]: AbstractControl; } = {
        purpose: this.fg.controls.purpose,
        cost_center_id: this.fg.controls.costCenter,
        txn_dt: this.fg.controls.dateOfSpend,
        distance: this.fg.controls.distance
      };

      for (const defaultValueColumn in defaultValues) {
        if (defaultValues.hasOwnProperty(defaultValueColumn)) {
          const control = keyToControlMap[defaultValueColumn];
          if (!control.value && !control.touched) {
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
      map(({ accounts, orgSettings }) => {
        const isAdvanceEnabled = (orgSettings.advances && orgSettings.advances.enabled) ||
          (orgSettings.advance_requests && orgSettings.advance_requests.enabled);
        const isMultipleAdvanceEnabled = orgSettings && orgSettings.advance_account_settings &&
          orgSettings.advance_account_settings.multiple_accounts;
        const userAccounts = this.accountsService
          .filterAccountsWithSufficientBalance(accounts.filter(account => account.acc.type), isAdvanceEnabled)
          .filter(userAccount => ['PERSONAL_ACCOUNT', 'PERSONAL_ADVANCE_ACCOUNT'].includes(userAccount.acc.type));

        return this.accountsService.constructPaymentModes(userAccounts, isMultipleAdvanceEnabled);
      }),
      map(paymentModes => paymentModes.map((paymentMode: any) => ({ label: paymentMode.acc.displayName, value: paymentMode })))
    );
  }

  getSubCategories() {
    return this.offlineService.getAllCategories().pipe(
      map(categories => {
        const parentCategoryName = 'mileage';
        return categories
          .filter((orgCategory) => (parentCategoryName.toLowerCase() === orgCategory.name.toLowerCase())
            && (parentCategoryName.toLowerCase() !== orgCategory.sub_category.toLowerCase()))
          .filter(category => category.enabled);
      }),
      shareReplay(1)
    );
  }

  getCustomInputs() {
    let initialFetch = true;
    return this.fg.controls.sub_category.valueChanges
      .pipe(
        startWith({}),
        switchMap((category) => {
          let selectedCategory$;
          if (initialFetch) {
            selectedCategory$ = this.etxn$.pipe(
              switchMap(etxn => {
                return iif(() => etxn.tx.org_category_id,
                  this.offlineService.getAllCategories().pipe(
                    map(categories => categories
                      .find(category => category.id === etxn.tx.org_category_id))), of(null));
              }));
            initialFetch = false;
          } else {
            selectedCategory$ = of(category);
          }

          if (this.mode === 'add') {
            if (category) {
              return of(category);
            } else {
              return this.getMileageCategories().pipe(
                map(mileageContainer => mileageContainer.defaultMileageCategory)
              );
            }
          } else {
            return selectedCategory$;
          }
        }),
        tap(console.log),
        switchMap((category) => {
          const formValue = this.fg.value;
          return this.offlineService.getCustomInputs().pipe(
            map(customFields => {

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
              customField.options = customField.options.map(option => ({ label: option, value: option }));
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
                      customField.value,
                      isConnected && customField.type !== 'BOOLEAN' && customField.type !== 'USER_LIST' && customField.mandatory && Validators.required
                    ]
                  })
                );
              }
              customFieldsFormArray.updateValueAndValidity();
              return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
            })
          );
        }),
        shareReplay(1)
      );
  }

  getNewExpense() {
    const defaultVehicle$ = forkJoin({
      vehicleType: this.transactionService.getDefaultVehicleType(),
      orgUserMileageSettings: this.offlineService.getOrgUserMileageSettings(),
      orgSettings: this.offlineService.getOrgSettings()
    }).pipe(
      map(
        ({ vehicleType, orgUserMileageSettings, orgSettings }) => {
          if (orgUserMileageSettings.length > 0) {
            const isVehicleTypePresent = orgUserMileageSettings.indexOf(vehicleType);

            if (isVehicleTypePresent === -1) {
              vehicleType = orgUserMileageSettings[0];
            }
          } else if (!vehicleType) {

            ['two_wheeler', 'four_wheeler', 'four_wheeler1'].some((vType) => {
              if (orgSettings.mileage[vType]) {
                vehicleType = vType;
                return true;
              }
            });

          }

          return vehicleType as string;
        }
      )
    );

    const defaultMileage$ = forkJoin({
      defaultVehicle: defaultVehicle$,
      orgSettings: this.offlineService.getOrgSettings()
    }).pipe(
      map(({ defaultVehicle, orgSettings }) => {
        return orgSettings.mileage[defaultVehicle];
      })
    );

    return forkJoin({
      mileageContainer: this.getMileageCategories(),
      homeCurrency: this.homeCurrency$,
      orgSettings: this.offlineService.getOrgSettings(),
      defaultVehicleType: defaultVehicle$,
      defaultMileageRate: defaultMileage$,
      currentEou: this.authService.getEou()
    }).pipe(
      map(({ mileageContainer, homeCurrency, orgSettings, defaultVehicleType, defaultMileageRate, currentEou }) => {
        const distanceUnit = orgSettings.mileage.unit;
        return {
          tx: {
            billable: false,
            skip_reimbursement: false,
            source: 'MOBILE',
            state: 'COMPLETE',
            txn_dt: new Date(),
            org_category_id: mileageContainer.defaultMileageCategory && mileageContainer.defaultMileageCategory.id,
            org_category: mileageContainer.defaultMileageCategory && mileageContainer.defaultMileageCategory.name,
            sub_category: mileageContainer.defaultMileageCategory && mileageContainer.defaultMileageCategory.sub_category,
            currency: homeCurrency,
            amount: 0,
            distance: null,
            mileage_calculated_amount: null,
            mileage_calculated_distance: null,
            policy_amount: null,
            mileage_vehicle_type: defaultVehicleType,
            mileage_rate: defaultMileageRate,
            distance_unit: distanceUnit,
            mileage_is_round_trip: false,
            fyle_category: 'Mileage',
            org_user_id: currentEou.ou.id,
            locations: [
              null,
              null
            ],
            custom_properties: []
          }
        };
      }),
      shareReplay(1)
    );
  }

  getEditExpense() {
    return this.transactionService.getETxn(this.activatedRoute.snapshot.params.id).pipe(
      shareReplay(1)
    );
  }

  customDateValidator(control: AbstractControl) {
    const today = new Date();
    const minDate = moment(new Date('Jan 1, 2001'));
    const maxDate = moment(new Date(today)).add(1, 'day');
    const passedInDate = control.value && moment(new Date(control.value));
    if (passedInDate) {
      return passedInDate.isBetween(minDate, maxDate) ? null : {
        invalidDateSelection: true
      };
    }
  }

  ionViewWillEnter() {
    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back;
    this.expenseStartTime = new Date().getTime();
    this.fg = this.fb.group({
      mileage_vehicle_type: [],
      dateOfSpend: [, this.customDateValidator],
      mileage_locations: new FormArray([]),
      distance: [, Validators.required],
      round_trip: [],
      paymentMode: [, Validators.required],
      purpose: [],
      project: [],
      billable: [],
      sub_category: [, Validators.required],
      custom_inputs: new FormArray([]),
      costCenter: [],
      add_to_new_report: [],
      report: [],
      duplicate_detection_reason: []
    });

    const today = new Date();
    this.maxDate = moment(this.dateService.addDaysToDate(today, 1)).format('y-MM-D');


    this.fg.controls.round_trip.valueChanges.subscribe(roundTrip => {
      if (this.formInitializedFlag) {
        if (this.fg.value.distance) {
          if (roundTrip) {
            this.fg.controls.distance.setValue((+this.fg.value.distance * 2).toFixed(2));
          } else {
            this.fg.controls.distance.setValue((+this.fg.value.distance / 2).toFixed(2));
          }
        }
      }
    });

    this.setupDuplicateDetection();

    this.fg.reset();
    this.title = 'Add Mileage';

    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;
    this.reviewList = this.activatedRoute.snapshot.params.txnIds && JSON.parse(this.activatedRoute.snapshot.params.txnIds);

    this.title = this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    if (this.activatedRoute.snapshot.params.id) {
      this.mode = 'edit';
    }

    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();

    this.isAdvancesEnabled$ = orgSettings$.pipe(map(orgSettings => {
      return (orgSettings.advances && orgSettings.advances.enabled) ||
      (orgSettings.advance_requests && orgSettings.advance_requests.enabled);
    }));

    this.setupNetworkWatcher();

    this.txnFields$ = this.getTransactionFields();
    this.paymentModes$ = this.getPaymentModes();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    this.subCategories$ = this.getSubCategories();
    this.setupFilteredCategories(this.subCategories$);
    this.projectCategoryIds$ = this.getProjectCategoryIds();
    this.comments$ = this.statusService.find('transactions', this.activatedRoute.snapshot.params.id);

    this.filteredCategories$.subscribe(subCategories => {
      if (subCategories.length) {
        this.fg.controls.sub_category.setValidators(Validators.required);
      } else {
        this.fg.controls.sub_category.clearValidators();
      }
      this.fg.controls.sub_category.updateValueAndValidity();
    });

    this.mileageConfig$ = this.offlineService.getOrgSettings().pipe(
      map(orgSettings => orgSettings.mileage)
    );

    this.etxn$ = iif(() => this.mode === 'add', this.getNewExpense(), this.getEditExpense());

    this.fg.controls.mileage_locations.valueChanges.pipe(
      switchMap((locations) => {
        return this.mileageService.getDistance(locations);
      }),
      switchMap((distance) => {
        return this.etxn$.pipe(map(etxn => {
          const distanceInKm = distance / 1000;
          const finalDistance = (etxn.tx.distance_unit === 'MILES') ? (distanceInKm * 0.6213) : distanceInKm;
          return finalDistance;
        }));
      })
    ).subscribe(finalDistance => {
      if (this.formInitializedFlag) {
        if (finalDistance === 0) {
          this.fg.controls.distance.setValue(finalDistance);
        } else {
          if (this.fg.value.round_trip) {
            this.fg.controls.distance.setValue((finalDistance * 2).toFixed(2));
          } else {
            this.fg.controls.distance.setValue(finalDistance.toFixed(2));
          }
        }
      }
    });

    this.isAmountDisabled$ = this.etxn$.pipe(
      map(
        etxn => !!etxn.tx.admin_amount
      )
    );

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects)
    );

    this.individualProjectIds$ = orgUserSettings$.pipe(
      map((orgUserSettings: any) => orgUserSettings.project_ids || [])
    );

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.projects && orgSettings.projects.enabled)
    );

    this.customInputs$ = this.getCustomInputs();

    this.transactionMandatoyFields$ = this.isConnected$.pipe(
      filter(isConnected => !!isConnected),
      switchMap(() => {
        return this.offlineService.getOrgSettings();
      }),
      map(orgSettings => orgSettings.transaction_fields_settings.transaction_mandatory_fields || {})
    );

    this.transactionMandatoyFields$
      .pipe(
        filter(transactionMandatoyFields => !isEqual(transactionMandatoyFields, {})),
        switchMap((transactionMandatoyFields) => {
          return forkJoin({
            individualProjectIds: this.individualProjectIds$,
            isIndividualProjectsEnabled: this.isIndividualProjectsEnabled$
          }).pipe(map(({individualProjectIds, isIndividualProjectsEnabled}) => {
            return {
              transactionMandatoyFields,
              individualProjectIds,
              isIndividualProjectsEnabled
            };
          }));
        })
      )
      .subscribe(({transactionMandatoyFields, individualProjectIds, isIndividualProjectsEnabled}) => {
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
      });

    this.costCenters$ = forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$
    }).pipe(
      switchMap(({ orgSettings, orgUserSettings }) => {
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

    this.reports$ = this.reportService.getFilteredPendingReports({ state: 'edit' }).pipe(
      map(reports => reports.map(report => ({ label: report.rp.purpose, value: report })))
    );

    this.txnFields$.pipe(
      distinctUntilChanged((a, b) => isEqual(a, b)),
      switchMap(txnFields => {
        return this.isConnected$.pipe(
          take(1),
          map(isConnected => ({
            isConnected,
            txnFields
          }))
        );
      })
    ).subscribe(({ isConnected, txnFields }) => {
      const keyToControlMap: { [id: string]: AbstractControl; } = {
        purpose: this.fg.controls.purpose,
        cost_center_id: this.fg.controls.costCenter,
        txn_dt: this.fg.controls.dateOfSpend,
        distance: this.fg.controls.distance
      };

      for (const control of Object.values(keyToControlMap)) {
        control.clearValidators();
        control.updateValueAndValidity();
      }

      for (const txnFieldKey of Object.keys(txnFields)) {
        const control = keyToControlMap[txnFieldKey];

        if (txnFields[txnFieldKey].mandatory) {
          if (txnFieldKey === 'txn_dt') {
            control.setValidators(isConnected ? Validators.compose([Validators.required, this.customDateValidator]) : null);
          } else {
            control.setValidators(isConnected ? Validators.required : null);
          }
        }
        control.updateValueAndValidity();
      }

      this.fg.updateValueAndValidity();
    });

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

    this.isBalanceAvailableInAnyAdvanceAccount$ = this.fg.controls.paymentMode.valueChanges.pipe(
      switchMap((paymentMode) => {
        if (paymentMode && paymentMode.acc && paymentMode.acc.type === 'PERSONAL_ACCOUNT') {
          return this.offlineService.getAccounts().pipe(
            map(accounts => {
              return accounts.filter(account => account && account.acc && account.acc.type === 'PERSONAL_ADVANCE_ACCOUNT' && account.acc.tentative_balance_amount > 0).length > 0 ;
            })
          );
        }
        return of(false);
      })
    );

    this.rate$ = iif(() => this.mode === 'edit',
      // this.etxn$.pipe(
      //   map(etxn => etxn.tx.mileage_rate)
      // )
      this.fg.valueChanges.pipe(
        map(formValue => formValue.mileage_vehicle_type),
        switchMap((vehicleType) => {
          return forkJoin({
            orgSettings: this.offlineService.getOrgSettings(),
            etxn: this.etxn$
          }).pipe(
            map(({ orgSettings, etxn }) => {
              if (etxn.tx.mileage_rate && etxn.tx.mileage_vehicle_type === vehicleType) {
                return etxn.tx.mileage_rate;
              } else {
                return orgSettings.mileage[vehicleType];
              }
            })
          );
        })
      )
      ,
      this.fg.valueChanges.pipe(
        map(formValue => formValue.mileage_vehicle_type),
        switchMap((vehicleType) => {
          return this.offlineService.getOrgSettings().pipe(
            map(orgSettings => {
              return orgSettings.mileage[vehicleType];
            })
          );
        })
      )
    );

    this.amount$ = combineLatest(
      this.fg.valueChanges,
      this.rate$
    ).pipe(
      map(([formValue, mileageRate]) => {
        const distance = formValue.distance || 0;
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

    const selectedSubCategory$ = this.etxn$.pipe(
      switchMap(etxn => {
        return iif(() => etxn.tx.org_category_id,
          this.offlineService.getAllCategories().pipe(
            map(subCategories => subCategories
              .filter(subCategory => subCategory.sub_category.toLowerCase() !== subCategory.name.toLowerCase())
              .find(subCategory => subCategory.id === etxn.tx.org_category_id)
            )
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
          this.txnFields$,
          selectedReport$,
          selectedCostCenter$,
          selectedCustomInputs$,
          this.mileageConfig$,
          defaultPaymentMode$
        ]);
      }),
      take(1),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(([etxn, paymentMode, project, subCategory, txnFields, report, costCenter, customInputs, mileageConfig, defaultPaymentMode]) => {
      const customInputValues = customInputs
        .map(customInput => {
          const cpor = etxn.tx.custom_properties && etxn.tx.custom_properties.find(customProp => customProp.name === customInput.name);
          return {
            name: customInput.name,
            value: (cpor && cpor.value) || null
          };
        });

      this.fg.patchValue({
        mileage_vehicle_type: etxn.tx.mileage_vehicle_type,
        dateOfSpend: etxn.tx.txn_dt && moment(etxn.tx.txn_dt).format('y-MM-DD'),
        distance: etxn.tx.distance,
        round_trip: etxn.tx.mileage_is_round_trip,
        paymentMode: paymentMode || defaultPaymentMode,
        purpose: etxn.tx.purpose,
        project,
        billable: etxn.tx.billable,
        sub_category: subCategory,
        costCenter,
        duplicate_detection_reason: etxn.tx.user_reason_for_duplicate_expenses,
        report
      });

      if (etxn.tx.locations) {
        etxn.tx.locations.forEach(location => {
          this.mileage_locations.push(new FormControl(location, mileageConfig.location_mandatory && Validators.required));
        });
      }

      setTimeout(() => {
        this.fg.controls.custom_inputs.setValue(customInputValues);
        this.formInitializedFlag = true;
      }, 1000);
    });
  }

  addMileageLocation() {
    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.mileageConfig$;
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(mileageConfig => {
      this.mileage_locations.push(
        new FormControl(null, mileageConfig.location_mandatory && Validators.required)
      );
    });
  }

  removeMileageLocation(index: number) {
    this.mileage_locations.removeAt(index);
  }

  async goBack() {
    if (this.fg.touched) {
      const popupResults = await this.popupService.showPopup({
        header: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure, you want to abandon this expense?',
        primaryCta: {
          text: 'Discard Changes'
        }
      });

      if (popupResults === 'primary') {
        this.close();
      }
    } else {
      if (this.activatedRoute.snapshot.params.id) {
        this.trackingService.viewExpense({Asset: 'Mobile', Type: 'Mileage'});
      }
      this.close();
    }
  }

  close() {
    if (this.mode === 'add') {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    } else {
      if (!this.reviewList || this.reviewList.length === 0) {
        this.navController.back();
      } else if (this.reviewList && this.activeIndex < this.reviewList.length) {
        if (+this.activeIndex === 0) {
          this.router.navigate(['/', 'enterprise', 'my_expenses']);
        } else {
          this.goToPrev();
        }
      } else {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    }
  }

  checkIfInvalidPaymentMode() {
    return forkJoin({
      amount: this.amount$.pipe(take(1)),
      etxn: this.etxn$
    }).pipe(
      map(({ etxn, amount }) => {
        const paymentAccount = this.fg.value.paymentMode;
        const originalSourceAccountId = etxn && etxn.tx && etxn.tx.source_account_id;
        let isPaymentModeInvalid = false;
        if (paymentAccount && paymentAccount.acc && paymentAccount.acc.type === 'PERSONAL_ADVANCE_ACCOUNT') {
          if (paymentAccount.acc.id !== originalSourceAccountId) {
            isPaymentModeInvalid = paymentAccount.acc.tentative_balance_amount < amount;
          } else {
            isPaymentModeInvalid = (paymentAccount.acc.tentative_balance_amount + etxn.tx.amount) < amount;
          }
        }
        return isPaymentModeInvalid;
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
        that.router.navigate(['/', 'enterprise' , 'my_create_report' , { txn_ids: JSON.stringify([txnId]) }]);
      } else {
        that.close();
      }
    });
  }

  saveExpense() {
    const that = this;

    that.checkIfInvalidPaymentMode().pipe(
      take(1)
    ).subscribe(invalidPaymentMode => {
      if (that.fg.valid && !invalidPaymentMode) {
        if (that.mode === 'add') {
          that.addExpense().subscribe((etxn) => {
            if (that.fg.controls.add_to_new_report.value && etxn && etxn.tx && etxn.tx.id ) {
              this.addToNewReport(etxn.tx.id);
            } else {
              that.close();
            }
          });
        } else {
          // to do edit
          that.editExpense().subscribe((tx) => {
            if (that.fg.controls.add_to_new_report.value && tx && tx.id ) {
              this.addToNewReport(tx.id);
            } else {
              that.close();
            }
          });
        }
      } else {
        that.fg.markAllAsTouched();
        const formContainer = that.formContainer.nativeElement as HTMLElement;
        if (formContainer) {
          const invalidElement = formContainer.querySelector('.ng-invalid');
          invalidElement.scrollIntoView({
            behavior: 'smooth'
          });
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

  reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/enterprise/my_expenses', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  saveAndNewExpense() {
    const that = this;

    that.checkIfInvalidPaymentMode().pipe(
      take(1)
    ).subscribe(invalidPaymentMode => {
      if (that.fg.valid && !invalidPaymentMode) {
        if (that.mode === 'add') {
          that.addExpense().subscribe(() => {
            this.trackingService.clickSaveAddNew({Asset: 'Mobile'});
            this.reloadCurrentRoute();
          });
        } else {
          // to do edit
          that.editExpense().subscribe(() => {
            that.close();
          });
        }
      } else {
        that.fg.markAllAsTouched();
        const formContainer = that.formContainer.nativeElement as HTMLElement;
        if (formContainer) {
          const invalidElement = formContainer.querySelector('.ng-invalid');
          invalidElement.scrollIntoView({
            behavior: 'smooth'
          });
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
        that.addExpense().subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.close();
          } else {
            that.goToNext();
          }
        });
      } else {
        // to do edit
        that.editExpense().subscribe(() => {
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
        invalidElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  }

  getCustomFields() {
    return this.customInputs$.pipe(
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

    const { data } = await currencyModal.onWillDismiss();
    return !!data;
  }

  async continueWithPolicyViolations(policyViolations: string[], policyActionDescription: string) {
    const currencyModal = await this.modalController.create({
      component: PolicyViolationComponent,
      componentProps: {
        policyViolationMessages: policyViolations,
        policyActionDescription
      }
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
      mileageConfig: this.mileageConfig$.pipe(take(1))
    }).pipe(
      map((res) => {
        const etxn: any = res.etxn;
        const customProperties = res.customProperties;
        const calculatedDistance = +res.calculatedDistance;
        const amount = res.amount;
        const skipReimbursement = this.fg.value.paymentMode.acc.type === 'PERSONAL_ACCOUNT'
          && !this.fg.value.paymentMode.acc.isReimbursable;

        const formValue = this.fg.value;

        return {
          tx: {
            ...etxn.tx,
            mileage_vehicle_type: formValue.mileage_vehicle_type,
            mileage_is_round_trip: formValue.round_trip,
            source_account_id: formValue.paymentMode.acc.id,
            billable: formValue.billable,
            distance: +formValue.distance,
            org_category_id: (formValue.sub_category && formValue.sub_category.id) || etxn.tx.org_category_id,
            txn_dt: new Date(formValue.dateOfSpend),
            skip_reimbursement: skipReimbursement,
            source: 'MOBILE',
            currency: res.homeCurrency,
            locations: formValue.mileage_locations,
            amount,
            orig_currency: null,
            orig_amount: null,
            mileage_calculated_distance: calculatedDistance,
            mileage_calculated_amount: (etxn.tx.mileage_rate || (res.mileageConfig[formValue.mileage_vehicle_type])) * calculatedDistance,
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
          ou: etxn.ou
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

  editExpense() {
    const customFields$ = this.getCustomFields();

    this.trackPolicyCorrections();

    const calculatedDistance$ = this.mileageService.getDistance(this.fg.controls.mileage_locations.value).pipe(
      switchMap((distance) => {
        return this.etxn$.pipe(map(etxn => {
          const distanceInKm = distance / 1000;
          const finalDistance = (etxn.tx.distance_unit === 'MILES') ? (distanceInKm * 0.6213) : distanceInKm;
          return finalDistance;
        }));
      }),
      map(finalDistance => {
        if (this.fg.value.round_trip) {
          return (finalDistance * 2).toFixed(2);
        } else {
          return (finalDistance).toFixed(2);
        }
      }),
      shareReplay(1)
    );

    return from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => {
          return this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$);
        }),
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
                  }
                  else {
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
                  }
                  else {
                    return of({ etxn, comment: null });
                  }
                })
              );
            } else {
              return of({ etxn, comment: null });
            }
          }));
        }),
        catchError(err => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$).pipe(
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
                      return of({ etxn: err.etxn });
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
                      return of({ etxn: err.etxn, comment: continueWithTransaction.comment });
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
        switchMap(({ etxn, comment }: any) => {
          return forkJoin({
            eou: from(this.authService.getEou()),
            txnCopy: this.etxn$
          }).pipe(
            switchMap(({ eou, txnCopy }) => {

              if (!isEqual(etxn.tx, txnCopy)) {
                // only if the form is edited
                this.trackingService.editExpense({
                  Asset: 'Mobile',
                  Type: 'Mileage',
                  Amount: etxn.tx.amount,
                  Currency: etxn.tx.currency,
                  Category: etxn.tx.org_category,
                  Time_Spent: this.getTimeSpentOnPage() + ' secs'
                });
              } else {
                // tracking expense closed without editing
                this.trackingService.viewExpense({Asset: 'Mobile', Type: 'Mileage'});
              }

              // NOTE: This double call is done as certain fields will not be present in return of upsert call. policy_amount in this case.
              return this.transactionService.upsert(etxn.tx).pipe(
                switchMap(txn => {
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

                    if (txnCopy.tx.report_id && selectedReportId && txnCopy.tx.report_id !== selectedReportId) {
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
                      return this.statusService.post('transactions', txn.id, { comment }, true).pipe(
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
        map((transaction) => {
          // remove after confirming mileage cannot be ccc expenses
          // if (transaction.corporate_credit_card_expense_group_id && vm.selectedCCCTransaction && vm.selectedCCCTransaction.id) {
          //   if (transaction.corporate_credit_card_expense_group_id !== vm.selectedCCCTransaction.id) {
          //     this.transactionService.unmatchCCCExpense(transaction.id, matchedCCCTransaction.id).then(function () {
          //       this.transactionService.matchCCCExpense(transaction.id, vm.selectedCCCTransaction.id);
          //     });
          //   }
          // }

          // //Case is for unmatching a matched expense
          // if (!vm.selectedCCCTransaction && transaction.corporate_credit_card_expense_group_id) {
          //   this.transactionService.unmatchCCCExpense(transaction.id, matchedCCCTransaction.id);
          // }

          // //Case is for matching a normal(unmatched) expense for the first time(edit)
          // if (vm.selectedCCCTransaction && !transaction.corporate_credit_card_expense_group_id) {
          //   this.transactionService.matchCCCExpense(transaction.id, vm.selectedCCCTransaction.id);
          // }
          return transaction;
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      );
  }

  addExpense() {
    const customFields$ = this.getCustomFields();

    const calculatedDistance$ = this.isConnected$
      .pipe(
        take(1),
        switchMap((isConnected) => {
          if (isConnected) {
            return this.mileageService.getDistance(this.fg.controls.mileage_locations.value).pipe(
              switchMap((distance) => {
                if (distance) {
                  return this.etxn$.pipe(map(etxn => {
                    const distanceInKm = distance / 1000;
                    const finalDistance = (etxn.tx.distance_unit === 'MILES') ? (distanceInKm * 0.6213) : distanceInKm;
                    return finalDistance;
                  }));
                } else {
                  return of(null);
                }
              }),
              map(finalDistance => {
                if (finalDistance) {
                  if (this.fg.value.round_trip) {
                    return (finalDistance * 2).toFixed(2);
                  } else {
                    return (finalDistance).toFixed(2);
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

    return from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => {
          return this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$);
        }),
        switchMap(etxn => {
          return this.isConnected$.pipe(
            take(1),
            switchMap(isConnected => {
              if (isConnected) {
                const policyViolations$ = this.checkPolicyViolation(etxn).pipe(
                  shareReplay(1));
                return policyViolations$.pipe(
                  map(this.policyService.getCriticalPolicyRules),
                  switchMap(criticalPolicyViolations => {
                    if (criticalPolicyViolations.length > 0) {
                      return throwError({
                        type: 'criticalPolicyViolations',
                        policyViolations: criticalPolicyViolations,
                        etxn
                      });
                    }
                    else {
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
                    }
                    else {
                      return of({ etxn, comment: null });
                    }
                  })
                );
              } else {
                return of({etxn});
              }
            })
          );
        }),
        catchError(err => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$, calculatedDistance$).pipe(
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
                      return of({ etxn: err.etxn });
                    })
                  );
                } else {
                  return throwError('unhandledError');
                }
              })
            );
          } else if (err.type === 'policyViolations') {
            return from(this.loaderService.hideLoader())
              .pipe(
                switchMap(() => {
                  return this.continueWithPolicyViolations(err.policyViolations, err.policyActionDescription);
                }),
                switchMap((continueWithTransaction) => {
                  if (continueWithTransaction) {
                    return from(this.loaderService.showLoader())
                      .pipe(
                        switchMap(() => {
                          return of({ etxn: err.etxn, comment: continueWithTransaction.comment });
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
        switchMap(({ etxn, comment }: any) => {
          return from(this.authService.getEou())
            .pipe(
              switchMap(eou => {

                const comments = [];
                this.trackingService.createExpense({
                  Asset: 'Mobile',
                  Type: 'Mileage',
                  Amount: etxn.tx.amount,
                  Currency: etxn.tx.currency,
                  Category: etxn.tx.org_category,
                  Time_Spent: this.getTimeSpentOnPage() + ' secs'
                });

                if (comment) {
                  comments.push(comment);
                }

                let reportId;
                if (this.fg.value.report && (etxn.tx.policy_amount === null || (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))) {
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
                  return from(this.transactionsOutboxService.addEntryAndSync(etxn.tx, etxn.dataUrls, entry.comments, entry.reportId)).pipe(
                    map(() => etxn)
                  );
                }
                else {
                  return of(this.transactionsOutboxService.addEntry(etxn.tx, etxn.dataUrls, comments, reportId, null, null)).pipe(
                    map(() => etxn)
                  );
                }

              })
            );
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      );
  }

  async deleteExpense() {
    const id = this.activatedRoute.snapshot.params.id;

    const popupResponse = await this.popupService.showPopup({
      header: 'Delete  Mileage',
      message: 'Are you sure you want to delete this mileage expense?',
      primaryCta: {
        text: 'DELETE'
      }
    });

    if (popupResponse === 'primary') {
      from(this.loaderService.showLoader('Deleting Expense...')).pipe(
        switchMap(() => {
          return this.transactionService.delete(id);
        }),
        tap(() => this.trackingService.deleteExpense({Asset: 'Mobile', Type: 'Mileage'})),
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
      this.trackingService.clickDeleteExpense({Asset: 'Mobile', Type: 'Mileage'});
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
}
