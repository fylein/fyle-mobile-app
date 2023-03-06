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
  sourceTxn3,
} from '../mock-data/transaction.data';
import { of } from 'rxjs';
import { splitExpFileObj, splitExpFile2, splitExpFile3 } from '../mock-data/file-object.data';
import { fileTxns } from '../mock-data/file-txn.data';
import { splitExpensePolicyExp } from '../mock-data/platform-policy-expense.data';
import { splitExpPolicyData } from '../mock-data/expense-policy.data';
import { splitPolicyExp } from '../mock-data/public-policy-expense.data';
import { policyViolation1, policyViolationData3, policyVoilationData2 } from '../mock-data/policy-violation.data';
import { splitExpData } from '../mock-data/expense.data';
import { formattedTxnViolations } from '../mock-data/formatted-policy-violation.data';
import { txnStatusData, txnStatusData1, txnStatusData2 } from '../mock-data/transaction-status.data';
import { violationComment1, violationComment2, violationComment3 } from '../mock-data/policy-violcation-comment.data';
import { criticalPolicyViolation1, criticalPolicyViolation2 } from '../mock-data/crtical-policy-violations.data';

describe('SplitExpenseService', () => {
  let splitExpenseService: SplitExpenseService;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let fileService: jasmine.SpyObj<FileService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;

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
      ],
    });

    splitExpenseService = TestBed.inject(SplitExpenseService);
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
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

  it('formatDisplayName(): should get display name from list of categories', () => {
    categoriesService.filterByOrgCategoryId.and.returnValue(transformedOrgCategories[0]);
    const model = 141295;

    expect(splitExpenseService.formatDisplayName(model, transformedOrgCategories)).toEqual(
      transformedOrgCategories[0].displayName
    );
    expect(categoriesService.filterByOrgCategoryId).toHaveBeenCalledOnceWith(model, transformedOrgCategories);
  });

  it('setupSplitExpensePurpose(): should modify split expense purpose', () => {
    const splitGroupId = 'txfwF576rExp';
    const index = 0;
    const numberOfTxn = 2;

    //@ts-ignore
    splitExpenseService.setupSplitExpensePurpose(splitPurposeTxn, splitGroupId, index, numberOfTxn);
    expect(splitPurposeTxn.purpose).toEqual('test_term (1) (1)');
  });

  it('setUpSplitExpenseBillable(): setup expense billable amount', () => {
    //@ts-ignore
    expect(splitExpenseService.setUpSplitExpenseBillable(sourceSplitTxn, splitTxn)).toEqual(splitTxn.billable);
  });

  it('setUpSplitExpenseTax(): setup expense tax', () => {
    //@ts-ignore
    expect(splitExpenseService.setUpSplitExpenseTax(sourceSplitTxn, splitTxn)).toEqual(splitTxn.tax_amount);
  });

  it('createSplitTxns(): should create split transaction', (done) => {
    spyOn(splitExpenseService, 'createTxns').and.returnValue(of(splitTxns));

    splitExpenseService.createSplitTxns(sourceTxn2, sourceTxn2.amount, splitTxns).subscribe((res) => {
      expect(res).toEqual(splitTxns);
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

  it('mapViolationDataWithEtxn(): should map violation data with expenses', () => {
    const formatDisplayNameSpy = spyOn(splitExpenseService, 'formatDisplayName');
    formatDisplayNameSpy.and.returnValue('Food');
    formatDisplayNameSpy.and.returnValue('Food / Travelling - Inland');
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
});
