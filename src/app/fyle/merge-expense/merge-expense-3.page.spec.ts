import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MergeExpensePage } from './merge-expense.page';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { NavController } from '@ionic/angular';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { MergeExpensesService } from 'src/app/core/services/merge-expenses.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { FormBuilder, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { expenseList2 } from 'src/app/core/mock-data/expense.data';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
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
  optionsData32,
  optionsData6,
  optionsData7,
  optionsData8,
  optionsData9,
} from 'src/app/core/mock-data/merge-expenses-options-data.data';
import { combinedOptionsData1, combinedOptionsData2 } from 'src/app/core/mock-data/combined-options.data';
import { fileObject7 } from 'src/app/core/mock-data/file-object.data';
import { projectDependentFieldsMappingData1 } from 'src/app/core/mock-data/project-dependent-fields-mapping.data';
import { CostCenterDependentFieldsMappingData1 } from 'src/app/core/mock-data/cost-center-dependent-fields-mapping.data';
import {
  generatedFormPropertiesData1,
  generatedFormPropertiesData2,
  generatedFormPropertiesData3,
  generatedFormPropertiesData4,
} from 'src/app/core/mock-data/generated-form-properties.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { snackbarPropertiesRes5 } from 'src/app/core/mock-data/snackbar-properties.data';
import {
  mergeExpenseFormData1,
  mergeExpenseFormData2,
  mergeExpenseFormData3,
  mergeExpenseFormData4,
  mergeExpenseFormData5,
} from 'src/app/core/mock-data/merge-expense-form-data.data';
import { dependentCustomFields } from 'src/app/core/mock-data/expense-field.data';
import {
  expectedTxnCustomProperties,
  expectedTxnCustomProperties2,
  txnCustomPropertiesData,
  txnCustomPropertiesData2,
} from 'src/app/core/mock-data/txn-custom-properties.data';
import { filterTestData } from 'src/app/core/test-data/custom-inputs.spec.data';
import { responseAfterAppliedFilter } from 'src/app/core/test-data/custom-inputs.spec.data';
import { expenseFieldsMapResponse, expenseFieldsMapResponse4 } from 'src/app/core/mock-data/expense-fields-map.data';
import { dependentFieldsMappingForProject } from 'src/app/core/mock-data/dependent-field-mapping.data';
import { expectedCustomInputFields } from 'src/app/core/mock-data/custom-field.data';
import { apiCardV2Transactions } from 'src/app/core/mock-data/ccc-api-response';

