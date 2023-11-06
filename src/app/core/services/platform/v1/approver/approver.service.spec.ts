import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApproverService } from './approver.service';
import { DateService } from '../shared/date.service';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

describe('ApproverService', () => {
  const rootUrl = 'https://staging.fyle.tech';
  let approverService: ApproverService;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let dateService: jasmine.SpyObj<DateService>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['fixDates']);

    TestBed.configureTestingModule({
      providers: [
        ApproverService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
      ],
    });

    approverService = TestBed.inject(ApproverService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;

    approverService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(approverService).toBeTruthy();
  });

  it('should set root url', () => {
    expect(approverService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  it('should make GET request without params', (done) => {
    httpClient.get.and.returnValue(of(apiResponse));
    dateService.fixDates.and.returnValue(apiResponse);

    approverService.get('/expense_fields').subscribe((response) => {
      expect(response).toEqual(apiResponse);
      expect(httpClient.get).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/approver/expense_fields', {});
      expect(dateService.fixDates).toHaveBeenCalledOnceWith(apiResponse);
      done();
    });
  });

  it('should make GET request with params', (done) => {
    httpClient.get.and.returnValue(of(apiResponse));
    dateService.fixDates.and.returnValue(apiResponse);

    approverService
      .get('/expense_fields', {
        params: requestObj,
      })
      .subscribe((response) => {
        expect(response).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/approver/expense_fields', {
          params: requestObj,
        });
        expect(dateService.fixDates).toHaveBeenCalledOnceWith(apiResponse);
        done();
      });
  });

  it('should make POST request without body', (done) => {
    httpClient.post.and.returnValue(of(apiResponse));
    dateService.fixDates.and.returnValue(apiResponse);

    approverService.post('/expense_fields').subscribe((response) => {
      expect(response).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/approver/expense_fields', {});
      expect(dateService.fixDates).toHaveBeenCalledOnceWith(apiResponse);
      done();
    });
  });

  it('should make POST request with body', (done) => {
    httpClient.post.and.returnValue(of(apiResponse));
    dateService.fixDates.and.returnValue(apiResponse);

    approverService.post('/expense_fields', requestObj).subscribe((response) => {
      expect(response).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://staging.fyle.tech/platform/v1/approver/expense_fields',
        requestObj
      );
      expect(dateService.fixDates).toHaveBeenCalledOnceWith(apiResponse);
      done();
    });
  });
});
