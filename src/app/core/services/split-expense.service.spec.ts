import { TestBed } from '@angular/core/testing';
import { SplitExpenseService } from './split-expense.service';
import { TransactionService } from './transaction.service';
import { PolicyService } from './policy.service';
import { DataTransformService } from './data-transform.service';
import { FileService } from './file.service';
import { StatusService } from './status.service';
import { CategoriesService } from './categories.service';
import { transformedOrgCategories } from '../mock-data/org-category.data';
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
} from '../mock-data/policy-violation.data';
import { splitExpData, splitExpData2 } from '../mock-data/expense.data';
import { formattedTxnViolations, formattedTxnViolations2 } from '../mock-data/formatted-policy-violation.data';
import { txnStatusData, txnStatusData1, txnStatusData2 } from '../mock-data/transaction-status.data';
import { violationComment1, violationComment2, violationComment3 } from '../mock-data/policy-violcation-comment.data';
import { unflattenExp1, unflattenExp2 } from '../mock-data/unflattened-expense.data';
import { criticalPolicyViolation1, criticalPolicyViolation2 } from '../mock-data/crtical-policy-violations.data';
import { UtilityService } from './utility.service';
import { cloneDeep } from 'lodash';

describe('SplitExpenseService', () => {
  let splitExpenseService: SplitExpenseService;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let fileService: jasmine.SpyObj<FileService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let utilityService: jasmine.SpyObj<UtilityService>;

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
  });

  it('should be created', () => {
    expect(splitExpenseService).toBeTruthy();
  });

  describe('linkTxnWithFiles():', () => {
    it('should link transactions with files', (done) => {
      transactionService.uploadBase64File
        .withArgs(fileTxns.txns[0].id, fileTxns.files[0].name, fileTxns.files[0].content)
        .and.returnValue(of(splitExpFile2));
      transactionService.uploadBase64File
        .withArgs(fileTxns.txns[1].id, fileTxns.files[0].name, fileTxns.files[0].content)
        .and.returnValue(of(splitExpFile3));

      splitExpenseService.linkTxnWithFiles(fileTxns).subscribe((res) => {
        expect(res).toEqual([splitExpFile2, splitExpFile3]);
        expect(transactionService.uploadBase64File).toHaveBeenCalledWith(
          fileTxns.txns[0].id,
          fileTxns.files[0].name,
          fileTxns.files[0].content
        );
        expect(transactionService.uploadBase64File).toHaveBeenCalledWith(
          fileTxns.txns[1].id,
          fileTxns.files[0].name,
          fileTxns.files[0].content
        );
        expect(transactionService.uploadBase64File).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should return null if no files are present', (done) => {
      splitExpenseService.linkTxnWithFiles({ ...fileTxns, files: null }).subscribe((res) => {
        expect(res).toEqual([null]);
        done();
      });
    });
  });

  it('getBase64Content(): should get base 64 string of txn files', (done) => {
    fileService.base64Download.withArgs(splitExpFileObj[0].id).and.returnValue(of({ content: 'base64encodedcontent' }));

    splitExpenseService.getBase64Content(splitExpFileObj).subscribe((res) => {
      expect(res).toEqual([
        {
          id: 'fijCeF0G0jTl',
          name: '000.jpeg',
          content: 'base64encodedcontent',
        },
      ]);
      expect(fileService.base64Download).toHaveBeenCalledOnceWith(splitExpFileObj[0].id);
      done();
    });
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

    splitExpenseService.createSplitTxns(createSourceTxn, createSourceTxn.amount, splitTxn2).subscribe((res) => {
      expect(res).toEqual(splitTxn2);
      expect(splitExpenseService.createTxns).toHaveBeenCalledOnceWith(
        createSourceTxn,
        splitTxn2,
        createSourceTxn.split_group_user_amount,
        createSourceTxn.split_group_id,
        splitTxn2.length
      );
      done();
    });
  });

  it('createSplitTxns(): should create split transaction when IDs are not present', (done) => {
    utilityService.generateRandomString.and.returnValue('0AGAoeQfQX');
    spyOn(splitExpenseService, 'createTxns').and.returnValue(of(splitTxn2));

    const amount = 16428.56;

    splitExpenseService.createSplitTxns(createSourceTxn2, amount, splitTxn2).subscribe((res) => {
      expect(res).toEqual(splitTxn2);
      expect(utilityService.generateRandomString).toHaveBeenCalledOnceWith(10);
      expect(splitExpenseService.createTxns).toHaveBeenCalledOnceWith(
        createSourceTxn2,
        splitTxn2,
        amount,
        'tx0AGAoeQfQX',
        splitTxn2.length
      );
      done();
    });
  });

  it('checkPolicyForTransaction(): should check policy for a transaction', (done) => {
    policyService.transformTo.and.returnValue(splitExpensePolicyExp);
    transactionService.checkPolicy.and.returnValue(of(splitExpPolicyData));

    splitExpenseService.checkPolicyForTransaction(splitPolicyExp).subscribe((res) => {
      expect(res).toEqual({
        txqhb1IwrujH: policyViolation1,
      });
      expect(policyService.transformTo).toHaveBeenCalledOnceWith(splitPolicyExp);
      expect(transactionService.checkPolicy).toHaveBeenCalledOnceWith(splitExpensePolicyExp);
      done();
    });
  });

  it('checkPolicyForTransactions(): should check policy for multiple transactions', (done) => {
    spyOn(splitExpenseService, 'checkPolicyForTransaction').and.returnValue(
      of({
        txqhb1IwrujH: policyViolation1,
      })
    );

    splitExpenseService.checkPolicyForTransactions([splitPolicyExp]).subscribe((res) => {
      expect(res).toEqual({
        txqhb1IwrujH: policyViolation1,
      });
      expect(splitExpenseService.checkPolicyForTransaction).toHaveBeenCalledOnceWith(splitPolicyExp);
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

  describe('runPolicyCheck():', () => {
    it('should run policy check on expenses', (done) => {
      dataTransformService.unflatten.withArgs(splitExpData2[0]).and.returnValue(unflattenExp1);
      dataTransformService.unflatten.withArgs(splitExpData2[1]).and.returnValue(unflattenExp2);

      spyOn(splitExpenseService, 'checkPolicyForTransactions').and.returnValue(of(policyViolationData4));

      splitExpenseService.runPolicyCheck(splitExpData2, fileObject4).subscribe((res) => {
        expect(res).toEqual(policyViolationData4);
        expect(dataTransformService.unflatten).toHaveBeenCalledWith(splitExpData2[0]);
        expect(dataTransformService.unflatten).toHaveBeenCalledWith(splitExpData2[1]);
        expect(dataTransformService.unflatten).toHaveBeenCalledTimes(2);
        expect(splitExpenseService.checkPolicyForTransactions).toHaveBeenCalledOnceWith([
          unflattenExp1.tx,
          unflattenExp2.tx,
        ]);
        done();
      });
    });

    it('should return empty object when no expenses are provided', (done) => {
      splitExpenseService.runPolicyCheck([], fileObject4).subscribe((res) => {
        expect(res).toEqual({});
        done();
      });
    });

    it('should run policy check on expenses when files are not present', (done) => {
      dataTransformService.unflatten.withArgs(splitExpData2[0]).and.returnValue(unflattenExp1);
      dataTransformService.unflatten.withArgs(splitExpData2[1]).and.returnValue(unflattenExp2);

      spyOn(splitExpenseService, 'checkPolicyForTransactions').and.returnValue(of(policyViolationData4));

      splitExpenseService.runPolicyCheck(splitExpData2, []).subscribe((res) => {
        expect(res).toEqual(policyViolationData4);
        expect(dataTransformService.unflatten).toHaveBeenCalledWith(splitExpData2[0]);
        expect(dataTransformService.unflatten).toHaveBeenCalledWith(splitExpData2[1]);
        expect(dataTransformService.unflatten).toHaveBeenCalledTimes(2);
        expect(splitExpenseService.checkPolicyForTransactions).toHaveBeenCalledOnceWith([
          unflattenExp1.tx,
          unflattenExp2.tx,
        ]);
        done();
      });
    });

    it('should run policy check on expenses when files and user_amount are not defined', (done) => {
      const mockUnflattenExp1 = cloneDeep(unflattenExp1);
      mockUnflattenExp1.tx.user_amount = undefined;
      dataTransformService.unflatten.withArgs(splitExpData2[0]).and.returnValue(mockUnflattenExp1);
      dataTransformService.unflatten.withArgs(splitExpData2[1]).and.returnValue(unflattenExp2);

      spyOn(splitExpenseService, 'checkPolicyForTransactions').and.returnValue(of(policyViolationData4));

      splitExpenseService.runPolicyCheck(splitExpData2, undefined).subscribe((res) => {
        expect(res).toEqual(policyViolationData4);
        expect(dataTransformService.unflatten).toHaveBeenCalledWith(splitExpData2[0]);
        expect(dataTransformService.unflatten).toHaveBeenCalledWith(splitExpData2[1]);
        expect(dataTransformService.unflatten).toHaveBeenCalledTimes(2);
        expect(splitExpenseService.checkPolicyForTransactions).toHaveBeenCalledOnceWith([
          mockUnflattenExp1.tx,
          unflattenExp2.tx,
        ]);
        done();
      });
    });

    it('should return empty object when expenses are undefined', (done) => {
      splitExpenseService.runPolicyCheck(undefined, fileObject4).subscribe((res) => {
        expect(res).toEqual({});
        done();
      });
    });
  });

  it('executePolicyCheck(): should execute policy check', (done) => {
    spyOn(splitExpenseService, 'runPolicyCheck').and.returnValue(of(policyViolationData4));
    spyOn(splitExpenseService, 'mapViolationDataWithEtxn').and.returnValue(policyViolationData4);

    splitExpenseService.executePolicyCheck(splitExpData2, fileObject4, transformedOrgCategories).subscribe((res) => {
      expect(res).toEqual(policyViolationData4);
      expect(splitExpenseService.runPolicyCheck).toHaveBeenCalledOnceWith(splitExpData2, fileObject4);
      expect(splitExpenseService.mapViolationDataWithEtxn).toHaveBeenCalledOnceWith(
        policyViolationData4,
        splitExpData2,
        transformedOrgCategories
      );
      done();
    });
  });

  it('checkForPolicyViolations(): check for policy violations', (done) => {
    transactionService.getEtxn.withArgs(splitExpData2[0].tx_id).and.returnValue(of(splitExpData2[0]));
    transactionService.getEtxn.withArgs(splitExpData2[1].tx_id).and.returnValue(of(splitExpData2[1]));
    spyOn(splitExpenseService, 'executePolicyCheck').and.returnValue(of(policyViolationData4));

    splitExpenseService
      .checkForPolicyViolations([splitExpData2[0].tx_id, splitExpData2[1].tx_id], fileObject4, transformedOrgCategories)
      .subscribe((res) => {
        expect(res).toEqual(policyViolationData4);
        expect(transactionService.getEtxn).toHaveBeenCalledWith(splitExpData2[0].tx_id);
        expect(transactionService.getEtxn).toHaveBeenCalledWith(splitExpData2[1].tx_id);
        expect(transactionService.getEtxn).toHaveBeenCalledTimes(2);
        expect(splitExpenseService.executePolicyCheck).toHaveBeenCalledOnceWith(
          [splitExpData2[0], splitExpData2[1]],
          fileObject4,
          transformedOrgCategories
        );
        done();
      });
  });

  describe('createTxns(): ', () => {
    beforeEach(() => {
      spyOn(splitExpenseService, 'setUpSplitExpenseBillable').and.returnValue(true);
      spyOn(splitExpenseService, 'setUpSplitExpenseTax').and.returnValue(45);
      spyOn(splitExpenseService, 'setupSplitExpensePurpose');
    });

    it('should return observable of transactions if orig_currency is defined in source transactions', () => {
      const mockTxn = cloneDeep(txnData5);
      mockTxn.split_group_id = undefined;
      mockTxn.split_group_user_amount = undefined;
      const mockSplitExpenses = cloneDeep(txnList);
      mockSplitExpenses[0].amount = 100;
      mockSplitExpenses[1].amount = 100;
      mockSplitExpenses[0].txn_dt = undefined;
      mockSplitExpenses[0].org_category_id = undefined;
      mockSplitExpenses[0].custom_properties = undefined;
      transactionService.upsert.and.returnValues(of(mockTxn), of(mockTxn));
      splitExpenseService
        .createTxns(mockTxn, mockSplitExpenses, 100, 'txOJVaaPxo9O', 100)
        .subscribe((expectedTxnRes) => {
          expect(expectedTxnRes).toEqual([mockTxn, mockTxn]);
        });
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledTimes(2);
      expect(transactionService.upsert).toHaveBeenCalledTimes(2);
      expect(transactionService.upsert).toHaveBeenCalledWith(expectedTxnParams);
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
      expect(transactionService.upsert).toHaveBeenCalledWith(expectedTxnParams2);
    });

    it('should return observable of transactions if orig_currency is undefined in source transactions', () => {
      const mockTxn = cloneDeep(txnData5);
      mockTxn.orig_currency = undefined;
      const mockSplitExpenses = cloneDeep(txnList);
      transactionService.upsert.and.returnValues(of(mockTxn), of(mockTxn));
      splitExpenseService
        .createTxns(mockTxn, mockSplitExpenses, 100, 'txOJVaaPxo9O', 100)
        .subscribe((expectedTxnRes) => {
          expect(expectedTxnRes).toEqual([mockTxn, mockTxn]);
        });

      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledTimes(2);
      expect(transactionService.upsert).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams3,
        'txOJVaaPxo9O',
        0,
        100
      );
      expect(transactionService.upsert).toHaveBeenCalledWith(expectedTxnParams3);
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams4,
        'txOJVaaPxo9O',
        1,
        100
      );
      expect(transactionService.upsert).toHaveBeenCalledWith(expectedTxnParams4);
    });

    it('should return observable of transactions if transactions.source is undefined', () => {
      const mockTxn = cloneDeep(txnData5);
      mockTxn.source = undefined;
      const mockSplitExpenses = cloneDeep(txnList);
      transactionService.upsert.and.returnValues(of(mockTxn), of(mockTxn));
      splitExpenseService
        .createTxns(mockTxn, mockSplitExpenses, 100, 'txOJVaaPxo9O', 100)
        .subscribe((expectedTxnRes) => {
          expect(expectedTxnRes).toEqual([mockTxn, mockTxn]);
        });

      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledTimes(2);
      expect(transactionService.upsert).toHaveBeenCalledTimes(2);
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[0]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams5,
        'txOJVaaPxo9O',
        0,
        100
      );
      expect(transactionService.upsert).toHaveBeenCalledWith(expectedTxnParams5);
      expect(splitExpenseService.setUpSplitExpenseBillable).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setUpSplitExpenseTax).toHaveBeenCalledWith(mockTxn, mockSplitExpenses[1]);
      expect(splitExpenseService.setupSplitExpensePurpose).toHaveBeenCalledWith(
        expectedTxnParams5,
        'txOJVaaPxo9O',
        0,
        100
      );
      expect(transactionService.upsert).toHaveBeenCalledWith(expectedTxnParams5);
    });
  });
});
