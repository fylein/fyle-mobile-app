import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { from, noop, Observable, of, Subject } from 'rxjs';
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
} from 'rxjs/operators';
import { OfflineService } from 'src/app/core/services/offline.service';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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

  isMerging = false;

  selectedReceiptsId: string[] = [];

  customInputs$: Observable<any>;

  attachments$: Observable<FileObject[]>;

  taxGroups$: Observable<TaxGroup[]>;

  taxGroupsOptions$: Observable<option[]>;

  isLoaded = false;

  projects;

  categories;

  mergedCustomProperties: any = {};

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

  from: string;

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
    private humanizeCurrency: HumanizeCurrencyPipe
  ) {}

  ngOnInit() {
    this.expenses = this.router.getCurrentNavigation().extras.state.selectedElements;
    this.from = this.router.getCurrentNavigation().extras.state.from;
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
    });

    this.generateCustomInputOptions();
    this.setupCustomFields();
    this.generateLocationOptions();

    from(Object.keys(this.expenses[0])).subscribe((field) => {
      this.mergedExpenseOptions[field] = {};
      this.mergedExpenseOptions[field].options = [];
      from(this.expenses)
        .pipe(
          map((expense) => {
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
          })
        )
        .subscribe(noop);

      let values = this.mergedExpenseOptions[field].options.map((field) => field.value);
      if (field === 'tx_txn_dt') {
        values = this.mergedExpenseOptions[field].options.map((field) =>
          new Date(new Date(field.value).toDateString()).getTime()
        );
      }

      const isDuplicate = values.some((field, idx) => values.indexOf(field) !== idx);
      this.mergedExpenseOptions[field].isSame = isDuplicate;
      this.patchValuesOnLoad(field, isDuplicate);
    });

    this.expenseOptions$ = from(this.expenses).pipe(
      map((expense) => {
        let vendorOrCategory = '';
        if (expense.tx_org_category) {
          vendorOrCategory = expense.tx_org_category;
        }
        if (expense.tx_vendor) {
          vendorOrCategory = expense.tx_vendor;
        }
        let projectName = '';
        if (expense.tx_project_name) {
          projectName = `- ${expense.tx_project_name}`;
        }

        let date = '';
        if (expense.tx_txn_dt) {
          date = moment(expense.tx_txn_dt).format('MMM DD');
        }
        let amount = this.humanizeCurrency.transform(expense.tx_amount, expense.tx_currency, 2);
        if (!date) {
          amount = '';
        }
        return {
          label: `${date} ${amount} ${vendorOrCategory} ${projectName}`,
          value: expense.tx_id,
        };
      }),
      scan((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      shareReplay(1)
    );

    this.receiptOptions$ = from(this.expenses).pipe(
      map((expense, index) => ({
        label: `Receipt From Expense ${index + 1} `,
        value: expense.tx_id,
      })),
      scan((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      shareReplay(1)
    );

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

    this.loadAttchments();
    this.fg.controls.target_txn_id.valueChanges.subscribe((expenseId) => {
      const selectedIndex = this.expenses.map((e) => e.tx_id).indexOf(expenseId);
      this.onExpenseChanged(selectedIndex);
    });

    const expensesInfo = this.mergeExpensesService.setDefaultExpenseToKeep(this.expenses);
    const isAllAdvanceExpenses = this.mergeExpensesService.isAllAdvanceExpenses(this.expenses);
    this.setInitialExpenseToKeepDetails(expensesInfo, isAllAdvanceExpenses);
    this.onPaymentModeChange();
    this.isLoaded = true;
  }

  // eslint-disable-next-line complexity
  patchValuesOnLoad(field: string, isDuplicate: boolean) {
    if (field === 'source_account_type' && isDuplicate) {
      this.fg.patchValue({
        paymentMode: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    if (field === 'tx_currency' && isDuplicate) {
      this.fg.patchValue({
        currencyObj: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    if (field === 'tx_txn_dt' && isDuplicate) {
      this.fg.patchValue({
        dateOfSpend: this.mergedExpenseOptions[field].options[0].value,
      });
    }

    if (field === 'tx_amount' && isDuplicate) {
      this.fg.patchValue({
        amount: this.mergedExpenseOptions[field].options[0].value,
      });
    }

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
    this.attachments$ = this.fg.controls.receipt_ids.valueChanges.pipe(
      startWith({}),
      switchMap((etxn) =>
        this.fileService.findByTransactionId(etxn).pipe(
          switchMap((fileObjs) => from(fileObjs)),
          concatMap((fileObj: any) =>
            this.fileService.downloadUrl(fileObj.id).pipe(
              map((downloadUrl) => {
                fileObj.url = downloadUrl;
                const details = this.mergeExpensesService.getReceiptDetails(fileObj);
                fileObj.type = details.type;
                fileObj.thumbnail = details.thumbnail;
                return fileObj;
              })
            )
          ),
          reduce((acc, curr) => acc.concat(curr), [])
        )
      ),
      tap((receipts) => {
        this.selectedReceiptsId = receipts.map((receipt) => receipt.id);
      })
    );
  }

  mergeExpense() {
    const selectedExpense = this.fg.value.target_txn_id;
    this.fg.markAllAsTouched();
    if (!this.fg.valid) {
      return;
    }
    this.isMerging = true;
    const source_txn_ids = [];
    from(this.expenses)
      .pipe(
        map((expense) => {
          source_txn_ids.push(expense.tx_id);
        })
      )
      .subscribe(noop);

    const index = source_txn_ids.findIndex((id) => id === selectedExpense);
    source_txn_ids.splice(index, 1);
    this.generateFromFg()
      .pipe(
        take(1),
        switchMap((formValues) =>
          this.mergeExpensesService.mergeExpenses(source_txn_ids, selectedExpense, formValues).pipe(
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
    if (this.from === 'EDIT_EXPENSE') {
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
    const customInputs$ = this.getCustomFields();
    const result = this.expenses.find((obj) => obj.source_account_type === this.fg.value.paymentMode);
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
    return customInputs$.pipe(
      take(1),
      switchMap(async (customProperties) => ({
        source_account_id: result && result.tx_source_account_id,
        billable: this.fg.value.billable,
        currency: this.fg.value.currencyObj,
        amount: this.fg.value.amount,
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
        this.mergedCustomProperties[customInput.name] &&
        this.mergedCustomProperties[customInput.name] &&
        this.mergedCustomProperties[customInput.name].isSame &&
        this.mergedCustomProperties[customInput.name].options.length > 0
      ) {
        return {
          name: customInput.name,
          value: this.mergedCustomProperties[customInput.name].options[0].value || null,
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
      switchMap(() =>
        this.offlineService.getCustomInputs().pipe(
          switchMap(() => {
            const CCCGroupIds = this.expenses.map(
              (expense) =>
                expense.tx_corporate_credit_card_expense_group_id && expense.tx_corporate_credit_card_expense_group_id
            );

            if (CCCGroupIds && CCCGroupIds.length > 0) {
              const queryParams = {
                group_id: ['in.(' + CCCGroupIds + ')'],
              };
              const params: any = {};
              params.queryParams = queryParams;
              params.offset = 0;
              params.limit = 1;
              return this.corporateCreditCardExpenseService.getv2CardTransactions(params).pipe(map((res) => res.data));
            } else {
              return of([]);
            }
          })
        )
      )
    );
  }

  formatDateOptions(options: option[]) {
    return options.map((option) => {
      option.label = moment(option.label).format('MMM DD, YYYY');
      return option;
    });
  }

  formatPaymentModeOptions(options: option[]) {
    return options.map((option) => {
      if (option.value === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT') {
        option.label = 'Paid via Corporate Card';
      } else if (option.value === 'PERSONAL_ACCOUNT') {
        option.label = 'Paid by Me';
      } else if (option.value === 'PERSONAL_ADVANCE_ACCOUNT') {
        option.label = 'Paid from Advance';
      }
      return option;
    });
  }

  formatBillableOptions(options: option[]) {
    return options.map((option) => {
      if (option.value === true) {
        option.label = 'Yes';
      } else {
        option.label = 'No';
      }
      return option;
    });
  }

  formatReceiptOptions(options: option[]) {
    if (!options) {
      return;
    }
    return options.filter((option, index) => this.expenses[index].tx_file_ids !== null);
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

    let mergedCustomProperties = [].concat.apply([], customProperties);

    mergedCustomProperties = mergedCustomProperties.map((field) => {
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

    mergedCustomProperties.forEach((field) => {
      const existing = customProperty.filter((option) => option.name === field.name);
      if (existing.length) {
        const existingIndex = customProperty.indexOf(existing[0]);

        if (
          typeof customProperty[existingIndex].value === 'string' ||
          typeof customProperty[existingIndex].value === 'number'
        ) {
          customProperty[existingIndex].options.push({ label: field.value.toString(), value: field.value });
        } else {
          customProperty[existingIndex].options = customProperty[existingIndex].options.concat(field.options);
        }
      } else {
        if ((field.value && typeof field.value === 'string') || typeof field.value === 'number') {
          field.options.push({ label: field.value.toString(), value: field.value });
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
      this.mergedCustomProperties[field.name] = field;
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

        if (field === 'tx_currency' && !this.fg.controls.currencyObj.touched) {
          this.fg.patchValue({
            currencyObj: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        if (field === 'tx_txn_dt' && !this.fg.controls.dateOfSpend.touched) {
          this.fg.patchValue({
            dateOfSpend: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

        if (field === 'tx_amount' && !this.fg.controls.amount.touched) {
          this.fg.patchValue({
            amount: this.mergedExpenseOptions[field].options[selectedIndex].value,
          });
        }

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

  generateLocationOptions() {
    this.location1Options = this.expenses
      .map((expense) => ({
        label: expense.tx_locations[0]?.formatted_address,
        value: expense.tx_locations[0],
      }))
      .filter((res) => res.value);

    this.location2Options = this.expenses
      .map((expense) => ({
        label: expense.tx_locations[1]?.formatted_address,
        value: expense.tx_locations[1],
      }))
      .filter((res) => res.value);
  }
}
