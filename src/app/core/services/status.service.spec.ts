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
        'services.status.expenseAutomaticallyMerged': 'Expense automatically merged',
        'services.status.expensesMergedToThisExpense': '{{count}} expenses merged to this expense',
        'services.status.expenseMerged': 'Expense merged',
        'services.status.typeReversed': '{{type}} Reversed',
        'services.status.expenseRuleApplied': 'Expense rule applied',
        'services.status.typeCreated': '{{type}} Created',
        'services.status.typeEdited': '{{type}} Edited',
        'services.status.policyViolation': 'Policy violation',
        'services.status.criticalPolicyViolation': 'Critical policy violation found',
        'services.status.expenseAdded': 'Expense added',
        'services.status.receiptAttached': 'Receipt attached',
        'services.status.reportSubmitted': 'Report submitted',
        'services.status.receiptRemoved': 'Receipt removed',
        'services.status.expenseRemoved': 'Expense removed',
        'services.status.reportNameChanged': 'Report name changed',
        'services.status.report': 'Report',
        'services.status.unflagged': 'Unflagged',
        'services.status.flagged': 'Flagged',
        'services.status.failedToRunPolicies': 'Failed to run policies',
        'services.status.verified': 'Verified',
        'services.status.typeSentBack': '{{type}} Sent Back',
        'services.status.approverPending': 'Approver pending',
        'services.status.typeApproved': '{{type}} Approved',
        'services.status.processingPayment': 'Processing payment',
        'services.status.paid': 'Paid',
        'services.status.expenseIssues': 'Expense issues',
        'services.status.policiesRanSuccessfully': 'Policies ran successfully',
        'services.status.cardTransactionMatched': 'Card transaction matched',
        'services.status.expenseUnmatched': 'Expense unmatched',
        'services.status.expenseMatched': 'Expense matched',
        'services.status.duplicateDetected': 'Duplicate detected',
        'services.status.duplicateIssueResolved': 'Duplicate(s) issue resolved',
        'services.status.others': 'Others',
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
});
