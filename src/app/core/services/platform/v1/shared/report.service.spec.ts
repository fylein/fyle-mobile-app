import { TestBed } from '@angular/core/testing';
import { PlatformReportService } from './report.service';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import {
  allReportsPaginated1,
  expectedReportsPaginated,
  allReportsPaginated2,
  platformReportCountRes,
  expectedReportsSinglePage,
} from 'src/app/core/mock-data/platform-report.data';
import { ReportPlatformParams } from 'src/app/core/models/platform/v1/reports-query-params.model';

describe('PlatformReportService', () => {
  let platformReportService: PlatformReportService;
  const spenderPlatformV1ApiServiceMock = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlatformReportService,
        { provide: PAGINATION_SIZE, useValue: 2 },
        { provide: SpenderPlatformV1ApiService, useValue: spenderPlatformV1ApiServiceMock },
      ],
    });
    platformReportService = TestBed.inject(PlatformReportService);
  });

  it('should be created', () => {
    expect(platformReportService).toBeTruthy();
  });

  it('getReportsCount(): should get a count of reports', (done) => {
    // Mock the response of getReportsByParams
    spyOn(platformReportService, 'getReportsByParams').and.returnValue(of(platformReportCountRes));

    const expectedParams = {
      state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
    };

    platformReportService.getReportsCount(expectedParams).subscribe((res) => {
      // Verify
      expect(res).toEqual(4); // Check if the count is as expected
      expect(platformReportService.getReportsByParams).toHaveBeenCalledWith(expectedParams); // Check if the method is called with the expected params
      done(); // Call 'done' to indicate the end of the asynchronous test
    });
  });

  it('getAllReportsByParams(): should get all reports multiple pages', (done) => {
    const getReportsByParams = spyOn(platformReportService, 'getReportsByParams');
    spyOn(platformReportService, 'getReportsCount').and.returnValue(of(4));

    const expectedParams: ReportPlatformParams = {
      state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
    };

    getReportsByParams.withArgs(expectedParams, 0, 2).and.returnValue(of(allReportsPaginated1));
    getReportsByParams.withArgs(expectedParams, 2, 2).and.returnValue(of(allReportsPaginated2));

    platformReportService.getAllReportsByParams(expectedParams).subscribe((res) => {
      expect(res).toEqual(expectedReportsPaginated);
      expect(platformReportService.getReportsCount).toHaveBeenCalledTimes(1);
      expect(getReportsByParams).toHaveBeenCalledWith(expectedParams, 0, 2);
      expect(getReportsByParams).toHaveBeenCalledWith(expectedParams, 2, 2);
      expect(getReportsByParams).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('getAllReportsByParams(): should get all reports single page', (done) => {
    const getReportsByParams = spyOn(platformReportService, 'getReportsByParams');
    spyOn(platformReportService, 'getReportsCount').and.returnValue(of(1));

    const expectedParams: ReportPlatformParams = {
      state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
    };

    getReportsByParams.withArgs(expectedParams, 0, 2).and.returnValue(of(allReportsPaginated1));

    platformReportService.getAllReportsByParams(expectedParams).subscribe((res) => {
      expect(res).toEqual(expectedReportsSinglePage);
      expect(platformReportService.getReportsCount).toHaveBeenCalledTimes(1);
      expect(getReportsByParams).toHaveBeenCalledWith(expectedParams, 0, 2);
      expect(getReportsByParams).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getReportsByParams()', () => {
    it('should get reports with specified parameters', (done) => {
      const queryParams = {
        state: 'DRAFT',
      };
      const expectedConfig = {
        params: {
          ...queryParams,
          offset: 0,
          limit: 2,
        },
      };
      spenderPlatformV1ApiServiceMock.get.and.returnValue(of(allReportsPaginated1));
      platformReportService.getReportsByParams(queryParams, 0, 2).subscribe((response) => {
        expect(response).toEqual(allReportsPaginated1);
        expect(spenderPlatformV1ApiServiceMock.get).toHaveBeenCalledWith('/reports', expectedConfig);
        done();
      });
    });

    it('should use default limit =1  and offset =0', (done) => {
      const queryParams = {
        state: 'DRAFT',
      };
      const expectedConfig = {
        params: {
          ...queryParams,
          offset: 0,
          limit: 1,
        },
      };
      spenderPlatformV1ApiServiceMock.get.and.returnValue(of(allReportsPaginated1));
      platformReportService.getReportsByParams(queryParams).subscribe((response) => {
        expect(spenderPlatformV1ApiServiceMock.get).toHaveBeenCalledWith('/reports', expectedConfig);
        done();
      });
    });
  });
});
