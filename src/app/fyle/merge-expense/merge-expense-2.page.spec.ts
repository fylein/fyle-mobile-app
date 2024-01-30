import { ComponentFixture, waitForAsync } from '@angular/core/testing';
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
import { UntypedFormBuilder, Validators } from '@angular/forms';
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
  optionsData33,
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
  generatedFormPropertiesData5,
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

export function TestCases2(getTestBed) {
  return describe('test cases set 2', () => {
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
    let formBuilder: UntypedFormBuilder;

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
      formBuilder = TestBed.inject(UntypedFormBuilder);
      component.fg = formBuilder.group({
        target_txn_id: [, Validators.required],
        genericFields: [],
        categoryDependent: [],
        custom_inputs: [],
      });
    }));

    describe('onExpenseChanged(): ', () => {
      beforeEach(() => {
        component.genericFieldsOptions$ = of(cloneDeep(combinedOptionsData1));
        component.expenses = cloneDeep(expenseList2);
        mergeExpensesService.getFieldValueOnChange.and.returnValues(
          'tx3nHShG60zq',
          new Date('2023-03-13T11:30:00.000Z'),
          'PERSONAL_ACCOUNT',
          '3943',
          false,
          207484,
          'Nilesh As Vendor',
          'tgXEJA6YUoZ1',
          0.01,
          '213',
          'Outing'
        );
      });

      it('should call getFieldValueOnChange 11 times', () => {
        component.onExpenseChanged(1);

        expect(mergeExpensesService.getFieldValueOnChange).toHaveBeenCalledTimes(11);
      });

      it('should update receipt_ids to null if expense is undefined', () => {
        component.onExpenseChanged(-1);
        expect(component.fg.controls.genericFields.value.receipt_ids).toEqual(null);
      });

      it('should update receipt_ids to null if tx_file_ids is undefined', () => {
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.receipt_ids).toEqual(null);
      });

      it('should update receipt_ids to null if tx_file_ids is empty', () => {
        component.expenses[1].tx_file_ids = [];
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.receipt_ids).toEqual(null);
      });

      it('should set receipt_ids to tx_split_group_id if tx_file_ids is not empty and touchedGenericFields is undefined', () => {
        component.expenses[1].tx_file_ids = ['fiGLwwPtYD8X'];
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.receipt_ids).toEqual('tx3nHShG60zq');
      });

      it('should set receipt_ids to tx_split_group_id if tx_file_ids is not empty and receipt_ids field is not touched in the form', () => {
        component.expenses[1].tx_file_ids = ['fiGLwwPtYD8X'];
        component.touchedGenericFields = ['dateOfSpend', 'paymentMode'];
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.receipt_ids).toEqual('tx3nHShG60zq');
      });

      it('should call getFieldValueOnChange for updating amount with correct arguments', () => {
        component.touchedGenericFields = ['amount'];
        component.genericFieldsForm.patchValue({ amount: 99 });
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.amount).toEqual('tx3nHShG60zq');
        const amountCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(0);
        expect(amountCall[0]).toEqual(optionsData3);
        expect(amountCall[1]).toEqual(true);
        expect(amountCall[2]).toEqual('tx3nHShG60zq');
        expect(amountCall[3]).toEqual(99);
      });

      it('should call getFieldValueOnChange for updating dateOfSpend with correct arguments', () => {
        component.touchedGenericFields = ['amount'];
        component.genericFieldsForm.patchValue({ dateOfSpend: new Date('2023-03-13T11:30:00.000Z') });
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.dateOfSpend).toEqual(new Date('2023-03-13T11:30:00.000Z'));
        const dateOfSpendCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(1);
        expect(dateOfSpendCall[0]).toEqual(optionsData6);
        expect(dateOfSpendCall[1]).toEqual(false);
        expect(dateOfSpendCall[2]).toEqual(new Date('2021-07-29T06:30:00.000Z'));
        expect(dateOfSpendCall[3]).toEqual(new Date('2023-03-13T11:30:00.000Z'));
      });

      it('should call getFieldValueOnChange for updating paymentMode with correct arguments', () => {
        component.touchedGenericFields = ['paymentMode'];
        component.genericFieldsForm.patchValue({ paymentMode: 'PERSONAL_ACCOUNT' });
        component.onExpenseChanged(-1);
        expect(component.fg.controls.genericFields.value.paymentMode).toEqual('PERSONAL_ACCOUNT');
        const paymentModeCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(2);
        expect(paymentModeCall[0]).toEqual(optionsData7);
        expect(paymentModeCall[1]).toEqual(true);
        expect(paymentModeCall[2]).toEqual(undefined);
        expect(paymentModeCall[3]).toEqual('PERSONAL_ACCOUNT');
      });

      it('should call getFieldValueOnChange for updating project with correct arguments', () => {
        component.touchedGenericFields = ['amount'];
        component.genericFieldsForm.patchValue({ project: 'PROJECT_1' });
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.project).toEqual('3943');
        const projectCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(3);
        expect(projectCall[0]).toEqual(optionsData9);
        expect(projectCall[1]).toEqual(false);
        expect(projectCall[2]).toEqual(3812);
        expect(projectCall[3]).toEqual('PROJECT_1');
      });

      it('should call getFieldValueOnChange for updating billable with correct arguments', () => {
        component.touchedGenericFields = ['billable'];
        component.genericFieldsForm.patchValue({ billable: false });
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.billable).toEqual(false);
        const billableCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(4);
        expect(billableCall[0]).toEqual(optionsData2);
        expect(billableCall[1]).toEqual(true);
        expect(billableCall[2]).toEqual(false);
        expect(billableCall[3]).toEqual(false);
      });

      it('should call getFieldValueOnChange for updating category with correct arguments', () => {
        component.touchedGenericFields = ['category'];
        component.genericFieldsForm.patchValue({ category: 213 });
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.category).toEqual(207484);
        const categoryCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(5);
        expect(categoryCall[0]).toEqual(optionsData10);
        expect(categoryCall[1]).toEqual(true);
        expect(categoryCall[2]).toEqual(207484);
        expect(categoryCall[3]).toEqual(213);
      });

      it('should call getFieldValueOnChange for updating vendor with correct arguments', () => {
        component.touchedGenericFields = ['category'];
        component.genericFieldsForm.patchValue({ vendor: 'VENDOR_1' });
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.vendor).toEqual('Nilesh As Vendor');
        const vendorCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(6);
        expect(vendorCall[0]).toEqual(optionsData8);
        expect(vendorCall[1]).toEqual(false);
        expect(vendorCall[2]).toEqual('ramdev baba');
        expect(vendorCall[3]).toEqual('VENDOR_1');
      });

      it('should call getFieldValueOnChange for updating tax_group with correct arguments', () => {
        component.touchedGenericFields = ['tax_group'];
        component.genericFieldsForm.patchValue({ tax_group: 'TAX_GROUP_1' });
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.tax_group).toEqual('tgXEJA6YUoZ1');
        const taxGroupCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(7);
        expect(taxGroupCall[0]).toEqual(optionsData11);
        expect(taxGroupCall[1]).toEqual(true);
        expect(taxGroupCall[2]).toEqual('tgFDWBpJL3vy');
        expect(taxGroupCall[3]).toEqual('TAX_GROUP_1');
      });

      it('should call getFieldValueOnChange for updating tax_amount with correct arguments', () => {
        component.touchedGenericFields = ['tax_amount'];
        component.genericFieldsForm.patchValue({ tax_amount: 99 });
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.tax_amount).toEqual(0.01);
        const taxAmountCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(8);
        expect(taxAmountCall[0]).toEqual(optionsData12);
        expect(taxAmountCall[1]).toEqual(true);
        expect(taxAmountCall[2]).toEqual(0.32);
        expect(taxAmountCall[3]).toEqual(99);
      });

      it('should call getFieldValueOnChange for updating costCenter with correct arguments', () => {
        component.touchedGenericFields = ['costCenter'];
        component.genericFieldsForm.patchValue({ costCenter: 'COST_CENTER_1' });
        component.onExpenseChanged(1);

        expect(component.fg.controls.genericFields.value.costCenter).toEqual('213');
        const costCenterCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(9);
        expect(costCenterCall[0]).toEqual(optionsData13);
        expect(costCenterCall[1]).toEqual(true);
        expect(costCenterCall[2]).toEqual(12488);
        expect(costCenterCall[3]).toEqual('COST_CENTER_1');
      });

      it('should call getFieldValueOnChange for updating purpose with correct arguments', () => {
        component.touchedGenericFields = ['purpose'];
        component.genericFieldsForm.patchValue({ purpose: 'PURPOSE_1' });
        component.onExpenseChanged(1);
        expect(component.fg.controls.genericFields.value.purpose).toEqual('Outing');
        const customFieldsCall = mergeExpensesService.getFieldValueOnChange.calls.argsFor(10);
        expect(customFieldsCall[0]).toEqual(optionsData14);
        expect(customFieldsCall[1]).toEqual(true);
        expect(customFieldsCall[2]).toEqual('Others');
        expect(customFieldsCall[3]).toEqual('PURPOSE_1');
      });
    });

    describe('loadCategoryDependentFields(): ', () => {
      beforeEach(() => {
        component.location1OptionsData$ = of(optionsData15);
        component.location2OptionsData$ = of(optionsData15);
        component.onwardDateOptionsData$ = of(optionsData16);
        component.returnDateOptionsData$ = of(optionsData16);
        component.flightJourneyTravelClassOptionsData$ = of(optionsData17);
        component.flightReturnTravelClassOptionsData$ = of(optionsData17);
        component.trainTravelClassOptionsData$ = of(optionsData18);
        component.busTravelClassOptionsData$ = of(optionsData19);
        component.distanceOptionsData$ = of(optionsData20);
        component.distanceUnitOptionsData$ = of(optionsData21);
        mergeExpensesService.getFieldValue.and.returnValues(
          null,
          null,
          new Date('2023-03-13T05:31:00.000Z'),
          new Date('2023-03-13T05:31:00.000Z'),
          'ECONOMY',
          'ECONOMY',
          null,
          'AC',
          null,
          null
        );
      });

      it('should set categoryDependent fields in the form correctly', () => {
        component.loadCategoryDependentFields();

        expect(component.fg.controls.categoryDependent.value.location_1).toEqual(null);
        expect(component.fg.controls.categoryDependent.value.location_2).toEqual(null);
        expect(component.fg.controls.categoryDependent.value.from_dt).toEqual(new Date('2023-03-13T05:31:00.000Z'));
        expect(component.fg.controls.categoryDependent.value.to_dt).toEqual(new Date('2023-03-13T05:31:00.000Z'));
        expect(component.fg.controls.categoryDependent.value.flight_journey_travel_class).toEqual('ECONOMY');
        expect(component.fg.controls.categoryDependent.value.flight_return_travel_class).toEqual('ECONOMY');
        expect(component.fg.controls.categoryDependent.value.train_travel_class).toEqual(null);
        expect(component.fg.controls.categoryDependent.value.bus_travel_class).toEqual('AC');
        expect(component.fg.controls.categoryDependent.value.distance).toEqual(null);
        expect(component.fg.controls.categoryDependent.value.distance_unit).toEqual(null);
      });

      it('should call mergeExpensesService.getFieldValue with correct arguments', () => {
        component.loadCategoryDependentFields();

        expect(mergeExpensesService.getFieldValue).toHaveBeenCalledTimes(10);
        const location1Call = mergeExpensesService.getFieldValue.calls.argsFor(0);
        expect(location1Call).toEqual([optionsData15]);
        const location2Call = mergeExpensesService.getFieldValue.calls.argsFor(1);
        expect(location2Call).toEqual([optionsData15]);
        const onwardDateCall = mergeExpensesService.getFieldValue.calls.argsFor(2);
        expect(onwardDateCall).toEqual([optionsData16]);
        const returnDateCall = mergeExpensesService.getFieldValue.calls.argsFor(3);
        expect(returnDateCall).toEqual([optionsData16]);
        const flightJourneyTravelClassCall = mergeExpensesService.getFieldValue.calls.argsFor(4);
        expect(flightJourneyTravelClassCall).toEqual([optionsData17]);
        const flightReturnTravelClassCall = mergeExpensesService.getFieldValue.calls.argsFor(5);
        expect(flightReturnTravelClassCall).toEqual([optionsData17]);
        const trainTravelClassCall = mergeExpensesService.getFieldValue.calls.argsFor(6);
        expect(trainTravelClassCall).toEqual([optionsData18]);
        const busTravelClassCall = mergeExpensesService.getFieldValue.calls.argsFor(7);
        expect(busTravelClassCall).toEqual([optionsData19]);
        const distanceCall = mergeExpensesService.getFieldValue.calls.argsFor(8);
        expect(distanceCall).toEqual([optionsData20]);
        const distanceUnitCall = mergeExpensesService.getFieldValue.calls.argsFor(9);
        expect(distanceUnitCall).toEqual([optionsData21]);
      });
    });

    it('onReceiptChanged(): should set selectedReceiptsId and attachments correctly after calling mergeExpensesService.getAttachements', () => {
      const receiptId = 'txz2vohKxBXu';
      const expectedSelectedReceiptsId = ['ficaDEJBVhjm', 'firDjjutGXfT'];
      mergeExpensesService.getAttachements.and.returnValue(of(fileObject7));
      component.onReceiptChanged(receiptId);

      expect(mergeExpensesService.getAttachements).toHaveBeenCalledOnceWith(receiptId);
      expect(component.selectedReceiptsId).toEqual(expectedSelectedReceiptsId);
      expect(component.attachments).toEqual(fileObject7);
    });

    describe('mergeExpense(): ', () => {
      beforeEach(() => {
        component.fg = formBuilder.group({
          target_txn_id: 'txBphgnCHHeO',
          genericFields: [],
          categoryDependent: [],
          custom_inputs: [],
        });
        spyOn(component.fg, 'markAllAsTouched');
        component.expenses = cloneDeep(expenseList2);
        component.projectDependentFieldsMapping$ = of(projectDependentFieldsMappingData1);
        component.costCenterDependentFieldsMapping$ = of(CostCenterDependentFieldsMappingData1);
        mergeExpensesService.mergeExpenses.and.returnValue(of('txVNpvgTPW4Z'));
        spyOn(component, 'generateFromFg').and.returnValue(generatedFormPropertiesData1);
        spyOn(component, 'showMergedSuccessToast');
        spyOn(component, 'goBack');
      });

      it('should call fg.markAllAsTouched once and set isMerging to false', () => {
        component.mergeExpense();
        expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
        expect(component.isMerging).toEqual(false);
      });

      it('should call mergeExpensesService.mergeExpenses once', () => {
        component.mergeExpense();
        expect(mergeExpensesService.mergeExpenses).toHaveBeenCalledOnceWith(
          ['tx3nHShG60zq'],
          'txBphgnCHHeO',
          generatedFormPropertiesData1
        );
        expect(component.generateFromFg).toHaveBeenCalledOnceWith({
          ...projectDependentFieldsMappingData1,
          ...CostCenterDependentFieldsMappingData1,
        });
      });

      it('should call trackingService.expensesMerged, showMergedSuccessToast and goBack method once', () => {
        component.mergeExpense();
        expect(trackingService.expensesMerged).toHaveBeenCalledTimes(1);
        expect(component.showMergedSuccessToast).toHaveBeenCalledTimes(1);
        expect(component.goBack).toHaveBeenCalledTimes(1);
      });
    });

    describe('goBack(): ', () => {
      beforeEach(() => {
        component.redirectedFrom = 'EDIT_EXPENSE';
      });

      it('should navigate to my_expenses page if user is redirected from EDIT_EXPENSE', () => {
        component.goBack();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
        expect(navController.back).not.toHaveBeenCalled();
      });

      it('should navigate to previous page if user is not redirected from EDIT_EXPENSE', () => {
        component.redirectedFrom = 'TASK';
        component.goBack();
        expect(navController.back).toHaveBeenCalledTimes(1);
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });

    it('showMergedSuccessToast(): should show Expenses merged Successfully toast', () => {
      matSnackBar.openFromComponent.and.returnValue({
        onAction: () => ({
          subscribe: () => {},
        }),
      } as MatSnackBarRef<ToastMessageComponent>);
      snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes5);

      component.showMergedSuccessToast();

      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
        message: 'Expenses merged Successfully',
      });
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarPropertiesRes5,
        panelClass: ['msb-success-with-camera-icon'],
      });
    });

    describe('generateFromFg(): ', () => {
      beforeEach(() => {
        const mockExpense = cloneDeep(expenseList2);
        mockExpense[1].source_account_type = 'CORPORATE_CARD';
        component.expenses = cloneDeep(mockExpense);
        component.fg = formBuilder.group(mergeExpenseFormData1);
      });

      it('should return generated form properties with locations consist of source and destination address', () => {
        const generatedFormProperties = component.generateFromFg(CostCenterDependentFieldsMappingData1);
        expect(generatedFormProperties).toEqual(generatedFormPropertiesData2);
      });

      it('should return generated form properties with locations as a single element if location_2 is undefined', () => {
        component.fg.patchValue(mergeExpenseFormData2);
        const generatedFormProperties = component.generateFromFg(CostCenterDependentFieldsMappingData1);
        expect(generatedFormProperties).toEqual({
          ...generatedFormPropertiesData2,
          locations: [optionsData15.options[0].value],
        });
      });

      it('should return generated form properties with locations as empty array if location_1 and locations_2 are undefined', () => {
        component.fg.patchValue(mergeExpenseFormData3);
        const generatedFormProperties = component.generateFromFg(CostCenterDependentFieldsMappingData1);
        expect(generatedFormProperties).toEqual({ ...generatedFormPropertiesData2, locations: [] });
      });

      it('should return generated form properties with projectDependantFieldValues and costCenterDependentFieldValues as empty array if project and costCenter are undefined in genericFields', () => {
        component.fg.patchValue(mergeExpenseFormData4);
        const generatedFormProperties = component.generateFromFg(CostCenterDependentFieldsMappingData1);
        expect(generatedFormProperties).toEqual(generatedFormPropertiesData3);
      });

      it('should return generated form properties with source_account_id, currency and amount as undefined if sourceExpense and amountExpense are undefined', () => {
        component.expenses = cloneDeep(expenseList2);
        component.fg.patchValue(mergeExpenseFormData5);
        const generatedFormProperties = component.generateFromFg(CostCenterDependentFieldsMappingData1);
        expect(generatedFormProperties).toEqual(generatedFormPropertiesData4);
      });

      it('should return generated form properties with ccce_group_id if tx_corporate_credit_card_expense_group_id is present in expense', () => {
        const mockExpense = cloneDeep(expenseList2);
        mockExpense[1].tx_corporate_credit_card_expense_group_id = 'ae593zqtepw';
        mockExpense[1].source_account_type = 'CORPORATE_CARD';
        component.expenses = cloneDeep(mockExpense);
        const generatedFormProperties = component.generateFromFg(CostCenterDependentFieldsMappingData1);
        expect(generatedFormProperties).toEqual({ ...generatedFormPropertiesData2, ccce_group_id: 'ae593zqtepw' });
      });

      it('should return generated form properties with custom_properties as empty array if dependentFieldsMapping is empty', () => {
        const mockFormData = cloneDeep(mergeExpenseFormData1);
        mockFormData.custom_inputs.fields = [];
        component.fg = formBuilder.group(mockFormData);
        const generatedFormProperties = component.generateFromFg({});
        expect(generatedFormProperties).toEqual(generatedFormPropertiesData5);
      });
    });

    it('onCategoryChanged(): should update selectedCategoryName and loadCustomFields$', () => {
      component.loadCustomFields$ = new BehaviorSubject(null);
      mergeExpensesService.getCategoryName.and.returnValue(of('Food'));
      component.onCategoryChanged('201952');
      expect(mergeExpensesService.getCategoryName).toHaveBeenCalledOnceWith('201952');
      expect(component.selectedCategoryName).toEqual('Food');
      component.loadCustomFields$.subscribe((customFields) => {
        expect(customFields).toEqual('201952');
      });
    });
  });
}
