import { TestBed } from '@angular/core/testing';
import { ApproverReportsService } from './reports.service';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';

describe('ApproverReportsService', () => {
  let approverReportsService: ApproverReportsService;
  const approverPlatformApiService = jasmine.createSpyObj('ApproverPlatformApiService', ['get']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApproverReportsService,
        { provide: ApproverPlatformApiService, useValue: approverPlatformApiService },
      ],
    });
    approverReportsService = TestBed.inject(ApproverReportsService);
  });

  it('should be created', () => {
    expect(approverReportsService).toBeTruthy();
  });
});
