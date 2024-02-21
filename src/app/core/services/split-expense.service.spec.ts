import { TestBed } from '@angular/core/testing';
import { SplitExpenseService } from './split-expense.service';
import { TransactionService } from './transaction.service';
import { PolicyService } from './policy.service';
import { DataTransformService } from './data-transform.service';
import { FileService } from './file.service';
import { StatusService } from './status.service';
import { CategoriesService } from './categories.service';
import { transformedOrgCategories, unspecifiedCategory } from '../mock-data/org-category.data';
import {
  splitPurposeTxn,
  splitTxn,
  sourceSplitTxn,
  sourceTxn2,
  splitTxns,
  createSourceTxn,
  splitTxn2,
  txnParam1,
  txnParam2,
  createSourceTxn2,
  txnData2,
  txnList,
  txnData,
  txnData5,
  expectedTxnParams,
  expectedTxnParams2,
  expectedTxnParams3,
  expectedTxnParams4,
  expectedTxnParams5,
  txnData8,
  txnData7,
  txnData9,
  txnData10,
  txnData11,
  txnData12,
  upsertTxnParam,
  txnDataPayload,
} from '../mock-data/transaction.data';
import { of } from 'rxjs';
import { splitExpFileObj, splitExpFile2, splitExpFile3, fileObject4 } from '../mock-data/file-object.data';
import { fileTxns } from '../mock-data/file-txn.data';
import { splitExpensePolicyExp } from '../mock-data/platform-policy-expense.data';
import { splitExpPolicyData } from '../mock-data/expense-policy.data';
import { splitPolicyExp } from '../mock-data/public-policy-expense.data';
import {
  policyViolation1,
  policyViolationData3,
  policyViolationData4,
  policyVoilationData2,
  splitPolicyExp4,
} from '../mock-data/policy-violation.data';
import { splitExpData, splitExpData2 } from '../mock-data/expense.data';
import { formattedTxnViolations, formattedTxnViolations2 } from '../mock-data/formatted-policy-violation.data';
import { txnStatusData, txnStatusData1, txnStatusData2 } from '../mock-data/transaction-status.data';
import {
  violationComment1,
  violationComment2,
  violationComment3,
  violationComment4,
  violationComment5,
} from '../mock-data/policy-violcation-comment.data';
import { unflattenExp1, unflattenExp2 } from '../mock-data/unflattened-expense.data';
import { criticalPolicyViolation1, criticalPolicyViolation2 } from '../mock-data/crtical-policy-violations.data';
import { UtilityService } from './utility.service';
import { cloneDeep, split } from 'lodash';
import { expenseFieldResponse } from '../mock-data/expense-field.data';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { splitPayloadData1, splitPayloadData2, splitPayloadData3 } from '../mock-data/split-payload.data';
import { splitPolicyExp1 } from '../mock-data/split-expense-policy.data';
import { splitData2, splitsData1 } from '../mock-data/splits.data';
import { SplitExpenseMissingFieldsData } from '../models/split-expense-missing-fields.data';
import {
  transformedSplitExpenseMissingFieldsData,
  transformedSplitExpenseMissingFieldsData2,
} from '../mock-data/transformed-split-expense-missing-fields.data';
import { filteredSplitPolicyViolationsData2 } from '../mock-data/filtered-split-policy-violations.data';
import {
  filteredMissingFieldsViolationsData,
  filteredMissingFieldsViolationsData2,
} from '../mock-data/filtered-missing-fields-violations.data';

