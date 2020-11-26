import { Component, OnInit } from '@angular/core';
import { Observable, of, iif, forkJoin, from, combineLatest, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { concatMap, switchMap, map, startWith, shareReplay, distinctUntilChanged, take, tap } from 'rxjs/operators';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ValidationErrors, AbstractControl } from '@angular/forms';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { DateService } from 'src/app/core/services/date.service';
import * as moment from 'moment';
import { TransactionFieldConfigurationsService } from 'src/app/core/services/transaction-field-configurations.service';
import { ReportService } from 'src/app/core/services/report.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { isEqual, cloneDeep } from 'lodash';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { DataTransformService } from 'src/app/core/services/data-transform.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { TransactionsOutboxService } from 'src/app/services/transactions-outbox.service';
import { PopoverController } from '@ionic/angular';
import { SplitExpensePopoverComponent } from './split-expense-popover/split-expense-popover.component';

@Component({
  selector: 'app-add-edit-expense',
  templateUrl: './add-edit-expense.page.html',
  styleUrls: ['./add-edit-expense.page.scss'],
})
export class AddEditExpensePage implements OnInit {
  etxn$: Observable<any>;
  paymentModes$: Observable<any[]>;
  pickRecentCurrency$: Observable<any>;
  isCreatedFromCCC = false; // TODO: Verify naming
  paymentAccount$: Observable<any>;
  isCCCAccountSelected$: Observable<boolean>;
  homeCurrency$: Observable<string>;
  mode: string;
  title: string;
  activeIndex: number;
  reviewList: string[];
  fg: FormGroup;
  filteredCategories$: Observable<any[]>;
  minDate: string;
  maxDate: string;
  txnFields$: Observable<any>;
  taxSettings$: Observable<any>;
  reports$: Observable<any>;
  isProjectsEnabled$: Observable<boolean>;
  flightJourneyTravelClassOptions$: Observable<any>;
  customInputs$: Observable<any>;
  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;
  selectedCCCTransaction;
  isOffline = false;
  canChangeMatchingCCCTransaction = true;
  transactionInReport$: Observable<boolean>;
  transactionMandatoyFields$: Observable<any>;
  isCriticalPolicyViolated = false;
  showSelectedTransaction = false;
  isIndividualProjectsEnabled$: Observable<boolean>;
  individualProjectIds$: Observable<[]>;
  isNotReimbursable$: Observable<boolean>;
  costCenters$: Observable<any[]>;
  receiptsData: any;
  isSplitExpenseAllowed$: Observable<boolean>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private accountsService: AccountsService,
    private offlineService: OfflineService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private dateService: DateService,
    private projectService: ProjectsService,
    private reportService: ReportService,
    private transactionFieldConfigurationService: TransactionFieldConfigurationsService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private transactionService: TransactionService,
    private dataTransformService: DataTransformService,
    private policyService: PolicyService,
    private transactionOutboxService: TransactionsOutboxService,
    private popoverController: PopoverController
  ) { }

  merchantValidator(c: FormControl): ValidationErrors {
    if (c.value && c.value.display_name) {
      return c.value.display_name.length > 250 ? { merchantNameSize: 'Length is greater than 250' } : null;
    }
    return null;
  }

  currencyObjValidator(c: FormControl): ValidationErrors {
    if (c.value && c.value.amount && c.value.currency) {
      return null;
    }
    return {
      required: false
    };
  }

  ngOnInit() {
    this.fg = this.formBuilder.group({
      currencyObj: [, this.currencyObjValidator],
      paymentMode: [, Validators.required],
      project: [],
      category: [],
      dateOfSpend: [],
      merchant: [, this.merchantValidator],
      purpose: [],
      report: [],
      tax: [],
      taxValue: [],
      location_1: [],
      location_2: [],
      from_dt: [],
      to_dt: [],
      flight_journey_travel_class: [],
      flight_return_travel_class: [],
      train_travel_class: [],
      bus_travel_class: [],
      distance: [],
      distance_unit: [],
      custom_inputs: new FormArray([]),
      add_to_new_report: [],
      duplicate_detection_reason: [],
      billable: [],
      costCenter: []
    });

    // tslint:disable-next-line: deprecation
    combineLatest(this.fg.controls.currencyObj.valueChanges, this.fg.controls.tax.valueChanges).subscribe(() => {
      if (this.fg.controls.tax.value && this.fg.controls.tax.value.percentage && this.fg.controls.currencyObj.value) {
        this.fg.controls.taxValue.setValue(
          this.fg.controls.tax.value.percentage *
          (this.fg.controls.currencyObj.value.orig_amount || this.fg.controls.currencyObj.value.amount));
      }
    });

    // this.fg.valueChanges.subscribe(console.log);
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

  openSplitExpenseModal(type) {
    console.log(type);
  }

  async splitExpense() {
    return forkJoin({
      costCenters: this.costCenters$,
      projects: this.offlineService.getProjects()
    }).subscribe(async res => {
      const areCostCentersAvailable = res.costCenters.length > 0;
      const areProjectsAvailable = res.projects.length > 0;
      let popupTypeItemClass = '';
      if (areProjectsAvailable || areCostCentersAvailable) {
        popupTypeItemClass = 'two-items-list';

        if (areProjectsAvailable && areCostCentersAvailable) {
          popupTypeItemClass = 'three-items-list';
        }
      }

      const splitExpensePopover = await this.popoverController.create({
        component: SplitExpensePopoverComponent,
        componentProps: {
          class: popupTypeItemClass,
          areProjectsAvailable,
          areCostCentersAvailable
        },
        cssClass: 'split-expense-popover'
      });
      await splitExpensePopover.present();

      const { data } = await splitExpensePopover.onWillDismiss();

      if (data && data.type) {
        this.openSplitExpenseModal(data.type);
      }
    })
  }

  ionViewWillEnter() {
    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    const allCategories$ = this.offlineService.getAllCategories();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    const accounts$ = this.offlineService.getAccounts();
    const eou$ = from(this.authService.getEou());

    this.receiptsData = this.activatedRoute.snapshot.params.receiptsData;

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

    this.transactionMandatoyFields$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.transaction_fields_settings.transaction_mandatory_fields)
    );

    this.transactionMandatoyFields$.subscribe((transactionMandatoyFields) => {
      if (transactionMandatoyFields.project) {
        this.fg.controls.project.setValidators(Validators.required);
        this.fg.controls.project.updateValueAndValidity();
      }

      if (transactionMandatoyFields.category) {
        this.fg.controls.category.setValidators(Validators.required);
        this.fg.controls.category.updateValueAndValidity();
      }
    });

    this.mode = this.activatedRoute.snapshot.params.id ? 'edit' : 'add';
    this.isCreatedFromCCC = !this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn;
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;
    this.reviewList = this.activatedRoute.snapshot.params.txnIds;
    this.title = 'Add Expense';
    this.title = this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    this.isProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.projects && orgSettings.projects.enabled)
    );
    this.isBalanceAvailableInAnyAdvanceAccount$ = this.fg.controls.paymentMode.valueChanges.pipe(
      switchMap((paymentMode) => {
        if (paymentMode && paymentMode.acc && paymentMode.acc.type === 'PERSONAL_ACCOUNT') {
          return accounts$.pipe(
            map(accounts => {
              return accounts.filter(account => account && account.acc && account.acc.type === 'PERSONAL_ADVANCE_ACCOUNT').length > 0;
            })
          );
        }
        return of(false);
      })
    );

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects)
    );

    this.individualProjectIds$ = orgUserSettings$.pipe(
      map((orgUserSettings: any) => orgUserSettings.project_ids || [])
    );

    const today = new Date();
    this.minDate = moment(new Date('Jan 1, 2001')).format('y-MM-D');
    this.maxDate = moment(this.dateService.addDaysToDate(today, 1)).format('y-MM-D');

    const activeCategories$ = allCategories$.pipe(
      map(catogories => catogories.filter(category => category.enabled === true)),
      map(catogories => this.categoriesService.filterRequired(catogories))
    );

    this.paymentModes$ = forkJoin({
      accounts: accounts$,
      orgSettings: orgSettings$
    }).pipe(
      map(({ accounts, orgSettings }) => {
        const isAdvanceEnabled = (orgSettings.advances && orgSettings.advances.enabled) ||
          (orgSettings.advance_requests && orgSettings.advance_requests.enabled);
        const isMultipleAdvanceEnabled = orgSettings && orgSettings.advance_account_settings &&
          orgSettings.advance_account_settings.multiple_accounts;
        const userAccounts = this.accountsService.filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled);
        return this.accountsService.constructPaymentModes(userAccounts, isMultipleAdvanceEnabled);
      }),
      map(paymentModes => paymentModes.map((paymentMode: any) => ({ label: paymentMode.acc.displayName, value: paymentMode })))
    );


    this.pickRecentCurrency$ = orgUserSettings$.pipe(
      map(orgUserSettings => {
        if (orgUserSettings.currency_settings && orgUserSettings.currency_settings.enabled) {
          return orgUserSettings.currency_settings.preferred_currency && '';
        } else {
          return 'true';
        }
      })
    );

    this.paymentAccount$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.find((account) => account.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
        } else {
          return null;
        }
      })
    );

    this.isCCCAccountSelected$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.find((account) => account.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT').length > 0;
        } else {
          return false;
        }
      })
    );

    const newExpensePipe$ = forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$,
      categories: activeCategories$,
      homeCurrency: this.homeCurrency$,
      accounts: accounts$,
      eou: eou$
    }).pipe(
      map((dependencies) => {
        const { orgSettings, orgUserSettings, categories, homeCurrency, accounts, eou } = dependencies;
        const bankTxn = this.activatedRoute.snapshot.params.bankTxn;
        let etxn;
        if (!bankTxn) {
          etxn = {
            tx: {
              billable: false,
              skip_reimbursement: false,
              source: 'MOBILE',
              txn_dt: new Date(),
              currency: homeCurrency,
              amount: null,
              orig_currency: null,
              orig_amount: null,
              policy_amount: null,
              locations: [],
              custom_properties: [],
              num_files: this.activatedRoute.snapshot.params.dataUrl ? 1 : 0,
              org_user_id: eou.ou.id
            },
            dataUrls: []
          };

          if (orgUserSettings.currency_settings && orgUserSettings.currency_settings.enabled) {
            etxn.tx.currency = orgUserSettings.currency_settings.preferred_currency || etxn.tx.currency;
          }

          const receiptsData = this.activatedRoute.snapshot.params.receiptsData;

          if (receiptsData) {
            if (receiptsData.amount) {
              etxn.tx.amount = receiptsData.amount;
              etxn.tx.orig_amount = receiptsData.amount;
            }
            if (receiptsData.dataUrls) {
              etxn.dataUrls = receiptsData.dataUrls;
              etxn.tx.num_files = etxn.dataUrls ? 1 : 0;
            }
          }
        } else {
          etxn = {
            tx: {
              txn_dt: new Date(bankTxn.ccce.txn_dt),
              source: 'MOBILE',
              currency: bankTxn.ccce.currency,
              org_category_id: bankTxn.org_category_id,
              amount: bankTxn.ccce.amount,
              vendor: bankTxn.ccce.vendor,
              purpose: bankTxn.ccce.description,
              skip_reimbursement: false,
              locations: [],
              hotel_is_breakfast_provided: false,
              num_files: 0,
              org_user_id: eou.ou.id
            },
            dataUrls: []
          };
        }
        return etxn;
      })
    );

    const editExpensePipe$ = of({});

    this.etxn$ = iif(() => this.activatedRoute.snapshot.params.id, editExpensePipe$, newExpensePipe$);

    const formProjectValue$ = this.fg.controls.project.valueChanges.pipe(
      startWith(this.fg.controls.project.value)
    );

    this.filteredCategories$ = formProjectValue$.pipe(
      concatMap(project => {
        return activeCategories$.pipe(
          map(activeCategories => this.projectService.getAllowedOrgCategoryIds(project, activeCategories))
        );
      }),
      map(categories => categories.map(category => ({ label: category.name, value: category })))
    );

    this.filteredCategories$.subscribe(categories => {
      if (this.fg.value.category
        && this.fg.value.category.id
        && !categories.some(category => this.fg.value.category && this.fg.value.category.id === category.value.id)) {
        this.fg.controls.category.reset();
      }
    });

    this.txnFields$ = this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) => {
        return this.offlineService.getTransactionFieldConfigurationsMap().pipe(
          switchMap(tfcMap => {
            return this.transactionFieldConfigurationService.filterByOrgCategoryIdProjectId(tfcMap, formValue.category, formValue.project);
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
      tap(console.log),
      shareReplay()
    );

    this.txnFields$.pipe(
      distinctUntilChanged((a, b) => isEqual(a, b))
    ).subscribe(txnFields => {
      const keyToControlMap: { [id: string]: AbstractControl; } = {
        purpose: this.fg.controls.purpose,
        txn_dt: this.fg.controls.dateOfSpend,
        vendor_id: this.fg.controls.merchant,
        cost_center_id: this.fg.controls.costCenter,
        from_dt: this.fg.controls.from_dt,
        to_dt: this.fg.controls.to_dt,
        location1: this.fg.controls.location_1,
        location2: this.fg.controls.location_2,
        distance: this.fg.controls.distance,
        distance_unit: this.fg.controls.distance_unit,
        flight_journey_travel_class: this.fg.controls.flight_journey_travel_class,
        flight_return_travel_class: this.fg.controls.flight_return_travel_class,
        train_travel_class: this.fg.controls.train_travel_class,
        bus_travel_class: this.fg.controls.bus_travel_class
      };

      for (const control of Object.values(keyToControlMap)) {
        control.clearValidators();
        control.updateValueAndValidity();
      }

      for (const txnFieldKey of Object.keys(txnFields)) {
        const control = keyToControlMap[txnFieldKey];

        if (txnFields[txnFieldKey].mandatory) {
          if (txnFieldKey === 'vendor_id') {
            control.setValidators(Validators.compose([Validators.required, this.merchantValidator]));
          } else {
            control.setValidators(Validators.required);
          }
        } else {
          if (txnFieldKey === 'vendor_id') {
            control.setValidators(this.merchantValidator);
          }
        }
        control.updateValueAndValidity();
      }

      this.fg.updateValueAndValidity();
    });

    this.flightJourneyTravelClassOptions$ = this.txnFields$.pipe(
      map(txnFields => {
        return txnFields.flight_journey_travel_class && txnFields.flight_journey_travel_class.values.map(v => ({ label: v, value: v }));
      })
    );

    this.taxSettings$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.tax_settings.groups),
      map(taxs => taxs.map(tax => ({ label: tax.name, value: tax })))
    );

    this.reports$ = this.reportService.getFilteredPendingReports({ state: 'edit' }).pipe(
      map(reports => reports.map(report => ({ label: report.rp.purpose, value: report })))
    );

    this.customInputs$ = this.fg.controls.category.valueChanges.pipe(
      startWith({}),
      concatMap((category) => {
        const formValue = this.fg.value;
        return this.customInputsService.getAll(true).pipe(
          map(customFields => {
            // TODO: Convert custom properties to get generated from formValue
            return this.customFieldsService.standardizeCustomFields([],
              this.customInputsService.filterByCategory(customFields, category && category.id));
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
      map((customFields: any[]) => {
        const customFieldsFormArray = this.fg.controls.custom_inputs as FormArray;
        customFieldsFormArray.clear();
        for (const customField of customFields) {
          customFieldsFormArray.push(
            this.formBuilder.group({
              value: [, customField.mandatory && Validators.required]
            })
          );
        }

        return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
      })
    );

    this.isSplitExpenseAllowed$ = orgSettings$.pipe(
      map(orgSettings => {
        return orgSettings.expense_settings.split_expense_settings.enabled;
      })
    );

    const etxnProject$ = this.etxn$.pipe(
      switchMap(etxn => {
        return etxn.tx.tx_project_id ? this.projectService.getbyId(etxn.tx.tx_project_id) : of(null)
      })
    );

    const etxnCategory$ = this.etxn$.pipe(
      switchMap(etxn => {
        return etxn.tx.tx_org_category_id ? allCategories$.pipe(
          map(categories => categories.find(category => category.id === etxn.tx.tx_org_category_id))
        ) : of(null);
      })
    );

    const etxnReport$ = this.etxn$.pipe(
      switchMap(etxn => {
        return etxn.tx_report_id ? this.reportService.getReport(etxn.tx_report_id) : of(null);
      })
    );

    forkJoin({
      etxn: this.etxn$,
      paymentModes: this.paymentModes$,
      project: etxnProject$,
      category: etxnCategory$,
      report: etxnReport$
    }).subscribe(({ etxn, paymentModes, project, category, report }) => {
      const paymentModeOption = paymentModes.find(paymentMode => paymentMode.value.acc.id === etxn.tx.source_account_id);
      const paymentMode = paymentModeOption ? paymentModeOption.value : null;
      this.fg.patchValue({
        currencyObj: {
          amount: etxn.tx.amount,
          currency: etxn.tx.currency,
          orig_amount: etxn.tx.orig_amount,
          orig_currency: etxn.tx.orig_currency,
        },
        paymentMode,
        project,
        category,
        dateOfSpend: moment(etxn.tx.txn_dt).format('y-MM-DD'),
        merchant: etxn.tx.vendor || null,
        purpose: etxn.tx.purpose || null,
        report,
        tax: null, // Map the rest
        taxValue: null,
        location_1: null,
        location_2: null,
        from_dt: null,
        to_dt: null,
        flight_journey_travel_class: null,
        flight_return_travel_class: null,
        train_travel_class: null,
        bus_travel_class: null,
        distance: null,
        distance_unit: null,
        add_to_new_report: null,
        duplicate_detection_reason: null,
        billable: false,
        costCenter: null
      });
    });

    this.transactionInReport$ = this.etxn$.pipe(
      map(etxn => ['APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(etxn.tx.state) > -1)
    );

    this.isNotReimbursable$ = this.etxn$.pipe(map(etxn => !etxn.tx.user_can_delete && this.mode === 'edit'));
  }

  generateEtxnFromFg(etxn$, standardisedCustomProperties$) {
    return forkJoin({
      etxn: etxn$,
      customProperties: standardisedCustomProperties$
    }).pipe(
      map((res) => {
        const etxn: any = res.etxn;
        const customProperties = res.customProperties;
        let locations;
        if (this.fg.value.location_1 && this.fg.value.location_2) {
          locations = [
            this.fg.value.location_1,
            this.fg.value.location_2
          ];
        }

        return {
          tx: {
            billable: this.fg.value.billable,
            skip_reimbursement: this.fg.value.paymentMode.acc.isReimbursable,
            source: 'MOBILE',
            txn_dt: new Date(this.fg.value.dateOfSpend),
            currency: this.fg.value.currencyObj.currency,
            amount: this.fg.value.currencyObj.amount,
            orig_currency: this.fg.value.currencyObj.orig_currency,
            orig_amount: this.fg.value.currencyObj.orig_amount,
            project_id: this.fg.value.project && this.fg.value.project.id,
            policy_amount: null,
            vendor: this.fg.value.merchant && this.fg.value.merchant.display_name,
            purpose: this.fg.value.purpose,
            locations,
            custom_properties: customProperties || [],
            num_files: this.activatedRoute.snapshot.params.dataUrl ? 1 : 0,
            org_user_id: etxn.tx.org_user_id,
            from_dt: this.fg.value.from_dt,
            to_dt: this.fg.value.to_dt,
            flight_journey_travel_class: this.fg.value.flight_journey_travel_class,
            flight_return_travel_class: this.fg.value.flight_return_travel_class,
            train_travel_class: this.fg.value.train_travel_class,
            bus_travel_class: this.fg.value.bus_travel_class,
            distance: this.fg.value.distance,
            distance_unit: this.fg.value.distance_unit
          },
          dataUrls: []
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
      tap(a => {
        console.log('Before test policy', a);
      }),
      switchMap((policyETxn) => {
        return this.transactionService.testPolicy(policyETxn);
      }),
      tap(a => {
        console.log('After test policy', a);
      })
    );
  }

  saveExpense() {
    const customFields$ = this.customInputsService.getAll(true).pipe(
      map(customFields => {
        // TODO: Convert custom properties to get generated from formValue
        return this.customFieldsService
          .standardizeCustomFields([],
            this.customInputsService
              .filterByCategory(customFields, this.fg.value.category && this.fg.value.category.id));
      }),
      map((customFields: any[]) => {
        return customFields.map((customField, i) => ({ ...customField, value: this.fg.value.custom_inputs[i].value }));
      }),
      map(this.customFieldsService.standardizeProperties)
    );

    if (this.fg.valid) {
      if (this.mode === 'add') {
        this.generateEtxnFromFg(this.etxn$, customFields$)
          .pipe(
            switchMap(etxn => {
              const policyViolations$ = this.checkPolicyViolation(etxn).pipe(
                tap(a => {
                  console.log('Inside etxn generation', a);
                }),
                shareReplay()
                );
              return policyViolations$.pipe(
                tap(console.log),
                map(this.policyService.getCriticalPolicyRules),
                switchMap(criticalPolicyViolations => {
                  if (criticalPolicyViolations.length > 0) {
                    return throwError(new Error('Critical Policy Violated'));
                  } else {
                    return policyViolations$;
                  }
                }),
                tap(console.log),
                map(this.policyService.getPolicyRules),
                switchMap(policyRules => {
                  if (policyRules.length > 0) {
                    return throwError(new Error('Policy Violated'));
                  } else {
                    return of(etxn);
                  }
                }),
                tap(console.log)
              );
            }),
            switchMap((etxn) => {
              return from(this.authService.getEou()).pipe(
                switchMap(eou => {
                  if (this.mode === 'add') {
                    const comments = [];

                    // if (this.activatedRoute.snapshot.params.dataUrl) {
                    //   TrackingService.createExpense({Asset: 'Mobile', Category: 'InstaFyle'});
                    // } else {
                    //   TrackingService.createExpense
                    // ({Asset: 'Mobile', Type: 'Receipt', Amount: this.etxn.tx.amount, Currency: this.etxn.tx.currency, Category: this.etxn.tx.org_category, Time_Spent: timeSpentOnExpensePage +' secs'});
                    // }

                    // if (this.saveAndCreate) {
                    //   // track click of save and new expense button
                    //   TrackingService.clickSaveAddNew({Asset: 'Mobile'});
                    // }

                    // if (this.comment) {
                    //   comments.push(this.comment);
                    // }

                    // if (this.selectedCCCTransaction) {
                    //   this.etxn.tx.matchCCCId = this.selectedCCCTransaction.id;
                    //   setSourceAccount('PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
                    // }

                    let reportId;
                    if (this.fg.value.report
                      && (etxn.tx.policy_amount === null || (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))) {
                      reportId = this.fg.value.report.id;
                    }
                    let entry;
                    if (this.fg.value.add_to_new_report) {
                      entry = {
                        comments,
                        reportId
                      };
                    }

                    if (entry) {
                      return from(this.transactionOutboxService.addEntryAndSync(
                        etxn.tx, etxn.dataUrls, entry.comments, entry.reportId
                        ));
                    } else {
                      let receiptsData = null;
                      if (this.receiptsData) {
                        receiptsData = {
                          linked_by: eou.ou.id,
                          receipt_id: this.receiptsData.receiptId,
                          fileId: this.receiptsData.fileId
                        };
                      }
                      return of(this.transactionOutboxService.addEntry(
                        etxn.tx, etxn.dataUrls, comments, reportId, null, receiptsData));
                    }
                  }
                })
              );
            })
          ).subscribe(console.log);
      } else {
        // to do edit
      }
    } else {
      this.fg.markAllAsTouched();
    }
  }

}
