import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { StatusService } from './status.service';
import {
  getEstatusApiResponse,
  apiCommentsResponse,
  getApiResponse,
  updateReponseWithFlattenedEStatus,
} from '../test-data/status.service.spec.data';
import { cloneDeep } from 'lodash';
import { TranslocoService } from '@jsverse/transloco';
import { expenseCommentData, expenseCommentData2 } from '../mock-data/expense-comment.data';
import { estatusData1 } from '../test-data/status.service.spec.data';
describe('StatusService', () => {
  let statusService: StatusService;
  let apiService: jasmine.SpyObj<ApiService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  const type = 'transactions';
  const id = 'tx1oTNwgRdRq';

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string, params?: any) => {
      const translations: { [key: string]: string } = {
        'services.status.approverAdded': 'Approver added',
        'services.status.approverPending': 'Approver pending',
        'services.status.approverRemoved': 'Approver removed',
        'services.status.approvalsReset': 'Approvals reset',
        'services.status.cardExpenseMerged': 'Card expense merged',
        'services.status.cardExpenseRemoved': 'Card expense removed',
        'services.status.cardTransactionMatched': 'Card transaction matched',
        'services.status.criticalPolicyViolation': 'Critical policy violation found',
        'services.status.dataExtracted': 'Data extracted',
        'services.status.duplicateDetected': 'Duplicate detected',
        'services.status.duplicateIssueResolved': 'Duplicate(s) issue resolved',
        'services.status.expense': 'Expense',
        'services.status.expenseAdded': 'Expense added',
        'services.status.expenseApproved': 'Expense approved',
        'services.status.expenseAutomaticallyMerged': 'Expense automatically merged',
        'services.status.expenseIssues': 'Expense issues',
        'services.status.expenseMatched': 'Expense matched',
        'services.status.expenseMerged': 'Expense merged',
        'services.status.expenseReconciled': 'Reconciled',
        'services.status.expenseRemoved': 'Expense removed',
        'services.status.expenseReportApproved': 'Expense report approved',
        'services.status.expenseRuleApplied': 'Expense rule applied',
        'services.status.expenseSplit': 'Expense split',
        'services.status.expenseUnlinked': 'Expense unlinked',
        'services.status.expenseUnmatched': 'Expense unmatched',
        'services.status.expenseVerificationUndone': 'Expense verification undone',
        'services.status.expenseVerified': 'Expense verified',
        'services.status.expensesAdded': 'Expense(s) added',
        'services.status.expensesMergedToThisExpense': '{{count}} expenses merged to this expense',
        'services.status.failedToRunPolicies': 'Failed to run policies',
        'services.status.flagged': 'Flagged',
        'services.status.invalidValueRemoved': 'Invalid value removed',
        'services.status.others': 'Others',
        'services.status.paid': 'Paid',
        'services.status.policiesRanSuccessfully': 'Policies ran successfully',
        'services.status.policyCappedAmount': 'Policy capped amount',
        'services.status.policyViolation': 'Policy violation',
        'services.status.policyViolationTriggered': 'Policy violation triggered',
        'services.status.processingPayment': 'Processing payment',
        'services.status.receiptAttached': 'Receipt attached',
        'services.status.receiptRemoved': 'Receipt removed',
        'services.status.reimbursements': 'Reimbursements',
        'services.status.report': 'Report',
        'services.status.reportClosed': 'Report closed',
        'services.status.reportNameChanged': 'Report name changed',
        'services.status.reportSubmitted': 'Report submitted',
        'services.status.typeApproved': '{{type}} approved',
        'services.status.typeCreated': '{{type}} created',
        'services.status.typeEdited': '{{type}} edited',
        'services.status.typeReversed': '{{type}} reversed',
        'services.status.typeSentBack': '{{type}} sent back',
        'services.status.unflagged': 'Unflagged',
        'services.status.verified': 'Verified',
      };

      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params) {
        if (params.count) {
          translation = translation.replace('{{count}}', params.count);
        }
        if (params.type) {
          translation = translation.replace('{{type}}', params.type);
        }
      }

      return translation;
    });

    TestBed.configureTestingModule({
      providers: [
        StatusService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    statusService = TestBed.inject(StatusService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(statusService).toBeTruthy();
  });

  it('should find all estatuses', (done) => {
    const mockGetApiResponse = cloneDeep(getApiResponse);
    apiService.get.and.returnValue(of(mockGetApiResponse));

    statusService.find(type, id).subscribe((res) => {
      expect(res).toEqual(getEstatusApiResponse);
      done();
    });
  });

  it('should return null instead of estatuses', (done) => {
    apiService.get.and.returnValue(of(null));

    statusService.find(type, id).subscribe((res) => {
      expect(res).toBeUndefined();
      done();
    });
  });

  it('should use status map and update the comments accordingly by adding statuses', () => {
    const mockApiCommentsResponse = cloneDeep(apiCommentsResponse);
    const result = statusService.createStatusMap(mockApiCommentsResponse, 'reports');
    expect(result).toEqual(updateReponseWithFlattenedEStatus);
  });

  it('should find and return the latest comment', (done) => {
    const mockGetApiResponse = cloneDeep(getApiResponse);
    apiService.get.and.returnValue(of(mockGetApiResponse));

    const result = statusService.findLatestComment(id, type, 'POLICY');
    result.subscribe((res) => {
      expect(res).toEqual('food expenses are limited to rs 200 only');
      done();
    });
  });

  it('should post a new comment on object type', (done) => {
    const testComment = {
      id: 'stjIdPp8BX8O',
      created_at: new Date('2022-11-17T06:07:38.590Z'),
      org_user_id: 'ouX8dwsbLCLv',
      comment: 'a comment',
      diff: null,
      state: null,
      transaction_id: null,
      report_id: 'rpkpSa8guCuR',
      advance_request_id: null,
    };

    const objectId = 'rpkpSa8guCuR';
    const objectType = 'reports';
    const status = {
      comment: 'a comment',
    };
    apiService.post.and.returnValue(of(testComment));

    statusService.post(objectType, objectId, status).subscribe((res) => {
      expect(res).toEqual(testComment);
      done();
    });
  });

  it('should return "Critical policy violation found" for blocked reports', () => {
    const blockedComment =
      'The policy violation will trigger the following action(s): expense will be flagged for verification and approval, expense could not be added to a report or submitted';
    const result = statusService.getStatusCategory(blockedComment, 'transactions');
    expect(result.category).toBe('Critical policy violation found');
    expect(result.icon).toBe('danger-outline');
  });

  it('should return "Policy violation" for non-blocked policy violations', () => {
    const nonBlockedComment =
      'The policy violation will trigger the following action(s): expense will be flagged for verification and approval';
    const result = statusService.getStatusCategory(nonBlockedComment, 'transactions');
    expect(result.category).toBe('Policy violation');
    expect(result.icon).toBe('danger-outline');
  });

  it('should return "Policy violation triggered" for policy violation triggered comments', () => {
    const comment = 'Policy violation triggered via system';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Policy violation triggered');
    expect(result.icon).toBe('danger-outline');
  });

  it('should return "Approver added" for added as approver comments', () => {
    const comment = 'John Doe john@example.com added as approver by system via policy';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Approver added');
    expect(result.icon).toBe('check');
  });

  it('should return "Approver removed" for removed approver comments', () => {
    const comment = 'Removed approver John Doe john@example.com by system via policy';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Approver removed');
    expect(result.icon).toBe('check');
  });

  it('should return "Receipt attached" for attached to expense comments', () => {
    const comment = 'Receipt.pdf attached to expense by user@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Receipt attached');
    expect(result.icon).toBe('check');
  });

  it('should return "Receipt removed" for removed from expense comments', () => {
    const comment = 'Receipt.pdf removed from expense by user@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Receipt removed');
    expect(result.icon).toBe('check');
  });

  it('should return "Expense removed" for expense removed from report comments', () => {
    const comment = 'Expense removed from report by user@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Expense removed');
    expect(result.icon).toBe('check');
  });

  it('should return "Reimbursements" for expense paid comments', () => {
    const comment = 'Expense paid by John Doe john@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Reimbursements');
    expect(result.icon).toBe('check');
  });

  it('should return "Expense verified" for expense verified comments', () => {
    const comment = 'Expense verified by John Doe john@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Expense verified');
    expect(result.icon).toBe('check');
  });

  it('should return "Expense matched" for matched by comments', () => {
    const comment = 'Expense matched by John Doe john@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Expense matched');
    expect(result.icon).toBe('check');
  });

  it('should return "Card expense removed" for card expense removed comments', () => {
    const comment = 'Card expense removed by user@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Card expense removed');
    expect(result.icon).toBe('check');
  });

  it('should return "Data extracted" for data extracted from receipt comments', () => {
    const comment = 'Data extracted from the receipt by system';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Data extracted');
    expect(result.icon).toBe('check');
  });

  it('should return "Expense unlinked" for expense unlinked comments', () => {
    const comment = 'Expense unlinked by user@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Expense unlinked');
    expect(result.icon).toBe('check');
  });

  it('should return "Expense verification undone" for expense verification undone comments', () => {
    const comment = 'Expense verification undone by system';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Expense verification undone');
    expect(result.icon).toBe('check');
  });

  it('should return "Invalid value removed" for invalid value removed comments', () => {
    const comment = 'Invalid value removed from expense by system';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Invalid value removed');
    expect(result.icon).toBe('check');
  });

  it('should return "Policy capped amount" for expense amount capped comments', () => {
    const comment = 'Expense amount capped by system due to policy';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Policy capped amount');
    expect(result.icon).toBe('danger-outline');
  });

  it('should return "Report closed" for report closed comments', () => {
    const comment = 'Report closed by admin@example.com';
    const result = statusService.getStatusCategory(comment, 'reports');
    expect(result.category).toBe('Report closed');
    expect(result.icon).toBe('check');
  });

  it('should return "Reports approved" for approved by admin comments', () => {
    const comment = 'Expense report approved by admin';
    const result = statusService.getStatusCategory(comment, 'reports');
    expect(result.category).toBe('Reports approved');
    expect(result.icon).toBe('check');
  });

  it('should return "Reconciled" for expense was reconciled comments', () => {
    const comment = 'Expense was reconciled by system';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Reconciled');
    expect(result.icon).toBe('check');
  });

  it('should sort statuses when dateA is less than or equal to dateB', () => {
    const mockEstatusData = cloneDeep(estatusData1);
    const result = statusService.sortStatusByDate(mockEstatusData);
    expect(result[0].st_comment).toBe('food expenses are limited to rs 200 only');
    expect(result[2].st_comment).toBe('created by Abhishek (ajain@fyle.in)');
  });

  it('should transform expense comment to extended status', () => {
    const result = statusService.transformToExtendedStatus(expenseCommentData);

    expect(result.st_id).toBe('stNj1KHeiNIb');
    expect(result.st_org_user_id).toBe('usvMoPfCC9Xw');
    expect(result.st_comment).toBe('comment add');
    expect(result.st_diff).toBeNull();
    expect(result.us_full_name).toBe('Devendra Rana G');
    expect(result.us_email).toBe('devendra.r@fyle.in');
  });

  it('should transform expense comment to extended status with creator_type fallback when creator_user_id is null', () => {
    const result = statusService.transformToExtendedStatus(expenseCommentData2);

    expect(result.st_id).toBe('stIdwUZhp7xB');
    expect(result.st_org_user_id).toBe('SYSTEM');
    expect(result.st_comment).toBe('System has auto-filled expense field(s)');
    expect(result.st_diff).toEqual({ Amount: 5.72, Category: 'Office Supplies', Merchant: 'Enroll' });
    expect(result.us_full_name).toBeNull();
    expect(result.us_email).toBeNull();
  });

  it('should return "Expense merged" for generic merged comments', () => {
    const comment = 'Expense merged by user@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Expense merged');
    expect(result.icon).toBe('check');
  });

  it('should return "Card expense merged" for expense merged automatically comments', () => {
    const comment = 'Expense merged automatically by system';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Card expense merged');
    expect(result.icon).toBe('check');
  });

  it('should return "Expense(s) added" for expense(s) added to report comments', () => {
    const comment = 'expense(s) added to report by user@example.com';
    const result = statusService.getStatusCategory(comment, 'reports');
    expect(result.category).toBe('Expense(s) added');
    expect(result.icon).toBe('check');
  });

  it('should return "Report name changed" for name was changed from comments', () => {
    const comment = 'Report name was changed from "Old Name" to "New Name"';
    const result = statusService.getStatusCategory(comment, 'reports');
    expect(result.category).toBe('Report name changed');
    expect(result.icon).toBe('check');
  });

  it('should return "Unflagged" for unflagged comments', () => {
    const comment = 'Expense unflagged by user@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Unflagged');
    expect(result.icon).toBe('check');
  });

  it('should return "Flagged" for flagged comments', () => {
    const comment = 'Expense flagged by system';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Flagged');
    expect(result.icon).toBe('danger-outline');
  });

  it('should return "Expense split" for expense split comments', () => {
    const comment = 'Expense split by user@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Expense split');
    expect(result.icon).toBe('check');
  });

  it('should return "Verified" for generic verified comments', () => {
    const comment = 'Report verified by admin@example.com';
    const result = statusService.getStatusCategory(comment, 'reports');
    expect(result.category).toBe('Verified');
    expect(result.icon).toBe('check');
  });

  it('should return "Approvals reset" for approvals reset comments', () => {
    const comment = 'Approvals reset by admin@example.com';
    const result = statusService.getStatusCategory(comment, 'reports');
    expect(result.category).toBe('Approvals reset');
    expect(result.icon).toBe('check');
  });

  it('should return "Policies ran successfully" for policies ran successfully comments', () => {
    const comment = 'Policies ran successfully on this expense';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Policies ran successfully');
    expect(result.icon).toBe('check');
  });

  it('should return "Card transaction matched" for auto-matched by comments', () => {
    const comment = 'Expense auto-matched by system';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Card transaction matched');
    expect(result.icon).toBe('check');
  });

  it('should return "Expense unmatched" for unmatched by comments', () => {
    const comment = 'Expense unmatched by user@example.com';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Expense unmatched');
    expect(result.icon).toBe('check');
  });

  it('should return "Approver pending" for approver_pending comments', () => {
    const comment = 'approver_pending status set by system';
    const result = statusService.getStatusCategory(comment, 'reports');
    expect(result.category).toBe('Approver pending');
    expect(result.icon).toBe('check');
  });

  it('should return "Processing payment" for payment_processing comments', () => {
    const comment = 'payment_processing status set by system';
    const result = statusService.getStatusCategory(comment, 'reports');
    expect(result.category).toBe('Processing payment');
    expect(result.icon).toBe('check');
  });

  it('should return "Expense issues" for expense issues comments', () => {
    const comment = 'Expense issues detected by system';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Expense issues');
    expect(result.icon).toBe('danger-outline');
  });

  it('should return "Duplicate detected" for expense is a possible duplicate comments', () => {
    const comment = 'This expense is a possible duplicate of another expense';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Duplicate detected');
    expect(result.icon).toBe('danger-outline');
  });

  it('should return "Duplicate(s) issue resolved" for duplicate expense(s) with similar details comments', () => {
    const comment = 'duplicate expense(s) with similar details have been resolved';
    const result = statusService.getStatusCategory(comment, 'transactions');
    expect(result.category).toBe('Duplicate(s) issue resolved');
    expect(result.icon).toBe('check');
  });
});