export function TestCases3(getTestBed) {
  return describe('test cases set 3', () => {
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
      component.fg = formBuilder.group({
        target_txn_id: [, Validators.required],
        genericFields: [],
        categoryDependent: [],
        custom_inputs: [],
      });
    }));

    describe('setupCustomInputs(): ', () => {
      beforeEach(() => {
        customInputsService.getAll.and.returnValue(of(filterTestData));
        component.loadCustomFields$ = new BehaviorSubject(null);
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomPropertiesData);
        customInputsService.filterByCategory.and.returnValue(responseAfterAppliedFilter);
        spyOn(component, 'patchCustomInputsValues');
        spyOn(component, 'getDependentFieldsMapping').and.returnValues(
          of(projectDependentFieldsMappingData1),
          of(CostCenterDependentFieldsMappingData1)
        );
      });

      it('should call customInputsService.getAll() once with true', () => {
        component.setupCustomInputs();
        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
      });

      it('should call customFieldsService.standardizeCustomFields with empty array if fields are not defined in custom_inputs', () => {
        component.loadCustomFields$ = new BehaviorSubject('201952');
        component.setupCustomInputs();

        component.customInputs$.subscribe();

        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(2);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledWith([], responseAfterAppliedFilter);
        expect(customInputsService.filterByCategory).toHaveBeenCalledTimes(2);
        const firstFilterByCategoryCall = customInputsService.filterByCategory.calls.argsFor(0);
        expect(firstFilterByCategoryCall).toEqual([filterTestData, null]);
        const secondFilterByCategoryCall = customInputsService.filterByCategory.calls.argsFor(1);
        expect(secondFilterByCategoryCall).toEqual([filterTestData, '201952']);
      });

      it('should call customFieldsService.standrardizeCustomFields with custom_inputs if fields are defined in custom_inputs', () => {
        component.fg = formBuilder.group(mergeExpenseFormData1);
        component.loadCustomFields$ = new BehaviorSubject('201952');
        component.setupCustomInputs();

        component.customInputs$.subscribe();

        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(2);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledWith(
          mergeExpenseFormData1.custom_inputs.fields,
          responseAfterAppliedFilter
        );
        expect(customInputsService.filterByCategory).toHaveBeenCalledTimes(2);
        const firstFilterByCategoryCall = customInputsService.filterByCategory.calls.argsFor(0);
        expect(firstFilterByCategoryCall).toEqual([filterTestData, null]);
        const secondFilterByCategoryCall = customInputsService.filterByCategory.calls.argsFor(1);
        expect(secondFilterByCategoryCall).toEqual([filterTestData, '201952']);
      });

      it('should return customFields corrctly', () => {
        component.setupCustomInputs();
        component.customInputs$.subscribe((customInputs) => {
          expect(customInputs).toEqual(txnCustomPropertiesData);
        });
      });

      it('should call patchCustomInputsValues if isMerging is false', () => {
        component.isMerging = false;
        component.setupCustomInputs();

        component.customInputs$.subscribe();
        expect(component.patchCustomInputsValues).toHaveBeenCalledTimes(2);
        expect(component.patchCustomInputsValues).toHaveBeenCalledWith(txnCustomPropertiesData);
      });

      it('should not call patchCustomInputsValues if isMerging is true', () => {
        component.isMerging = true;
        component.setupCustomInputs();

        component.customInputs$.subscribe();
        expect(component.patchCustomInputsValues).not.toHaveBeenCalled();
      });

      it('should assign projectDependentFieldsMapping$ and costCenterDependentFieldsMapping$ correctly', () => {
        component.setupCustomInputs();
        component.projectDependentFieldsMapping$.subscribe((projectDependentFields) => {
          expect(projectDependentFields).toEqual(projectDependentFieldsMappingData1);
        });
        component.costCenterDependentFieldsMapping$.subscribe((costCenterDependentFields) => {
          expect(costCenterDependentFields).toEqual(CostCenterDependentFieldsMappingData1);
        });
        expect(component.getDependentFieldsMapping).toHaveBeenCalledTimes(2);
        expect(component.getDependentFieldsMapping).toHaveBeenCalledWith('PROJECT');
        expect(component.getDependentFieldsMapping).toHaveBeenCalledWith('COST_CENTER');
      });
    });

    describe('getDependentFieldsMapping(): ', () => {
      beforeEach(() => {
        expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse4));
        dependantFieldsService.getDependentFieldsForBaseField.and.returnValue(of(dependentCustomFields));
        customFieldsService.standardizeCustomFields.and.returnValue(expectedTxnCustomProperties);
        mergeExpensesService.getDependentFieldsMapping.and.returnValue(dependentFieldsMappingForProject);
      });

      it('should call expenseFieldsService.getAllMap() once', () => {
        component.getDependentFieldsMapping('PROJECT');
        expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(1);
      });

      it('should call dependantFieldsService.getDependentFieldsForBaseField() once with project_id.id if parentField is PROJECT', () => {
        component.getDependentFieldsMapping('PROJECT').subscribe((res) => {
          expect(dependantFieldsService.getDependentFieldsForBaseField).toHaveBeenCalledOnceWith(1);
        });
      });

      it('should call dependantFieldsService.getDependentFieldsForBaseField() once with cost_center_id.id if parentField is COST_CENTER', () => {
        component.getDependentFieldsMapping('COST_CENTER').subscribe((res) => {
          expect(dependantFieldsService.getDependentFieldsForBaseField).toHaveBeenCalledOnceWith(3);
        });
      });

      it('should call customFieldsService.standardizeCustomFields() once with customFields', () => {
        component.getDependentFieldsMapping('PROJECT').subscribe((res) => {
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], dependentCustomFields);
        });
      });

      it('should call mergeExpensesService.getDependentFieldsMapping() once with expense, dependentField and parentField if parentField is PROJECT', () => {
        component.expenses = expenseList2;
        component.getDependentFieldsMapping('PROJECT').subscribe((res) => {
          expect(mergeExpensesService.getDependentFieldsMapping).toHaveBeenCalledOnceWith(
            expenseList2,
            expectedTxnCustomProperties,
            'PROJECT'
          );
        });
      });

      it('should call mergeExpensesService.getDependentFieldsMapping() once with expense, dependentField and parentField if parentField is COST_CENTER', () => {
        component.expenses = expenseList2;
        component.getDependentFieldsMapping('COST_CENTER').subscribe((res) => {
          expect(mergeExpensesService.getDependentFieldsMapping).toHaveBeenCalledOnceWith(
            expenseList2,
            expectedTxnCustomProperties,
            'COST_CENTER'
          );
        });
      });

      it('should return the dependentFieldsMapping correctly', () => {
        const dependentFieldsMapping$ = component.getDependentFieldsMapping('COST_CENTER');
        dependentFieldsMapping$.subscribe((dependentFieldsMapping) => {
          expect(dependentFieldsMapping).toEqual(dependentFieldsMappingForProject);
        });
      });
    });

    it('patchCustomInputsValues(): should patch customInputsValues correctly', () => {
      component.combinedCustomProperties = combinedOptionsData2;
      component.patchCustomInputsValues(txnCustomPropertiesData);
      expect(component.fg.controls.custom_inputs.value).toEqual(expectedCustomInputFields);
    });

    it('onPaymentModeChanged(): should call mergeExpensesService.getCorporateCardTransactions() once and assign CCCTxns correctly', () => {
      component.expenses = expenseList2;
      mergeExpensesService.getCorporateCardTransactions.and.returnValue(of(apiCardV2Transactions.data));
      component.onPaymentModeChanged();
      expect(mergeExpensesService.getCorporateCardTransactions).toHaveBeenCalledOnceWith(expenseList2);
      expect(component.CCCTxns).toEqual(apiCardV2Transactions.data);
    });

    describe('generateCustomInputOptions(): ', () => {
      beforeEach(() => {
        component.expenses = expenseList2;
        mergeExpensesService.getCustomInputValues.and.returnValue(cloneDeep(expectedTxnCustomProperties2));
        mergeExpensesService.formatCustomInputOptions.and.returnValue({
          'select all 2': optionsData32[7],
        });
      });

      it('should return customInput options correctly', () => {
        const customInputOptions = component.generateCustomInputOptions();
        expect(mergeExpensesService.formatCustomInputOptions).toHaveBeenCalledOnceWith(optionsData32);
        expect(customInputOptions).toEqual({
          'select all 2': optionsData32[7],
        });
      });
    });
  });
}
