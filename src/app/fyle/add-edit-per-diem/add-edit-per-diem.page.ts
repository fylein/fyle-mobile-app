import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, iif, of, combineLatest } from 'rxjs';
import { OfflineService } from 'src/app/core/services/offline.service';
import { switchMap, map, startWith, tap, shareReplay, concatMap, distinctUntilChanged, filter } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidationErrors } from '@angular/forms';
import { TransactionFieldConfigurationsService } from 'src/app/core/services/transaction-field-configurations.service';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { DateService } from 'src/app/core/services/date.service';
import * as moment from 'moment';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { isEqual } from 'lodash';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ReportService } from 'src/app/core/services/report.service';

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
    private reportService: ReportService
  ) { }

  currencyObjValidator(c: FormControl): ValidationErrors {
    if (c.value && c.value.amount && c.value.currency) {
      return null;
    }
    return {
      required: false
    };
  }

  ngOnInit() {
    const today = new Date();
    this.minDate = moment(new Date('Jan 1, 2001')).format('y-MM-D');
    this.maxDate = moment(this.dateService.addDaysToDate(today, 1)).format('y-MM-D');

    this.fg = this.fb.group({
      currencyObj: [{
        value: null,
        disabled: true
      }, this.currencyObjValidator],
      paymentMode: [, Validators.required],
      project: [],
      sub_category: [, Validators.required],
      numDays: [],
      per_diem_rate: [],
      purpose: [],
      num_days: [],
      report: [],
      from_dt: [],
      to_dt: [],
      custom_inputs: new FormArray([]),
      add_to_new_report: [],
      duplicate_detection_reason: [],
      billable: [],
      costCenter: []
    });

    this.fg.valueChanges.subscribe(console.log);
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
          .filterAccountsWithSufficientBalance(accounts.filter(account => account.acc.type), isAdvanceEnabled);
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
      map(subCategories => subCategories.map(subCat => ({ label: subCat.displayName, value: subCat }))),
      shareReplay()
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

  getCustomInputs() {
    return this.fg.controls.sub_category.valueChanges.pipe(
      startWith({}),
      concatMap((category) => {
        const formValue = this.fg.value;
        return this.customInputsService.getAll(true).pipe(
          map(customFields => {
            // TODO: Convert custom properties to get generated from formValue
            return this.customFieldsService.standardizeCustomFields([],
              this.customInputsService.filterByCategory(customFields, category && category.id));
          }),
          map(customFields => customFields.filter(customField => customField.type !== 'USER_LIST'))
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
              value: [, customField.mandatory && Validators.required]
            })
          );
        }

        return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
      })
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

    const allowedPerDiemRates$ = forkJoin({
      orgSettings: orgSettings$,
      allowedPerDiemRates: perDiemRates$.pipe(switchMap(perDiemRates => this.offlineService.getAllowedPerDiems(perDiemRates)))
    }).pipe(
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

    this.canCreatePerDiem$ = forkJoin({
      orgSettings: orgSettings$,
      perDiemRates: perDiemRates$,
      allowedPerDiemRates: allowedPerDiemRates$
    }).pipe(
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

    this.allowedPerDiemRateOptions$ = allowedPerDiemRates$.pipe(
      map(allowedPerDiemRates => allowedPerDiemRates.map(rate => ({ label: rate.full_name, value: rate })))
    );

    this.transactionMandatoyFields$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.transaction_fields_settings.transaction_mandatory_fields)
    );

    this.etxn$ = iif(() => this.mode === 'add', this.getNewExpense(), of({}));

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
        // console.log(perDiemRate, numDays, homeCurrency, exchangeRate);
        this.fg.controls.currencyObj.setValue({
          currency: homeCurrency,
          amount: perDiemRate.rate * numDays * exchangeRate,
          orig_currency: perDiemRate.currency,
          orig_amount: perDiemRate.rate * numDays
        });
      });
  }

}