describe('SplitExpenseService', () => {
  let splitExpenseService: SplitExpenseService;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let fileService: jasmine.SpyObj<FileService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;

  beforeEach(() => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'uploadBase64File',
      'checkPolicy',
      'getEtxn',
      'upsert',
    ]);
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', [
      'transformTo',
      'getPolicyRules',
      'getCriticalPolicyRules',
    ]);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['base64Download']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['post']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['filterByOrgCategoryId']);
    const utilityServiceSpy = jasmine.createSpyObj('UtiltyService', ['generateRandomString']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', [
      'splitExpenseCheckPolicies',
      'splitExpenseCheckMissingFields',
      'splitExpense',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SplitExpenseService,
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: PolicyService,
          useValue: policyServiceSpy,
        },
        {
          provide: StatusService,
          useValue: statusServiceSpy,
        },
        {
          provide: FileService,
          useValue: fileServiceSpy,
        },
        {
          provide: CategoriesService,
          useValue: categoriesServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
      ],
    });

    splitExpenseService = TestBed.inject(SplitExpenseService);
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
  });

  it('should be created', () => {
    expect(splitExpenseService).toBeTruthy();
  });

  it('postComment(): should post a comment', (done) => {
    statusService.post.and.returnValue(of(txnStatusData));

    splitExpenseService.postComment(violationComment1).subscribe((res) => {
      expect(res).toEqual(txnStatusData);
      expect(statusService.post).toHaveBeenCalledOnceWith(
        violationComment1.objectType,
        violationComment1.txnId,
        violationComment1.comment,
        violationComment1.notify
      );
      done();
    });
  });

  it('postCommentsFromUsers(): should post comments from users', (done) => {
    const postCommentSpy = spyOn(splitExpenseService, 'postComment');
    postCommentSpy.withArgs(violationComment2).and.returnValue(of(txnStatusData1));
    postCommentSpy.withArgs(violationComment3).and.returnValue(of(txnStatusData2));

    splitExpenseService
      .postCommentsFromUsers(['txxkBruL0EO9', 'txNVtsqF8Siq'], {
        txxkBruL0EO9: 'another comment',
        txNVtsqF8Siq: '',
      })
      .subscribe((res) => {
        expect(res).toEqual([txnStatusData1, txnStatusData2]);
        expect(postCommentSpy).toHaveBeenCalledWith(violationComment2);
        expect(postCommentSpy).toHaveBeenCalledWith(violationComment3);
        expect(postCommentSpy).toHaveBeenCalledTimes(2);
        done();
      });
  });

  describe('formatDisplayName(): ', () => {
    it('should get display name from list of categories', () => {
      categoriesService.filterByOrgCategoryId.and.returnValue(transformedOrgCategories[0]);
      const model = 141295;

      expect(splitExpenseService.formatDisplayName(model, transformedOrgCategories)).toEqual(
        transformedOrgCategories[0].displayName
      );
      expect(categoriesService.filterByOrgCategoryId).toHaveBeenCalledOnceWith(model, transformedOrgCategories);
    });
    it('should return undefined if filterByOrgCategoryId returns undefined', () => {
      categoriesService.filterByOrgCategoryId.and.returnValue(undefined);
      const model = 141295;

      expect(splitExpenseService.formatDisplayName(model, transformedOrgCategories)).toEqual(undefined);
      expect(categoriesService.filterByOrgCategoryId).toHaveBeenCalledOnceWith(model, transformedOrgCategories);
    });
  });

  describe('setupSplitExpensePurpose():', () => {
    it('should modify split expense purpose', () => {
      const splitGroupId = 'txfwF576rExp';
      const index = 0;
      const numberOfTxn = 2;
      const mockSplitPurposeTxn = cloneDeep(splitPurposeTxn);

      splitExpenseService.setupSplitExpensePurpose(mockSplitPurposeTxn, splitGroupId, index, numberOfTxn);
      expect(mockSplitPurposeTxn.purpose).toEqual('test_term (1) (1)');
    });

    it('should modify split expense purpose without group ID', () => {
      const splitGroupId = null;
      const index = 0;
      const numberOfTxn = 2;

      splitExpenseService.setupSplitExpensePurpose(txnData2, splitGroupId, index, numberOfTxn);
      expect(txnData2.purpose).toBeNull();
    });

    it('should modify split expense purpose if splitGroupId is undefined', () => {
      const splitGroupId = null;
      const index = 0;
      const numberOfTxn = 2;
      const mockSplitPurposeTxn = cloneDeep(splitPurposeTxn);

      splitExpenseService.setupSplitExpensePurpose(mockSplitPurposeTxn, splitGroupId, index, numberOfTxn);
      expect(mockSplitPurposeTxn.purpose).toEqual('test_term (1) (2)');
    });
  });

  it('setUpSplitExpenseBillable(): setup expense billable amount', () => {
    expect(splitExpenseService.setUpSplitExpenseBillable(sourceSplitTxn, splitTxn)).toEqual(splitTxn.billable);
  });

  it('setUpSplitExpenseBillable(): setup expense billable amount with project ID', () => {
    expect(splitExpenseService.setUpSplitExpenseBillable(sourceSplitTxn, { project_id: 123, ...splitTxn })).toEqual(
      splitTxn.billable
    );
  });

  it('setUpSplitExpenseTax(): setup expense tax', () => {
    expect(splitExpenseService.setUpSplitExpenseTax(sourceSplitTxn, splitTxn)).toEqual(splitTxn.tax_amount);
  });

  it('setUpSplitExpenseTax(): setup expense tax', () => {
    const { tax_amount, ...newSourceTxn } = splitTxn;
    expect(splitExpenseService.setUpSplitExpenseTax(sourceSplitTxn, newSourceTxn)).toEqual(sourceSplitTxn.tax_amount);
  });

  it('createSplitTxns(): should create split transaction', (done) => {
    spyOn(splitExpenseService, 'createTxns').and.returnValue(of(splitTxn2));

    splitExpenseService
      .createSplitTxns(createSourceTxn, createSourceTxn.amount, splitTxn2, expenseFieldResponse)
      .subscribe((res) => {
        expect(res).toEqual(splitTxn2);
        expect(splitExpenseService.createTxns).toHaveBeenCalledOnceWith(
          createSourceTxn,
          splitTxn2,
          createSourceTxn.split_group_user_amount,
          createSourceTxn.split_group_id,
          splitTxn2.length,
          expenseFieldResponse
        );
        done();
      });
  });

  it('createSplitTxns(): should create split transaction when IDs are not present', (done) => {
    utilityService.generateRandomString.and.returnValue('0AGAoeQfQX');
    spyOn(splitExpenseService, 'createTxns').and.returnValue(of(splitTxn2));

    const amount = 16428.56;

    splitExpenseService.createSplitTxns(createSourceTxn2, amount, splitTxn2, expenseFieldResponse).subscribe((res) => {
      expect(res).toEqual(splitTxn2);
      expect(utilityService.generateRandomString).toHaveBeenCalledOnceWith(10);
      expect(splitExpenseService.createTxns).toHaveBeenCalledOnceWith(
        createSourceTxn2,
        splitTxn2,
        amount,
        'tx0AGAoeQfQX',
        splitTxn2.length,
        expenseFieldResponse
      );
      done();
    });
  });

  describe('mapViolationDataWithEtxn(): ', () => {
    beforeEach(() => {
      const formatDisplayNameSpy = spyOn(splitExpenseService, 'formatDisplayName');
      formatDisplayNameSpy.and.returnValue('Food / Travelling - Inland');
    });
    it('should map violation data with expenses', () => {
      expect(
        splitExpenseService.mapViolationDataWithEtxn(policyVoilationData2, splitExpData, transformedOrgCategories)
      ).toEqual(policyVoilationData2);
      expect(splitExpenseService.formatDisplayName).toHaveBeenCalledWith(
        splitExpData[0].tx_org_category_id,
        transformedOrgCategories
      );
      expect(splitExpenseService.formatDisplayName).toHaveBeenCalledWith(
        splitExpData[1].tx_org_category_id,
        transformedOrgCategories
      );
      expect(splitExpenseService.formatDisplayName).toHaveBeenCalledTimes(2);
    });
    it('should map violation data with expenses', () => {
      const { tx_orig_amount, tx_orig_currency, ...newSplitData } = splitExpData[0];

      expect(
        splitExpenseService.mapViolationDataWithEtxn(policyVoilationData2, [newSplitData], transformedOrgCategories)
      ).toEqual(policyVoilationData2);
      expect(splitExpenseService.formatDisplayName).toHaveBeenCalledOnceWith(
        newSplitData.tx_org_category_id,
        transformedOrgCategories
      );
    });
    it('should not map violation data with expenses if tx_id is undefined', () => {
      expect(
        splitExpenseService.mapViolationDataWithEtxn(policyVoilationData2, [undefined], transformedOrgCategories)
      ).toEqual(policyVoilationData2);
      expect(splitExpenseService.formatDisplayName).not.toHaveBeenCalled();
    });
  });

  it('formatPolicyViolations(): should format policy violations', () => {
    policyService.getPolicyRules.and.returnValue(criticalPolicyViolation1);
    policyService.getCriticalPolicyRules.and.returnValue(criticalPolicyViolation2);

    expect(splitExpenseService.formatPolicyViolations(policyViolationData3)).toEqual(formattedTxnViolations);
    expect(policyService.getPolicyRules).toHaveBeenCalledWith(policyViolationData3.txc2KIogxUAy);
    expect(policyService.getPolicyRules).toHaveBeenCalledWith(policyViolationData3.txgfkvuYteta);
    expect(policyService.getPolicyRules).toHaveBeenCalledTimes(2);
    expect(policyService.getCriticalPolicyRules).toHaveBeenCalledWith(policyViolationData3.txc2KIogxUAy);
    expect(policyService.getCriticalPolicyRules).toHaveBeenCalledWith(policyViolationData3.txgfkvuYteta);
    expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(2);
  });

  it('formatPolicyViolations(): should format policy violations without critical policy violations', () => {
    policyService.getPolicyRules.and.returnValue(criticalPolicyViolation1);
    policyService.getCriticalPolicyRules.and.returnValue(null);

    expect(splitExpenseService.formatPolicyViolations(policyViolationData3)).toEqual(formattedTxnViolations2);
    expect(policyService.getPolicyRules).toHaveBeenCalledWith(policyViolationData3.txc2KIogxUAy);
    expect(policyService.getPolicyRules).toHaveBeenCalledWith(policyViolationData3.txgfkvuYteta);
    expect(policyService.getPolicyRules).toHaveBeenCalledTimes(2);
    expect(policyService.getCriticalPolicyRules).toHaveBeenCalledWith(policyViolationData3.txc2KIogxUAy);
    expect(policyService.getCriticalPolicyRules).toHaveBeenCalledWith(policyViolationData3.txgfkvuYteta);
    expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(2);
  });

  describe('createTxns(): ', () => {
    beforeEach(() => {
      spyOn(splitExpenseService, 'setUpSplitExpenseBillable').and.returnValue(true);
      spyOn(splitExpenseService, 'setUpSplitExpenseTax').and.returnValue(45);
      spyOn(splitExpenseService, 'setupSplitExpensePurpose');
      spyOn(splitExpenseService, 'updateCustomProperties');
    });

    it('should set orig_amount of splitter expense and amount equals to (splitter amount * exchangeRate) if orig_currency is set', () => {
      const mockTxn = cloneDeep(txnData5);
      mockTxn.split_group_id = undefined;
      mockTxn.split_group_user_amount = undefined;
      const mockSplitExpenses = cloneDeep(txnList);
      mockSplitExpenses[0].amount = 100;
      mockSplitExpenses[1].amount = 100;
      mockSplitExpenses[0].txn_dt = undefined;
      mockSplitExpenses[0].org_category_id = undefined;
      mockSplitExpenses[0].custom_properties = undefined;
      splitExpenseService
        .createTxns(mockTxn, mockSplitExpenses, 100, 'txOJVaaPxo9O', 100, expenseFieldResponse)
        .subscribe((expectedTxnRes) => {
          expect(expectedTxnRes).toEqual([txnData7, txnData8]);
        });
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams,
        'txOJVaaPxo9O',
        0,
        100
      );
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams2,
        'txOJVaaPxo9O',
        1,
        100
      );
    });

    it('should set amount of the splitter expenses if orig_currency is not set', () => {
      const mockTxn = cloneDeep(txnData5);
      mockTxn.orig_currency = undefined;
      const mockSplitExpenses = cloneDeep(txnList);
      splitExpenseService
        .createTxns(mockTxn, mockSplitExpenses, 100, 'txOJVaaPxo9O', 100, expenseFieldResponse)
        .subscribe((expectedTxnRes) => {
          expect(expectedTxnRes).toEqual([txnData9, txnData10]);
        });

      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams3,
        'txOJVaaPxo9O',
        0,
        100
      );
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams4,
        'txOJVaaPxo9O',
        1,
        100
      );
    });

    it('should create expenses with source as mobile app if source is undefined', () => {
      const mockTxn = cloneDeep(txnData5);
      mockTxn.source = undefined;
      const mockSplitExpenses = cloneDeep(txnList);
      splitExpenseService
        .createTxns(mockTxn, mockSplitExpenses, 100, 'txOJVaaPxo9O', 100, expenseFieldResponse)
        .subscribe((expectedTxnRes) => {
          expect(expectedTxnRes).toEqual([txnData11, txnData12]);
        });

      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams5,
        'txOJVaaPxo9O',
        0,
        100
      );
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams5,
        'txOJVaaPxo9O',
        0,
        100
      );
    });
  });

  describe('isCustomFieldAllowedToSelectedCategory():', () => {
    it('should return true if custom field is allowed to selected category', () => {
      const mockExpenseFields = cloneDeep(expenseFieldResponse);
      mockExpenseFields[0].id = 12345;
      mockExpenseFields[0].org_category_ids = [16582];
      const res = splitExpenseService.isCustomFieldAllowedToSelectedCategory(
        txnData2,
        txnData5,
        12345,
        mockExpenseFields
      );

      expect(res).toBeTrue();
    });

    it('should return undefined if custom field is not present in expense fields', () => {
      const mockExpenseFields = cloneDeep(expenseFieldResponse);
      mockExpenseFields[0].id = 12346;
      mockExpenseFields[0].org_category_ids = [16582];
      const res = splitExpenseService.isCustomFieldAllowedToSelectedCategory(
        txnData2,
        txnData5,
        12345,
        mockExpenseFields
      );

      expect(res).toBeUndefined();
    });

    it('should return true if custom field is allowed to original expense category if expense is split by project', () => {
      const mockExpenseFields = cloneDeep(expenseFieldResponse);
      mockExpenseFields[0].id = 12345;
      mockExpenseFields[0].org_category_ids = [117013];
      const res = splitExpenseService.isCustomFieldAllowedToSelectedCategory(
        txnData,
        txnData5,
        12345,
        mockExpenseFields
      );

      expect(res).toBeTrue();
    });

    it('should return false if expense fields is null', () => {
      const res = splitExpenseService.isCustomFieldAllowedToSelectedCategory(txnData, txnData5, 12345, null);

      expect(res).toBeFalse();
    });

    it('should return false if sourceTxn is null', () => {
      const mockExpenseFields = cloneDeep(expenseFieldResponse);
      mockExpenseFields[0].id = 12345;
      mockExpenseFields[0].org_category_ids = [117013];

      const res = splitExpenseService.isCustomFieldAllowedToSelectedCategory(txnData, null, 12345, mockExpenseFields);

      expect(res).toBeFalse();
    });
  });

  describe('updateCustomProperties():', () => {
    it('should not update custom properties if split expense does not contain any custom property', () => {
      spyOn(splitExpenseService, 'isCustomFieldAllowedToSelectedCategory').and.returnValue(true);
      const mockExpenseFields = cloneDeep(expenseFieldResponse);
      const mockTxn = cloneDeep(txnData2);
      splitExpenseService.updateCustomProperties(mockTxn, txnData5, mockExpenseFields);
      expect(splitExpenseService.isCustomFieldAllowedToSelectedCategory).not.toHaveBeenCalled();
      expect(mockTxn.custom_properties).toEqual(txnData2.custom_properties);
    });

    it('should call isCustomFieldAllowedToSelectedCategory and modify custom property of split expense', () => {
      spyOn(splitExpenseService, 'isCustomFieldAllowedToSelectedCategory').and.returnValues(true, false);
      const mockExpenseFields = cloneDeep(expenseFieldResponse);
      const mockTxn = cloneDeep(txnDataPayload);
      splitExpenseService.updateCustomProperties(mockTxn, txnData5, mockExpenseFields);
      expect(splitExpenseService.isCustomFieldAllowedToSelectedCategory).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.isCustomFieldAllowedToSelectedCategory).toHaveBeenCalledWith(
        mockTxn,
        txnData5,
        200227,
        mockExpenseFields
      );
      expect(splitExpenseService.isCustomFieldAllowedToSelectedCategory).toHaveBeenCalledWith(
        mockTxn,
        txnData5,
        211326,
        mockExpenseFields
      );
      expect(mockTxn.custom_properties).toEqual([txnDataPayload.custom_properties[0]]);
    });
  });

  it('handleSplitPolicyCheck(): should get fileIds and call check policies API for split', (done) => {
    spyOn(splitExpenseService, 'getFileIdsFromObjects').and.returnValue(['fijCeF0G0jTl']);
    spyOn(splitExpenseService, 'transformSplitTo').and.returnValue(splitPayloadData1);
    expensesService.splitExpenseCheckPolicies.and.returnValue(of(splitPolicyExp1));

    splitExpenseService
      .handleSplitPolicyCheck(txnList, fileObject4, txnDataPayload, {
        reportId: null,
        unspecifiedCategory: unspecifiedCategory,
      })
      .subscribe((res) => {
        expect(res).toEqual(splitPolicyExp1);
        expect(splitExpenseService.getFileIdsFromObjects).toHaveBeenCalledOnceWith(fileObject4);
        expect(splitExpenseService.transformSplitTo).toHaveBeenCalledOnceWith(
          txnList,
          txnDataPayload,
          ['fijCeF0G0jTl'],
          {
            reportId: null,
            unspecifiedCategory: unspecifiedCategory,
          }
        );
        expect(expensesService.splitExpenseCheckPolicies).toHaveBeenCalledOnceWith(splitPayloadData1);
        done();
      });
  });

  describe('transformSplitFlightClasses():', () => {
    it('should not modify travel_classes if fyle_category is not present', () => {
      const mockSplitTxn = cloneDeep(splitTxn);
      const mockPlatformPayload = cloneDeep(splitPayloadData1);
      mockSplitTxn.fyle_category = undefined;
      splitExpenseService.transformSplitFlightClasses(mockSplitTxn, mockPlatformPayload);
      expect(mockPlatformPayload.travel_classes).toEqual(splitPayloadData1.travel_classes);
    });

    it('should modify travel_classes if fyle_category is airlines and flight_journey_travel_class and flight_return_travel_class is present in split expense', () => {
      const mockSplitTxn = cloneDeep(splitTxn);
      const mockPlatformPayload = cloneDeep(splitPayloadData1);
      mockPlatformPayload.travel_classes = [];
      mockSplitTxn.fyle_category = 'Airlines';
      mockSplitTxn.flight_journey_travel_class = 'Economy';
      mockSplitTxn.flight_return_travel_class = 'Business';
      splitExpenseService.transformSplitFlightClasses(mockSplitTxn, mockPlatformPayload);
      expect(mockPlatformPayload.travel_classes).toEqual(['Economy', 'Business']);
    });
  });

  describe('tranformSplitBusClasses():', () => {
    it('should not modify travel_classes if fyle_category is not present', () => {
      const mockSplitTxn = cloneDeep(splitTxn);
      const mockPlatformPayload = cloneDeep(splitPayloadData1);
      mockSplitTxn.fyle_category = undefined;
      splitExpenseService.tranformSplitBusClasses(mockSplitTxn, mockPlatformPayload);
      expect(mockPlatformPayload.travel_classes).toEqual(splitPayloadData1.travel_classes);
    });

    it('should modify travel_classes if fyle_category is bus and bus_travel_class is present in split expense', () => {
      const mockSplitTxn = cloneDeep(splitTxn);
      const mockPlatformPayload = cloneDeep(splitPayloadData1);
      mockPlatformPayload.travel_classes = [];
      mockSplitTxn.fyle_category = 'Bus';
      mockSplitTxn.bus_travel_class = 'Economy';
      splitExpenseService.tranformSplitBusClasses(mockSplitTxn, mockPlatformPayload);
      expect(mockPlatformPayload.travel_classes).toEqual(['Economy']);
    });
  });

  describe('transformSplitTrainClasses():', () => {
    it('should not modify travel_classes if fyle_category is not present', () => {
      const mockSplitTxn = cloneDeep(splitTxn);
      const mockPlatformPayload = cloneDeep(splitPayloadData1);
      mockSplitTxn.fyle_category = undefined;
      splitExpenseService.transformSplitTrainClasses(mockSplitTxn, mockPlatformPayload);
      expect(mockPlatformPayload.travel_classes).toEqual(splitPayloadData1.travel_classes);
    });

    it('should modify travel_classes if fyle_category is train and train_travel_class is present in split expense', () => {
      const mockSplitTxn = cloneDeep(splitTxn);
      const mockPlatformPayload = cloneDeep(splitPayloadData1);
      mockPlatformPayload.travel_classes = [];
      mockSplitTxn.fyle_category = 'Train';
      mockSplitTxn.train_travel_class = 'Sleeper';
      splitExpenseService.transformSplitTrainClasses(mockSplitTxn, mockPlatformPayload);
      expect(mockPlatformPayload.travel_classes).toEqual(['Sleeper']);
    });
  });

  it('transformSplitTravelClasses(): should modify travel_classes for split expense payload', () => {
    const mockSplitTxn = cloneDeep(splitTxn);
    const mockPlatformPayload = cloneDeep(splitPayloadData1);
    spyOn(splitExpenseService, 'transformSplitFlightClasses');
    spyOn(splitExpenseService, 'tranformSplitBusClasses');
    spyOn(splitExpenseService, 'transformSplitTrainClasses');
    splitExpenseService.transformSplitTravelClasses(mockSplitTxn, mockPlatformPayload);
    expect(splitExpenseService.transformSplitFlightClasses).toHaveBeenCalledOnceWith(mockSplitTxn, mockPlatformPayload);
    expect(splitExpenseService.tranformSplitBusClasses).toHaveBeenCalledOnceWith(mockSplitTxn, mockPlatformPayload);
    expect(splitExpenseService.transformSplitTrainClasses).toHaveBeenCalledOnceWith(mockSplitTxn, mockPlatformPayload);
  });

  describe('transformSplitTo():', () => {
    beforeEach(() => {
      spyOn(splitExpenseService, 'transformSplitTravelClasses');
      spyOn(splitExpenseService, 'transformSplitArray').and.returnValue(splitsData1);
    });

    it('should return platform split expense payload', () => {
      const mockSplitTxn = cloneDeep(txnList);
      const mockPlatformPayload = cloneDeep(splitPayloadData2);
      const reportAndUnspecifiedCategoryParams = {
        reportId: 'rp0AGAoeQfQX',
        unspecifiedCategory: unspecifiedCategory,
      };
      const res = splitExpenseService.transformSplitTo(
        mockSplitTxn,
        txnDataPayload,
        ['fijCeF0G0jTl'],
        reportAndUnspecifiedCategoryParams
      );
      expect(res).toEqual(mockPlatformPayload);
      expect(splitExpenseService.transformSplitTravelClasses).toHaveBeenCalledOnceWith(
        txnDataPayload,
        mockPlatformPayload
      );
      expect(splitExpenseService.transformSplitArray).toHaveBeenCalledOnceWith(
        mockSplitTxn,
        reportAndUnspecifiedCategoryParams.unspecifiedCategory
      );
    });

    it('should return platform split expense payload with category_id as unspecified if org_category_id is null in transaction', () => {
      const mockSplitTxn = cloneDeep(txnList);
      const mockPlatformPayload = cloneDeep(splitPayloadData3);
      const reportAndUnspecifiedCategoryParams = {
        reportId: 'rp0AGAoeQfQX',
        unspecifiedCategory: unspecifiedCategory,
      };
      const mockTxn = cloneDeep(txnDataPayload);
      mockTxn.org_category_id = null;
      mockTxn.skip_reimbursement = null;
      const res = splitExpenseService.transformSplitTo(
        mockSplitTxn,
        mockTxn,
        ['fijCeF0G0jTl'],
        reportAndUnspecifiedCategoryParams
      );
      expect(res).toEqual(mockPlatformPayload);
      expect(splitExpenseService.transformSplitTravelClasses).toHaveBeenCalledOnceWith(mockTxn, mockPlatformPayload);
      expect(splitExpenseService.transformSplitArray).toHaveBeenCalledOnceWith(
        mockSplitTxn,
        reportAndUnspecifiedCategoryParams.unspecifiedCategory
      );
    });
  });

  it('transformSplitArray(): should return splits array', () => {
    const mockSplitTxn = cloneDeep(txnList);
    mockSplitTxn[0].org_category_id = null;
    const res = splitExpenseService.transformSplitArray(mockSplitTxn, unspecifiedCategory);
    expect(res).toEqual(splitData2);
  });

  describe('handleSplitMissingFieldsCheck():', () => {
    beforeEach(() => {
      spyOn(splitExpenseService, 'getFileIdsFromObjects').and.returnValue(['fijCeF0G0jTl']);
      spyOn(splitExpenseService, 'transformSplitTo').and.returnValue(splitPayloadData1);
      expensesService.splitExpenseCheckMissingFields.and.returnValue(of(SplitExpenseMissingFieldsData));
    });

    it('should get fileIds and call check missing fields API for split if report is attached', (done) => {
      splitExpenseService
        .handleSplitMissingFieldsCheck(txnList, fileObject4, txnDataPayload, {
          reportId: 'rp0AGAoeQfQX',
          unspecifiedCategory: unspecifiedCategory,
        })
        .subscribe((res) => {
          expect(res).toEqual(SplitExpenseMissingFieldsData);
          expect(splitExpenseService.getFileIdsFromObjects).toHaveBeenCalledOnceWith(fileObject4);
          expect(splitExpenseService.transformSplitTo).toHaveBeenCalledOnceWith(
            txnList,
            txnDataPayload,
            ['fijCeF0G0jTl'],
            {
              reportId: 'rp0AGAoeQfQX',
              unspecifiedCategory: unspecifiedCategory,
            }
          );
          expect(expensesService.splitExpenseCheckMissingFields).toHaveBeenCalledOnceWith(splitPayloadData1);
          done();
        });
    });

    it('should get fileIds and should not call check missing fields API for split if report is not attached', (done) => {
      splitExpenseService
        .handleSplitMissingFieldsCheck(txnList, fileObject4, txnDataPayload, {
          reportId: null,
          unspecifiedCategory: unspecifiedCategory,
        })
        .subscribe((res) => {
          expect(res).toEqual({});
          expect(splitExpenseService.getFileIdsFromObjects).toHaveBeenCalledOnceWith(fileObject4);
          expect(splitExpenseService.transformSplitTo).not.toHaveBeenCalled();
          expect(expensesService.splitExpenseCheckMissingFields).not.toHaveBeenCalled();
          done();
        });
    });
  });

  it('handlePolicyAndMissingFieldsCheck(): should call handleSplitPolicyCheck and handleSplitMissingFieldsCheck', (done) => {
    spyOn(splitExpenseService, 'handleSplitPolicyCheck').and.returnValue(of(splitPolicyExp1));
    spyOn(splitExpenseService, 'handleSplitMissingFieldsCheck').and.returnValue(of(SplitExpenseMissingFieldsData));
    const reportAndUnspecifiedCategoryParams = {
      reportId: 'rp0AGAoeQfQX',
      unspecifiedCategory: unspecifiedCategory,
    };
    splitExpenseService
      .handlePolicyAndMissingFieldsCheck(txnList, fileObject4, txnDataPayload, {
        reportId: 'rp0AGAoeQfQX',
        unspecifiedCategory: unspecifiedCategory,
      })
      .subscribe((res) => {
        expect(res).toEqual({
          policyViolations: splitPolicyExp1,
          missingFields: SplitExpenseMissingFieldsData,
        });
        expect(splitExpenseService.handleSplitPolicyCheck).toHaveBeenCalledOnceWith(
          txnList,
          fileObject4,
          txnDataPayload,
          reportAndUnspecifiedCategoryParams
        );
        expect(splitExpenseService.handleSplitMissingFieldsCheck).toHaveBeenCalledOnceWith(
          txnList,
          fileObject4,
          txnDataPayload,
          reportAndUnspecifiedCategoryParams
        );
        done();
      });
  });

  it('getFileIdsFromObjects(): should return fileIds from file objects', () => {
    const res = splitExpenseService.getFileIdsFromObjects(fileObject4);
    expect(res).toEqual(['fiV1gXpyCcbU']);
  });

  describe('isMissingFields():', () => {
    it('should return false if missing fields are not present', () => {
      const mockMissingFields = cloneDeep(transformedSplitExpenseMissingFieldsData2);
      const res = splitExpenseService.isMissingFields(mockMissingFields);
      expect(res).toBeFalse();
    });

    it('should return true if missing fields are present', () => {
      const mockMissingFields = cloneDeep(transformedSplitExpenseMissingFieldsData2);
      mockMissingFields.data.missing_expense_field_ids = ['291832'];
      const res = splitExpenseService.isMissingFields(mockMissingFields);
      expect(res).toBeTrue();
    });
  });

  describe('checkIfMissingFieldsExist():', () => {
    it('checkIfMissingFieldsExist(): should return true if missing fields are present', () => {
      spyOn(splitExpenseService, 'isMissingFields').and.returnValue(true);
      const mockMissingFields = cloneDeep({ '0': transformedSplitExpenseMissingFieldsData2 });
      const res = splitExpenseService.checkIfMissingFieldsExist(mockMissingFields);
      expect(splitExpenseService.isMissingFields).toHaveBeenCalledOnceWith(transformedSplitExpenseMissingFieldsData2);
      expect(res).toBeTrue();
    });

    it('checkIfMissingFieldsExist(): should return false if missing fields are not present', () => {
      spyOn(splitExpenseService, 'isMissingFields').and.returnValue(false);
      const mockMissingFields = cloneDeep({ '0': transformedSplitExpenseMissingFieldsData2 });
      const res = splitExpenseService.checkIfMissingFieldsExist(mockMissingFields);
      expect(splitExpenseService.isMissingFields).toHaveBeenCalledOnceWith(transformedSplitExpenseMissingFieldsData2);
      expect(res).toBeFalse();
    });
  });

  it('filteredPolicyViolations(): should return policy violations with policy action and rules', () => {
    policyService.getPolicyRules.and.returnValue(criticalPolicyViolation1);
    policyService.getCriticalPolicyRules.and.returnValue(criticalPolicyViolation2);
    const res = splitExpenseService.filteredPolicyViolations({ '1': splitPolicyExp4 });
    expect(res).toEqual({ '1': filteredSplitPolicyViolationsData2 });
  });

  it('filteredMissingFieldsViolations(): should return missing fields with isMissingFields', () => {
    spyOn(splitExpenseService, 'isMissingFields').and.returnValue(true);
    const res = splitExpenseService.filteredMissingFieldsViolations({ '1': transformedSplitExpenseMissingFieldsData2 });
    expect(splitExpenseService.isMissingFields).toHaveBeenCalledOnceWith(transformedSplitExpenseMissingFieldsData2);
    expect(res).toEqual({ '1': filteredMissingFieldsViolationsData2 });
  });

  it('splitExpense(): should call split expense API', () => {
    spyOn(splitExpenseService, 'getFileIdsFromObjects').and.returnValue(['fijCeF0G0jTl']);
    spyOn(splitExpenseService, 'transformSplitTo').and.returnValue(splitPayloadData1);
    expensesService.splitExpense.and.returnValue(of({ data: txnList }));
    const reportAndUnspecifiedCategoryParams = {
      reportId: 'rp0AGAoeQfQX',
      unspecifiedCategory: unspecifiedCategory,
    };
    splitExpenseService
      .splitExpense(txnList, fileObject4, txnDataPayload, {
        reportId: 'rp0AGAoeQfQX',
        unspecifiedCategory: unspecifiedCategory,
      })
      .subscribe((res) => {
        expect(res).toEqual({ data: txnList });
        expect(splitExpenseService.transformSplitTo).toHaveBeenCalledOnceWith(
          txnList,
          txnDataPayload,
          ['fijCeF0G0jTl'],
          reportAndUnspecifiedCategoryParams
        );
        expect(expensesService.splitExpense).toHaveBeenCalledOnceWith(splitPayloadData1);
      });
  });

  describe('postSplitExpenseComments():', () => {
    beforeEach(() => {
      spyOn(splitExpenseService, 'postComment').and.returnValues(of(txnStatusData), of(txnStatusData));
    });

    it('should post comment for split expense', () => {
      splitExpenseService
        .postSplitExpenseComments(['txeqxj49dgh', 'txeqxj89ddf'], { '0': 'test comment 1', '1': '' })
        .subscribe((res) => {
          expect(res).toEqual([txnStatusData, txnStatusData]);
          expect(splitExpenseService.postComment).toHaveBeenCalledTimes(2);
          expect(splitExpenseService.postComment).toHaveBeenCalledWith(violationComment4);
          expect(splitExpenseService.postComment).toHaveBeenCalledWith(violationComment5);
        });
    });
  });
});
