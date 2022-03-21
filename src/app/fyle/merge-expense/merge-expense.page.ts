import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, forkJoin, from, noop, Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  concatMap,
  finalize,
  map,
  reduce,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  toArray,
  scan,
  filter,
} from 'rxjs/operators';
import { OfflineService } from 'src/app/core/services/offline.service';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import * as moment from 'moment';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { ActionSheetController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { FileService } from 'src/app/core/services/file.service';
import { CorporateCreditCardExpenseService } from '../../core/services/corporate-credit-card-expense.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FileObject } from 'src/app/core/models/file_obj.model';
import { TaxGroup } from 'src/app/core/models/tax_group.model';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { Expense } from 'src/app/core/models/expense.model';
import { MergeExpensesService } from 'src/app/core/services/merge-expenses.service';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { CorporateCardExpense } from 'src/app/core/models/v2/corporate-card-expense.model';
import { ExpensesInfo } from 'src/app/core/services/expenses-info.model';

type option = Partial<{ label: string; value: any }>;
type optionsData = Partial<{ options: option[]; areSameValues: boolean }>;
@Component({
  selector: 'app-merge-expense',
  templateUrl: './merge-expense.page.html',
  styleUrls: ['./merge-expense.page.scss'],
})
export class MergeExpensePage implements OnInit {
  @ViewChild('formContainer') formContainer: ElementRef;

  expenses: Expense[];

  mergedExpense = {};

  mergedExpenseOptions: any = {};

  fg: FormGroup;

  expenseOptions$: Observable<option[]>;

  amountOptionsData$: Observable<optionsData>;

  dateOfSpendOptionsData$: Observable<optionsData>;

  paymentModeOptionsData$: Observable<optionsData>;

  projectOptionsData$: Observable<optionsData>;

  billableOptionsData$: Observable<optionsData>;

  isMerging = false;

  selectedReceiptsId: string[] = [];

  customInputs$: Observable<any>;

  attachments$: Observable<FileObject[]>;

  taxGroups$: Observable<TaxGroup[]>;

  taxGroupsOptions$: Observable<option[]>;

  isLoaded = false;

  projects;

  categories;

  combinedCustomProperties: any = {};

  customPropertiesLoaded: boolean;

  receiptOptions$: Observable<option[]>;

  disableFormElements = false;

  isReportedExpensePresent: boolean;

  showReceiptSelection: boolean;

  disableExpenseToKeep: boolean;

  expenseToKeepInfoText: string;

  selectedExpense;

  CCCTxn$: Observable<CorporateCardExpense[]>;

  location1Options: option[];

  location2Options: option[];

  redirectedFrom: string;

  constructor(
    private router: Router,
    private offlineService: OfflineService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private projectService: ProjectsService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private fileService: FileService,
    private navController: NavController,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private trackingService: TrackingService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private mergeExpensesService: MergeExpensesService,
    private humanizeCurrency: HumanizeCurrencyPipe,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.expenses =
      this.activatedRoute.snapshot.params.selectedElements &&
      JSON.parse(this.activatedRoute.snapshot.params.selectedElements);
    this.redirectedFrom = this.activatedRoute.snapshot.params.from;
  }

  ionViewWillEnter() {
    this.fg = this.formBuilder.group({
      target_txn_id: [, Validators.required],
      currencyObj: [],
      paymentMode: [, Validators.required],
      amount: [],
      project: [],
      category: [],
      dateOfSpend: [],
      vendor: [],
      purpose: [],
      report: [],
      tax_group: [],
      tax_amount: [],
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
      costCenter: [],
      hotel_is_breakfast_provided: [],
      receipt_ids: [],
      genericFields: this.formBuilder.group({
        amount: [],
        receipt_ids: [],
        dateOfSpend: [],
        paymentMode: [],
        project: [],
        billable: [],
      }),
      customInputFields: [],
    });

    this.generateCustomInputOptions();
    this.setupCustomFields();

    this.location1Options = this.mergeExpensesService.generateLocationOptions(this.expenses, 0);
    this.location2Options = this.mergeExpensesService.generateLocationOptions(this.expenses, 1);

    from(Object.keys(this.expenses[0])).subscribe((field) => {
      this.mergedExpenseOptions[field] = {};
      this.mergedExpenseOptions[field].options = [];
      this.expenses.map((expense) => {
        if (expense[field] !== undefined && expense[field] !== null) {
          let label = String(expense[field]);
          if (field === 'tx_amount') {
            label = parseFloat(expense[field]).toFixed(2);
          }
          this.mergedExpenseOptions[field].options.push({
            label,
            value: expense[field],
          });
        }
      });

      let values = this.mergedExpenseOptions[field].options.map((field) => field.value);
      if (field === 'tx_txn_dt' || field === 'tx_from_dt' || field === 'tx_to_dt') {
        values = this.mergedExpenseOptions[field].options.map((field) =>
          new Date(new Date(field.value).toDateString()).getTime()
        );
        this.mergedExpenseOptions[field].options = this.mergeExpensesService.formatDateOptions(
          this.mergedExpenseOptions[field].options
        );
      }

      if (field === 'source_account_type') {
        this.mergedExpenseOptions[field].options = this.mergeExpensesService.formatPaymentModeOptions(
          this.mergedExpenseOptions[field].options
        );
      }

      if (field === 'tx_billable') {
        this.mergedExpenseOptions[field].options = this.mergeExpensesService.formatBillableOptions(
          this.mergedExpenseOptions[field].options
        );
      }

      const isDuplicate = values.some((field, index) => values.indexOf(field) !== index);
      this.mergedExpenseOptions[field].isSame = isDuplicate;

      this.patchValuesOnLoad(field, isDuplicate);
    });

    this.expenseOptions$ = this.mergeExpensesService.generateExpenseToKeepOptions(this.expenses);

    this.receiptOptions$ = this.mergeExpensesService.generateReceiptOptions(this.expenses).pipe(shareReplay(1));

    this.amountOptionsData$ = this.mergeExpensesService.generateAmountOptions(this.expenses).pipe(shareReplay(1));

    this.dateOfSpendOptionsData$ = this.mergeExpensesService
      .generateDateOfSpendOptions(this.expenses)
      .pipe(shareReplay(1));

    this.paymentModeOptionsData$ = this.mergeExpensesService
      .generatePaymentModeOptions(this.expenses)
      .pipe(shareReplay(1));

    this.projectOptionsData$ = this.mergeExpensesService.generateProjectOptions(this.expenses).pipe(shareReplay(1));

    this.billableOptionsData$ = this.mergeExpensesService.generateBillableOptions(this.expenses).pipe(shareReplay(1));

    this.patchValueOnLoad1();
    this.projectService.getAllActive().subscribe((projects) => {
      this.projects = projects;
      this.mergedExpenseOptions.tx_project_id.options = this.mergedExpenseOptions.tx_project_id.options.map(
        (option) => {
          option.label = this.projects[this.projects.map((project) => project.id).indexOf(option.value)].name;
          return option;
        }
      );
      if (
        this.mergedExpenseOptions.tx_project_id.options[0] &&
        this.mergedExpenseOptions.tx_project_id.options[0].value
      ) {
        this.fg.patchValue({
          project: this.mergedExpenseOptions.tx_project_id.options[0].value,
        });
      }
    });

    const allCategories$ = this.offlineService.getAllEnabledCategories();

    allCategories$
      .pipe(map((catogories) => this.categoriesService.filterRequired(catogories)))
      .subscribe((categories) => {
        this.categories = categories;
        this.mergedExpenseOptions.tx_org_category_id.options = this.mergedExpenseOptions.tx_org_category_id.options
          .map((option) => {
            option.label =
              this.categories[this.categories.map((category) => category.id).indexOf(option.value)]?.displayName;
            if (!option.label) {
              option.label = 'Unspecified';
            }
            return option;
          })
          .filter(
            (option, index, options) =>
              options.findIndex((currentOption) => currentOption.label === option.label) === index
          );

        if (this.mergedExpenseOptions.tx_org_category_id.options[0]) {
          setTimeout(() => {
            this.fg.patchValue({
              category: this.mergedExpenseOptions.tx_org_category_id.options[0].value,
            });
          }, 600);
        }
      });

    this.taxGroups$ = this.offlineService.getEnabledTaxGroups().pipe(shareReplay(1));
    this.taxGroupsOptions$ = this.taxGroups$.pipe(
      map((taxGroupsOptions) => taxGroupsOptions.map((tg) => ({ label: tg.name, value: tg })))
    );

    this.taxGroups$.subscribe((taxGroups) => {
      this.mergedExpenseOptions.tx_tax_group_id.options = this.mergedExpenseOptions.tx_tax_group_id.options.map(
        (option) => {
          option.label = taxGroups[taxGroups.map((taxGroup) => taxGroup.id).indexOf(option.value)]?.name;
          return option;
        }
      );
    });

    this.fg.controls.target_txn_id.valueChanges.subscribe((expenseId) => {
      const selectedIndex = this.expenses.map((e) => e.tx_id).indexOf(expenseId);
      this.onExpenseChanged(selectedIndex);
      this.fg.patchValue({
        amount: expenseId,
      });
    });

    const expensesInfo = this.mergeExpensesService.setDefaultExpenseToKeep(this.expenses);
    const isAllAdvanceExpenses = this.mergeExpensesService.isAllAdvanceExpenses(this.expenses);
    this.setInitialExpenseToKeepDetails(expensesInfo, isAllAdvanceExpenses);
    this.onPaymentModeChange();
    this.loadAttchments();
    // this.fg.controls.genericFields.get('amount').disable();
    this.isLoaded = true;
  }

  patchValueOnLoad1() {
    return forkJoin({
      amountOptionsData: this.amountOptionsData$,
      dateOfSpendOptionsData: this.dateOfSpendOptionsData$,
      paymentModeOptionsData: this.paymentModeOptionsData$,
      projectOptionsData: this.projectOptionsData$,
      billableOptionsData: this.billableOptionsData$,
    }).subscribe(
      ({
        amountOptionsData,
        dateOfSpendOptionsData,
        paymentModeOptionsData,
        projectOptionsData,
        billableOptionsData,
      }) => {
        console.log(billableOptionsData);
        this.fg.patchValue({
          genericFields: {
            amount: amountOptionsData?.areSameValues && amountOptionsData?.options[0].value,
            dateOfSpend: dateOfSpendOptionsData?.areSameValues && dateOfSpendOptionsData?.options[0].value,
            paymentMode: paymentModeOptionsData?.areSameValues && paymentModeOptionsData?.options[0].value,
            project: projectOptionsData?.areSameValues && projectOptionsData?.options[0].value,
            billable: billableOptionsData?.areSameValues && billableOptionsData?.options[0].value,
          },
        });
      }
    );
  }

  clickTo() {
    this.patchValueOnLoad1();
    // console.log(this.fg.controls.genericFields);
    console.log(this.fg.controls.genericFields);
    // console.log(this.fg.controls.genericFields);
    // this.fg.controls.genericFields.get('amount').disable();
  }

  // eslint-disable-next-line complexity
  patchValuesOnLoad(field: string, isDuplicate: boolean) {
    if (field === 'source_account_type' && isDuplicate) {
      this.fg.patchValue({
        paymentMode: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    // if (field === 'tx_currency' && isDuplicate) {
    //   this.fg.patchValue({
    //     currencyObj: this.mergedExpenseOptions[field].options[0].value,
    //   });
    // }

    if (field === 'tx_txn_dt' && isDuplicate) {
      this.fg.patchValue({
        dateOfSpend: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    // if (field === 'tx_amount' && isDuplicate) {
    //   this.fg.patchValue({
    //     amount: this.mergedExpenseOptions[field].options[0].value,
    //   });
    // }

    if (field === 'tx_billable' && isDuplicate) {
      this.fg.patchValue({
        billable: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    if (field === 'tx_vendor' && isDuplicate) {
      this.fg.patchValue({
        vendor: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    if (field === 'tx_cost_center_name' && isDuplicate) {
      this.fg.patchValue({
        costCenter: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    if (field === 'tx_purpose' && isDuplicate) {
      this.fg.patchValue({
        purpose: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    if (field === 'tx_tax_group_id' && isDuplicate) {
      this.fg.patchValue({
        tax_group: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    if (field === 'tx_tax_amount' && isDuplicate) {
      this.fg.patchValue({
        tax_amount: this.mergedExpenseOptions[field].options[0].value,
      });
    }
  }

  loadAttchments() {
    this.attachments$ = this.fg.controls.genericFields.get('receipt_ids').valueChanges.pipe(
      startWith({}),
      switchMap((receipt_ids) => this.mergeExpensesService.getAttachements(receipt_ids)),
      tap((receipts) => {
        this.selectedReceiptsId = receipts.map((receipt) => receipt.id);
      })
    );
  }

  mergeExpense() {
    console.log(this.fg.value);
    return;
    const selectedExpense = this.fg.value.target_txn_id;
    this.fg.markAllAsTouched();
    if (!this.fg.valid) {
      return;
    }
    this.isMerging = true;
    let sourceTxnIds = [];
    this.expenses.map((expense) => {
      sourceTxnIds.push(expense.tx_id);
    });
    sourceTxnIds = sourceTxnIds.filter((id) => id !== selectedExpense);

    this.generateFromFg()
      .pipe(
        take(1),
        switchMap((formValues) =>
          this.mergeExpensesService.mergeExpenses(sourceTxnIds, selectedExpense, formValues).pipe(
            finalize(() => {
              this.isMerging = false;
              this.showMergedSuccessToast();
              this.goBack();
            })
          )
        )
      )
      .subscribe(noop);
  }

  goBack() {
    if (this.redirectedFrom === 'EDIT_EXPENSE') {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    } else {
      this.navController.back();
    }
  }

  showMergedSuccessToast() {
    const toastMessageData = {
      message: 'Expenses merged Successfully',
    };
    this.matSnackBar
      .openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
        panelClass: ['msb-success-with-camera-icon'],
      })
      .onAction()
      .subscribe(noop);
  }

  generateFromFg() {
    const customFields$ = this.getCustomFields();
    const sourceExpense = this.expenses.find((expense) => expense.source_account_type === this.fg.value.paymentMode);
    const amountExpense = this.expenses.find((expense) => expense.tx_id === this.fg.value.amount);
    const CCCGroupIds = this.expenses.map(
      (expense) =>
        expense.tx_corporate_credit_card_expense_group_id && expense.tx_corporate_credit_card_expense_group_id
    );
    let locations;
    if (this.fg.value.location_1 && this.fg.value.location_2) {
      locations = [this.fg.value.location_1, this.fg.value.location_2];
    } else if (this.fg.value.location_1) {
      locations = [this.fg.value.location_1];
    }
    return customFields$.pipe(
      take(1),
      map((customProperties) => ({
        source_account_id: sourceExpense?.tx_source_account_id,
        billable: this.fg.value.billable,
        currency: amountExpense?.tx_currency,
        amount: amountExpense?.tx_amount,
        project_id: this.fg.value.project,
        tax_amount: this.fg.value.tax_amount,
        tax_group_id: this.fg.value.tax_group && this.fg.value.tax_group.id,
        org_category_id: this.fg.value.category && this.fg.value.category,
        fyle_category: this.fg.value.category && this.fg.value.category.category,
        policy_amount: null,
        vendor: this.fg.value.vendor,
        purpose: this.fg.value.purpose,
        txn_dt: this.fg.value.dateOfSpend,
        receipt_ids: this.selectedReceiptsId,
        custom_properties: customProperties,
        ccce_group_id: CCCGroupIds && CCCGroupIds[0],
        from_dt: this.fg.value.from_dt,
        to_dt: this.fg.value.to_dt,
        flight_journey_travel_class: this.fg.value.flight_journey_travel_class,
        flight_return_travel_class: this.fg.value.flight_return_travel_class,
        train_travel_class: this.fg.value.train_travel_class,
        bus_travel_class: this.fg.value.bus_travel_class,
        distance: this.fg.value.distance,
        distance_unit: this.fg.value.distance_unit,
        locations: locations || [],
      }))
    );
  }

  setupCustomFields() {
    this.customInputs$ = this.fg.controls.category.valueChanges.pipe(
      startWith({}),
      switchMap(() =>
        this.offlineService.getCustomInputs().pipe(
          switchMap((fields) => {
            const formValue = this.fg.value;
            const customFields = this.customFieldsService.standardizeCustomFields(
              formValue.custom_inputs || [],
              this.customInputsService.filterByCategory(fields, this.fg.value.category)
            );

            const customFieldsFormArray = this.fg.controls.custom_inputs as FormArray;
            customFieldsFormArray.clear();
            for (const customField of customFields) {
              customFieldsFormArray.push(
                this.formBuilder.group({
                  name: [customField.name],
                  value: [customField.value],
                })
              );
            }
            customFieldsFormArray.updateValueAndValidity();
            return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
          }),
          toArray()
        )
      ),
      tap((customInputs) => {
        if (!this.isMerging) {
          this.patchValues(customInputs);
        }
      })
    );
  }

  patchValues(customInputs) {
    const customInputValues = customInputs.map((customInput) => {
      if (
        this.combinedCustomProperties[customInput.name] &&
        this.combinedCustomProperties[customInput.name] &&
        this.combinedCustomProperties[customInput.name].isSame &&
        this.combinedCustomProperties[customInput.name].options.length > 0
      ) {
        return {
          name: customInput.name,
          value: this.combinedCustomProperties[customInput.name].options[0].value || null,
        };
      } else {
        return {
          name: customInput.name,
          value: null,
        };
      }
    });
    this.fg.controls.custom_inputs.patchValue(customInputValues);
  }

  onPaymentModeChange() {
    this.CCCTxn$ = this.fg.controls.paymentMode.valueChanges.pipe(
      startWith({}),
      switchMap(() => this.mergeExpensesService.getCardCardTransactions(this.expenses))
    );
  }

  getCategoryName(options: option[]) {
    if (!options || !this.categories) {
      return;
    }
    const label = this.categories[this.categories.map((category) => category.id).indexOf(options)]?.displayName;

    return label;
  }

  generateCustomInputOptions() {
    let customProperties = this.expenses.map((expense) => {
      if (expense.tx_custom_properties !== null && expense.tx_custom_properties.length > 0) {
        return expense.tx_custom_properties;
      }
    });

    customProperties = customProperties.filter((element) => element !== undefined);

    let combinedCustomProperties = [].concat.apply([], customProperties);

    combinedCustomProperties = combinedCustomProperties.map((field) => {
      if (field.value && field.value instanceof Array) {
        field.options = [
          {
            label: field.value.toString(),
            value: field.value,
          },
        ];
        if (field.value.length === 0) {
          field.options = [];
        }
      } else {
        if (!field.value || field.value !== '') {
          field.options = [];
        } else {
          field.options = [
            {
              label: field.value,
              value: field.value,
            },
          ];
        }
      }
      return field;
    });

    const customProperty = [];

    combinedCustomProperties.forEach((field) => {
      const existing = customProperty.filter((option) => option.name === field.name);
      if (field.value) {
        let formatedlabel;
        if (moment(field.value, moment.ISO_8601, true).isValid()) {
          formatedlabel = moment(field.value).format('MMM DD, YYYY');
        } else {
          formatedlabel = field.value.toString();
        }
        if (existing.length) {
          const existingIndex = customProperty.indexOf(existing[0]);
          if (
            typeof customProperty[existingIndex].value === 'string' ||
            typeof customProperty[existingIndex].value === 'number'
          ) {
            customProperty[existingIndex].options.push({ label: formatedlabel, value: field.value });
          } else {
            customProperty[existingIndex].options = customProperty[existingIndex].options.concat(field.options);
          }
        } else {
          field.options = [];
          field.options.push({ label: formatedlabel, value: field.value });
          customProperty.push(field);
        }
      }
    });

    const customPropertiesOptions = customProperty.map((field) => {
      let options;
      if (field.options) {
        options = field.options.filter((option) => option != null);
        options = field.options.filter((option) => option !== '');

        const values = options.map((item) => item.label);

        const isDuplicate = values.some((item, index) => values.indexOf(item) !== index);

        field.isSame = isDuplicate;
        field.options = options;
      } else {
        field.options = [];
      }
      return field;
    });

    customPropertiesOptions.map((field) => {
      this.combinedCustomProperties[field.name] = field;
    });

    this.customPropertiesLoaded = true;
  }

  onExpenseChanged(selectedIndex: number) {
    // eslint-disable-next-line complexity
    from(Object.keys(this.expenses[selectedIndex])).subscribe((field) => {
      const values = this.mergedExpenseOptions[field].options.map((field) => field.value);
      const isDuplicate = values.some((field, index) => values.indexOf(field) !== index);
      if (
        this.mergedExpenseOptions[field].options[selectedIndex] &&
        this.mergedExpenseOptions[field].options[selectedIndex].value &&
        !isDuplicate
      ) {
        if (this.expenses[selectedIndex].tx_file_ids !== null) {
          this.fg.patchValue({
            receipt_ids: this.expenses[selectedIndex].tx_split_group_id,
          });
        }

        if (field === 'source_account_type' && !this.fg.controls.paymentMode.touched) {
          this.fg.patchValue({
            paymentMode: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        // if (field === 'tx_currency' && !this.fg.controls.currencyObj.touched) {
        //   this.fg.patchValue({
        //     currencyObj: this.mergedExpenseOptions[field].options[selectedIndex].value,
        //   });
        // }

        if (field === 'tx_txn_dt' && !this.fg.controls.dateOfSpend.touched) {
          this.fg.patchValue({
            dateOfSpend: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        // if (field === 'tx_amount' && !this.fg.controls.amount.touched) {
        //   this.fg.patchValue({
        //     amount: this.mergedExpenseOptions[field].options[selectedIndex].value,
        //   });
        // }

        if (field === 'tx_billable' && !this.fg.controls.billable.touched) {
          this.fg.patchValue({
            billable: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        if (field === 'tx_project_id' && !this.fg.controls.project.touched) {
          this.fg.patchValue({
            project: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        if (field === 'tx_vendor' && !this.fg.controls.vendor.touched) {
          this.fg.patchValue({
            vendor: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }
        if (field === 'tx_org_category_id' && !this.fg.controls.category.touched) {
          this.fg.patchValue({
            category: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        if (field === 'tx_cost_center_name' && !this.fg.controls.costCenter.touched) {
          this.fg.patchValue({
            costCenter: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        if (field === 'tx_purpose' && !this.fg.controls.purpose.touched) {
          this.fg.patchValue({
            purpose: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        if (field === 'tx_tax_group_id' && !this.fg.controls.purpose.touched) {
          this.fg.patchValue({
            tax_group: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        if (field === 'tx_tax_amount' && !this.fg.controls.purpose.touched) {
          this.fg.patchValue({
            tax_amount: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }
      }
    });
  }

  setAdvanceOrApprovedAndAbove(expensesInfo: ExpensesInfo) {
    const isApprovedAndAbove = this.mergeExpensesService.isApprovedAndAbove(this.expenses);
    this.disableFormElements = (isApprovedAndAbove && isApprovedAndAbove.length > 0) || expensesInfo.isAdvancePresent;
  }

  setIsReported(expensesInfo: ExpensesInfo) {
    const isReported = this.mergeExpensesService.isReportedPresent(this.expenses);
    this.isReportedExpensePresent = isReported && isReported.length > 0;
    if (this.isReportedExpensePresent && expensesInfo.isAdvancePresent) {
      this.disableFormElements = true;
      this.showReceiptSelection = true;
    }
  }

  setInitialExpenseToKeepDetails(expensesInfo: ExpensesInfo, isAllAdvanceExpenses: boolean) {
    if (expensesInfo.defaultExpenses) {
      if (this.mergeExpensesService.isReportedOrAbove(expensesInfo)) {
        this.setIsReported(expensesInfo);
        this.disableExpenseToKeep = true;
        this.expenseToKeepInfoText = 'You are required to keep the expense that has already been submitted.';
        this.fg.patchValue({
          target_txn_id: expensesInfo.defaultExpenses[0].tx_split_group_id,
        });
      } else if (this.mergeExpensesService.isMoreThanOneAdvancePresent(expensesInfo, isAllAdvanceExpenses)) {
        this.selectedExpense = null;
        this.showReceiptSelection = true;
        this.expenseToKeepInfoText =
          'You cannot make changes to an expense paid from ‘advance’. Edit each expense separately if you wish to make any changes.';
      } else if (this.mergeExpensesService.isAdvancePresent(expensesInfo)) {
        this.fg.patchValue({
          target_txn_id: expensesInfo.defaultExpenses[0].tx_split_group_id,
        });
        this.disableExpenseToKeep = true;
        this.expenseToKeepInfoText =
          'You are required to keep the expense paid from ‘advance’. Edit each expense separately if you wish to make any changes.';
      }
      this.setAdvanceOrApprovedAndAbove(expensesInfo);
    }
  }

  getCustomFields() {
    return this.customInputs$.pipe(
      take(1),
      map((customInputs) =>
        customInputs.map((customInput, i) => ({
          id: customInput.id,
          name: customInput.name,
          value: this.fg.value.custom_inputs[i].value,
        }))
      )
    );
  }
}
