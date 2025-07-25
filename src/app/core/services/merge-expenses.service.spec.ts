import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { projectDependentFields, costCenterDependentFields } from '../mock-data/dependent-field.data';
import {
  advanceExpensesList,
  apiExpenseRes,
  expenseData2,
  expensesDataWithCC,
  mergeExpenseData1,
} from '../mock-data/expense.data';
import {
  expenseInfoWithoutDefaultExpense,
  expensesInfo,
  expensesInfoData1,
  expensesInfoWithMultipleAdvanceExpenses,
  expensesInfoWithReportedExpense,
  expensesInfoWithReportedExpenseAndNoAdvance,
} from '../mock-data/expenses-info.data';
import { expensesWithDependentFields, expensesWithSameProject } from '../mock-data/dependent-field-expenses.data';
import { mergeExpensesPayload } from '../mock-data/merge-expenses-payload.data';
import {
  dependentFieldsMappingForProject,
  dependentFieldsMappingForCostCenter,
  dependentFieldsMappingForNoDependentFields,
  dependentFieldsMappingForSameProject,
} from '../mock-data/dependent-field-mapping.data';
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
  categoryOptionsData,
  mergeExpensesOptionData1,
  mergeExpensesOptionData10,
  mergeExpensesOptionData2,
  mergeExpensesOptionData3,
  mergeExpensesOptionData4,
  mergeExpensesOptionData5,
  mergeExpensesOptionData6,
  mergeExpensesOptionData7,
  mergeExpensesOptionData8,
  mergeExpensesOptionData9,
  mergeExpensesOptionsData,
  paymentModeOptions1,
  paymentModeOptions2,
  paymentModeOptions3,
  projectOptionsData,
  sameOptions,
} from '../mock-data/merge-expenses-option.data';
import { AccountType } from '../enums/account-type.enum';
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
  optionsData22,
  optionsData23,
  optionsData24,
  optionsData25,
  optionsData26,
  optionsData27,
  optionsData28,
  optionsData29,
  optionsData3,
  optionsData30,
  optionsData4,
  optionsData5,
  optionsData6,
  optionsData7,
  optionsData8,
  optionsData9,
} from '../mock-data/merge-expenses-options-data.data';
import { fileObject11 } from '../mock-data/file-object.data';
import * as lodash from 'lodash';
import { projectsV1Data } from '../test-data/projects.spec.data';
import { ccTransactionResponseData } from '../mock-data/corporate-card-transaction-response.data';
import { customInputData } from '../test-data/custom-inputs.spec.data';
import dayjs from 'dayjs';
import { expectedOrgCategoryByName2, orgCategoryData1 } from '../mock-data/org-category.data';
import { taxGroupData } from '../mock-data/tax-group.data';
import { cloneDeep } from 'lodash';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { SpenderFileService } from './platform/v1/spender/file.service';
import {
  expenseData,
  platformExpenseData,
  platformExpenseWithExtractedData,
} from '../mock-data/platform/v1/expense.data';
import { generateUrlsBulkData1 } from '../mock-data/generate-urls-bulk-response.data';
import { TranslocoService } from '@jsverse/transloco';

