import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { forkJoin, noop, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, shareReplay, startWith, switchMap, take, tap, toArray } from 'rxjs/operators';
import { OfflineService } from 'src/app/core/services/offline.service';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { NavController } from '@ionic/angular';
import { FileObject } from 'src/app/core/models/file_obj.model';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { Expense } from 'src/app/core/models/expense.model';
import { MergeExpensesService } from 'src/app/core/services/merge-expenses.service';
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
  expenses: Expense[];

  fg: FormGroup;

  expenseOptions$: Observable<option[]>;

  amountOptionsData$: Observable<optionsData>;

  dateOfSpendOptionsData$: Observable<optionsData>;

  paymentModeOptionsData$: Observable<optionsData>;

  projectOptionsData$: Observable<optionsData>;

  billableOptionsData$: Observable<optionsData>;

  vendorOptionsData$: Observable<optionsData>;

  categoryOptionsData$: Observable<optionsData>;

  taxGroupOptionsData$: Observable<optionsData>;

  taxAmountOptionsData$: Observable<optionsData>;

  constCenterOptionsData$: Observable<optionsData>;

  purposeOptionsData$: Observable<optionsData>;

  location1OptionsData$: Observable<optionsData>;

  location2OptionsData$: Observable<optionsData>;

  onwardDateOptionsData$: Observable<optionsData>;

  returnDateOptionsData$: Observable<optionsData>;

  flightJourneyTravelClassOptionsData$: Observable<optionsData>;

  flightReturnTravelClassOptionsData$: Observable<optionsData>;

  trainTravelClassOptionsData$: Observable<optionsData>;

  busTravelClassOptionsData$: Observable<optionsData>;

  distanceOptionsData$: Observable<optionsData>;

  distanceUnitOptionsData$: Observable<optionsData>;

  receiptOptions$: Observable<option[]>;

  isMerging = false;

  selectedReceiptsId: string[] = [];

  customInputs$: Observable<any>;

  attachments$: Observable<FileObject[]>;

  combinedCustomProperties: any = {};

  disableFormElements = false;

  isReportedExpensePresent: boolean;

  showReceiptSelection: boolean;

  disableExpenseToKeep: boolean;

  expenseToKeepInfoText: string;

  CCCTxn$: Observable<CorporateCardExpense[]>;

  redirectedFrom: string;

  constructor(
    private router: Router,
    private offlineService: OfflineService,
    private formBuilder: FormBuilder,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private navController: NavController,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private mergeExpensesService: MergeExpensesService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.expenses = JSON.parse(this.activatedRoute.snapshot.params?.selectedElements);
    this.redirectedFrom = this.activatedRoute.snapshot.params.from;
  }

  ionViewWillEnter() {
    this.fg = this.formBuilder.group({
      target_txn_id: [, Validators.required],
      genericFields: this.formBuilder.group({
        amount: [, Validators.required],
        receipt_ids: [],
        dateOfSpend: [],
        paymentMode: [, Validators.required],
        project: [],
        billable: [],
        vendor: [],
        category: [],
        tax_group: [],
        tax_amount: [],
        costCenter: [],
        purpose: [],
      }),
      categoryDependent: this.formBuilder.group({
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
      }),
      custom_inputs: new FormArray([]),
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

    this.vendorOptionsData$ = this.mergeExpensesService.generateVendorOptions(this.expenses).pipe(shareReplay(1));

    this.categoryOptionsData$ = this.mergeExpensesService.generateCategoryOptions(this.expenses).pipe(shareReplay(1));

    this.taxGroupOptionsData$ = this.mergeExpensesService.generateTaxGroupOptions(this.expenses).pipe(shareReplay(1));

    this.taxAmountOptionsData$ = this.mergeExpensesService.generateTaxAmountOptions(this.expenses).pipe(shareReplay(1));

    this.constCenterOptionsData$ = this.mergeExpensesService
      .generateCostCenterOptions(this.expenses)
      .pipe(shareReplay(1));

    this.purposeOptionsData$ = this.mergeExpensesService.generatePurposeOptions(this.expenses).pipe(shareReplay(1));

    this.location1OptionsData$ = this.mergeExpensesService
      .generateLocationOptions(this.expenses, 0)
      .pipe(shareReplay(1));

    this.location2OptionsData$ = this.mergeExpensesService
      .generateLocationOptions(this.expenses, 1)
      .pipe(shareReplay(1));

    this.onwardDateOptionsData$ = this.mergeExpensesService
      .generateOnwardDateOptions(this.expenses)
      .pipe(shareReplay(1));

    this.returnDateOptionsData$ = this.mergeExpensesService
      .generateReturnDateOptions(this.expenses)
      .pipe(shareReplay(1));

    this.flightJourneyTravelClassOptionsData$ = this.mergeExpensesService
      .generateFlightJourneyTravelClassOptions(this.expenses)
      .pipe(shareReplay(1));

    this.flightReturnTravelClassOptionsData$ = this.mergeExpensesService
      .generateFlightJourneyTravelClassOptions(this.expenses)
      .pipe(shareReplay(1));

    this.trainTravelClassOptionsData$ = this.mergeExpensesService
      .generateFlightReturnTravelClassOptions(this.expenses)
      .pipe(shareReplay(1));

    this.busTravelClassOptionsData$ = this.mergeExpensesService
      .generateBusTravelClassOptions(this.expenses)
      .pipe(shareReplay(1));

    this.distanceOptionsData$ = this.mergeExpensesService.generateDistanceOptions(this.expenses).pipe(shareReplay(1));

    this.distanceUnitOptionsData$ = this.mergeExpensesService
      .generateDistanceUnitOptions(this.expenses)
      .pipe(shareReplay(1));

    this.setupCustomInputs();
    this.generateCustomInputOptions();

    this.patchValuesOnGenericFields();
    this.patchValuesOnCategoryDependentFields();
    this.subscribeExpenseChange();

    const expensesInfo = this.mergeExpensesService.setDefaultExpenseToKeep(this.expenses);
    const isAllAdvanceExpenses = this.mergeExpensesService.isAllAdvanceExpenses(this.expenses);
    this.setInitialExpenseToKeepDetails(expensesInfo, isAllAdvanceExpenses);
    this.subscribePaymentModeChange();
    this.loadAttchments();
  }

  patchValuesOnGenericFields() {
    forkJoin({
      amountOptionsData: this.amountOptionsData$,
      dateOfSpendOptionsData: this.dateOfSpendOptionsData$,
      paymentModeOptionsData: this.paymentModeOptionsData$,
      projectOptionsData: this.projectOptionsData$,
      billableOptionsData: this.billableOptionsData$,
      categoryOptionsData: this.categoryOptionsData$,
      vendorOptionsData: this.vendorOptionsData$,
      taxGroupOptionsData: this.taxGroupOptionsData$,
      taxAmountOptionsData: this.taxAmountOptionsData$,
      constCenterOptionsData: this.constCenterOptionsData$,
      purposeOptionsData: this.purposeOptionsData$,
    }).subscribe(
      // eslint-disable-next-line complexity
      ({
        amountOptionsData,
        dateOfSpendOptionsData,
        paymentModeOptionsData,
        projectOptionsData,
        billableOptionsData,
        categoryOptionsData,
        vendorOptionsData,
        taxGroupOptionsData,
        taxAmountOptionsData,
        constCenterOptionsData,
        purposeOptionsData,
      }) => {
        this.fg.patchValue({
          genericFields: {
            amount: amountOptionsData?.areSameValues ? amountOptionsData?.options[0]?.value : null,
            dateOfSpend: dateOfSpendOptionsData?.areSameValues ? dateOfSpendOptionsData?.options[0]?.value : null,
            paymentMode: paymentModeOptionsData?.areSameValues ? paymentModeOptionsData?.options[0]?.value : null,
            project: projectOptionsData?.areSameValues ? projectOptionsData?.options[0]?.value : null,
            billable: billableOptionsData?.areSameValues ? billableOptionsData?.options[0]?.value : null,
            category: categoryOptionsData?.areSameValues ? categoryOptionsData?.options[0]?.value : null,
            vendor: vendorOptionsData?.areSameValues ? vendorOptionsData?.options[0]?.value : null,
            tax_group: taxGroupOptionsData?.areSameValues ? taxGroupOptionsData?.options[0]?.value : null,
            tax_amount: taxAmountOptionsData?.areSameValues ? taxAmountOptionsData?.options[0]?.value : null,
            costCenter: constCenterOptionsData?.areSameValues ? constCenterOptionsData?.options[0]?.value : null,
            purpose: purposeOptionsData?.areSameValues ? purposeOptionsData?.options[0]?.value : null,
          },
        });
      }
    );
  }

  subscribeExpenseChange() {
    this.fg.controls.target_txn_id.valueChanges.subscribe((expenseId) => {
      const selectedIndex = this.expenses.map((e) => e.tx_id).indexOf(expenseId);
      this.onExpenseChanged(selectedIndex);
    });
  }

  onExpenseChanged(selectedIndex: number) {
    forkJoin({
      amountOptionsData: this.amountOptionsData$,
      dateOfSpendOptionsData: this.dateOfSpendOptionsData$,
      paymentModeOptionsData: this.paymentModeOptionsData$,
      projectOptionsData: this.projectOptionsData$,
      billableOptionsData: this.billableOptionsData$,
      categoryOptionsData: this.categoryOptionsData$,
      vendorOptionsData: this.vendorOptionsData$,
      taxGroupOptionsData: this.taxGroupOptionsData$,
      taxAmountOptionsData: this.taxAmountOptionsData$,
      constCenterOptionsData: this.constCenterOptionsData$,
      purposeOptionsData: this.purposeOptionsData$,
    }).subscribe(
      // eslint-disable-next-line complexity
      ({
        amountOptionsData,
        dateOfSpendOptionsData,
        paymentModeOptionsData,
        projectOptionsData,
        billableOptionsData,
        categoryOptionsData,
        vendorOptionsData,
        taxGroupOptionsData,
        taxAmountOptionsData,
        constCenterOptionsData,
        purposeOptionsData,
      }) => {
        this.fg.patchValue({
          genericFields: {
            receipt_ids:
              this.expenses[selectedIndex]?.tx_file_ids?.length > 0 &&
              !this.fg.controls.genericFields.get('receipt_ids').touched
                ? this.expenses[selectedIndex]?.tx_split_group_id
                : null,
            amount:
              !amountOptionsData?.areSameValues && !this.fg.controls.genericFields.get('amount').touched
                ? amountOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('amount').value,
            dateOfSpend:
              !dateOfSpendOptionsData?.areSameValues && !this.fg.controls.genericFields.get('dateOfSpend').touched
                ? dateOfSpendOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('dateOfSpend').value,
            paymentMode:
              !paymentModeOptionsData?.areSameValues && !this.fg.controls.genericFields.get('paymentMode').touched
                ? paymentModeOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('paymentMode').value,
            project:
              !projectOptionsData?.areSameValues && !this.fg.controls.genericFields.get('project').touched
                ? projectOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('project').value,
            billable:
              !billableOptionsData?.areSameValues && !this.fg.controls.genericFields.get('billable').touched
                ? billableOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('billable').value,
            category:
              !categoryOptionsData?.areSameValues && !this.fg.controls.genericFields.get('category').touched
                ? categoryOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('category').value,
            vendor:
              !vendorOptionsData?.areSameValues && !this.fg.controls.genericFields.get('vendor').touched
                ? vendorOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('vendor').value,
            tax_group:
              !taxGroupOptionsData?.areSameValues && !this.fg.controls.genericFields.get('tax_group').touched
                ? taxGroupOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('tax_group').value,
            tax_amount:
              !taxAmountOptionsData?.areSameValues && !this.fg.controls.genericFields.get('tax_amount').touched
                ? taxAmountOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('tax_amount').value,
            costCenter:
              !constCenterOptionsData?.areSameValues && !this.fg.controls.genericFields.get('costCenter').touched
                ? constCenterOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('costCenter').value,
            purpose:
              !purposeOptionsData?.areSameValues && !this.fg.controls.genericFields.get('purpose').touched
                ? purposeOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.get('purpose').value,
          },
        });
      }
    );
  }

  patchValuesOnCategoryDependentFields() {
    return forkJoin({
      location1OptionsData: this.location1OptionsData$,
      location2OptionsData: this.location2OptionsData$,
      onwardDateOptionsData: this.onwardDateOptionsData$,
      returnDateOptionsData: this.returnDateOptionsData$,
      flightJourneyTravelClassOptionsData: this.flightJourneyTravelClassOptionsData$,
      flightReturnTravelClassOptionsData: this.flightReturnTravelClassOptionsData$,
      trainTravelClassOptionsData: this.trainTravelClassOptionsData$,
      busTravelClassOptionsData: this.busTravelClassOptionsData$,
      distanceOptionsData: this.distanceOptionsData$,
      distanceUnitOptionsData: this.distanceUnitOptionsData$,
    }).subscribe(
      // eslint-disable-next-line complexity
      ({
        location1OptionsData,
        location2OptionsData,
        onwardDateOptionsData,
        returnDateOptionsData,
        flightJourneyTravelClassOptionsData,
        flightReturnTravelClassOptionsData,
        trainTravelClassOptionsData,
        busTravelClassOptionsData,
        distanceOptionsData,
        distanceUnitOptionsData,
      }) => {
        this.fg.patchValue({
          categoryDependent: {
            location_1: location1OptionsData?.areSameValues ? location1OptionsData?.options[0]?.value : null,
            location_2: location2OptionsData?.areSameValues ? location2OptionsData?.options[0]?.value : null,
            from_dt: onwardDateOptionsData?.areSameValues ? onwardDateOptionsData?.options[0]?.value : null,
            to_dt: returnDateOptionsData?.areSameValues ? returnDateOptionsData?.options[0]?.value : null,
            flight_journey_travel_class: flightJourneyTravelClassOptionsData?.areSameValues
              ? flightJourneyTravelClassOptionsData?.options[0]?.value
              : null,
            flight_return_travel_class: flightReturnTravelClassOptionsData?.areSameValues
              ? flightReturnTravelClassOptionsData?.options[0]?.value
              : null,
            train_travel_class: trainTravelClassOptionsData?.areSameValues
              ? trainTravelClassOptionsData?.options[0]?.value
              : null,
            bus_travel_class: busTravelClassOptionsData?.areSameValues
              ? busTravelClassOptionsData?.options[0]?.value
              : null,
            distance: distanceOptionsData?.areSameValues ? distanceOptionsData?.options[0]?.value : null,
            distance_unit: distanceUnitOptionsData?.areSameValues ? distanceUnitOptionsData?.options[0]?.value : null,
          },
        });
      }
    );
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
    const selectedExpense = this.fg.value.target_txn_id;
    this.fg.markAllAsTouched();
    console.log(this.fg.valid);
    console.log(this.fg.value);
    if (this.fg.valid) {
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
    const sourceExpense = this.expenses.find(
      (expense) => expense.source_account_type === this.fg.controls.genericFields.get('paymentMode').value
    );
    const amountExpense = this.expenses.find(
      (expense) => expense.tx_id === this.fg.controls.genericFields.get('amount').value
    );
    const CCCGroupIds = this.expenses.map(
      (expense) =>
        expense.tx_corporate_credit_card_expense_group_id && expense.tx_corporate_credit_card_expense_group_id
    );
    let locations;
    if (this.fg.value.location_1 && this.fg.value.location_2) {
      locations = [
        this.fg.controls.genericFields.get('location_1').value,
        this.fg.controls.genericFields.get('location_2').value,
      ];
    } else if (this.fg.value.location_1) {
      locations = [this.fg.controls.genericFields.get('location_1').value];
    }
    return customFields$.pipe(
      take(1),
      map((customProperties) => ({
        source_account_id: sourceExpense?.tx_source_account_id,
        billable: this.fg.controls.genericFields.get('billable')?.value,
        currency: amountExpense?.tx_currency,
        amount: amountExpense?.tx_amount,
        project_id: this.fg.controls.genericFields.get('project')?.value,
        tax_amount: this.fg.controls.genericFields.get('tax_amount')?.value,
        tax_group_id: this.fg.controls.genericFields.get('tax_group')?.value,
        org_category_id: this.fg.controls.genericFields.get('category')?.value,
        fyle_category: this.fg.controls.genericFields.get('category')?.value,
        vendor: this.fg.controls.genericFields.get('vendor')?.value,
        purpose: this.fg.controls.genericFields.get('purpose')?.value,
        txn_dt: this.fg.controls.genericFields.get('dateOfSpend')?.value,
        receipt_ids: this.selectedReceiptsId,
        custom_properties: customProperties,
        ccce_group_id: CCCGroupIds && CCCGroupIds[0],
        from_dt: this.fg.controls.genericFields.get('from_dt')?.value,
        to_dt: this.fg.controls.genericFields.get('to_dt')?.value,
        flight_journey_travel_class: this.fg.controls.genericFields.get('flight_journey_travel_class')?.value,
        flight_return_travel_class: this.fg.controls.genericFields.get('flight_return_travel_class')?.value,
        train_travel_class: this.fg.controls.genericFields.get('train_travel_class')?.value,
        bus_travel_class: this.fg.controls.genericFields.get('bus_travel_class')?.value,
        distance: this.fg.controls.genericFields.get('distance')?.value,
        distance_unit: this.fg.controls.genericFields.get('distance_unit')?.value,
        locations: locations || [],
      }))
    );
  }

  setupCustomInputs() {
    this.customInputs$ = this.fg.controls.genericFields.get('category').valueChanges.pipe(
      startWith({}),
      switchMap(() =>
        this.offlineService.getCustomInputs().pipe(
          switchMap((fields) => {
            const formValue = this.fg.value;
            const customFields = this.customFieldsService.standardizeCustomFields(
              formValue.custom_inputs || [],
              this.customInputsService.filterByCategory(fields, this.fg.controls.genericFields.get('category').value)
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

  subscribePaymentModeChange() {
    this.CCCTxn$ = this.fg.controls.genericFields.get('paymentMode').valueChanges.pipe(
      startWith({}),
      switchMap(() => this.mergeExpensesService.getCardCardTransactions(this.expenses))
    );
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
