import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { dependentFields } from '../mock-data/dependent-field.data';
import { advanceExpensesList, apiExpenseRes, expenseData2, mergeExpenseData1 } from '../mock-data/expense.data';
import {
  expenseInfoWithoutDefaultExpense,
  expensesInfo,
  expensesInfoWithMultipleAdvanceExpenses,
  expensesInfoWithReportedExpense,
} from '../mock-data/expenses-info.data';
import { expensesWithDependentFields, expensesWithSameProject } from '../mock-data/expenses.data';
import { mergeExpensesPayload } from '../mock-data/merge-expenses-payload.data';
import {
  projectDependentFieldsMapping,
  projectDependentFieldsMappingForNoDependentFields,
  projectDependentFieldsMappingForSameProject,
} from '../mock-data/project-dependent-field-mapping.data';
import { ApiService } from './api.service';
import { CategoriesService } from './categories.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { CustomInputsService } from './custom-inputs.service';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { MergeExpensesService } from './merge-expenses.service';
import { ProjectsService } from './projects.service';
import { TaxGroupService } from './tax-group.service';
import {
  billableOptions1,
  billableOptions2,
  paymentModeOptions1,
  paymentModeOptions2,
  paymentModeOptions3,
  sameOptions,
} from '../mock-data/merge-expenses-option.data';
import { AccountType } from '../enums/account-type.enum';
import { optionsData2 } from '../mock-data/merge-expenses-options-data.data';

