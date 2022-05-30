import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, forkJoin, noop, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, reduce, shareReplay, startWith, switchMap, take, tap, toArray } from 'rxjs/operators';
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
import { TrackingService } from 'src/app/core/services/tracking.service';

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
    private activatedRoute: ActivatedRoute,
    private trackingService: TrackingService
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

    this.genericFieldsOptions$ = forkJoin({
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
    });

    this.loadCustomFields$ = new BehaviorSubject(this.genericFieldsForm.value?.category);

    this.setupCustomInputs();
    this.generateCustomInputOptions();

    this.loadGenericFieldsOptions();
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
    this.genericFieldsOptions$.subscribe(
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
            amount: this.mergeExpensesService.getFieldValue(amountOptionsData),
            dateOfSpend: this.mergeExpensesService.getFieldValue(dateOfSpendOptionsData),
            paymentMode: this.mergeExpensesService.getFieldValue(paymentModeOptionsData),
            project: this.mergeExpensesService.getFieldValue(projectOptionsData),
            billable: this.mergeExpensesService.getFieldValue(billableOptionsData),
            category: this.mergeExpensesService.getFieldValue(categoryOptionsData),
            vendor: this.mergeExpensesService.getFieldValue(vendorOptionsData),
            tax_group: this.mergeExpensesService.getFieldValue(taxGroupOptionsData),
            tax_amount: this.mergeExpensesService.getFieldValue(taxAmountOptionsData),
            costCenter: this.mergeExpensesService.getFieldValue(constCenterOptionsData),
            purpose: this.mergeExpensesService.getFieldValue(purposeOptionsData),
          },
        });
        const expensesInfo = this.mergeExpensesService.setDefaultExpenseToKeep(this.expenses);
        const isAllAdvanceExpenses = this.mergeExpensesService.isAllAdvanceExpenses(this.expenses);
        this.setInitialExpenseToKeepDetails(expensesInfo, isAllAdvanceExpenses);
      }
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
    this.genericFieldsOptions$.subscribe(
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
            amount: this.mergeExpensesService.getFieldValueOnChange(
              amountOptionsData,
              this.touchedGenericFields?.includes('amount'),
              this.expenses[selectedIndex]?.tx_id,
              this.genericFieldsForm.value?.amount
            ),
            dateOfSpend: this.mergeExpensesService.getFieldValueOnChange(
              dateOfSpendOptionsData,
              this.touchedGenericFields?.includes('dateOfSpend'),
              this.expenses[selectedIndex]?.tx_txn_dt,
              this.genericFieldsForm.value?.dateOfSpend
            ),
            paymentMode: this.mergeExpensesService.getFieldValueOnChange(
              paymentModeOptionsData,
              this.touchedGenericFields?.includes('paymentMode'),
              this.expenses[selectedIndex]?.source_account_type,
              this.genericFieldsForm.value?.paymentMode
            ),
            project: this.mergeExpensesService.getFieldValueOnChange(
              projectOptionsData,
              this.touchedGenericFields?.includes('project'),
              this.expenses[selectedIndex]?.tx_project_id,
              this.genericFieldsForm.value?.project
            ),
            billable: this.mergeExpensesService.getFieldValueOnChange(
              billableOptionsData,
              this.touchedGenericFields?.includes('billable'),
              this.expenses[selectedIndex]?.tx_billable,
              this.genericFieldsForm.value?.billable
            ),
            category: this.mergeExpensesService.getFieldValueOnChange(
              categoryOptionsData,
              this.touchedGenericFields?.includes('category'),
              this.expenses[selectedIndex]?.tx_org_category_id,
              this.genericFieldsForm.value?.category
            ),
            vendor: this.mergeExpensesService.getFieldValueOnChange(
              vendorOptionsData,
              this.touchedGenericFields?.includes('vendor'),
              this.expenses[selectedIndex]?.tx_vendor,
              this.genericFieldsForm.value?.vendor
            ),
            tax_group: this.mergeExpensesService.getFieldValueOnChange(
              taxGroupOptionsData,
              this.touchedGenericFields?.includes('tax_group'),
              this.expenses[selectedIndex]?.tx_tax_group_id,
              this.genericFieldsForm.value?.tax_group
            ),
            tax_amount: this.mergeExpensesService.getFieldValueOnChange(
              taxAmountOptionsData,
              this.touchedGenericFields?.includes('tax_amount'),
              this.expenses[selectedIndex]?.tx_tax,
              this.genericFieldsForm.value?.tax_amount
            ),
            costCenter: this.mergeExpensesService.getFieldValueOnChange(
              constCenterOptionsData,
              this.touchedGenericFields?.includes('costCenter'),
              this.expenses[selectedIndex]?.tx_cost_center_name,
              this.genericFieldsForm.value?.costCenter
            ),
            purpose: this.mergeExpensesService.getFieldValueOnChange(
              purposeOptionsData,
              this.touchedGenericFields?.includes('purpose'),
              this.expenses[selectedIndex]?.tx_purpose,
              this.genericFieldsForm.value?.purpose
            ),
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
    });

    this.categoryDependentFieldsOptions$.subscribe(
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
            location_1: this.mergeExpensesService.getFieldValue(location1OptionsData),
            location_2: this.mergeExpensesService.getFieldValue(location2OptionsData),
            from_dt: this.mergeExpensesService.getFieldValue(onwardDateOptionsData),
            to_dt: this.mergeExpensesService.getFieldValue(returnDateOptionsData),
            flight_journey_travel_class: this.mergeExpensesService.getFieldValue(flightJourneyTravelClassOptionsData),
            flight_return_travel_class: this.mergeExpensesService.getFieldValue(flightReturnTravelClassOptionsData),
            train_travel_class: this.mergeExpensesService.getFieldValue(trainTravelClassOptionsData),
            bus_travel_class: this.mergeExpensesService.getFieldValue(busTravelClassOptionsData),
            distance: this.mergeExpensesService.getFieldValue(distanceOptionsData),
            distance_unit: this.mergeExpensesService.getFieldValue(distanceUnitOptionsData),
          },
        });
      }
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
            this.trackingService.expensesMerged();
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
      (expense) => expense.source_account_type === this.genericFieldsForm.value.paymentMode
    );
    const amountExpense = this.expenses.find((expense) => expense.tx_id === this.genericFieldsForm.value.amount);
    const CCCGroupIds = this.expenses.map(
      (expense) =>
        expense.tx_corporate_credit_card_expense_group_id && expense.tx_corporate_credit_card_expense_group_id
    );
    let locations;
    if (this.fg.value.location_1 && this.fg.value.location_2) {
      locations = [this.genericFieldsForm.value.location_1, this.genericFieldsForm.value.location_2];
    } else if (this.fg.value.location_1) {
      locations = [this.genericFieldsForm.value.location_1];
    }
    return {
      source_account_id: sourceExpense?.tx_source_account_id,
      billable: this.genericFieldsForm.value.billable,
      currency: amountExpense?.tx_currency,
      amount: amountExpense?.tx_amount,
      project_id: this.genericFieldsForm.value.project,
      tax_amount: this.genericFieldsForm.value.tax_amount,
      tax_group_id: this.genericFieldsForm.value.tax_group,
      org_category_id: this.genericFieldsForm.value.category,
      fyle_category: this.genericFieldsForm.value.category,
      vendor: this.genericFieldsForm.value.vendor,
      purpose: this.genericFieldsForm.value.purpose,
      txn_dt: this.genericFieldsForm.value.dateOfSpend,
      receipt_ids: this.selectedReceiptsId,
      custom_properties: this.fg.controls.custom_inputs.value.fields,
      ccce_group_id: CCCGroupIds && CCCGroupIds[0],
      from_dt: this.genericFieldsForm.value.from_dt,
      to_dt: this.genericFieldsForm.value.to_dt,
      flight_journey_travel_class: this.genericFieldsForm.value.flight_journey_travel_class,
      flight_return_travel_class: this.genericFieldsForm.value.flight_return_travel_class,
      train_travel_class: this.genericFieldsForm.value.train_travel_class,
      bus_travel_class: this.genericFieldsForm.value.bus_travel_class,
      distance: this.genericFieldsForm.value.distance,
      distance_unit: this.genericFieldsForm.value.distance_unit,
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
          reduce((acc, curr) => {
            acc.push(curr);
            return acc;
          }, [])
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
    this.categoryDependentFieldsOptions$.subscribe(
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
            location_1: this.mergeExpensesService.getFieldValueOnChange(
              location1OptionsData,
              this.touchedGenericFields?.includes('location_1'),
              this.expenses[selectedIndex]?.tx_locations[0],
              this.genericFieldsForm.value?.location_1
            ),
            location_2: this.mergeExpensesService.getFieldValueOnChange(
              location2OptionsData,
              this.touchedGenericFields?.includes('location_2'),
              this.expenses[selectedIndex]?.tx_locations[1],
              this.genericFieldsForm.value?.location_2
            ),
            from_dt: this.mergeExpensesService.getFieldValueOnChange(
              onwardDateOptionsData,
              this.touchedGenericFields?.includes('from_dt'),
              this.expenses[selectedIndex]?.tx_from_dt,
              this.genericFieldsForm.value?.from_dt
            ),
            to_dt: this.mergeExpensesService.getFieldValueOnChange(
              returnDateOptionsData,
              this.touchedGenericFields?.includes('to_dt'),
              this.expenses[selectedIndex]?.tx_to_dt,
              this.genericFieldsForm.value?.to_dt
            ),
            flight_journey_travel_class: this.mergeExpensesService.getFieldValueOnChange(
              flightJourneyTravelClassOptionsData,
              this.touchedGenericFields?.includes('flight_journey_travel_class'),
              this.expenses[selectedIndex]?.tx_flight_journey_travel_class,
              this.genericFieldsForm.value?.flight_journey_travel_class
            ),
            flight_return_travel_class: this.mergeExpensesService.getFieldValueOnChange(
              flightReturnTravelClassOptionsData,
              this.touchedGenericFields?.includes('flight_return_travel_class'),
              this.expenses[selectedIndex]?.tx_flight_return_travel_class,
              this.genericFieldsForm.value?.flight_return_travel_class
            ),
            train_travel_class: this.mergeExpensesService.getFieldValueOnChange(
              trainTravelClassOptionsData,
              this.touchedGenericFields?.includes('train_travel_class'),
              this.expenses[selectedIndex]?.tx_train_travel_class,
              this.genericFieldsForm.value?.train_travel_class
            ),
            bus_travel_class: this.mergeExpensesService.getFieldValueOnChange(
              busTravelClassOptionsData,
              this.touchedGenericFields?.includes('bus_travel_class'),
              this.expenses[selectedIndex]?.tx_bus_travel_class,
              this.genericFieldsForm.value?.bus_travel_class
            ),
            distance: this.mergeExpensesService.getFieldValueOnChange(
              distanceOptionsData,
              this.touchedGenericFields?.includes('distance'),
              this.expenses[selectedIndex]?.tx_distance,
              this.genericFieldsForm.value?.distance
            ),
            distance_unit: this.mergeExpensesService.getFieldValueOnChange(
              distanceUnitOptionsData,
              this.touchedGenericFields?.includes('distance_unit'),
              this.expenses[selectedIndex]?.tx_flight_journey_travel_class,
              this.genericFieldsForm.value?.tx_distance_unit
            ),
          },
        });
      }
    );
  }
}
