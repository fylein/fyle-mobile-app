import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ExpenseAggregationService } from './expense-aggregation.service';
import { of } from 'rxjs';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

describe('ExpenseAggregationService', () => {
  let expenseAggregationService: ExpenseAggregationService;
  const rootUrl = 'https://staging.fyle.tech';
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        ExpenseAggregationService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });
    expenseAggregationService = TestBed.inject(ExpenseAggregationService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    expenseAggregationService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(expenseAggregationService).toBeTruthy();
  });

  it('setRoot(): should set the root', () => {
    expect(expenseAggregationService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  describe('get():', () => {
    it('should make a GET call without params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      expenseAggregationService.get('/yodlee/personal/access_token').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/expense_aggregation/yodlee/personal/access_token',
          {}
        );
        done();
      });
    });

    it('should make a GET call with params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      expenseAggregationService.get('/yodlee/personal/access_token', { params: requestObj }).subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/expense_aggregation/yodlee/personal/access_token',
          { params: requestObj }
        );
        done();
      });
    });
  });

  describe('post():', () => {
    it('should make a POST call with params', (done) => {
      httpClient.post.and.returnValue(of(apiResponse));

      expenseAggregationService.post('/bank_accounts', requestObj).subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.post).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/expense_aggregation/bank_accounts',
          requestObj
        );
        done();
      });
    });

    it('should make a POST call without params', (done) => {
      httpClient.post.and.returnValue(of(apiResponse));

      expenseAggregationService.post('/bank_accounts').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.post).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/expense_aggregation/bank_accounts',
          {}
        );
        done();
      });
    });
  });

  describe('delete():', () => {
    it('should make a DELETE call with params', (done) => {
      httpClient.delete.and.returnValue(of(apiResponse));

      expenseAggregationService.delete('/bank_accounts', { params: requestObj }).subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.delete).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/expense_aggregation/bank_accounts',
          { params: requestObj }
        );
        done();
      });
    });

    it('should make a DELETE call without params', (done) => {
      httpClient.delete.and.returnValue(of(apiResponse));

      expenseAggregationService.delete('/bank_accounts').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.delete).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/expense_aggregation/bank_accounts',
          {}
        );
        done();
      });
    });
  });
});
