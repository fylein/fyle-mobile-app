import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { MergeExpensePage } from './merge-expense.page';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { NavController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { MergeExpensesService } from 'src/app/core/services/merge-expenses.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { expenseData1, expenseList2 } from 'src/app/core/mock-data/expense.data';
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
    let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
    let dependantFieldsService: jasmine.SpyObj<DependentFieldsService>;
    let formBuilder: FormBuilder;

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
      expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
      dependantFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;
      formBuilder = TestBed.inject(FormBuilder);
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('genericFieldsForm(): should return the genericFields form control', () => {
      component.fg = formBuilder.group({
        genericFields: new FormControl([]),
      });

      const genericFieldsForm = component.genericFieldsForm;

      expect(genericFieldsForm.value).toEqual([]);
    });

    it('categoryDependentForm(): should return the categoryDependent form control', () => {
      component.fg = formBuilder.group({
        categoryDependent: new FormControl([]),
      });

      const categoryDependentForm = component.categoryDependentForm;

      expect(categoryDependentForm.value).toEqual([]);
    });

    it('ngOnInit(): should set expenses and redirectedFrom correctly', () => {
      activatedRoute.snapshot.params = {
        selectedElements: JSON.stringify([expenseData1]),
        from: 'MY_EXPENSES',
      };
      fixture.detectChanges();

      const expense = JSON.parse(activatedRoute.snapshot.params.selectedElements);
      expect(component.expenses).toEqual(expense);
      expect(component.redirectedFrom).toEqual('MY_EXPENSES');
    });

    describe('ionViewWillEnter(): ', () => {
      beforeEach(() => {
        component.expenses = expenseList2;
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
      });

      it('should assign form values correctly', () => {
        component.ionViewWillEnter();
        expect(component.fg.controls.target_txn_id.value).toEqual(null);
        expect(component.fg.controls.target_txn_id.validator).toBe(Validators.required);
        expect(component.fg.controls.genericFields.value).toEqual(null);
        expect(component.fg.controls.categoryDependent.value).toEqual(null);
        expect(component.fg.controls.custom_inputs.value).toEqual(null);
      });

      it('should assign systemCategories, expenseOptions$ and receiptOptions correctly', () => {
        component.ionViewWillEnter();

        expect(categoriesService.getSystemCategories).toHaveBeenCalledTimes(1);
        expect(mergeExpensesService.generateExpenseToKeepOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateReceiptOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(component.systemCategories).toEqual(['Bus', 'Airlines', 'Lodging', 'Train']);
        expect(component.receiptOptions).toEqual(mergeExpensesOptionsData);
        component.expenseOptions$.subscribe((res) => {
          expect(res).toEqual(mergeExpensesOptionsData);
        });
      });

      it('should assign amountOptionsData$, dateOfSpendOptionsData$ and paymentModeOptionsData$ correctly', () => {
        component.ionViewWillEnter();

        expect(mergeExpensesService.generateAmountOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateDateOfSpendOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generatePaymentModeOptions).toHaveBeenCalledOnceWith(expenseList2);
        component.amountOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData3);
        });
        component.dateOfSpendOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData6);
        });
        component.paymentModeOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData7);
        });
      });

      it('should assign projectOptionsData$, billableOptionsData$ and vendorOptionsData$ correctly', () => {
        component.ionViewWillEnter();

        expect(mergeExpensesService.generateProjectOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateBillableOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateVendorOptions).toHaveBeenCalledOnceWith(expenseList2);
        component.projectOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData9);
        });
        component.billableOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData2);
        });
        component.vendorOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData8);
        });
      });

      it('should assign categoryOptionsData$, taxGroupOptionsData$ and taxAmountOptionsData$ correctly', () => {
        component.ionViewWillEnter();

        expect(mergeExpensesService.generateCategoryOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateTaxGroupOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateTaxAmountOptions).toHaveBeenCalledOnceWith(expenseList2);
        component.categoryOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData10);
        });
        component.taxGroupOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData11);
        });
        component.taxAmountOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData12);
        });
      });

      it('should assign costCenterOptionsData$ and purposeOptionsData$ correctly', () => {
        component.ionViewWillEnter();

        expect(mergeExpensesService.generateCostCenterOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generatePurposeOptions).toHaveBeenCalledOnceWith(expenseList2);
        component.constCenterOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData13);
        });
        component.purposeOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData14);
        });
      });

      it('should assign location1OptionsData$ and location2OptionsData$ correctly', () => {
        component.ionViewWillEnter();

        expect(mergeExpensesService.generateLocationOptions).toHaveBeenCalledTimes(2);
        expect(mergeExpensesService.generateLocationOptions).toHaveBeenCalledWith(expenseList2, 0);
        expect(mergeExpensesService.generateLocationOptions).toHaveBeenCalledWith(expenseList2, 1);
        component.location1OptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData15);
        });
        component.location2OptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData15);
        });
      });

      it('should assign onwardDateOptionsData$ and returnDateOptionsData$ correctly', () => {
        component.ionViewWillEnter();

        expect(mergeExpensesService.generateOnwardDateOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateReturnDateOptions).toHaveBeenCalledOnceWith(expenseList2);
        component.onwardDateOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData16);
        });
        component.returnDateOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData16);
        });
      });

      it('should assign flightJourneyTravelClassOptionsData$ and flightReturnTravelClassOptionsData$', () => {
        component.ionViewWillEnter();

        expect(mergeExpensesService.generateFlightJourneyTravelClassOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateFlightReturnTravelClassOptions).toHaveBeenCalledOnceWith(expenseList2);
        component.flightJourneyTravelClassOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData17);
        });
        component.flightReturnTravelClassOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData17);
        });
      });

      it('should assign trainTravelClassOptionsData$ and busTravelClassOptionsData$ correctly', () => {
        component.ionViewWillEnter();

        expect(mergeExpensesService.generateTrainTravelClassOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateBusTravelClassOptions).toHaveBeenCalledOnceWith(expenseList2);
        component.trainTravelClassOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData18);
        });
        component.busTravelClassOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData19);
        });
      });

      it('should assign distanceOptionsData$ and distanceUnitOptionsData$ correctly', () => {
        component.ionViewWillEnter();

        expect(mergeExpensesService.generateDistanceOptions).toHaveBeenCalledOnceWith(expenseList2);
        expect(mergeExpensesService.generateDistanceUnitOptions).toHaveBeenCalledOnceWith(expenseList2);
        component.distanceOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData20);
        });
        component.distanceUnitOptionsData$.subscribe((res) => {
          expect(res).toEqual(optionsData21);
        });
      });

      it('should assign genericFieldsOptions$ correctly', () => {
        component.ionViewWillEnter();

        component.genericFieldsOptions$.subscribe((genericFieldsOptions) => {
          expect(genericFieldsOptions.amountOptionsData).toEqual(optionsData3);
          expect(genericFieldsOptions.dateOfSpendOptionsData).toEqual(optionsData6);
          expect(genericFieldsOptions.paymentModeOptionsData).toEqual(optionsData7);
          expect(genericFieldsOptions.projectOptionsData).toEqual(optionsData9);
          expect(genericFieldsOptions.billableOptionsData).toEqual(optionsData2);
          expect(genericFieldsOptions.categoryOptionsData).toEqual(optionsData10);
          expect(genericFieldsOptions.vendorOptionsData).toEqual(optionsData8);
          expect(genericFieldsOptions.taxGroupOptionsData).toEqual(optionsData11);
          expect(genericFieldsOptions.taxAmountOptionsData).toEqual(optionsData12);
          expect(genericFieldsOptions.constCenterOptionsData).toEqual(optionsData13);
          expect(genericFieldsOptions.purposeOptionsData).toEqual(optionsData14);
        });
      });

      it('should assign loadCustomFields$ and combinedCustomProperties correctly', () => {
        component.ionViewWillEnter();

        component.loadCustomFields$.subscribe((res) => {
          expect(res).toEqual(undefined);
        });
        expect(component.combinedCustomProperties).toEqual(combinedOptionsData1);
        expect(component.generateCustomInputOptions).toHaveBeenCalledTimes(1);
      });

      it('should call setupCustomInputs, loadGenericFieldsOptions, loadCategoryDependentFields and subscribeExpenseChange only once', () => {
        component.ionViewWillEnter();

        expect(component.setupCustomInputs).toHaveBeenCalledTimes(1);
        expect(component.loadGenericFieldsOptions).toHaveBeenCalledTimes(1);
        expect(component.loadCategoryDependentFields).toHaveBeenCalledTimes(1);
        expect(component.subscribeExpenseChange).toHaveBeenCalledTimes(1);
      });
    });
  });
}
