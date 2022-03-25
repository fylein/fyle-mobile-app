import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, forkJoin, noop, Observable } from 'rxjs';
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

type Option = Partial<{
  label: string;
  value: any;
}>;

type OptionsData = Partial<{
  options: Option[];
  areSameValues: boolean;
  name: string;
  value: any;
}>;

type CustomInputs = Partial<{
  control: FormControl;
  id: string;
  mandatory: boolean;
  name: string;
  options: Option[];
  placeholder: string;
  prefix: string;
  type: string;
  value: string;
}>;

interface CombinedOptions {
  [key: string]: OptionsData;
}

interface OptionsSet {
  [key: string]: OptionsData;
}

@Component({
  selector: 'app-merge-expense',
  templateUrl: './merge-expense.page.html',
  styleUrls: ['./merge-expense.page.scss'],
})
export class MergeExpensePage implements OnInit {
  expenses: Expense[];

  fg: FormGroup;

  expenseOptions$: Observable<Option[]>;

  amountOptionsData$: Observable<OptionsData>;

  dateOfSpendOptionsData$: Observable<OptionsData>;

  paymentModeOptionsData$: Observable<OptionsData>;

  projectOptionsData$: Observable<OptionsData>;

  billableOptionsData$: Observable<OptionsData>;

  vendorOptionsData$: Observable<OptionsData>;

  categoryOptionsData$: Observable<OptionsData>;

  taxGroupOptionsData$: Observable<OptionsData>;

  taxAmountOptionsData$: Observable<OptionsData>;

  constCenterOptionsData$: Observable<OptionsData>;

  purposeOptionsData$: Observable<OptionsData>;

  location1OptionsData$: Observable<OptionsData>;

  location2OptionsData$: Observable<OptionsData>;

  onwardDateOptionsData$: Observable<OptionsData>;

  returnDateOptionsData$: Observable<OptionsData>;

  flightJourneyTravelClassOptionsData$: Observable<OptionsData>;

  flightReturnTravelClassOptionsData$: Observable<OptionsData>;

  trainTravelClassOptionsData$: Observable<OptionsData>;

  busTravelClassOptionsData$: Observable<OptionsData>;

  distanceOptionsData$: Observable<OptionsData>;

  distanceUnitOptionsData$: Observable<OptionsData>;

  receiptOptions: Option[];

  genericFieldsOptions$: Observable<OptionsSet>;

  categoryDependentFieldsOptions$: Observable<OptionsSet>;

  loadCustomFields$: BehaviorSubject<string>;

  isMerging = false;

  selectedReceiptsId: string[] = [];

  customInputs$: Observable<CustomInputs[]>;

  attachments: FileObject[];

  combinedCustomProperties: CombinedOptions = {};

  disableFormElements = false;

  selectedCategoryName: string;

  isReportedExpensePresent: boolean;

  showReceiptSelection: boolean;

  disableExpenseToKeep: boolean;

  expenseToKeepInfoText: string;

  CCCTxns: CorporateCardExpense[];

  redirectedFrom: string;

  touchedGenericFields: string[];

