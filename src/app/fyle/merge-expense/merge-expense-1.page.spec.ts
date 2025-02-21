import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { MergeExpensePage } from './merge-expense.page';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { NavController } from '@ionic/angular';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { MergeExpensesService } from 'src/app/core/services/merge-expenses.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { expenseList2, transformedPlatformedExpense1 } from 'src/app/core/mock-data/expense.data';
import { mergeExpensesOptionsData } from 'src/app/core/mock-data/merge-expenses-option.data';
import { of } from 'rxjs';
import {
  optionsData10,
  optionsData11,
  optionsData12,
  optionsData13,
  optionsData14,
  optionsData15,
  optionsData16,
  optionsData17,
  optionsData18,
  optionsData19,
  optionsData2,
  optionsData20,
  optionsData21,
  optionsData3,
  optionsData6,
  optionsData7,
  optionsData8,
  optionsData9,
} from 'src/app/core/mock-data/merge-expenses-options-data.data';
import { combinedOptionsData1 } from 'src/app/core/mock-data/combined-options.data';
import { expensesInfo } from 'src/app/core/mock-data/expenses-info.data';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { apiExpenses3 } from 'src/app/core/mock-data/platform/v1/expense.data';

export function TestCases1(getTestBed) {
  return describe('test cases set 1', () => {
    let component: MergeExpensePage;
    let fixture: ComponentFixture<MergeExpensePage>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let categoriesService: jasmine.SpyObj<CategoriesService>;
    let customInputsService: jasmine.SpyObj<CustomInputsService>;
    let customFieldsService: jasmine.SpyObj<CustomFieldsService>;
    let navController: jasmine.SpyObj<NavController>;
    let matSnackBar: jasmine.SpyObj<MatSnackBar>;
    let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
    let mergeExpensesService: jasmine.SpyObj<MergeExpensesService>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let formBuilder: UntypedFormBuilder;
    let transactionService: jasmine.SpyObj<TransactionService>;
    let expensesService: jasmine.SpyObj<ExpensesService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(MergeExpensePage);
      component = fixture.componentInstance;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
      customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
      customFieldsService = TestBed.inject(CustomFieldsService) as jasmine.SpyObj<CustomFieldsService>;
      navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
      matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
      snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
      mergeExpensesService = TestBed.inject(MergeExpensesService) as jasmine.SpyObj<MergeExpensesService>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      transactionService = TestBed.inject(TransactionService);
      expensesService = TestBed.inject(ExpensesService);
      formBuilder = TestBed.inject(UntypedFormBuilder);
      component.fg = formBuilder.group({
        target_txn_id: [, Validators.required],
        genericFields: [],
        categoryDependent: [],
        custom_inputs: [],
      });
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('genericFieldsForm(): should return the genericFields form control', () => {
      component.fg = formBuilder.group({
        genericFields: new UntypedFormControl([]),
      });

      const genericFieldsForm = component.genericFieldsForm;

      expect(genericFieldsForm.value).toEqual([]);
    });

    it('categoryDependentForm(): should return the categoryDependent form control', () => {
      component.fg = formBuilder.group({
        categoryDependent: new UntypedFormControl([]),
      });

      const categoryDependentForm = component.categoryDependentForm;

      expect(categoryDependentForm.value).toEqual([]);
    });

    it('ngOnInit(): should set expenses and redirectedFrom correctly', () => {
      activatedRoute.snapshot.params = {
        from: 'MY_EXPENSES',
      };
      fixture.detectChanges();

      expect(component.redirectedFrom).toEqual('MY_EXPENSES');
    });

    describe('ionViewWillEnter():', () => {
      beforeEach(() => {
        expensesService.getAllExpenses.and.returnValue(of(apiExpenses3));
        transactionService.transformRawExpense.and.returnValue(transformedPlatformedExpense1[0]);
        transactionService.transformRawExpense.and.returnValue(transformedPlatformedExpense1[1]);
        categoriesService.getSystemCategories.and.returnValue(['Bus', 'Airlines', 'Lodging', 'Train']);
        mergeExpensesService.generateExpenseToKeepOptions.and.returnValue(of(mergeExpensesOptionsData));
        mergeExpensesService.generateReceiptOptions.and.returnValue(of(mergeExpensesOptionsData));
        mergeExpensesService.generateAmountOptions.and.returnValue(of(optionsData3));
        mergeExpensesService.generateDateOfSpendOptions.and.returnValue(of(optionsData6));
        mergeExpensesService.generatePaymentModeOptions.and.returnValue(of(optionsData7));
        mergeExpensesService.generateProjectOptions.and.returnValue(of(optionsData9));
        mergeExpensesService.generateBillableOptions.and.returnValue(of(optionsData2));
        mergeExpensesService.generateVendorOptions.and.returnValue(of(optionsData8));
        mergeExpensesService.generateCategoryOptions.and.returnValue(of(optionsData10));
        mergeExpensesService.generateTaxGroupOptions.and.returnValue(of(optionsData11));
        mergeExpensesService.generateTaxAmountOptions.and.returnValue(of(optionsData12));
        mergeExpensesService.generateCostCenterOptions.and.returnValue(of(optionsData13));
        mergeExpensesService.generatePurposeOptions.and.returnValue(of(optionsData14));
        mergeExpensesService.generateLocationOptions.and.returnValue(of(optionsData15));
        mergeExpensesService.generateOnwardDateOptions.and.returnValue(of(optionsData16));
        mergeExpensesService.generateReturnDateOptions.and.returnValue(of(optionsData16));
        mergeExpensesService.generateFlightJourneyTravelClassOptions.and.returnValue(of(optionsData17));
        mergeExpensesService.generateFlightReturnTravelClassOptions.and.returnValue(of(optionsData17));
        mergeExpensesService.generateTrainTravelClassOptions.and.returnValue(of(optionsData18));
        mergeExpensesService.generateBusTravelClassOptions.and.returnValue(of(optionsData19));
        mergeExpensesService.generateDistanceOptions.and.returnValue(of(optionsData20));
        mergeExpensesService.generateDistanceUnitOptions.and.returnValue(of(optionsData21));
        spyOn(component, 'setupCustomInputs');
        spyOn(component, 'loadGenericFieldsOptions');
        spyOn(component, 'loadCategoryDependentFields');
        spyOn(component, 'subscribeExpenseChange');
        spyOn(component, 'generateCustomInputOptions').and.returnValue(combinedOptionsData1);
        spyOn(component, 'setupDefaultReceipts');
      });

      it('should setup class observables', () => {
        component.expenses = transformedPlatformedExpense1;
        component.ionViewWillEnter();

        expect(component.fg.controls.target_txn_id.value).toEqual(null);
        expect(component.fg.controls.target_txn_id.validator).toBe(Validators.required);
        expect(component.fg.controls.genericFields.value).toEqual(null);
        expect(component.fg.controls.categoryDependent.value).toEqual(null);
        expect(component.fg.controls.custom_inputs.value).toEqual(null);

        expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 200,
          queryParams: {
            id: 'in.(txQNInZMIHgZ,txZA0Oj6TV9c)',
          },
        });

        expect(transactionService.transformRawExpense).toHaveBeenCalledWith(apiExpenses3[0]);
        expect(transactionService.transformRawExpense).toHaveBeenCalledWith(apiExpenses3[1]);
        expect(categoriesService.getSystemCategories).toHaveBeenCalledTimes(1);
        expect(mergeExpensesService.generateReceiptOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        expect(component.systemCategories).toEqual(['Bus', 'Airlines', 'Lodging', 'Train']);
        expect(component.receiptOptions).toEqual(mergeExpensesOptionsData);

        component.expenseOptions$.subscribe((res) => {
          expect(res).toEqual(mergeExpensesOptionsData);
          expect(mergeExpensesService.generateExpenseToKeepOptions).toHaveBeenCalledOnceWith(
            transformedPlatformedExpense1
          );
        });

        component.amountOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData3);
          expect(mergeExpensesService.generateAmountOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        });

        component.dateOfSpendOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData6);
          expect(mergeExpensesService.generateDateOfSpendOptions).toHaveBeenCalledOnceWith(
            transformedPlatformedExpense1
          );
        });

        component.paymentModeOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData7);
          expect(mergeExpensesService.generatePaymentModeOptions).toHaveBeenCalledOnceWith(
            transformedPlatformedExpense1
          );
        });

        component.projectOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData9);
          expect(mergeExpensesService.generateProjectOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        });

        component.billableOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData2);
          expect(mergeExpensesService.generateBillableOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        });

        component.vendorOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData8);
          expect(mergeExpensesService.generateVendorOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        });

        component.categoryOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData10);
          expect(mergeExpensesService.generateCategoryOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        });

        component.taxGroupOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData11);
          expect(mergeExpensesService.generateTaxGroupOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        });

        component.taxAmountOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData12);
          expect(mergeExpensesService.generateTaxAmountOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        });

        component.constCenterOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData13);
          expect(mergeExpensesService.generateCostCenterOptions).toHaveBeenCalledOnceWith(
            transformedPlatformedExpense1
          );
        });

        component.purposeOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData14);
          expect(mergeExpensesService.generatePurposeOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        });

        component.location1OptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData15);
        });
        component.location2OptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData15);
        });

        expect(mergeExpensesService.generateLocationOptions).toHaveBeenCalledTimes(2);
        expect(mergeExpensesService.generateLocationOptions).toHaveBeenCalledWith(transformedPlatformedExpense1, 0);
        expect(mergeExpensesService.generateLocationOptions).toHaveBeenCalledWith(transformedPlatformedExpense1, 1);

        component.onwardDateOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData16);
        });
        component.returnDateOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData16);
        });

        expect(mergeExpensesService.generateOnwardDateOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        expect(mergeExpensesService.generateReturnDateOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);

        component.flightJourneyTravelClassOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData17);
        });
        component.flightReturnTravelClassOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData17);
        });

        component.trainTravelClassOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData18);
        });
        component.busTravelClassOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData19);
        });

        expect(mergeExpensesService.generateTrainTravelClassOptions).toHaveBeenCalledOnceWith(
          transformedPlatformedExpense1
        );
        expect(mergeExpensesService.generateBusTravelClassOptions).toHaveBeenCalledOnceWith(
          transformedPlatformedExpense1
        );

        expect(mergeExpensesService.generateFlightJourneyTravelClassOptions).toHaveBeenCalledOnceWith(
          transformedPlatformedExpense1
        );
        expect(mergeExpensesService.generateFlightReturnTravelClassOptions).toHaveBeenCalledOnceWith(
          transformedPlatformedExpense1
        );

        component.distanceOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData20);
        });
        component.distanceUnitOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData21);
        });

        expect(component.setupDefaultReceipts).toHaveBeenCalledTimes(1);

        expect(mergeExpensesService.generateDistanceOptions).toHaveBeenCalledOnceWith(transformedPlatformedExpense1);
        expect(mergeExpensesService.generateDistanceUnitOptions).toHaveBeenCalledOnceWith(
          transformedPlatformedExpense1
        );
      });
    });

    describe('setupDefaultReceipts():', () => {
      beforeEach(() => {
        component.expenses = cloneDeep(transformedPlatformedExpense1);
        component.genericFieldsOptions$ = of(cloneDeep(combinedOptionsData1));
      });

      it('should set receipts_from as transaction ID if any of the merged expense has receipt', () => {
        component.expenses[1].tx_file_ids = ['fi2xk29232qwr'];
        component.setupDefaultReceipts(component.expenses);
        expect(component.fg.controls.genericFields.value.receipts_from).toEqual('txZA0Oj6TV9c');
      });

      it('should set receipts_from as null if none of the merged expense has receipt', () => {
        component.setupDefaultReceipts(component.expenses);
        expect(component.fg.controls.genericFields.value.receipts_from).toEqual(null);
      });
    });

    describe('loadGenericFieldsOptions(): ', () => {
      beforeEach(() => {
        component.expenses = expenseList2;
        component.genericFieldsOptions$ = of(cloneDeep(combinedOptionsData1));
        mergeExpensesService.getFieldValue.and.returnValues(
          40.67,
          null,
          null,
          '3943',
          null,
          null,
          'Nilesh As Vendor',
          'tgXEJA6YUoZ1',
          0.01,
          null,
          null
        );
        mergeExpensesService.setDefaultExpenseToKeep.and.returnValue(expensesInfo);
        mergeExpensesService.isAllAdvanceExpenses.and.returnValue(true);
        spyOn(component, 'setInitialExpenseToKeepDetails');
      });

      it('should update genericFields in the form correctly', () => {
        component.loadGenericFieldsOptions();

        expect(component.fg.controls.genericFields.value).toEqual({
          amount: 40.67,
          dateOfSpend: null,
          paymentMode: null,
          project: '3943',
          billable: null,
          category: null,
          vendor: 'Nilesh As Vendor',
          tax_group: 'tgXEJA6YUoZ1',
          tax_amount: 0.01,
          costCenter: null,
          purpose: null,
          receipts_from: undefined,
        });
        expect(mergeExpensesService.getFieldValue).toHaveBeenCalledTimes(11);
      });

      it('should call setInitialExpenseToKeepDetails once with expensesInfo and isAllAdvanceExpenses flag', () => {
        component.loadGenericFieldsOptions();
        expect(mergeExpensesService.setDefaultExpenseToKeep).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.isAllAdvanceExpenses).toHaveBeenCalledOnceWith(expenseList2);
        expect(component.setInitialExpenseToKeepDetails).toHaveBeenCalledOnceWith(expensesInfo, true);
      });
    });

    it('subscribeExpenseChange(): should call onExpenseChanged and patchCategoryDependentFields once if target_txn_id value changes', () => {
      component.expenses = expenseList2;
      spyOn(component, 'onExpenseChanged');
      spyOn(component, 'patchCategoryDependentFields');
      component.subscribeExpenseChange();
      component.fg.patchValue({ target_txn_id: 'tx3nHShG60zq' });
      expect(component.onExpenseChanged).toHaveBeenCalledOnceWith(1);
      expect(component.patchCategoryDependentFields).toHaveBeenCalledOnceWith(1);
    });
  });
}
