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
} from 'src/app/core/mock-data/platform-report.data';
import { ReportsQueryParams } from 'src/app/core/models/platform/v1/reports-query-params.model';

describe('SpenderReportsService', () => {
  let spenderReportsService: SpenderReportsService;
  const spenderPlatformV1ApiServiceMock = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SpenderReportsService,
        { provide: PAGINATION_SIZE, useValue: 2 },
        { provide: SpenderPlatformV1ApiService, useValue: spenderPlatformV1ApiServiceMock },
      ],
    });
    spenderReportsService = TestBed.inject(SpenderReportsService);
  });

  it('should be created', () => {
    expect(spenderReportsService).toBeTruthy();
  });

  it('getReportsCount(): should get a count of reports', (done) => {
    // Mock the response of getReportsByParams
    spyOn(spenderReportsService, 'getReportsByParams').and.returnValue(of(platformReportCountData));

    const expectedParams: ReportsQueryParams = {
      ...mockQueryParams,
      limit: 1,
      offset: 0,
    };

    spenderReportsService.getReportsCount(mockQueryParams).subscribe((res) => {
      // Verify
      expect(res).toEqual(4); // Check if the count is as expected
      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith(expectedParams); // Check if the method is called with the expected params
      done(); // Call 'done' to indicate the end of the asynchronous test
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
    };
    const expectedConfig = {
      params: {
        ...queryParams,
      },
    };
    spenderPlatformV1ApiServiceMock.get.and.returnValue(of(allReportsPaginated1));
    spenderReportsService.getReportsByParams(queryParams).subscribe((response) => {
      expect(response).toEqual(allReportsPaginated1);
      expect(spenderPlatformV1ApiServiceMock.get).toHaveBeenCalledOnceWith('/reports', expectedConfig);
      done();
    });
  });
});
