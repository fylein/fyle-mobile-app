import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { HandleDuplicatesService } from './handle-duplicates.service';
import { of } from 'rxjs';
import { handleDuplicatesData } from '../mock-data/handle-duplicates.service.data';

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
    apiService.get.and.returnValue(of(handleDuplicatesData));
    handleDuplicatesService.getDuplicateSets().subscribe((res) => {
      expect(handleDuplicatesData).toEqual(res);
      expect(apiService.get).toHaveBeenCalledWith('/transactions/duplicates/sets');
      done();
    });
  });

  it('getDuplicatesByExpense() : should call the API  with the correct parameters and return the expected data from the API', (done) => {
    const txnId = 'txaiCW1efU0n';
    handleDuplicatesService.getDuplicatesByExpense(txnId);

    expect(apiService.get).toHaveBeenCalledWith('/transactions/duplicates/sets', {
      params: {
        txn_id: txnId,
      },
    });
    expect(apiService.get).toHaveBeenCalledTimes(1);

    apiService.get.and.returnValue(of(handleDuplicatesData));
    handleDuplicatesService.getDuplicatesByExpense(txnId).subscribe((res) => {
      expect(res).toEqual(handleDuplicatesData);
    });
    expect(apiService.get).toHaveBeenCalledTimes(2);
    done();
  });

  it('dismissAll() : should call the API service with correct params and dismiss all the duplicates', (done) => {
    const duplicateSetTransactionIds = ['tx5CixxvxeAF', 'txCyV7WCXXqD'];
    const transactionIds = ['tx5CixxvxeAF', 'txCyV7WCXXqD'];
    handleDuplicatesService.dismissAll(duplicateSetTransactionIds, transactionIds);
    expect(apiService.post).toHaveBeenCalledWith('/transactions/duplicates/dismiss', {
      duplicate_set_transaction_ids: duplicateSetTransactionIds,
      transaction_ids: transactionIds,
    });
    apiService.post.and.returnValue(of(null));
    expect(apiService.post).toHaveBeenCalledTimes(1);
    done();
  });
});
