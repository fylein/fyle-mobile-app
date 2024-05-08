import { TestBed } from '@angular/core/testing';
import { ApproverReportsService } from './reports.service';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import {
  allReportsPaginated1,
  allReportsPaginated2,
  expectedReportsPaginated,
  expectedReportsSinglePage,
  mockQueryParams,
  mockQueryParamsForCount,
  platformReportCountData,
} from 'src/app/core/mock-data/platform-report.data';
import { ReportsQueryParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { StatsResponse } from 'src/app/core/models/platform/v1/stats-response.model';
import { expectedReportStats } from 'src/app/core/mock-data/report-stats.data';
import { ReportState } from '../../../../models/platform/v1/report.model';

describe('ApproverReportsService', () => {
  let approverReportsService: ApproverReportsService;
  let approverPlatformApiService: jasmine.SpyObj<ApproverPlatformApiService>;

  beforeEach(() => {
    const approverPlatformApiServiceSpy = jasmine.createSpyObj('ApproverPlatformApiService', ['post', 'get']);
    TestBed.configureTestingModule({
      providers: [
        ApproverReportsService,
        { provide: PAGINATION_SIZE, useValue: 2 },
        { provide: ApproverPlatformApiService, useValue: approverPlatformApiServiceSpy },
      ],
    });
    approverReportsService = TestBed.inject(ApproverReportsService);
    approverPlatformApiService = TestBed.inject(
      ApproverPlatformApiService
    ) as jasmine.SpyObj<ApproverPlatformApiService>;
  });

  it('should be created', () => {
    expect(approverReportsService).toBeTruthy();
  });

  it('ejectExpenses(): should remove a transaction from a report', (done) => {
    approverPlatformApiService.post.and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';
    const txns = ['txTQVBx7W8EO'];

    const payload = {
      data: {
        id: reportID,
        expense_ids: txns,
      },
      reason: undefined,
    };
    approverReportsService.ejectExpenses(reportID, txns[0]).subscribe(() => {
      expect(approverPlatformApiService.post).toHaveBeenCalledOnceWith('/reports/eject_expenses', payload);
      done();
    });
  });

  it('generateStatsQueryParams(): should generate stats query params', () => {
    const queryParams = {
      state: `eq.${ReportState.DRAFT}`,
    };

    const result = approverReportsService.generateStatsQueryParams(queryParams);
    expect(result).toEqual('state=eq.DRAFT');
  });

  it('getReportsCount(): should get a count of reports', (done) => {
    // Mock the response of getReportsByParams
    spyOn(approverReportsService, 'getReportsByParams').and.returnValue(of(platformReportCountData));

    const expectedParams: ReportsQueryParams = {
      ...mockQueryParamsForCount,
      limit: 1,
      offset: 0,
    };

    approverReportsService.getReportsCount(mockQueryParams).subscribe((res) => {
      // Verify
      expect(res).toEqual(4); // Check if the count is as expected
      expect(approverReportsService.getReportsByParams).toHaveBeenCalledWith(expectedParams); // Check if the method is called with the expected params
      done(); // Call 'done' to indicate the end of the asynchronous test
    });
  });

  it('getAllReportsByParams(): should get all reports multiple pages', (done) => {
    const getReportsByParams = spyOn(approverReportsService, 'getReportsByParams');
    spyOn(approverReportsService, 'getReportsCount').and.returnValue(of(4));

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

    approverReportsService.getAllReportsByParams(mockQueryParams).subscribe((res) => {
      expect(res).toEqual(expectedReportsPaginated);
      expect(approverReportsService.getReportsCount).toHaveBeenCalledOnceWith({
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
    const getReportsByParams = spyOn(approverReportsService, 'getReportsByParams');
    spyOn(approverReportsService, 'getReportsCount').and.returnValue(of(1));

    const expectedParams: ReportsQueryParams = {
      ...mockQueryParams,
      offset: 0,
      limit: 2,
    };

    getReportsByParams.withArgs(expectedParams).and.returnValue(of(allReportsPaginated1));

    approverReportsService.getAllReportsByParams(mockQueryParams).subscribe((res) => {
      expect(res).toEqual(expectedReportsSinglePage);
      expect(approverReportsService.getReportsCount).toHaveBeenCalledOnceWith(mockQueryParams);
      expect(getReportsByParams).toHaveBeenCalledOnceWith(expectedParams);
      done();
    });
  });

  it('should get reports with specified parameters', (done) => {
    const queryParams = {
      state: 'DRAFT',
      offset: 0,
      limit: 2,
    };
    const expectedConfig = {
      params: {
        ...queryParams,
      },
    };
    approverPlatformApiService.get.and.returnValue(of(allReportsPaginated1));
    approverReportsService.getReportsByParams(queryParams).subscribe((response) => {
      expect(response).toEqual(allReportsPaginated1);
      expect(approverPlatformApiService.get).toHaveBeenCalledOnceWith('/reports', expectedConfig);
      done();
    });
  });

  it('getReportById(): should get a report by id', () => {
    spyOn(approverReportsService, 'getReportsByParams').and.returnValue(of(allReportsPaginated1));
    const queryParams = {
      id: 'eq.rpvcIMRMyM3A',
    };
    approverReportsService.getReportById('rpvcIMRMyM3A').subscribe((res) => {
      expect(res).toEqual(allReportsPaginated1.data[0]);
      expect(approverReportsService.getReportsByParams).toHaveBeenCalledOnceWith(queryParams);
    });
  });

  it('getReportsStats(): should get advance request stats', (done) => {
    approverPlatformApiService.post.and.returnValue(of({ data: expectedReportStats.draft }));

    const params = {
      state: `eq.${ReportState.DRAFT}`,
    };

    approverReportsService.getReportsStats(params).subscribe((res) => {
      expect(res).toEqual(expectedReportStats.draft);
      expect(approverPlatformApiService.post).toHaveBeenCalledOnceWith('/reports/stats', {
        data: {
          query_params: `state=${params.state}`,
        },
      });
      done();
    });
  });
});
