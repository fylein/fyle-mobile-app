import { TestBed } from '@angular/core/testing';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import { reportAllowedActionsResponse } from '../mock-data/allowed-actions.data';
import { orgSettingsRes } from '../mock-data/org-settings.data';
import { apiReportAutoSubmissionDetails } from '../mock-data/report-auto-submission-details.data';
import { LaunchDarklyService } from './launch-darkly.service';
import { PermissionsService } from './permissions.service';
import { ReportService } from './report.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';
import { platformReportData } from '../mock-data/platform-report.data';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { cloneDeep } from 'lodash';
import { TranslocoService } from '@jsverse/transloco';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
describe('ReportService', () => {
  let reportService: ReportService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let approverPlatformApiService: jasmine.SpyObj<ApproverPlatformApiService>;
  let permissionsService: jasmine.SpyObj<PermissionsService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['clearCache']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventServive', ['clearTaskCache', 'onLogout']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformService', ['post']);
    const approverPlatformApiServiceSpy = jasmine.createSpyObj('ApproverPlatformApiService', ['post']);
    const permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['allowedActions']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Configure the translate spy to return expected values
    translocoServiceSpy.translate.and.callFake((key: string, params?: any) => {
      const translations: { [key: string]: string } = {
        'services.report.automaticSubmissionOnDate': '(Automatic Submission On {date})',
      };

      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && params.date) {
        translation = translation.replace('{date}', params.date);
      }

      return translation;
    });

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        ReportService,
        DatePipe,
        LaunchDarklyService,
        {
            provide: TransactionService,
            useValue: transactionServiceSpy,
        },
        {
            provide: UserEventService,
            useValue: userEventServiceSpy,
        },
        {
            provide: SpenderPlatformV1ApiService,
            useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
            provide: ApproverPlatformApiService,
            useValue: approverPlatformApiServiceSpy,
        },
        {
            provide: PermissionsService,
            useValue: permissionsServiceSpy,
        },
        {
            provide: PAGINATION_SIZE,
            useValue: 2,
        },
        {
            provide: TranslocoService,
            useValue: translocoServiceSpy,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    reportService = TestBed.inject(ReportService);
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    approverPlatformApiService = TestBed.inject(
      ApproverPlatformApiService
    ) as jasmine.SpyObj<ApproverPlatformApiService>;
    permissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(reportService).toBeTruthy();
  });

  it('clearCache(): should clear cache', (done) => {
    reportService.clearCache().subscribe((res) => {
      expect(res).toBeNull();
      done();
    });
  });

  it('clearTransactionCache(): should clear transaction cache', (done) => {
    transactionService.clearCache.and.returnValue(of(null));

    reportService.clearTransactionCache().subscribe(() => {
      expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getAutoSubmissionReportName()', () => {
    it('should get auto submitted report name', (done) => {
      spyOn(reportService, 'getReportAutoSubmissionDetails').and.returnValue(of(apiReportAutoSubmissionDetails));

      reportService.getAutoSubmissionReportName().subscribe((res) => {
        expect(res).toEqual('(Automatic Submission On Feb 1)');
        expect(reportService.getReportAutoSubmissionDetails).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return null if auto submission is not scheduled', (done) => {
      spyOn(reportService, 'getReportAutoSubmissionDetails').and.returnValue(of({ data: null }));

      reportService.getAutoSubmissionReportName().subscribe((res) => {
        expect(res).toBeNull();
        expect(reportService.getReportAutoSubmissionDetails).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('getReportAutoSubmissionDetails():', () => {
    it('should get submission details', (done) => {
      const mockApiReportAutoSubmissionDetails = cloneDeep(apiReportAutoSubmissionDetails);
      spenderPlatformV1ApiService.post.and.returnValue(of(mockApiReportAutoSubmissionDetails));

      reportService.getReportAutoSubmissionDetails().subscribe((res) => {
        expect(res).toEqual({
          data: {
            next_at: new Date('2023-02-01T00:00:00.000000'),
          },
        });
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/automations/report_submissions/next_at', {
          data: null,
        });
        done();
      });
    });
  });

  it('updateReportPurpose(): should update the report purpose', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(platformReportData));
    reportService.updateReportPurpose(platformReportData).subscribe((res) => {
      expect(res).toEqual(platformReportData);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports', {
        data: {
          id: 'rpMvN0P10l6F',
          source: 'WEBAPP',
          purpose: '#3:  Jul 2023 - Office expense',
        },
      });
      done();
    });
  });

  it('approverUpdateReportPurpose(): should update the report purpose for approver', (done) => {
    approverPlatformApiService.post.and.returnValue(of(platformReportData));
    reportService.approverUpdateReportPurpose(platformReportData).subscribe((res) => {
      expect(res).toEqual(platformReportData);
      expect(approverPlatformApiService.post).toHaveBeenCalledOnceWith('/reports', {
        data: {
          id: 'rpMvN0P10l6F',
          source: 'WEBAPP',
          purpose: '#3:  Jul 2023 - Office expense',
        },
      });
      done();
    });
  });

  describe('getReportPermissions()', () => {
    it('should get report permissions', (done) => {
      permissionsService.allowedActions.and.returnValue(of(reportAllowedActionsResponse));
      reportService.getReportPermissions(orgSettingsRes).subscribe((res) => {
        expect(res).toEqual(reportAllowedActionsResponse);
        expect(permissionsService.allowedActions).toHaveBeenCalledOnceWith(
          'reports',
          ['approve', 'create', 'delete'],
          orgSettingsRes
        );
        done();
      });
    });
  });
});