describe('MergeExpensesService', () => {
  let mergeExpensesService: MergeExpensesService;
  let apiService: jasmine.SpyObj<ApiService>;
  let fileService: jasmine.SpyObj<FileService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;
  let humanizeCurrencyPipe: jasmine.SpyObj<HumanizeCurrencyPipe>;
  let projectService: jasmine.SpyObj<ProjectsService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let dateService: jasmine.SpyObj<DateService>;
  let taxGroupService: jasmine.SpyObj<TaxGroupService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['findByTransactionId', 'downloadUrl']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getv2CardTransactions',
    ]);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', ['getAll']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);
    const projectServiceSpy = jasmine.createSpyObj('ProjectsService', ['getAllActive']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getAll', 'filterRequired']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['isValidDate']);
    const taxGroupServiceSpy = jasmine.createSpyObj('TaxGroupService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        MergeExpensesService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: CorporateCreditCardExpenseService, useValue: corporateCreditCardExpenseServiceSpy },
        { provide: CustomInputsService, useValue: customInputsServiceSpy },
        { provide: HumanizeCurrencyPipe, useValue: humanizeCurrencyPipeSpy },
        { provide: ProjectsService, useValue: projectServiceSpy },
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: TaxGroupService, useValue: taxGroupServiceSpy },
      ],
    });
    mergeExpensesService = TestBed.inject(MergeExpensesService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
    humanizeCurrencyPipe = TestBed.inject(HumanizeCurrencyPipe) as jasmine.SpyObj<HumanizeCurrencyPipe>;
    projectService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
  });

  it('should be created', () => {
    expect(mergeExpensesService).toBeTruthy();
  });

  describe('getProjectDependentFieldsMapping(): ', () => {
    it('should return the correct project dependent fields mapping when projects are different', () => {
      expect(
        mergeExpensesService.getProjectDependentFieldsMapping(expensesWithDependentFields, dependentFields)
      ).toEqual(projectDependentFieldsMapping);
    });

    it('should return the correct project dependent fields mapping when projects are same', () => {
      expect(mergeExpensesService.getProjectDependentFieldsMapping(expensesWithSameProject, dependentFields)).toEqual(
        projectDependentFieldsMappingForSameProject
      );
    });

    it('should return empty array when there are no dependent fields', () => {
      expect(mergeExpensesService.getProjectDependentFieldsMapping(expensesWithSameProject, null)).toEqual(
        projectDependentFieldsMappingForNoDependentFields
      );
    });
  });

  describe('isAllAdvanceExpenses(): ', () => {
    it('should return true when all expenses are advance expenses', () => {
      expect(mergeExpensesService.isAllAdvanceExpenses(advanceExpensesList)).toBeTrue();
    });

    it('should return false when all expenses are not advance expenses', () => {
      expect(mergeExpensesService.isAllAdvanceExpenses(apiExpenseRes)).toBeFalse();
    });

    it('should return false when expense list is empty', () => {
      expect(mergeExpensesService.isAllAdvanceExpenses([null])).toBeFalse();
    });
  });

  describe('checkIfAdvanceExpensePresent(): ', () => {
    it('should return the advance expense if present', () => {
      expect(mergeExpensesService.checkIfAdvanceExpensePresent(advanceExpensesList)).toEqual(advanceExpensesList);
    });

    it('should return empty list if advance expense is not present', () => {
      expect(mergeExpensesService.checkIfAdvanceExpensePresent(apiExpenseRes)).toEqual([]);
    });

    it('should return empty list if expense list is empty', () => {
      expect(mergeExpensesService.checkIfAdvanceExpensePresent([null])).toEqual([]);
    });
  });

  it('mergeExpenses(): should merge the expenses', (done) => {
    const mergeExpensesRes = {
      txn_id: 'txVNpvgTPW4Z',
    };

    apiService.post.and.returnValue(of(mergeExpensesRes));

    mergeExpensesService
      .mergeExpenses(
        mergeExpensesPayload.source_txn_ids,
        mergeExpensesPayload.target_txn_id,
        mergeExpensesPayload.target_txn_fields
      )
      .subscribe((res) => {
        expect(res).toEqual(Object(mergeExpensesRes));

        expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/merge', {
          source_txn_ids: mergeExpensesPayload.source_txn_ids,
          target_txn_id: mergeExpensesPayload.target_txn_id,
          target_txn_fields: mergeExpensesPayload.target_txn_fields,
        });
        done();
      });
  });

  it('isApprovedAndAbove(): should return the expenses that are approved and above', () => {
    expect(mergeExpensesService.isApprovedAndAbove(apiExpenseRes)).toEqual(apiExpenseRes);
  });

  describe('isAdvancePresent():', () => {
    it('should return true if advance expense is present', () => {
      expect(mergeExpensesService.isAdvancePresent(expensesInfo)).toBeTrue();
    });

    it('isAdvancePresent(): should return false if default expense is not present', () => {
      expect(mergeExpensesService.isAdvancePresent(expenseInfoWithoutDefaultExpense)).toBeFalse();
    });
  });

  it('isReportedPresent(): should return the reported expense is present', () => {
    expect(mergeExpensesService.isReportedPresent([expenseData2])).toEqual([expenseData2]);
  });

  describe('isReportedOrAbove():', () => {
    it('should return true if reported expense is present', () => {
      expect(mergeExpensesService.isReportedOrAbove(expensesInfoWithReportedExpense)).toBeTrue();
    });

    it('should return false if default expenses is not present', () => {
      expect(
        mergeExpensesService.isReportedOrAbove({ isReportedAndAbove: true, ...expenseInfoWithoutDefaultExpense })
      ).toBeFalse();
    });
  });

  describe('setDefaultExpenseToKeep():', () => {
    it('should set the default expense to keep', () => {
      spyOn(mergeExpensesService, 'checkIfAdvanceExpensePresent').and.returnValue([mergeExpenseData1[1]]);
      expect(mergeExpensesService.setDefaultExpenseToKeep(mergeExpenseData1)).toEqual(
        expensesInfoWithMultipleAdvanceExpenses
      );
      expect(mergeExpensesService.checkIfAdvanceExpensePresent).toHaveBeenCalledOnceWith(mergeExpenseData1);
    });

    it('should set default expense to null when advance expense is not present and all expenses are not reported and above', () => {
      spyOn(mergeExpensesService, 'checkIfAdvanceExpensePresent').and.returnValue([]);
      expect(mergeExpensesService.setDefaultExpenseToKeep(mergeExpenseData1)).toEqual(expenseInfoWithoutDefaultExpense);
      expect(mergeExpensesService.checkIfAdvanceExpensePresent).toHaveBeenCalledOnceWith(mergeExpenseData1);
    });
  });

  describe('formatBillableOptions():', () => {
    it('should return the billable options when billable is true', () => {
      // @ts-ignore
      expect(mergeExpensesService.formatBillableOptions({ value: true })).toEqual(billableOptions1);
    });

    it('should return the billable options when billable is false', () => {
      // @ts-ignore
      expect(mergeExpensesService.formatBillableOptions({ value: false })).toEqual(billableOptions2);
    });
  });

  describe('formatPaymentModeOptions():', () => {
    it('should return the payment mode options when payment mode is personal cash', () => {
      // @ts-ignore
      expect(mergeExpensesService.formatPaymentModeOptions({ value: AccountType.PERSONAL })).toEqual(
        paymentModeOptions1
      );
    });

    it('should return the payment mode options when payment mode is advance', () => {
      // @ts-ignore
      expect(mergeExpensesService.formatPaymentModeOptions({ value: AccountType.ADVANCE })).toEqual(
        paymentModeOptions2
      );
    });

    it('should return the payment mode options when payment mode is corporate card', () => {
      // @ts-ignore
      expect(mergeExpensesService.formatPaymentModeOptions({ value: AccountType.CCC })).toEqual(paymentModeOptions3);
    });
  });

  it('checkOptionsAreSame(): should return true if options are same', () => {
    // @ts-ignore
    expect(mergeExpensesService.checkOptionsAreSame(sameOptions)).toBeTrue();
  });

  it('formatOptions(): should return the formatted options', () => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'checkOptionsAreSame').and.returnValue(true);

    // @ts-ignore
    expect(mergeExpensesService.formatOptions(sameOptions)).toEqual({ options: sameOptions, areSameValues: true });
    // @ts-ignore
    expect(mergeExpensesService.checkOptionsAreSame).toHaveBeenCalledWith([sameOptions[0].value, sameOptions[1].value]);
  });

  it('generateBillableOptions(): should return the billable options', () => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatBillableOptions').and.returnValue(optionsData2.options[0]);
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData2);

    mergeExpensesService.generateBillableOptions(apiExpenseRes).subscribe((res) => {
      expect(res).toEqual(optionsData2);
      // @ts-ignore
      expect(mergeExpensesService.formatBillableOptions).toHaveBeenCalledWith({ label: 'false', value: false });
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledOnceWith([
        { label: 'false', ...optionsData2.options[0] },
      ]);
    });
  });
});