  touchedCategoryDepedentFields: string[];

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
      genericFields: [],
      categoryDependent: [],
      custom_inputs: [],
    });

    this.expenseOptions$ = this.mergeExpensesService.generateExpenseToKeepOptions(this.expenses);

    this.mergeExpensesService.generateReceiptOptions(this.expenses).subscribe((receiptOptions) => {
      this.receiptOptions = receiptOptions;
    });

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

    this.loadCustomFields$ = new BehaviorSubject(this.fg.controls.genericFields.value?.category);

    this.setupCustomInputs();
    this.generateCustomInputOptions();

    this.genericFieldsOptions$ = this.loadGenericFieldsOptions();
    this.loadCategoryDependentFields();
    this.subscribeExpenseChange();

    this.combinedCustomProperties = this.generateCustomInputOptions();
  }

  get genericFieldsForm() {
    return this.fg.controls.genericFields;
  }

  get categoryDependentForm() {
    return this.fg.controls.categoryDependent;
  }

  loadGenericFieldsOptions() {
    return forkJoin({
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
    }).pipe(
      tap(
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
          const expensesInfo = this.mergeExpensesService.setDefaultExpenseToKeep(this.expenses);
          const isAllAdvanceExpenses = this.mergeExpensesService.isAllAdvanceExpenses(this.expenses);
          this.setInitialExpenseToKeepDetails(expensesInfo, isAllAdvanceExpenses);
        }
      )
    );
  }

  subscribeExpenseChange() {
    this.fg.controls.target_txn_id.valueChanges.subscribe((expenseId) => {
      const selectedIndex = this.expenses.map((e) => e.tx_id).indexOf(expenseId);
      this.onExpenseChanged(selectedIndex);
      this.patchCategoryDependentFields(selectedIndex);
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
              !this.touchedGenericFields?.includes('receipt_ids')
                ? this.expenses[selectedIndex]?.tx_split_group_id
                : null,
            amount:
              !amountOptionsData?.areSameValues && !this.touchedGenericFields?.includes('amount')
                ? amountOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.amount,
            dateOfSpend:
              !dateOfSpendOptionsData?.areSameValues && !this.touchedGenericFields?.includes('dateOfSpend')
                ? dateOfSpendOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.dateOfSpend,
            paymentMode:
              !paymentModeOptionsData?.areSameValues && !this.touchedGenericFields?.includes('paymentMode')
                ? paymentModeOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value.paymentMode,
            project:
              !projectOptionsData?.areSameValues && !this.touchedGenericFields?.includes('project')
                ? projectOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.project,
            billable:
              !billableOptionsData?.areSameValues && !this.touchedGenericFields?.includes('billable')
                ? billableOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.billable,
            category:
              !categoryOptionsData?.areSameValues && !this.touchedGenericFields?.includes('category')
                ? categoryOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.category,
            vendor:
              !vendorOptionsData?.areSameValues && !this.touchedGenericFields?.includes('vendor')
                ? vendorOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.vendor,
            tax_group:
              !taxGroupOptionsData?.areSameValues && !this.touchedGenericFields?.includes('tax_group')
                ? taxGroupOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.tax_group,
            tax_amount:
              !taxAmountOptionsData?.areSameValues && !this.touchedGenericFields?.includes('tax_amount')
                ? taxAmountOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.tax_amount,
            costCenter:
              !constCenterOptionsData?.areSameValues && !this.touchedGenericFields?.includes('costCenter')
                ? constCenterOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.costCenter,
            purpose:
              !purposeOptionsData?.areSameValues && !this.touchedGenericFields?.includes('purpose')
                ? purposeOptionsData?.options[selectedIndex]?.value
                : this.fg.controls.genericFields.value?.purpose,
          },
        });
      }
    );
  }

  loadCategoryDependentFields() {
    this.categoryDependentFieldsOptions$ = forkJoin({
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
    }).pipe(
      tap(
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
      )
    );
  }

  onReceiptChanged(receipt_ids) {
    this.mergeExpensesService.getAttachements(receipt_ids).subscribe((receipts) => {
      this.selectedReceiptsId = receipts.map((receipt) => receipt.id);
      this.attachments = receipts;
    });
  }

  mergeExpense() {
    const selectedExpense = this.fg.value.target_txn_id;
    this.fg.markAllAsTouched();
    if (this.fg.valid) {
      this.isMerging = true;
      let sourceTxnIds = [];
      this.expenses.map((expense) => {
        sourceTxnIds.push(expense.tx_id);
      });
      sourceTxnIds = sourceTxnIds.filter((id) => id !== selectedExpense);

      this.mergeExpensesService
        .mergeExpenses(sourceTxnIds, selectedExpense, this.generateFromFg())
        .pipe(
          finalize(() => {
            this.isMerging = false;
            this.showMergedSuccessToast();
            this.goBack();
          })
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
    const sourceExpense = this.expenses.find(
      (expense) => expense.source_account_type === this.fg.controls.genericFields.value.paymentMode
    );
    const amountExpense = this.expenses.find(
      (expense) => expense.tx_id === this.fg.controls.genericFields.value.amount
    );
    const CCCGroupIds = this.expenses.map(
      (expense) =>
        expense.tx_corporate_credit_card_expense_group_id && expense.tx_corporate_credit_card_expense_group_id
    );
    let locations;
    if (this.fg.value.location_1 && this.fg.value.location_2) {
      locations = [this.fg.controls.genericFields.value.location_1, this.fg.controls.genericFields.value.location_2];
    } else if (this.fg.value.location_1) {
      locations = [this.fg.controls.genericFields.value.location_1];
    }
    return {
      source_account_id: sourceExpense?.tx_source_account_id,
      billable: this.fg.controls.genericFields.value.billable,
      currency: amountExpense?.tx_currency,
      amount: amountExpense?.tx_amount,
      project_id: this.fg.controls.genericFields.value.project,
      tax_amount: this.fg.controls.genericFields.value.tax_amount,
      tax_group_id: this.fg.controls.genericFields.value.tax_group,
      org_category_id: this.fg.controls.genericFields.value.category,
      fyle_category: this.fg.controls.genericFields.value.category,
      vendor: this.fg.controls.genericFields.value.vendor,
      purpose: this.fg.controls.genericFields.value.purpose,
      txn_dt: this.fg.controls.genericFields.value.dateOfSpend,
      receipt_ids: this.selectedReceiptsId,
      custom_properties: this.fg.controls.custom_inputs.value.fields,
      ccce_group_id: CCCGroupIds && CCCGroupIds[0],
      from_dt: this.fg.controls.genericFields.value.from_dt,
      to_dt: this.fg.controls.genericFields.value.to_dt,
      flight_journey_travel_class: this.fg.controls.genericFields.value.flight_journey_travel_class,
      flight_return_travel_class: this.fg.controls.genericFields.value.flight_return_travel_class,
      train_travel_class: this.fg.controls.genericFields.value.train_travel_class,
      bus_travel_class: this.fg.controls.genericFields.value.bus_travel_class,
      distance: this.fg.controls.genericFields.value.distance,
      distance_unit: this.fg.controls.genericFields.value.distance_unit,
      locations: locations || [],
    };
  }

  onCategoryChanged(categoryId) {
    this.mergeExpensesService.getCategoryName(categoryId).subscribe((categoryName) => {
      this.selectedCategoryName = categoryName;
    });
    this.loadCustomFields$.next(categoryId);
  }

  setupCustomInputs() {
    this.customInputs$ = this.loadCustomFields$.pipe(
      startWith({}),
      switchMap((categoryId) =>
        this.offlineService.getCustomInputs().pipe(
          switchMap((fields) => {
            const customFields = this.customFieldsService.standardizeCustomFields(
              this.fg.controls.custom_inputs?.value?.fields || [],
              this.customInputsService.filterByCategory(fields, categoryId)
            );
            return customFields;
          }),
          toArray()
        )
      ),
      tap((customInputs) => {
        if (!this.isMerging) {
          this.patchCustomInputsValues(customInputs);
        }
      })
    );
  }

  patchCustomInputsValues(customInputs) {
    const customInputValues = customInputs.map((customInput) => {
      if (
        this.combinedCustomProperties[customInput.name]?.areSameValues &&
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

  onPaymentModeChanged() {
    this.mergeExpensesService.getCardCardTransactions(this.expenses).subscribe((txns) => {
      this.CCCTxns = txns;
    });
  }

  generateCustomInputOptions(): CombinedOptions {
    const customProperties = this.mergeExpensesService.getCustomInputValues(this.expenses);

    let combinedCustomProperties = [].concat.apply([], customProperties);

    combinedCustomProperties = combinedCustomProperties.map((field) => {
      if (field.value && field.value instanceof Array) {
        field.options = [
          {
            label: field.value?.toString(),
            value: field.value,
          },
        ];
        if (field.value?.length === 0) {
          field.options = [];
        }
      } else {
        if (!field.value || field.value !== '') {
          field.options = [];
        } else {
          field.options = [
            {
              label: field?.value,
              value: field?.value,
            },
          ];
        }
      }
      return field;
    });
    return this.mergeExpensesService.formatCustomInputOptions(combinedCustomProperties);
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

  onGenericFieldsTouched(touchedGenericFields) {
    this.touchedGenericFields = touchedGenericFields;
  }

  onCategoryDependentFieldsTouched(touchedGenericFields) {
    this.touchedCategoryDepedentFields = touchedGenericFields;
  }

  patchCategoryDependentFields(selectedIndex: number) {
    forkJoin({
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
            location_1:
              !location1OptionsData?.areSameValues && !this.touchedCategoryDepedentFields?.includes('location_1')
                ? location1OptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.location_1,
            location_2:
              !location2OptionsData?.areSameValues && !this.touchedCategoryDepedentFields?.includes('location_2')
                ? location2OptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.location_2,
            from_dt:
              !onwardDateOptionsData?.areSameValues && !this.touchedCategoryDepedentFields?.includes('from_dt')
                ? onwardDateOptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.from_dt,
            to_dt:
              !returnDateOptionsData?.areSameValues && !this.touchedCategoryDepedentFields?.includes('to_dt')
                ? returnDateOptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.to_dt,
            flight_journey_travel_class:
              !flightJourneyTravelClassOptionsData?.areSameValues &&
              !this.touchedCategoryDepedentFields?.includes('flight_journey_travel_class')
                ? flightJourneyTravelClassOptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.flight_journey_travel_class,
            flight_return_travel_class:
              !flightReturnTravelClassOptionsData?.areSameValues &&
              !this.touchedCategoryDepedentFields?.includes('flight_return_travel_class')
                ? flightReturnTravelClassOptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.flight_return_travel_class,
            train_travel_class:
              !trainTravelClassOptionsData?.areSameValues &&
              !this.touchedCategoryDepedentFields?.includes('train_travel_class')
                ? trainTravelClassOptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.train_travel_class,
            bus_travel_class:
              !busTravelClassOptionsData?.areSameValues &&
              !this.touchedCategoryDepedentFields?.includes('bus_travel_class')
                ? busTravelClassOptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.bus_travel_class,
            distance:
              !distanceOptionsData?.areSameValues && !this.touchedCategoryDepedentFields?.includes('distance')
                ? distanceOptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.distance,
            distance_unit:
              !distanceUnitOptionsData?.areSameValues && !this.touchedCategoryDepedentFields?.includes('distance_unit')
                ? distanceUnitOptionsData?.options[selectedIndex]?.value
                : this.categoryDependentForm.value?.distance_unit,
          },
        });
      }
    );
  }
}
