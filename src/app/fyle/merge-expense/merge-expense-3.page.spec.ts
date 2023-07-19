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
import { BehaviorSubject, Observable, Subscription, of, skip, take } from 'rxjs';
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
import { txnCustomPropertiesData } from 'src/app/core/mock-data/txn-custom-properties.data';
import { filterTestData } from 'src/app/core/test-data/custom-inputs.spec.data';
import { responseAfterAppliedFilter } from 'src/app/core/test-data/custom-inputs.spec.data';

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

      it('should call customFieldsService.standardizeCustomFields with empty array if fields are not defined in custom_inputs', (done) => {
        component.loadCustomFields$ = new BehaviorSubject('201952');
        component.setupCustomInputs();

        component.customInputs$.pipe(take(2), skip(1)).subscribe(() => {
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(2);
          expect(customInputsService.filterByCategory).toHaveBeenCalledTimes(2);
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledWith([], responseAfterAppliedFilter);
          const firstFilterByCategoryCall = customInputsService.filterByCategory.calls.argsFor(0);
          expect(firstFilterByCategoryCall).toEqual([filterTestData, null]);
          const secondFilterByCategoryCall = customInputsService.filterByCategory.calls.argsFor(1);
          expect(secondFilterByCategoryCall).toEqual([filterTestData, '201952']);
          done();
        });
      });

      it('should call customFieldsService.standardizeCustomFields with custom_inputs if fields are defined in custom_inputs', (done) => {
        component.fg = formBuilder.group(mergeExpenseFormData1);
        component.loadCustomFields$ = new BehaviorSubject('201952');
        component.setupCustomInputs();

        component.customInputs$.pipe(take(2), skip(1)).subscribe(() => {
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
          done();
        });
      });

      it('should return customFields correctly', (done) => {
        component.setupCustomInputs();
        component.customInputs$.pipe(take(2), skip(1)).subscribe((customInputs) => {
          expect(customInputs).toEqual(txnCustomPropertiesData);
          done();
        });
      });

      it('should call patchCustomInputsValues if isMerging is false', (done) => {
        component.isMerging = false;
        component.setupCustomInputs();

        component.customInputs$.pipe(take(2), skip(1)).subscribe(() => {
          expect(component.patchCustomInputsValues).toHaveBeenCalledTimes(2);
          expect(component.patchCustomInputsValues).toHaveBeenCalledWith(txnCustomPropertiesData);
          done();
        });
      });

      it('should not call patchCustomInputsValues if isMerging is true', (done) => {
        component.isMerging = true;
        component.setupCustomInputs();

        component.customInputs$.pipe(take(2), skip(1)).subscribe(() => {
          expect(component.patchCustomInputsValues).not.toHaveBeenCalled();
          done();
        });
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
  });
}
