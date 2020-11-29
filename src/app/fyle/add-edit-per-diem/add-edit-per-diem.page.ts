import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, iif, of, combineLatest, from, throwError, noop } from 'rxjs';
import { OfflineService } from 'src/app/core/services/offline.service';
import { switchMap, map, startWith, tap, shareReplay, distinctUntilChanged, filter, take, finalize, catchError, concatMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormArray, ValidationErrors, AbstractControl } from '@angular/forms';
import { TransactionFieldConfigurationsService } from 'src/app/core/services/transaction-field-configurations.service';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { DateService } from 'src/app/core/services/date.service';
import * as moment from 'moment';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { isEqual, isNumber, cloneDeep } from 'lodash';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { DataTransformService } from 'src/app/core/services/data-transform.service';
import { CriticalPolicyViolationComponent } from './critical-policy-violation/critical-policy-violation.component';
import { ModalController } from '@ionic/angular';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { PolicyViolationComponent } from './policy-violation/policy-violation.component';
import { StatusService } from 'src/app/core/services/status.service';

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
  allowedProjectIds$: Observable<string[]>;
  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;
  paymentModeInvalid$: Observable<boolean>;
  isAmountCapped$: Observable<boolean>;
  isAmountDisabled$: Observable<boolean>;
  isCriticalPolicyViolated$: Observable<boolean>;
  projectCategoryIds$: Observable<string[]>;
  filteredCategories$: Observable<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private offlineService: OfflineService,
    private fb: FormBuilder,
    private transactionFieldConfigurationService: TransactionFieldConfigurationsService,
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
    private statusService: StatusService
  ) { }

  ngOnInit() {
    const today = new Date();
    this.minDate = moment(new Date('Jan 1, 2001')).format('y-MM-D');
    this.maxDate = moment(this.dateService.addDaysToDate(today, 1)).format('y-MM-D');

    this.fg = this.fb.group({
      currencyObj: [{
        value: null,
        disabled: true
      }],
      paymentMode: [, Validators.required],
      project: [],
      sub_category: [, Validators.required],
      per_diem_rate: [, Validators.required],
      purpose: [],
      num_days: [, Validators.required],
      report: [],
      from_dt: [],
      to_dt: [],
      custom_inputs: new FormArray([]),
      add_to_new_report: [],
      duplicate_detection_reason: [],
      billable: [],
      costCenter: []
    });
  }

  getTransactionFields() {
    return this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) => {
        return forkJoin({
          tfcMap: this.offlineService.getTransactionFieldConfigurationsMap(),
          perDiemCategoriesContainer: this.getPerDiemCategories()
        }).pipe(
          switchMap(({ tfcMap, perDiemCategoriesContainer }) => {
            const fields = ['purpose', 'cost_center_id', 'from_dt', 'to_dt', 'num_days'];
            return this.transactionFieldConfigurationService
              .filterByOrgCategoryIdProjectId(
                tfcMap, fields, formValue.sub_category || perDiemCategoriesContainer.defaultPerDiemCategory, formValue.project
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
      shareReplay()
    );
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
        const parentCategoryName = 'per diem';
        return categories
          .filter((orgCategory) => (parentCategoryName.toLowerCase() === orgCategory.name.toLowerCase())
            && (parentCategoryName.toLowerCase() !== orgCategory.sub_category.toLowerCase()))
          .filter(category => category.enabled);
      }),
      shareReplay()
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
      homeCurrency: this.offlineService.getHomeCurrency()
    }).pipe(
      map(({ categoryContainer, homeCurrency }) => {
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
            custom_properties: []
          }
        };
      })
    );
  }

  getEditExpense() {
    return this.transactionService.getETxn(this.activatedRoute.snapshot.params.id).pipe(
      shareReplay()
    );
  }

  setupFilteredCategories(activeCategories$: Observable<any>) {
    this.filteredCategories$ = this.fg.controls.project.valueChanges.pipe(
      startWith(this.fg.controls.project.value),
      concatMap(project => {
        return activeCategories$.pipe(
          map(activeCategories =>
            this.projectService.getAllowedOrgCategoryIds(project, activeCategories)));
      }),
      tap(console.log),
      map(categories => categories.map(category => ({ label: category.displayName, value: category }))));

    this.filteredCategories$.subscribe(categories => {
      if (this.fg.value.sub_category
        && this.fg.value.sub_category.id
        && !categories.some(category => this.fg.value.sub_category && this.fg.value.sub_category.id === category.value.id)) {
        this.fg.controls.sub_category.reset();
      }
    });
  }

  getCustomInputs() {
    return this.fg.controls.sub_category.valueChanges
      .pipe(
        startWith({}),
        switchMap((category) => {
          const selectedCategory$ = this.etxn$.pipe(switchMap(etxn => {
            return iif(() => etxn.tx.org_category_id,
              this.offlineService.getAllCategories().pipe(
                map(categories => categories
                  .find(category => category.id === etxn.tx.org_category_id))), of(null));
          }));
          return iif(() => this.mode === 'add', of(category), selectedCategory$);
        }),
        switchMap((category) => {
          const formValue = this.fg.value;
          return this.customInputsService.getAll(true).pipe(
            map(customFields => {
              // TODO: Convert custom properties to get generated from formValue
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
        map((customFields: any[]) => {
          const customFieldsFormArray = this.fg.controls.custom_inputs as FormArray;
          customFieldsFormArray.clear();
          for (const customField of customFields) {
            customFieldsFormArray.push(
              this.fb.group({
                name: [customField.name],
                value: [customField.value, customField.mandatory && Validators.required]
              })
            );
          }
          return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
        }),
        shareReplay()
      );
  }

  ionViewWillEnter() {
    this.title = 'Add Expense';
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;
    this.reviewList = this.activatedRoute.snapshot.params.txnIds;
    this.title = this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    if (this.activatedRoute.snapshot.params.id) {
      this.mode = 'edit';
    }

    const orgSettings$ = this.offlineService.getOrgSettings();
    const perDiemRates$ = this.offlineService.getPerDiemRates();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();

    const allowedPerDiemRates$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return forkJoin({
          orgSettings: orgSettings$,
          allowedPerDiemRates: perDiemRates$.pipe(switchMap(perDiemRates => this.offlineService.getAllowedPerDiems(perDiemRates)))
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).pipe(
      switchMap(({ orgSettings, allowedPerDiemRates }) => {
        return iif(
          () => allowedPerDiemRates.length > 0 || orgSettings.per_diem.enable_individual_per_diem_rates,
          of(allowedPerDiemRates),
          perDiemRates$);
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
      map(({ orgSettings, perDiemRates, allowedPerDiemRates }) => {
        if (orgSettings.per_diem.enable_individual_per_diem_rates) {
          if (allowedPerDiemRates.length > 0 && perDiemRates.length > 0) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      })
    );


    this.txnFields$ = this.getTransactionFields();
    this.paymentModes$ = this.getPaymentModes();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    this.subCategories$ = this.getSubCategories();
    this.setupFilteredCategories(this.subCategories$);

    this.projectCategoryIds$ =  this.getProjectCategoryIds();

    this.filteredCategories$.subscribe(subCategories => {
      if (!subCategories.length) {
        this.fg.controls.sub_category.clearValidators();
        this.fg.controls.sub_category.updateValueAndValidity();
      }
    });

    this.allowedPerDiemRateOptions$ = allowedPerDiemRates$.pipe(
      map(allowedPerDiemRates => allowedPerDiemRates.map(rate => ({ label: rate.full_name, value: rate })))
    );

    this.transactionMandatoyFields$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.transaction_fields_settings.transaction_mandatory_fields || {})
    );

    // TODO: Put this in per diem
    this.transactionMandatoyFields$
      .pipe(
        filter(transactionMandatoyFields => !isEqual(transactionMandatoyFields, {}))
      )
      .subscribe((transactionMandatoyFields) => {
        if (transactionMandatoyFields.project) {
          this.fg.controls.project.setValidators(Validators.required);
          this.fg.controls.project.updateValueAndValidity();
        }
      });


    this.etxn$ = iif(() => this.mode === 'add', this.getNewExpense(), this.getEditExpense());

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
      distinctUntilChanged((a, b) => isEqual(a, b))
    ).subscribe(txnFields => {
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

        if (txnFields[txnFieldKey].mandatory) {
          control.setValidators(Validators.required);
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
          this.fg.controls.num_days.setValue(toDate.diff(fromDate, 'day') + 1);
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
        if (fromDt && numDays) {
          const fromDate = moment(new Date(fromDt));
          this.fg.controls.to_dt.setValue(fromDate.add((+numDays - 1), 'day').format('y-MM-DD'));
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
              amount: perDiemRate.rate * numDays,
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
          amount: perDiemRate.rate * numDays * exchangeRate,
          orig_currency: perDiemRate.currency,
          orig_amount: perDiemRate.rate * numDays
        });
      });

    this.isBalanceAvailableInAnyAdvanceAccount$ = this.fg.controls.paymentMode.valueChanges.pipe(
      switchMap((paymentMode) => {
        if (paymentMode && paymentMode.acc && paymentMode.acc.type === 'PERSONAL_ACCOUNT') {
          return this.offlineService.getAccounts().pipe(
            map(accounts => {
              return accounts.filter(account => account && account.acc && account.acc.type === 'PERSONAL_ADVANCE_ACCOUNT').length > 0;
            })
          );
        }
        return of(false);
      })
    );

    const selectedProject$ = this.etxn$.pipe(
      switchMap(etxn => {
        return iif(() => etxn.tx.project_id, this.projectService.getbyId(etxn.tx.project_id), of(null));
      })
    );

    const selectedPaymentMode$ = this.etxn$.pipe(
      switchMap(etxn => {
        return iif(() => etxn.tx.source_account_id, this.paymentModes$.pipe(
          map(paymentModes => paymentModes
            .map(res => res.value)
            .find(paymentMode => paymentMode.acc.id === etxn.tx.source_account_id))
        ), of(null));
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
              .find(reportOption => reportOption.id === etxn.tx.report_id))
          ),
          of(null)
        );
      })
    );

    const selectedCostCenter$ = this.etxn$.pipe(
      switchMap(etxn => {
        return iif(() => etxn.tx.cost_center_id,
          this.costCenters$.pipe(
            map(costCenters => costCenters
              .map(res => res.value)
              .find(costCenter => costCenter.id === etxn.tx.cost_center_id))
          ),
          of(null)
        );
      })
    );

    const selectedCustomInputs$ = this.etxn$.pipe(
      switchMap(etxn => {
        return this.customInputsService.getAll(true).pipe(map(customFields => {
          // TODO: Convert custom properties to get generated from formValue
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
        ]);
      }),
      take(1),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(([etxn, paymentMode, project, subCategory, perDiemRate, txnFields, report, costCenter, customInputs]) => {
      const customInputValues = customInputs
        .map(customInput => {
          const cpor = etxn.tx.custom_properties && etxn.tx.custom_properties.find(customProp => customProp.name === customInput.name);
          return {
            name: customInput.name,
            value: (cpor && cpor.value) || null
          };
        });

      this.fg.patchValue({
        paymentMode,
        project,
        sub_category: subCategory,
        per_diem_rate: perDiemRate,
        purpose: etxn.tx.purpose,
        num_days: etxn.tx.num_days,
        report,
        from_dt: etxn.tx.from_dt ? moment(new Date(etxn.tx.from_dt)).format('y-MM-DD') : null,
        to_dt: etxn.tx.to_dt ? moment(new Date(etxn.tx.to_dt)).format('y-MM-DD') : null,
        billable: etxn.tx.billable,
        costCenter
      });

      setTimeout(() => {
        this.fg.controls.custom_inputs.setValue(customInputValues);
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
        const customProperties = res.customProperties;
        const skipReimbursement = this.fg.value.paymentMode.acc.type === 'PERSONAL_ACCOUNT'
          && !this.fg.value.paymentMode.acc.isReimbursable;

        const formValue = this.fg.value;
        const currencyObj = this.fg.controls.currencyObj.value;
        const amountData: any = {
          currency: currencyObj.currency,
          orig_currency: currencyObj.orig_currency,
          orig_amount: currencyObj.orig_amount,
        };

        if (this.mode === 'edit') {
          if (etxn.tx.user_amount !== currencyObj.amount) {
            amountData.amount = currencyObj.amount;
          }
        } else {
          amountData.amount = currencyObj.amount;
        }

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
            project_id: formValue.project && formValue.project.id,
            purpose: formValue.purpose,
            custom_properties: customProperties || [],
            org_user_id: etxn.tx.org_user_id,
            from_dt: formValue.from_dt && new Date(formValue.from_dt),
            to_dt: formValue.from_dt && new Date(formValue.to_dt),
            category: null,
            num_days: formValue.num_days,
            cost_center_id: formValue.costCenter && formValue.costCenter.id,
            cost_center_name: formValue.costCenter && formValue.costCenter.name,
            cost_center_code: formValue.costCenter && formValue.costCenter.code
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

  savePerDiem() {
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

    if (this.fg.valid) {
      if (this.mode === 'add') {
        from(this.loaderService.showLoader())
          .pipe(
            switchMap(() => {
              return this.generateEtxnFromFg(this.etxn$, customFields$);
            }),
            switchMap(etxn => {
              const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay());
              return policyViolations$.pipe(
                map(this.policyService.getCriticalPolicyRules),
                switchMap(policyViolations => {
                  if (policyViolations.length > 0) {
                    return throwError({
                      type: 'criticalPolicyViolations',
                      policyViolations,
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
                    return of({ etxn });
                  }
                })
              );
            }),
            catchError(err => {
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
            finalize(() => from(this.loaderService.hideLoader()))
          )
          .subscribe(({ etxn, comment }: any) => {
            const comments = [];
            if (comment) {
              comments.push(comment);
            }
            this.transactionsOutboxService.addEntry(etxn.tx, null, comments, this.fg.value.report && this.fg.value.report.id, null, null);
          });
      } else {
        from(this.loaderService.showLoader())
          .pipe(
            switchMap(() => {
              return this.generateEtxnFromFg(this.etxn$, customFields$);
            }),
            switchMap(etxn => {
              const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay());
              return policyViolations$.pipe(
                map(this.policyService.getCriticalPolicyRules),
                switchMap(policyViolations => {
                  if (policyViolations.length > 0) {
                    return throwError({
                      type: 'criticalPolicyViolations',
                      policyViolations,
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
                    return of({ etxn });
                  }
                })
              );
            }),
            catchError(err => {
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
            switchMap(({ etxn, comment }: any) => {
              return this.etxn$.pipe(
                switchMap((txnCopy) => {
                  return this.transactionService.upsert(etxn.tx).pipe(
                    switchMap((txn) => {
                      return this.transactionService.getETxn(txn.id);
                    }),
                    map(savedEtxn => savedEtxn && savedEtxn.tx),
                    switchMap((tx) => {
                      const addTransactionToReport$ = this.reportService.addTransactions(etxn.tx.report_id, [tx.id]);
                      const removeTransactionFromReport$ = this.reportService.removeTransaction(txnCopy.report_id, tx.id);
                      const reviewTxn = this.transactionService.review(tx.id);
                      return forkJoin({
                        addExpenseToReport: iif(() => !txnCopy.report_id && etxn.tx.report_id, addTransactionToReport$, of(null)),
                        changeReport: iif(() => txnCopy.report_id && etxn.tx.report_id && etxn.tx.report_id !== etxn.tx.report_id,
                          removeTransactionFromReport$.pipe(
                            switchMap(() => addTransactionToReport$)
                          ),
                          of(null)),
                        transactionRemovedFromReport: iif(
                          () => txnCopy.report_id && !etxn.tx.report_id, removeTransactionFromReport$, of(null)
                        ),
                        review: iif(() => etxn.tx.user_review_needed, reviewTxn, of(null))
                      }).pipe(
                        map(() => tx)
                      );
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
            finalize(() => from(this.loaderService.hideLoader()))
          ).subscribe(noop);
      }
    } else {
      this.fg.markAllAsTouched();
    }
  }

  close() {
    this.router.navigate(['/', 'enterprise', 'my_expenses']);
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
