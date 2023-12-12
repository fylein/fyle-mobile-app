import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { HandleDuplicatesService } from './handle-duplicates.service';
import { of } from 'rxjs';
import { handleDuplicatesDataResponse } from '../mock-data/handle-duplicates.service.data';

describe('HandleDuplicatesService', () => {
  let handleDuplicatesService: HandleDuplicatesService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        HandleDuplicatesService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
      ],
    });
    handleDuplicatesService = TestBed.inject(HandleDuplicatesService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(handleDuplicatesService).toBeTruthy();
  });

  it('getDuplicateSets() : should get all the duplicate sets', (done) => {
    apiService.get.and.returnValue(of(handleDuplicatesDataResponse));
    handleDuplicatesService.getDuplicateSets().subscribe((res) => {
      expect(handleDuplicatesDataResponse).toEqual(res);
      expect(apiService.get).toHaveBeenCalledOnceWith('/transactions/duplicates/sets');
      done();
    });
  });

  it('getDuplicatesByExpense() : should get the duplicates by expense', (done) => {
    const txnId = 'txaiCW1efU0n';
    apiService.get.and.returnValue(of(handleDuplicatesDataResponse));
    handleDuplicatesService.getDuplicatesByExpense(txnId).subscribe((res) => {
      expect(res).toEqual(handleDuplicatesDataResponse);
      expect(apiService.get).toHaveBeenCalledOnceWith('/transactions/duplicates/sets', {
        params: {
          txn_id: txnId,
        },
      });
    });
    done();
  });

  it('dismissAll() : should dismiss all duplicates', (done) => {
    apiService.post.and.returnValue(of(null));
    const duplicateSetTransactionIds = ['tx5CixxvxeAF', 'txCyV7WCXXqD'];
    const transactionIds = ['tx5CixxvxeAF', 'txCyV7WCXXqD'];
    handleDuplicatesService.dismissAll(duplicateSetTransactionIds, transactionIds).subscribe((res) => {
      expect(res).toBeNull();
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/duplicates/dismiss', {
        duplicate_set_transaction_ids: duplicateSetTransactionIds,
        transaction_ids: transactionIds,
      });
      done();
    });
  });
});
