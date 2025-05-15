import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExpenseCommentService } from './expense-comment.service';
import { ApproverService } from './approver.service';
import { StatusService } from '../../../status.service';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { expenseCommentData, expenseCommentData2 } from 'src/app/core/mock-data/expense-comment.data';
import { transformedExpenseComments } from 'src/app/core/test-data/status.service.spec.data';

describe('ExpenseCommentService', () => {
  let service: ExpenseCommentService;
  let approverServiceSpy: jasmine.SpyObj<ApproverService>;
  let statusServiceSpy: jasmine.SpyObj<StatusService>;

  beforeEach(() => {
    approverServiceSpy = jasmine.createSpyObj('ApproverService', ['get', 'post']);
    statusServiceSpy = jasmine.createSpyObj('StatusService', ['transformToExtendedStatus']);

    TestBed.configureTestingModule({
      providers: [
        ExpenseCommentService,
        { provide: ApproverService, useValue: approverServiceSpy },
        { provide: StatusService, useValue: statusServiceSpy },
      ],
    });

    service = TestBed.inject(ExpenseCommentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getExpenseCommentsById', () => {
    it('should call approverService.get and return expense comments', (done) => {
      approverServiceSpy.get.and.returnValue(of({ data: [expenseCommentData] }));

      service.getExpenseCommentsById('txjt6agn0gBY').subscribe((res) => {
        expect(res).toEqual([expenseCommentData]);
        expect(approverServiceSpy.get).toHaveBeenCalledOnceWith('/expenses/comments', {
          params: { expense_id: 'eq.txjt6agn0gBY' },
        });
        done();
      });
    });
  });

  describe('getTransformedComments', () => {
    it('should transform comments using statusService', (done) => {
      approverServiceSpy.get.and.returnValue(of({ data: [expenseCommentData] }));
      statusServiceSpy.transformToExtendedStatus.and.returnValue(transformedExpenseComments[0]);

      service.getTransformedComments('txjt6agn0gBY').subscribe((res) => {
        expect(res.length).toBe(1);
        expect(res[0]).toEqual(transformedExpenseComments[0]);
        expect(statusServiceSpy.transformToExtendedStatus).toHaveBeenCalledWith(expenseCommentData);
        done();
      });
    });
  });

  describe('findLatestExpenseComment', () => {
    it('should return the latest comment by the user', (done) => {
      const mockSortedStatus: ExtendedStatus[] = [
        { ...transformedExpenseComments[0], st_created_at: new Date('2025-01-01') },
        { ...transformedExpenseComments[1], st_created_at: new Date('2025-01-03') },
      ];

      spyOn(service, 'getTransformedComments').and.returnValue(of(mockSortedStatus));

      service.findLatestExpenseComment('txjt6agn0gBY', 'usvMoPfCC9Xw').subscribe((comment) => {
        expect(comment).toBe('Test Comment');
        done();
      });
    });
  });

  describe('sortStatusByDate', () => {
    it('should sort ExtendedStatus array by st_created_at descending', () => {
      const unsorted: ExtendedStatus[] = [
        { ...transformedExpenseComments[0], st_created_at: new Date('2025-01-01') },
        { ...transformedExpenseComments[0], st_created_at: new Date('2025-01-03') },
        { ...transformedExpenseComments[0], st_created_at: new Date('2025-01-02') },
      ];

      const sorted = service.sortStatusByDate(unsorted);
      expect(sorted[0].st_created_at.toISOString()).toBe(new Date('2025-01-03').toISOString());
      expect(sorted[2].st_created_at.toISOString()).toBe(new Date('2025-01-01').toISOString());
    });
  });

  describe('post', () => {
    it('should call approverService.post with correct data', (done) => {
      const payload = [{ expense_id: 'exp1', comment: 'Looks good', notify: true }];

      const mockResponse = { data: [expenseCommentData2] };
      approverServiceSpy.post.and.returnValue(of(mockResponse));

      service.post(payload).subscribe((res) => {
        expect(approverServiceSpy.post).toHaveBeenCalledOnceWith('/expenses/comments/bulk', {
          data: payload,
        });
        expect(res).toEqual(mockResponse.data);
        done();
      });
    });
  });
});
