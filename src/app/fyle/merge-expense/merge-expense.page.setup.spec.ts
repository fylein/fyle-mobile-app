import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { NavController } from '@ionic/angular';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { MergeExpensesService } from 'src/app/core/services/merge-expenses.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';

import { MergeExpensePage } from './merge-expense.page';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TestCases1 } from './merge-expense-1.page.spec';
import { TestCases2 } from './merge-expense-2.page.spec';

describe('MergeExpensePage', () => {
  const getTestBed = () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      snapshot: {
        params: {},
      },
    };
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getSystemCategories']);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', ['getAll', 'filterByCategory']);
    const customFieldsServiceSpy = jasmine.createSpyObj('CustomFieldsService', ['standardizeCustomFields']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const matSnackbarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const mergeExpensesServiceSpy = jasmine.createSpyObj('MergeExpensesService', [
      'generateExpenseToKeepOptions',
      'generateReceiptOptions',
      'generateAmountOptions',
      'generateDateOfSpendOptions',
      'generatePaymentModeOptions',
      'generateProjectOptions',
      'generateBillableOptions',
      'generateVendorOptions',
      'generateCategoryOptions',
      'generateTaxGroupOptions',
      'generateTaxAmountOptions',
      'generateCostCenterOptions',
      'generatePurposeOptions',
      'generateLocationOptions',
      'generateOnwardDateOptions',
      'generateReturnDateOptions',
      'generateFlightJourneyTravelClassOptions',
      'generateFlightReturnTravelClassOptions',
      'generateTrainTravelClassOptions',
      'generateBusTravelClassOptions',
      'generateDistanceOptions',
      'generateDistanceUnitOptions',
      'getFieldValue',
      'setDefaultExpenseToKeep',
      'isAllAdvanceExpenses',
      'getFieldValueOnChange',
      'getAttachements',
      'mergeExpenses',
      'getCategoryName',
      'getDependentFieldsMapping',
      'getCorporateCardTransactions',
      'getCustomInputValues',
      'formatCustomInputOptions',
      'isApprovedAndAbove',
      'isReportedPresent',
      'isReportedOrAbove',
      'isMoreThanOneAdvancePresent',
      'isAdvancePresent',
    ]);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['expensesMerged']);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', [
      'getDependentFieldsForBaseField',
    ]);

    TestBed.configureTestingModule({
      declarations: [MergeExpensePage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, FormsModule, RouterTestingModule, RouterModule],
      providers: [
        FormBuilder,
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: CustomInputsService, useValue: customInputsServiceSpy },
        { provide: CustomFieldsService, useValue: customFieldsServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: MatSnackBar, useValue: matSnackbarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        {
          provide: MergeExpensesService,
          useValue: mergeExpensesServiceSpy,
        },
        {
          provide: ExpenseFieldsService,
          useValue: expenseFieldsServiceSpy,
        },
        {
          provide: DependentFieldsService,
          useValue: dependentFieldsServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    return TestBed;
  };

  TestCases1(getTestBed);
  TestCases2(getTestBed);
});
