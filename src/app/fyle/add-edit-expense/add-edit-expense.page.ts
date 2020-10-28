import { Component, OnInit } from '@angular/core';
import { Observable, of, iif, forkJoin, from, combineLatest, zip, noop } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { concatMap, switchMap, map, startWith, tap, shareReplay, take, distinctUntilChanged } from 'rxjs/operators';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { DateService } from 'src/app/core/services/date.service';
import * as moment from 'moment';
import { TransactionFieldConfigurationsService } from 'src/app/core/services/transaction-field-configurations.service';
import { ReportService } from 'src/app/core/services/report.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';

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
  isOffline = false;

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
    private customFieldsService: CustomFieldsService
  ) { }

  ngOnInit() {
    this.fg = this.formBuilder.group({
      currencyObj: [],
      paymentMode: [],
      project: [],
      category: [],
      dateOfSpend: [],
      merchant: [],
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
      custom_inputs: new FormArray([])
    });

    // tslint:disable-next-line: deprecation
    combineLatest(this.fg.controls.currencyObj.valueChanges, this.fg.controls.tax.valueChanges).subscribe(() => {
      if (this.fg.controls.tax.value && this.fg.controls.tax.value.percentage && this.fg.controls.currencyObj.value) {
        this.fg.controls.taxValue.setValue(
          this.fg.controls.tax.value.percentage *
          (this.fg.controls.currencyObj.value.orig_amount || this.fg.controls.currencyObj.value.amount));
      }
    });

    this.fg.valueChanges.subscribe(console.log);
  }

  ionViewWillEnter() {
    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    const allCategories$ = this.offlineService.getAllCategories();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    const accounts$ = this.offlineService.getAccounts();
    const eou$ = from(this.authService.getEou());

    this.mode = this.activatedRoute.snapshot.params.id ? 'edit' : 'add';
    this.isCreatedFromCCC = !this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn;
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;
    this.reviewList = this.activatedRoute.snapshot.params.txnIds;
    this.title = 'Add Expense';
    this.title = this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    this.isProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.projects && orgSettings.projects.enabled)
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
      shareReplay()
    );

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
      concatMap(() => {
        const formValue = this.fg.value;
        return this.customInputsService.getAll(true).pipe(
          map(customFields => {
            // TODO: Convert custom properties to get generated from formValue
            return this.customFieldsService.standardizeCustomFields([],
              this.customInputsService.filterByCategory(customFields, formValue.category && formValue.category.id));
          })
        );
      }),
      tap(console.log),
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
        return etxn.tx_report_id ? this.reportService.getReport(etxn.tx_report_id) : of(null)
      })
    );

    forkJoin({
      etxn: this.etxn$,
      paymentModes: this.paymentModes$,
      project: etxnProject$,
      category: etxnCategory$,
      report: etxnReport$
    }).subscribe(({ etxn, paymentModes, project, category, report }) => {
      console.log(etxn);
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
        dateOfSpend: moment(etxn.tx.txn_dt).format('y-MM-D'),
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
        bus_travel_class: null
      });
    });
  }

}
