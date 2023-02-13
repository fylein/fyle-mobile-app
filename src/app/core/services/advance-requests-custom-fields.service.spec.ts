import { TestBed } from '@angular/core/testing';
import { advanceRequestCustomFieldData } from '../mock-data/advance-requests-custom-fields.data';
import { AdvanceRequestsCustomFieldsService } from './advance-requests-custom-fields.service';
import { of } from 'rxjs';
import { ApiService } from './api.service';

describe('AdvanceRequestsCustomFieldsService', () => {
  let advanceRequestsCustomFieldsService: AdvanceRequestsCustomFieldsService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        AdvanceRequestsCustomFieldsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
      ],
    });
    advanceRequestsCustomFieldsService = TestBed.inject(AdvanceRequestsCustomFieldsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(advanceRequestsCustomFieldsService).toBeTruthy();
  });

  it('getAll() : should return all advance requests custom fields', (done) => {
    apiService.get.and.returnValue(of(advanceRequestCustomFieldData));

    advanceRequestsCustomFieldsService.getAll().subscribe((res) => {
      expect(res).toEqual(advanceRequestCustomFieldData);
      expect(apiService.get).toHaveBeenCalledWith('/advance_request_custom_fields');
      expect(apiService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
