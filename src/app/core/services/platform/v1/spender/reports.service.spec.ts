import { TestBed } from '@angular/core/testing';
import { SpenderReportsService } from './reports.service';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import {
  allReportsPaginated1,
  expectedReportsPaginated,
  allReportsPaginated2,
  platformReportCountData,
  expectedReportsSinglePage,
  mockQueryParams,
  mockQueryParamsForCount,
  platformReportData,
  reportExportResponse,
} from 'src/app/core/mock-data/platform-report.data';
import { ReportsQueryParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { expectedReportStats } from 'src/app/core/mock-data/report-stats.data';
import { UserEventService } from '../../../user-event.service';
import { TransactionService } from '../../../transaction.service';
import { apiReportPermissions } from 'src/app/core/mock-data/report-permissions.data';
import { Comment } from 'src/app/core/models/platform/v1/comment.model';
import { exportPayload } from 'src/app/core/mock-data/export-payload.data';

describe('SpenderReportsService', () => {
  let spenderReportsService: SpenderReportsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let transactionService: jasmine.SpyObj<TransactionService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventServive', ['clearTaskCache']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['clearCache']);
    TestBed.configureTestingModule({
      providers: [
        SpenderReportsService,
        { provide: PAGINATION_SIZE, useValue: 2 },
        { provide: SpenderPlatformV1ApiService, useValue: spenderPlatformV1ApiServiceSpy },
        { provide: UserEventService, useValue: userEventServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
      ],
    });
    spenderReportsService = TestBed.inject(SpenderReportsService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    spyOn(spenderReportsService, 'clearTransactionCache').and.returnValue(of(null));
  });

  it('should be created', () => {
    expect(spenderReportsService).toBeTruthy();
  });

  it('getReportsCount(): should get a count of reports', (done) => {
    // Mock the response of getReportsByParams
    spyOn(spenderReportsService, 'getReportsByParams').and.returnValue(of(platformReportCountData));

    const expectedParams: ReportsQueryParams = {
      ...mockQueryParamsForCount,
      limit: 1,
      offset: 0,
    };

    spenderReportsService.getReportsCount(mockQueryParamsForCount).subscribe((res) => {
      // Verify
      expect(res).toEqual(4); // Check if the count is as expected
      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith(expectedParams); // Check if the method is called with the expected params
      done(); // Call 'done' to indicate the end of the asynchronous test
    });
  });

  it('permissions(): should get report permissions', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: apiReportPermissions }));

    const id = 'rpxtbiLXQZUm';

    spenderReportsService.permissions(id).subscribe((res) => {
      expect(res).toEqual(apiReportPermissions);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports/permissions', { data: { id } });
      done();
    });
  });

  it('suggestPurpose(): should get the purpose of the report', (done) => {
    const reportData = { data: { purpose: ' #7:  Jan 2023' } };
    spenderPlatformV1ApiService.post.and.returnValue(of(reportData));

    spenderReportsService.suggestPurpose([]).subscribe((res) => {
      expect(res).toEqual(reportData.data.purpose);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports/suggest_purpose', {
        data: { expense_ids: [] },
      });
      done();
    });
  });

  it('create(): should create a new report', (done) => {
    spyOn(spenderReportsService, 'createDraft').and.returnValue(of(expectedReportsSinglePage[0]));
    spenderPlatformV1ApiService.post.and.returnValue(of(null));
    spyOn(spenderReportsService, 'submit').and.returnValue(of(null));

    const reportPurpose = {
      purpose: 'A new report',
      source: 'MOBILE',
    };
    const expenseIds = ['tx6Oe6FaYDZl'];
    const reportID = 'rprAfNrce73O';
    const payload = {
      data: {
        id: reportID,
        expense_ids: expenseIds,
      },
    };

    spenderReportsService.create(reportPurpose, expenseIds).subscribe((res) => {
      expect(res).toEqual(expectedReportsSinglePage[0]);
      expect(spenderReportsService.createDraft).toHaveBeenCalledOnceWith({ data: reportPurpose });
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports/add_expenses', payload);
      expect(spenderReportsService.submit).toHaveBeenCalledOnceWith(reportID);
      done();
    });
  });

  it('submit(): should submit a report', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';

    spenderReportsService.submit(reportID).subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith(`/reports/submit`, { data: { id: reportID } });
      done();
    });
  });

  it('delete(): should delete a report', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(null));

    const id = 'rpShFuVCUIXk';
    spenderReportsService.delete(id).subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith(`/reports/delete/bulk`, { data: [{ id }] });
      done();
    });
  });

  it('export(): should export a report PDF', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(reportExportResponse));

    const id = 'rpShFuVCUIXk';
    const email = 'aastha.b@fyle.in';
    spenderReportsService.export(id, email).subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith(`/reports/exports`, { data: exportPayload });
      done();
    });
  });

  it('resubmit(): should resubmit a report', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';

    spenderReportsService.resubmit(reportID).subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith(`/reports/resubmit`, {
        data: { id: reportID },
      });
      done();
    });
  });

  it('postComment(): should add a comment', (done) => {
    const expectedCommentData: Comment = platformReportData.comments[0];
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: expectedCommentData }));

    const id = 'rpxtbiLXQZUm';

    spenderReportsService.postComment(id, 'comment').subscribe((res) => {
      expect(res).toEqual(expectedCommentData);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports/comments', {
        data: { id, comment: 'comment' },
      });
      done();
    });
  });

  it('getAllReportsByParams(): should get all reports multiple pages', (done) => {
    const getReportsByParams = spyOn(spenderReportsService, 'getReportsByParams');
    spyOn(spenderReportsService, 'getReportsCount').and.returnValue(of(4));

    const expectedParams1: ReportsQueryParams = {
      ...mockQueryParams,
      limit: 2,
      offset: 0,
    };
    const expectedParams2: ReportsQueryParams = {
      ...mockQueryParams,
      limit: 2,
      offset: 2,
    };

    getReportsByParams.withArgs(expectedParams1).and.returnValue(of(allReportsPaginated1));
    getReportsByParams.withArgs(expectedParams2).and.returnValue(of(allReportsPaginated2));

    spenderReportsService.getAllReportsByParams(mockQueryParams).subscribe((res) => {
      expect(res).toEqual(expectedReportsPaginated);
      expect(spenderReportsService.getReportsCount).toHaveBeenCalledOnceWith({
        state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        order: 'created_at.desc,id.desc',
      });
      expect(getReportsByParams).toHaveBeenCalledWith(expectedParams1);
      expect(getReportsByParams).toHaveBeenCalledWith(expectedParams2);
      expect(getReportsByParams).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('getAllReportsByParams(): should get all reports single page', (done) => {
    const getReportsByParams = spyOn(spenderReportsService, 'getReportsByParams');
    spyOn(spenderReportsService, 'getReportsCount').and.returnValue(of(1));

    const expectedParams: ReportsQueryParams = {
      ...mockQueryParams,
      offset: 0,
      limit: 2,
      order: 'created_at.desc,id.desc',
    };

    getReportsByParams.withArgs(expectedParams).and.returnValue(of(allReportsPaginated1));

    spenderReportsService.getAllReportsByParams(mockQueryParams).subscribe((res) => {
      expect(res).toEqual(expectedReportsSinglePage);
      expect(spenderReportsService.getReportsCount).toHaveBeenCalledOnceWith(mockQueryParams);
      expect(getReportsByParams).toHaveBeenCalledOnceWith(expectedParams);
      done();
    });
  });

  it('should get reports with specified parameters', (done) => {
    const queryParams = {
      state: 'DRAFT',
      offset: 0,
      limit: 2,
      order: 'created_at.desc,id.desc',
    };
    const expectedConfig = {
      params: {
        ...queryParams,
      },
    };
    spenderPlatformV1ApiService.get.and.returnValue(of(allReportsPaginated1));
    spenderReportsService.getReportsByParams(queryParams).subscribe((response) => {
      expect(response).toEqual(allReportsPaginated1);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/reports', expectedConfig);
      done();
    });
  });

  it('addExpenses(): should add an expense to a report', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';
    const txns = ['txTQVBx7W8EO'];

    const payload = {
      data: {
        id: reportID,
        expense_ids: txns,
      },
    };
    spenderReportsService.addExpenses(reportID, txns).subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports/add_expenses', payload);
      expect(spenderReportsService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getReportById(): should get a report by id', () => {
    spyOn(spenderReportsService, 'getReportsByParams').and.returnValue(of(allReportsPaginated1));
    const queryParams = {
      id: 'eq.rpvcIMRMyM3A',
    };
    spenderReportsService.getReportById('rpvcIMRMyM3A').subscribe((res) => {
      expect(res).toEqual(allReportsPaginated1.data[0]);
      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledOnceWith(queryParams);
    });
  });

  it('getReportsStats(): should get advance request stats', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: expectedReportStats.draft }));

    const params = {
      state: 'eq.DRAFT',
    };

    spenderReportsService.getReportsStats(params).subscribe((res) => {
      expect(res).toEqual(expectedReportStats.draft);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports/stats', {
        data: {
          query_params: `state=${params.state}`,
        },
      });
      done();
    });
  });

  it('getReportById(): should get a report by id', () => {
    spyOn(spenderReportsService, 'getReportsByParams').and.returnValue(of(allReportsPaginated1));
    const queryParams = {
      id: 'eq.rpvcIMRMyM3A',
    };
    spenderReportsService.getReportById('rpvcIMRMyM3A').subscribe((res) => {
      expect(res).toEqual(allReportsPaginated1.data[0]);
      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledOnceWith(queryParams);
    });
  });

  it('ejectExpenses(): should remove an expense from a report', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';
    const txns = ['txTQVBx7W8EO'];

    const payload = {
      data: {
        id: reportID,
        expense_ids: txns,
      },
      reason: undefined,
    };
    spenderReportsService.ejectExpenses(reportID, txns[0]).subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports/eject_expenses', payload);
      expect(spenderReportsService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('createDraft(): should create a draft report and return the report', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: allReportsPaginated1.data[0] }));

    const reportParam = {
      data: {
        purpose: 'A draft Report',
        source: 'MOBILE',
      },
    };

    spenderReportsService.createDraft(reportParam).subscribe((res) => {
      expect(res).toEqual(allReportsPaginated1.data[0]);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports', reportParam);
      expect(spenderReportsService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
