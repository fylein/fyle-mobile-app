import { TestBed } from '@angular/core/testing';
import { ApproverReportsService } from './reports.service';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';
import { of } from 'rxjs';

describe('ApproverReportsService', () => {
  let approverReportsService: ApproverReportsService;
  const approverPlatformApiService = jasmine.createSpyObj('ApproverPlatformApiService', ['post']);

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
});