describe('MergeExpensesService', () => {
  let mergeExpensesService: MergeExpensesService;
  let apiService: jasmine.SpyObj<ApiService>;
  let fileService: jasmine.SpyObj<FileService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;
  let humanizeCurrencyPipe: jasmine.SpyObj<HumanizeCurrencyPipe>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let dateService: jasmine.SpyObj<DateService>;
  let taxGroupService: jasmine.SpyObj<TaxGroupService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let spenderFileService: jasmine.SpyObj<SpenderFileService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', [
      'findByTransactionId',
      'downloadUrl',
      'getReceiptsDetails',
    ]);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCardTransactions',
    ]);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', ['getAll']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);
    const projectsServiceSpy = jasmine.createSpyObj('ProjectsService', ['getAllActive']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getAll', 'filterRequired']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['isValidDate']);
    const taxGroupServiceSpy = jasmine.createSpyObj('TaxGroupService', ['get']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseById']);
    const spenderFileServiceSpy = jasmine.createSpyObj('SpenderFileService', ['generateUrlsBulk']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.mergeExpenses.receiptFromExpense': 'Receipt From Expense',
        'services.mergeExpenses.unspecified': 'Unspecified',
        'services.mergeExpenses.yes': 'Yes',
        'services.mergeExpenses.no': 'No',
        'services.mergeExpenses.corporateCard': 'Corporate Card',
        'services.mergeExpenses.personalCardCash': 'Personal Card/Cash',
        'services.mergeExpenses.advance': 'Advance',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        MergeExpensesService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: CorporateCreditCardExpenseService, useValue: corporateCreditCardExpenseServiceSpy },
        { provide: CustomInputsService, useValue: customInputsServiceSpy },
        { provide: HumanizeCurrencyPipe, useValue: humanizeCurrencyPipeSpy },
        { provide: ProjectsService, useValue: projectsServiceSpy },
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: TaxGroupService, useValue: taxGroupServiceSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: SpenderFileService, useValue: spenderFileServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
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
    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    spenderFileService = TestBed.inject(SpenderFileService) as jasmine.SpyObj<SpenderFileService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(mergeExpensesService).toBeTruthy();
  });

  describe('getDependentFieldsMapping(): ', () => {
    it('should return the correct project dependent fields mapping when projects are different', () => {
      expect(
        mergeExpensesService.getDependentFieldsMapping(expensesWithDependentFields, projectDependentFields, 'PROJECT')
      ).toEqual(dependentFieldsMappingForProject);
    });

    it('should return the correct project dependent fields mapping when projects are same', () => {
      expect(
        mergeExpensesService.getDependentFieldsMapping(expensesWithSameProject, projectDependentFields, 'PROJECT')
      ).toEqual(dependentFieldsMappingForSameProject);
    });

    it('should return empty array when there are no dependent fields', () => {
      expect(mergeExpensesService.getDependentFieldsMapping(expensesWithSameProject, null, 'PROJECT')).toEqual(
        dependentFieldsMappingForNoDependentFields
      );
    });

    it('should retun the correct mapping for cost center', () => {
      expect(
        mergeExpensesService.getDependentFieldsMapping(
          expensesWithDependentFields,
          costCenterDependentFields,
          'COST_CENTER'
        )
      ).toEqual(dependentFieldsMappingForCostCenter);
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

    it('should set default expenses when advance expense is not present and all expenses are reported and above', () => {
      spyOn(mergeExpensesService, 'checkIfAdvanceExpensePresent').and.returnValue([]);
      expect(mergeExpensesService.setDefaultExpenseToKeep([apiExpenseRes[0], apiExpenseRes[0]])).toEqual(
        expensesInfoWithReportedExpenseAndNoAdvance
      );
      expect(mergeExpensesService.checkIfAdvanceExpensePresent).toHaveBeenCalledOnceWith([
        apiExpenseRes[0],
        apiExpenseRes[0],
      ]);
    });

    it('should set default expense to null when expense is not present', () => {
      spyOn(mergeExpensesService, 'checkIfAdvanceExpensePresent').and.returnValue(null);
      expect(mergeExpensesService.setDefaultExpenseToKeep([])).toEqual(expenseInfoWithoutDefaultExpense);
      expect(mergeExpensesService.checkIfAdvanceExpensePresent).toHaveBeenCalledOnceWith([]);
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

  it('generateBillableOptions(): should return the billable options', (done) => {
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
      done();
    });
  });

  it('getAttachements(): should return the attachments', (done) => {
    expensesService.getExpenseById.and.returnValue(of(platformExpenseWithExtractedData));
    spenderFileService.generateUrlsBulk.and.returnValue(of(generateUrlsBulkData1));
    fileService.getReceiptsDetails.and.returnValue({
      type: 'pdf',
      thumbnail: 'img/fy-pdf.svg',
    });

    const transactionId = 'txz2vohKxBXu';
    mergeExpensesService.getAttachements(transactionId).subscribe((res) => {
      expect(res).toEqual(fileObject11);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(transactionId);
      expect(spenderFileService.generateUrlsBulk).toHaveBeenCalledOnceWith(platformExpenseWithExtractedData.file_ids);
      expect(fileService.getReceiptsDetails).toHaveBeenCalledOnceWith(
        generateUrlsBulkData1[0].name,
        generateUrlsBulkData1[0].download_url
      );
      done();
    });
  });

  it('getAttachements(): should return empty array when there are no attachments', (done) => {
    expensesService.getExpenseById.and.returnValue(of(platformExpenseData));

    const transactionId = 'txz2vohKxBXu';
    mergeExpensesService.getAttachements(transactionId).subscribe((res) => {
      expect(res).toEqual([]);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(transactionId);
      expect(spenderFileService.generateUrlsBulk).not.toHaveBeenCalled();
      expect(fileService.getReceiptsDetails).not.toHaveBeenCalled();
      done();
    });
  });

  it('generateReceiptOptions(): should return the receipt options', (done) => {
    mergeExpensesService.generateReceiptOptions(apiExpenseRes).subscribe((res) => {
      expect(res).toEqual(mergeExpensesOptionsData);
      done();
    });
  });

  //Disabling this test case as it fails at times due to some weird issue in the method
  it('getCustomInputValues(): should return the custom input values', () => {
    const result = mergeExpensesService.getCustomInputValues(lodash.cloneDeep(apiExpenseRes));

    expect(result.length).toEqual(1);
  });

  describe('formatProjectOptions():', () => {
    it('should return the project options', (done) => {
      projectsService.getAllActive.and.returnValue(of(projectsV1Data));
      const mockProjectOptions = cloneDeep(projectOptionsData);
      // @ts-ignore
      mergeExpensesService.formatProjectOptions(mockProjectOptions).subscribe((res) => {
        expect(res).toEqual(mockProjectOptions);
        done();
      });
    });

    it('should return the project options with label as project name if id matches with option', (done) => {
      projectsService.getAllActive.and.returnValue(of(projectsV1Data));
      const mockProjectOptions = cloneDeep(projectOptionsData);
      // @ts-ignore
      mergeExpensesService.formatProjectOptions({ ...mockProjectOptions, value: 257528 }).subscribe((res) => {
        expect(res).toEqual({ label: 'Customer Mapped Project', value: 257528 });
        done();
      });
    });

    it('should return the project options when project is not present', (done) => {
      projectsService.getAllActive.and.returnValue(of([]));
      // @ts-ignore
      mergeExpensesService.formatProjectOptions({ label: null, value: null }).subscribe((res) => {
        expect(res).toEqual({ label: undefined, value: null });
        done();
      });
    });
  });

  it('removeUnspecified(): should remove unspecified from the options', () => {
    // @ts-ignore
    expect(mergeExpensesService.removeUnspecified(categoryOptionsData)).toEqual(categoryOptionsData);
  });

  describe('isMoreThanOneAdvancePresent():', () => {
    it('should return false if more than one advance is not present', () => {
      // @ts-ignore
      expect(
        mergeExpensesService.isMoreThanOneAdvancePresent(expensesInfoWithMultipleAdvanceExpenses, false)
      ).toBeFalse();
    });

    it('should return true if more than one advance is present', () => {
      // @ts-ignore
      expect(mergeExpensesService.isMoreThanOneAdvancePresent(expensesInfoData1, true)).toBeTrue();
    });

    it('should return false if default expenses are not present', () => {
      // @ts-ignore
      expect(mergeExpensesService.isMoreThanOneAdvancePresent(expenseInfoWithoutDefaultExpense, false)).toBeFalse();
    });
  });

  describe('getCorporateCardTransactions(): ', () => {
    it('should return the corporate card transactions', (done) => {
      const expenseWithId = [
        {
          tx_corporate_credit_card_expense_group_id: 'btxnBdS2Kpvzhy',
        },
      ];

      const config = {
        queryParams: {
          id: 'in.(btxnBdS2Kpvzhy)',
        },
        offset: 0,
        limit: 1,
      };

      customInputsService.getAll.withArgs(true).and.returnValue(of(customInputData));
      corporateCreditCardExpenseService.getCorporateCardTransactions
        .withArgs(config)
        .and.returnValue(of(ccTransactionResponseData));

      mergeExpensesService.getCorporateCardTransactions(expenseWithId).subscribe((res) => {
        expect(res).toEqual(ccTransactionResponseData.data);
        expect(corporateCreditCardExpenseService.getCorporateCardTransactions).toHaveBeenCalledOnceWith(config);
        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
        done();
      });
    });

    it('should return empty array when expense has null id', (done) => {
      const expensesWithNullIds = [
        {
          tx_corporate_credit_card_expense_group_id: null,
        },
      ];

      customInputsService.getAll.withArgs(true).and.returnValue(of(customInputData));

      mergeExpensesService.getCorporateCardTransactions(expensesWithNullIds).subscribe((res) => {
        expect(res).toEqual([]);
        expect(corporateCreditCardExpenseService.getCorporateCardTransactions).not.toHaveBeenCalled();
        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
        done();
      });
    });

    it('should return empty list if there are no expenses', (done) => {
      customInputsService.getAll.withArgs(true).and.returnValue(of(customInputData));

      mergeExpensesService.getCorporateCardTransactions([]).subscribe((res) => {
        expect(res).toEqual([]);
        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
        done();
      });
    });
  });

  describe('generateExpenseToKeepOptions(): ', () => {
    it('should return the merge expenses options of the expense to be kept with date', (done) => {
      humanizeCurrencyPipe.transform.and.returnValue('₹1.00');
      mergeExpensesService.generateExpenseToKeepOptions(expensesDataWithCC).subscribe((res) => {
        expect(res).toEqual(mergeExpensesOptionData1);
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledWith(1, 'INR');
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should return the merge expenses options of the expense to be kept without date', (done) => {
      humanizeCurrencyPipe.transform.and.returnValue('₹1.00');
      const expenses = [
        {
          ...expensesDataWithCC[0],
          tx_txn_dt: null,
        },
        {
          ...expensesDataWithCC[1],
          tx_txn_dt: null,
        },
      ];
      mergeExpensesService.generateExpenseToKeepOptions(expenses).subscribe((res) => {
        expect(res).toEqual(mergeExpensesOptionData2);
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledWith(1, 'INR');
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  describe('generateAmountOptions():', () => {
    it('should return the amount options', (done) => {
      mergeExpensesService.generateAmountOptions(expensesDataWithCC).subscribe((res) => {
        expect(res).toEqual(optionsData3);
        done();
      });
    });

    it('should return the amount options with foreign currency', (done) => {
      const expenses = [
        {
          ...expensesDataWithCC[0],
          tx_orig_currency: 'USD',
          tx_orig_amount: 1,
        },
        {
          ...expensesDataWithCC[1],
          tx_orig_currency: 'USD',
          tx_orig_amount: 1,
        },
      ];
      mergeExpensesService.generateAmountOptions(expenses).subscribe((res) => {
        expect(res).toEqual(optionsData4);
        done();
      });
    });

    it('should return default options when amount is is not present', (done) => {
      const expenses = [
        {
          ...expensesDataWithCC[0],
          tx_orig_currency: 'USD',
          tx_orig_amount: 0,
          tx_amount: null,
        },
        {
          ...expensesDataWithCC[1],
          tx_orig_currency: 'USD',
          tx_orig_amount: 0,
          tx_amount: null,
        },
      ];
      mergeExpensesService.generateAmountOptions(expenses).subscribe((res) => {
        expect(res).toEqual(optionsData5);
        done();
      });
    });
  });

  it('generateDateOfSpendOptions(): should return the date of spend options', (done) => {
    mergeExpensesService.generateDateOfSpendOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData6);
      done();
    });
  });

  it('generatePaymentModeOptions(): should return the payment mode options', (done) => {
    mergeExpensesService.generatePaymentModeOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData7);
      done();
    });
  });

  it('generateVendorOptions(): should return the vendor options', (done) => {
    mergeExpensesService.generateVendorOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData8);
      done();
    });
  });

  it('generateProjectOptions(): should return the project options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatProjectOptions').and.returnValue(of(mergeExpensesOptionData3));
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData9);

    mergeExpensesService.generateProjectOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData9);
      // @ts-ignore
      expect(mergeExpensesService.formatProjectOptions).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('generateCategoryOptions(): should return the category options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatCategoryOption').and.returnValue(of(mergeExpensesOptionData4));
    // @ts-ignore
    spyOn(mergeExpensesService, 'checkOptionsAreSame').and.returnValue(false);
    // @ts-ignore
    spyOn(mergeExpensesService, 'removeUnspecified').and.returnValue(mergeExpensesOptionData4);

    mergeExpensesService.generateCategoryOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData10);
      // @ts-ignore
      expect(mergeExpensesService.formatCategoryOption).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('generateTaxGroupOptions(): should return the tax group options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatTaxGroupOption').and.returnValue(of(mergeExpensesOptionData5));
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData11);

    mergeExpensesService.generateTaxGroupOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData11);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('generateTaxAmountOptions(): should return the tax amount options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData12);
    mergeExpensesService.generateTaxAmountOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData12);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('generateCostCenterOptions(): should return the cost center options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData13);

    mergeExpensesService.generateCostCenterOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData13);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('generatePurposeOptions(): should return the purpose options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData14);

    mergeExpensesService.generatePurposeOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData14);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getFieldValue():', () => {
    it('should return the field value when options are passed', () => {
      expect(mergeExpensesService.getFieldValue(optionsData12)).toEqual(0.01);
    });

    it('should return null when options are not passed', () => {
      expect(mergeExpensesService.getFieldValue(optionsData13)).toBeNull();
    });

    it('should return null when optionsData is null', () => {
      expect(mergeExpensesService.getFieldValue(null)).toBeNull();
    });

    it('should return undefined if option is empty array', () => {
      expect(
        mergeExpensesService.getFieldValue({ ...optionsData13, areSameValues: true, options: [] })
      ).toBeUndefined();
    });
  });

  it('generateLocationOptions(): should return the location options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'checkOptionsAreSame').and.returnValue(false);
    mergeExpensesService.generateLocationOptions(expensesDataWithCC, 0).subscribe((res) => {
      expect(res).toEqual(optionsData15);
      // @ts-ignore
      expect(mergeExpensesService.checkOptionsAreSame).toHaveBeenCalledOnceWith([optionsData15.options[0].label]);
      done();
    });
  });

  it('generateOnwardDateOptions(): should return the onward date options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'checkOptionsAreSame').and.returnValue(false);
    mergeExpensesService.generateOnwardDateOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData16);
      // @ts-ignore
      expect(mergeExpensesService.checkOptionsAreSame).toHaveBeenCalledOnceWith([
        dayjs(optionsData16.options[0].value).format('YYYY-MM-DD'),
        dayjs(optionsData16.options[1].value).format('YYYY-MM-DD'),
      ]);
      done();
    });
  });

  it('generateReturnDateOptions(): should return the return date options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'checkOptionsAreSame').and.returnValue(false);
    mergeExpensesService.generateReturnDateOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData16);
      // @ts-ignore
      expect(mergeExpensesService.checkOptionsAreSame).toHaveBeenCalledOnceWith([
        dayjs(optionsData16.options[0].value).format('YYYY-MM-DD'),
        dayjs(optionsData16.options[1].value).format('YYYY-MM-DD'),
      ]);
      done();
    });
  });

  it('generateFlightJourneyTravelClassOptions(): should return the flight journey travel class options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData17);

    mergeExpensesService.generateFlightJourneyTravelClassOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData17);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData6);
      done();
    });
  });

  it('generateFlightReturnTravelClassOptions(): should return the flight journey travel class options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData17);

    mergeExpensesService.generateFlightReturnTravelClassOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData17);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData6);
      done();
    });
  });

  it('generateTrainTravelClassOptions(): should return the train journey travel class options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData18);

    mergeExpensesService.generateTrainTravelClassOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData18);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData7);
      done();
    });
  });

  it('generateBusTravelClassOptions(): should return the bus journey travel class options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData19);

    mergeExpensesService.generateBusTravelClassOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData19);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData8);
      done();
    });
  });

  it('generateDistanceOptions(): should return the distance options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData20);

    mergeExpensesService.generateDistanceOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData20);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData9);
      done();
    });
  });

  it('generateDistanceUnitOptions(): should return the distance unit options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData21);

    mergeExpensesService.generateDistanceUnitOptions(expensesDataWithCC).subscribe((res) => {
      expect(res).toEqual(optionsData21);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData10);
      done();
    });
  });

  describe('getCategoryName():', () => {
    it('should return the category name', () => {
      categoriesService.getAll.and.returnValue(of(orgCategoryData1));
      const categoryId = '201952';
      mergeExpensesService.getCategoryName(categoryId).subscribe((res) => {
        expect(res).toEqual('Food');
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
      });
    });

    it('should return undefined if category id does not match with params', () => {
      categoriesService.getAll.and.returnValue(of(orgCategoryData1));
      const categoryId = '201951';
      mergeExpensesService.getCategoryName(categoryId).subscribe((res) => {
        expect(res).toBeUndefined();
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
      });
    });

    it('should return undefined if category id is undefined', () => {
      categoriesService.getAll.and.returnValue(of([expectedOrgCategoryByName2]));
      const categoryId = '201951';
      mergeExpensesService.getCategoryName(categoryId).subscribe((res) => {
        expect(res).toBeUndefined();
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Skipping this test case as it fails at times due to some weird issue in the method
  xit('formatCategoryOption(): should return the formatted category option', (done) => {
    categoriesService.getAll.and.returnValue(of(orgCategoryData1));
    categoriesService.filterRequired.and.returnValue(orgCategoryData1);
    // @ts-ignore
    mergeExpensesService.formatCategoryOption(mergeExpensesOptionData4[0]).subscribe((res) => {
      expect(res).toEqual(mergeExpensesOptionData4[0]);
      expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
      expect(categoriesService.filterRequired).toHaveBeenCalledOnceWith(orgCategoryData1);
      done();
    });
  });

  describe('getFieldValueOnChange():', () => {
    it('should return the field value on change when value is untouched', () => {
      const res = mergeExpensesService.getFieldValueOnChange(
        mergeExpensesOptionData4[0],
        null,
        mergeExpensesOptionData4[0].value,
        mergeExpensesOptionData4[0].value
      );
      expect(res).toEqual(mergeExpensesOptionData4[0].value);
    });

    it('should return the field value on change when value is untouched and optionsData is undefined', () => {
      const res = mergeExpensesService.getFieldValueOnChange(
        undefined,
        null,
        mergeExpensesOptionData4[0].value,
        mergeExpensesOptionData4[0].value
      );
      expect(res).toEqual(mergeExpensesOptionData4[0].value);
    });

    it('should return the field value on change when value is touched', () => {
      const res = mergeExpensesService.getFieldValueOnChange(
        mergeExpensesOptionData4[0],
        true,
        null,
        mergeExpensesOptionData4[1].value
      );
      expect(res).toEqual(mergeExpensesOptionData4[1].value);
    });
  });

  describe('formatTaxGroupOption():', () => {
    it('formatTaxGroupOption(): should return the formatted tax group option', (done) => {
      taxGroupService.get.and.returnValue(of(taxGroupData));
      const mockOptions = cloneDeep(optionsData11.options[0]);
      // @ts-ignore
      mergeExpensesService.formatTaxGroupOption(mockOptions).subscribe((res) => {
        expect(res).toEqual(mergeExpensesOptionData5[0]);
        expect(taxGroupService.get).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('formatTaxGroupOption(): should return the formatted tax group option with label as undefined if id does not matches with options', (done) => {
      taxGroupService.get.and.returnValue(of(taxGroupData));
      const mockOptions = { ...optionsData11.options[0], value: 'tgp6JA6tgoZ1' };
      // @ts-ignore
      mergeExpensesService.formatTaxGroupOption(mockOptions).subscribe((res) => {
        expect(res).toEqual({
          label: undefined,
          value: 'tgp6JA6tgoZ1',
        });
        expect(taxGroupService.get).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('formatCustomInputOptionsByType():', () => {
    it('should return the formatted custom input options by type with valid date', () => {
      dateService.isValidDate.and.returnValues(false, true);
      spyOn(mergeExpensesService, 'setFormattedDate').and.returnValue('Mar 10, 2021');
      const mockOptions = cloneDeep(optionsData22);
      // @ts-ignore
      const res = mergeExpensesService.formatCustomInputOptionsByType(mockOptions);
      expect(res).toEqual(optionsData23);
      expect(dateService.isValidDate).toHaveBeenCalledWith(mockOptions[1].value as Date);
    });

    it('should return the formatted custom input options by type without date', () => {
      dateService.isValidDate.and.returnValues(false, false);
      const mockOptions = cloneDeep(optionsData24);
      // @ts-ignore
      const res = mergeExpensesService.formatCustomInputOptionsByType(mockOptions);
      expect(res).toEqual(optionsData25);
    });

    it('should return the formatted custom input options by type with repeated string options', () => {
      dateService.isValidDate.and.returnValues(false, false);
      const mockOptions = cloneDeep(optionsData27);
      // @ts-ignore
      const res = mergeExpensesService.formatCustomInputOptionsByType(mockOptions);
      expect(res).toEqual(optionsData28);
    });

    it('should return the formatted custom input options by type with repeated number options', () => {
      dateService.isValidDate.and.returnValues(false, false);
      const mockOptions = cloneDeep(optionsData29);
      // @ts-ignore
      const res = mergeExpensesService.formatCustomInputOptionsByType(mockOptions);
      expect(res).toEqual(optionsData30);
    });

    it('should return the formatted custom input options by type with repeated select options', () => {
      dateService.isValidDate.and.returnValues(false, false);
      const mockOptions = cloneDeep(optionsData22);
      // @ts-ignore
      const res = mergeExpensesService.formatCustomInputOptionsByType([mockOptions[0], mockOptions[0]]);
      expect(res).toEqual([mockOptions[0]]);
    });
  });

  describe('formatCustomInputOptions():', () => {
    it('should return the formatted custom input options', () => {
      const mockOptions = cloneDeep(optionsData22);
      // @ts-ignore
      spyOn(mergeExpensesService, 'formatCustomInputOptionsByType').and.returnValue([mockOptions[0]]);
      // @ts-ignore
      const res = mergeExpensesService.formatCustomInputOptions(mockOptions);
      const expectedRes = {
        // eslint-disable-next-line quote-props
        userlist: mockOptions[0],
      };
      expect(res).toEqual(expectedRes);
      // @ts-ignore
      expect(mergeExpensesService.formatCustomInputOptionsByType).toHaveBeenCalledWith(mockOptions);
    });

    it('should return the formatted custom input options without options', () => {
      const mockOptions = cloneDeep(optionsData26);
      // @ts-ignore
      spyOn(mergeExpensesService, 'formatCustomInputOptionsByType').and.returnValue([mockOptions[0]]);
      // @ts-ignore
      const res = mergeExpensesService.formatCustomInputOptions(mockOptions);
      const expectedRes = {
        // eslint-disable-next-line quote-props
        numberfield: {
          options: [],
          ...mockOptions[0],
        },
      };
      expect(res).toEqual(expectedRes);
      // @ts-ignore
      expect(mergeExpensesService.formatCustomInputOptionsByType).toHaveBeenCalledWith(mockOptions);
    });
  });

  it('setformattedDate(): should return formatted date', () => {
    const mockDate = '2021-03-10T05:31:00.000Z';
    expect(mergeExpensesService.setFormattedDate(mockDate)).toEqual(dayjs(mockDate).format('MMM DD, YYYY'));
  });

  describe('formatCategoryOption():', () => {
    beforeEach(() => {
      categoriesService.getAll.and.returnValue(of(orgCategoryData1));
      categoriesService.filterRequired.and.returnValue(orgCategoryData1);
    });

    it('should return the formatted category option', (done) => {
      const mockOptions = cloneDeep(mergeExpensesOptionData4[0]);
      // @ts-ignore
      mergeExpensesService.formatCategoryOption(mockOptions).subscribe((res) => {
        expect(res).toEqual(mockOptions);
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
        expect(categoriesService.filterRequired).toHaveBeenCalledOnceWith(orgCategoryData1);
        done();
      });
    });

    it('should return the formatted category option with label as Unspecified if id does not matches with options', (done) => {
      const mockOptions = cloneDeep({ ...mergeExpensesOptionData4[0], value: 201951 });
      // @ts-ignore
      mergeExpensesService.formatCategoryOption(mockOptions).subscribe((res) => {
        expect(res).toEqual({
          label: 'Unspecified',
          value: 201951,
        });
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
        expect(categoriesService.filterRequired).toHaveBeenCalledOnceWith(orgCategoryData1);
        done();
      });
    });
  });
});
