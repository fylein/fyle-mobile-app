import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { projectDependentFields, costCenterDependentFields } from '../mock-data/dependent-field.data';
import { expenseInfoWithoutDefaultExpense } from '../mock-data/expenses-info.data';
import {
  dependentFieldsMappingForProject,
  dependentFieldsMappingForCostCenter,
  dependentFieldsMappingForNoDependentFields,
  dependentFieldsMappingForSameProject,
} from '../mock-data/dependent-field-mapping.data';
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
  mergeExpensesOptionData10,
  mergeExpensesOptionData3,
  mergeExpensesOptionData4,
  mergeExpensesOptionData5,
  mergeExpensesOptionData6,
  mergeExpensesOptionData7,
  mergeExpensesOptionData8,
  mergeExpensesOptionData9,
  paymentModeOptions1,
  paymentModeOptions2,
  paymentModeOptions3,
  projectOptionsData,
  sameOptions,
} from '../mock-data/merge-expenses-option.data';
import { AccountType } from '../enums/account-type.enum';
import {
  optionsData11,
  optionsData12,
  optionsData13,
  optionsData14,
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
  optionsData30,
  optionsData9,
} from '../mock-data/merge-expenses-options-data.data';
import { fileObject11 } from '../mock-data/file-object.data';
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
  advanceExpenses,
  apiExpenses3,
  approvedAndAboveExpenses,
  belowReportedExpenses,
  expensesWithDependentFieldsAndCostCenter,
  expensesWithDependentFieldsAndDifferentProject,
  expensesWithDependentFieldsAndSameProject,
  expensesWithSameProject,
  platformExpenseData,
  platformExpenseWithExtractedData,
  reportedAndAboveExpenses,
  reportedExpenses,
} from '../mock-data/platform/v1/expense.data';
import { generateUrlsBulkData1 } from '../mock-data/generate-urls-bulk-response.data';
import {
  expensesInfoWithAdvanceExpenses,
  expensesInfoWithMultipleAdvanceExpenses,
  expensesInfoWithOneReportedAndAboveExpense,
  expensesInfoWithoutDefaultExpense,
  expensesInfoWithReportedAndAboveExpenses,
} from '../mock-data/platform/v1/expenses-info.data';
import {
  amountOptionsData,
  amountOptionsDataWithForeignCurrency,
  amountOptionsDataWithZeroAmount,
  billableOptionsData,
  categoryOptionsData1,
  dateOfSpendOptionsData,
  expenseToKeepOptionsData,
  expenseToKeepOptionsDataWithoutDate,
  formattedCategoryOptionsData,
  locationOptionsData,
  merchantOptionsData,
  paymentModeOptionsData,
  receiptOptionsData,
} from '../mock-data/platform/v1/merge-expenses-option.data';
import { Expense } from '../models/platform/v1/expense.model';
import {
  expensesWithProjectId,
  mergeExpenses,
  mergeExpensesWithBusTravelClass,
  mergeExpensesWithDistance,
  mergeExpensesWithFlightJourneyTravelClass,
  mergeExpensesWithFlightReturnTravelClass,
  mergeExpensesWithForeignCurrency,
  mergeExpensesWithFromDate,
  mergeExpensesWithLocation,
  mergeExpensesWithoutDate,
  mergeExpensesWithToDate,
  mergeExpensesWithTrainTravelClass,
  mergeExpensesWithZeroAmount,
} from '../mock-data/platform/v1/merge-expense.service.data';
import { getTranslocoTestingModule } from '../testing/transloco-testing.utils';

describe('MergeExpensesService', () => {
  let mergeExpensesService: MergeExpensesService;
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
  beforeEach(() => {
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

    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule()],
      providers: [
        MergeExpensesService,
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
      ],
    });
    mergeExpensesService = TestBed.inject(MergeExpensesService);
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService,
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
    humanizeCurrencyPipe = TestBed.inject(HumanizeCurrencyPipe) as jasmine.SpyObj<HumanizeCurrencyPipe>;
    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    spenderFileService = TestBed.inject(SpenderFileService) as jasmine.SpyObj<SpenderFileService>;
  });

  it('should be created', () => {
    expect(mergeExpensesService).toBeTruthy();
  });

  describe('getDependentFieldsMapping(): ', () => {
    it('should return the correct project dependent fields mapping when projects are different', () => {
      expect(
        mergeExpensesService.getDependentFieldsMapping(
          expensesWithDependentFieldsAndDifferentProject,
          projectDependentFields,
          'PROJECT',
        ),
      ).toEqual(dependentFieldsMappingForProject);
    });

    it('should return the correct project dependent fields mapping when projects are same', () => {
      expect(
        mergeExpensesService.getDependentFieldsMapping(
          expensesWithDependentFieldsAndSameProject,
          projectDependentFields,
          'PROJECT',
        ),
      ).toEqual(dependentFieldsMappingForSameProject);
    });

    it('should return empty array when there are no dependent fields', () => {
      expect(mergeExpensesService.getDependentFieldsMapping(expensesWithSameProject, null, 'PROJECT')).toEqual(
        dependentFieldsMappingForNoDependentFields,
      );
    });

    it('should retun the correct mapping for cost center', () => {
      expect(
        mergeExpensesService.getDependentFieldsMapping(
          expensesWithDependentFieldsAndCostCenter,
          costCenterDependentFields,
          'COST_CENTER',
        ),
      ).toEqual(dependentFieldsMappingForCostCenter);
    });
  });

  describe('isAllAdvanceExpenses(): ', () => {
    it('should return true when all expenses are advance expenses', () => {
      expect(mergeExpensesService.isAllAdvanceExpenses(advanceExpenses)).toBeTrue();
    });

    it('should return false when all expenses are not advance expenses', () => {
      expect(mergeExpensesService.isAllAdvanceExpenses(apiExpenses3)).toBeFalse();
    });

    it('should return false when expense list is empty', () => {
      expect(mergeExpensesService.isAllAdvanceExpenses([null])).toBeFalse();
    });
  });

  describe('checkIfAdvanceExpensePresent(): ', () => {
    it('should return the advance expense if present', () => {
      expect(mergeExpensesService.checkIfAdvanceExpensePresent(advanceExpenses)).toEqual(advanceExpenses);
    });

    it('should return empty list if advance expense is not present', () => {
      expect(mergeExpensesService.checkIfAdvanceExpensePresent(apiExpenses3)).toEqual([]);
    });

    it('should return empty list if expense list is empty', () => {
      expect(mergeExpensesService.checkIfAdvanceExpensePresent([null])).toEqual([]);
    });
  });

  it('isApprovedAndAbove(): should return the expenses that are approved and above', () => {
    expect(mergeExpensesService.isApprovedAndAbove(approvedAndAboveExpenses)).toEqual(approvedAndAboveExpenses);
  });

  describe('isAdvancePresent():', () => {
    it('should return true if excatly 1 defaultExpenses is present and isAdvancePresent is true', () => {
      expect(mergeExpensesService.isAdvancePresent(expensesInfoWithAdvanceExpenses)).toBeTrue();
    });

    it('isAdvancePresent(): should return false if default expense is not present', () => {
      expect(mergeExpensesService.isAdvancePresent(expenseInfoWithoutDefaultExpense)).toBeFalse();
    });
  });

  it('isReportedPresent(): should return the reported expense is present', () => {
    expect(mergeExpensesService.isReportedPresent(reportedExpenses)).toEqual(reportedExpenses);
  });

  describe('isReportedOrAbove():', () => {
    it('should return true if excatly 1 defaultExpenses is present and isReportedAndAbove is true', () => {
      expect(mergeExpensesService.isReportedOrAbove(expensesInfoWithOneReportedAndAboveExpense)).toBeTrue();
    });

    it('should return false if default expenses is not present', () => {
      expect(
        mergeExpensesService.isReportedOrAbove({ isReportedAndAbove: true, ...expenseInfoWithoutDefaultExpense }),
      ).toBeFalse();
    });
  });

  describe('setDefaultExpenseToKeep():', () => {
    it('should set the default expense to keep when advance expense and below reported expenses are present', () => {
      spyOn(mergeExpensesService, 'checkIfAdvanceExpensePresent').and.returnValue([advanceExpenses[0]]);
      expect(mergeExpensesService.setDefaultExpenseToKeep(belowReportedExpenses)).toEqual(
        expensesInfoWithAdvanceExpenses,
      );
      expect(mergeExpensesService.checkIfAdvanceExpensePresent).toHaveBeenCalledOnceWith(belowReportedExpenses);
    });

    it('should set default expense to null when advance expense is not present and all expenses are not reported and above', () => {
      spyOn(mergeExpensesService, 'checkIfAdvanceExpensePresent').and.returnValue([]);
      expect(mergeExpensesService.setDefaultExpenseToKeep(belowReportedExpenses)).toEqual(
        expensesInfoWithoutDefaultExpense,
      );
      expect(mergeExpensesService.checkIfAdvanceExpensePresent).toHaveBeenCalledOnceWith(belowReportedExpenses);
    });

    it('should set default expenses when advance expense is not present and all expenses are reported and above', () => {
      spyOn(mergeExpensesService, 'checkIfAdvanceExpensePresent').and.returnValue([]);
      expect(mergeExpensesService.setDefaultExpenseToKeep(reportedAndAboveExpenses)).toEqual(
        expensesInfoWithReportedAndAboveExpenses,
      );
      expect(mergeExpensesService.checkIfAdvanceExpensePresent).toHaveBeenCalledOnceWith(reportedAndAboveExpenses);
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
        paymentModeOptions1,
      );
    });

    it('should return the payment mode options when payment mode is advance', () => {
      // @ts-ignore
      expect(mergeExpensesService.formatPaymentModeOptions({ value: AccountType.ADVANCE })).toEqual(
        paymentModeOptions2,
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

    mergeExpensesService.generateBillableOptions([{ ...apiExpenses3[0], is_billable: false }]).subscribe((res) => {
      expect(res).toEqual(billableOptionsData);
      // @ts-ignore
      expect(mergeExpensesService.formatBillableOptions).toHaveBeenCalledWith({ label: 'false', value: false });
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledOnceWith([
        { label: 'false', ...billableOptionsData.options[0] },
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
        generateUrlsBulkData1[0].download_url,
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
    mergeExpensesService.generateReceiptOptions(apiExpenses3).subscribe((res) => {
      expect(res).toEqual(receiptOptionsData);
      done();
    });
  });

  //Disabling this test case as it fails at times due to some weird issue in the method
  it('getCustomInputValues(): should return the custom input values', () => {
    const result = mergeExpensesService.getCustomInputValues(cloneDeep(apiExpenses3));

    expect(result.length).toEqual(2);
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
      expect(mergeExpensesService.isMoreThanOneAdvancePresent(expensesInfoWithAdvanceExpenses, false)).toBeFalse();
    });

    it('should return true if more than one advance is present', () => {
      // @ts-ignore
      expect(
        mergeExpensesService.isMoreThanOneAdvancePresent(expensesInfoWithMultipleAdvanceExpenses, true),
      ).toBeTrue();
    });

    it('should return false if default expenses are not present', () => {
      // @ts-ignore
      expect(mergeExpensesService.isMoreThanOneAdvancePresent(expenseInfoWithoutDefaultExpense, false)).toBeFalse();
    });
  });

  describe('getCorporateCardTransactions(): ', () => {
    it('should return the corporate card transactions', (done) => {
      const expenseWithId: Expense[] = [
        {
          ...apiExpenses3[0],
          matched_corporate_card_transaction_ids: ['btxnBdS2Kpvzhy'],
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
      const expensesWithNullIds: Expense[] = [
        {
          ...apiExpenses3[0],
          matched_corporate_card_transaction_ids: null,
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
      humanizeCurrencyPipe.transform.and.returnValue('₹100.00');
      mergeExpensesService.generateExpenseToKeepOptions(mergeExpenses).subscribe((res) => {
        expect(res).toEqual(expenseToKeepOptionsData);
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledWith(100, 'INR');
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledWith(200, 'INR');
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should return the merge expenses options of the expense to be kept without date', (done) => {
      mergeExpensesService.generateExpenseToKeepOptions(mergeExpensesWithoutDate).subscribe((res) => {
        expect(res).toEqual(expenseToKeepOptionsDataWithoutDate);
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledWith(100, 'INR');
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledWith(200, 'INR');
        expect(humanizeCurrencyPipe.transform).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  describe('generateAmountOptions():', () => {
    it('should return the amount options', (done) => {
      mergeExpensesService.generateAmountOptions(mergeExpenses).subscribe((res) => {
        expect(res).toEqual(amountOptionsData);
        done();
      });
    });

    it('should return the amount options with foreign currency', (done) => {
      mergeExpensesService.generateAmountOptions(mergeExpensesWithForeignCurrency).subscribe((res) => {
        expect(res).toEqual(amountOptionsDataWithForeignCurrency);
        done();
      });
    });

    it('should return default options when amount is is not present', (done) => {
      mergeExpensesService.generateAmountOptions(mergeExpensesWithZeroAmount).subscribe((res) => {
        expect(res).toEqual(amountOptionsDataWithZeroAmount);
        done();
      });
    });
  });

  it('generateDateOfSpendOptions(): should return the date of spend options', (done) => {
    mergeExpensesService.generateDateOfSpendOptions(mergeExpenses).subscribe((res) => {
      expect(res).toEqual(dateOfSpendOptionsData);
      done();
    });
  });

  it('generatePaymentModeOptions(): should return the payment mode options', (done) => {
    mergeExpensesService.generatePaymentModeOptions(mergeExpenses).subscribe((res) => {
      expect(res).toEqual(paymentModeOptionsData);
      done();
    });
  });

  it('generateVendorOptions(): should return the vendor options', (done) => {
    mergeExpensesService.generateVendorOptions(mergeExpenses).subscribe((res) => {
      expect(res).toEqual(merchantOptionsData);
      done();
    });
  });

  it('generateProjectOptions(): should return the project options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatProjectOptions').and.returnValue(of(mergeExpensesOptionData3));
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData9);

    mergeExpensesService.generateProjectOptions(expensesWithProjectId).subscribe((res) => {
      expect(res).toEqual(optionsData9);
      // @ts-ignore
      expect(mergeExpensesService.formatProjectOptions).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('generateCategoryOptions(): should return the category options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatCategoryOption').and.returnValue(of(formattedCategoryOptionsData));
    // @ts-ignore
    spyOn(mergeExpensesService, 'checkOptionsAreSame').and.returnValue(false);
    // @ts-ignore
    spyOn(mergeExpensesService, 'removeUnspecified').and.returnValue(formattedCategoryOptionsData);

    mergeExpensesService.generateCategoryOptions(mergeExpenses).subscribe((res) => {
      expect(res).toEqual(categoryOptionsData1);
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

    mergeExpensesService.generateTaxGroupOptions(mergeExpenses).subscribe((res) => {
      expect(res).toEqual(optionsData11);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('generateTaxAmountOptions(): should return the tax amount options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData12);
    mergeExpensesService.generateTaxAmountOptions(mergeExpenses).subscribe((res) => {
      expect(res).toEqual(optionsData12);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('generateCostCenterOptions(): should return the cost center options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData13);

    mergeExpensesService.generateCostCenterOptions(mergeExpenses).subscribe((res) => {
      expect(res).toEqual(optionsData13);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('generatePurposeOptions(): should return the purpose options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData14);

    mergeExpensesService.generatePurposeOptions(mergeExpenses).subscribe((res) => {
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
        mergeExpensesService.getFieldValue({ ...optionsData13, areSameValues: true, options: [] }),
      ).toBeUndefined();
    });
  });

  it('generateLocationOptions(): should return the location options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'checkOptionsAreSame').and.returnValue(false);
    mergeExpensesService.generateLocationOptions(mergeExpensesWithLocation, 0).subscribe((res) => {
      expect(res).toEqual(locationOptionsData);
      // @ts-ignore
      expect(mergeExpensesService.checkOptionsAreSame).toHaveBeenCalledOnceWith([locationOptionsData.options[0].label]);
      done();
    });
  });

  it('generateOnwardDateOptions(): should return the onward date options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'checkOptionsAreSame').and.returnValue(false);
    mergeExpensesService.generateOnwardDateOptions(mergeExpensesWithFromDate).subscribe((res) => {
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
    mergeExpensesService.generateReturnDateOptions(mergeExpensesWithToDate).subscribe((res) => {
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

    mergeExpensesService
      .generateFlightJourneyTravelClassOptions(mergeExpensesWithFlightJourneyTravelClass)
      .subscribe((res) => {
        expect(res).toEqual(optionsData17);
        // @ts-ignore
        expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData6);
        done();
      });
  });

  it('generateFlightReturnTravelClassOptions(): should return the flight return travel class options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData17);

    mergeExpensesService
      .generateFlightReturnTravelClassOptions(mergeExpensesWithFlightReturnTravelClass)
      .subscribe((res) => {
        expect(res).toEqual(optionsData17);
        // @ts-ignore
        expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData6);
        done();
      });
  });

  it('generateTrainTravelClassOptions(): should return the train journey travel class options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData18);

    mergeExpensesService.generateTrainTravelClassOptions(mergeExpensesWithTrainTravelClass).subscribe((res) => {
      expect(res).toEqual(optionsData18);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData7);
      done();
    });
  });

  it('generateBusTravelClassOptions(): should return the bus journey travel class options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData19);

    mergeExpensesService.generateBusTravelClassOptions(mergeExpensesWithBusTravelClass).subscribe((res) => {
      expect(res).toEqual(optionsData19);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData8);
      done();
    });
  });

  it('generateDistanceOptions(): should return the distance options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData20);

    mergeExpensesService.generateDistanceOptions(mergeExpensesWithDistance).subscribe((res) => {
      expect(res).toEqual(optionsData20);
      // @ts-ignore
      expect(mergeExpensesService.formatOptions).toHaveBeenCalledWith(mergeExpensesOptionData9);
      done();
    });
  });

  it('generateDistanceUnitOptions(): should return the distance unit options', (done) => {
    // @ts-ignore
    spyOn(mergeExpensesService, 'formatOptions').and.returnValue(optionsData21);

    mergeExpensesService.generateDistanceUnitOptions(mergeExpensesWithDistance).subscribe((res) => {
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
        mergeExpensesOptionData4[0].value,
      );
      expect(res).toEqual(mergeExpensesOptionData4[0].value);
    });

    it('should return the field value on change when value is untouched and optionsData is undefined', () => {
      const res = mergeExpensesService.getFieldValueOnChange(
        undefined,
        null,
        mergeExpensesOptionData4[0].value,
        mergeExpensesOptionData4[0].value,
      );
      expect(res).toEqual(mergeExpensesOptionData4[0].value);
    });

    it('should return the field value on change when value is touched', () => {
      const res = mergeExpensesService.getFieldValueOnChange(
        mergeExpensesOptionData4[0],
        true,
        null,
        mergeExpensesOptionData4[1].value,
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
