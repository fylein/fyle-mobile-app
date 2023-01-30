import { advanceRequestCustomFields } from '../mock-data/advance-requests-custom-fields.data';
import { AdvanceRequestsCustomFieldsService } from './advance-requests-custom-fields.service';
import { of } from 'rxjs';
import { ApiService } from './api.service';

describe('AdvanceRequestsCustomFieldsService', () => {
  let advanceRequestsCustomFieldsService: AdvanceRequestsCustomFieldsService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    advanceRequestsCustomFieldsService = new AdvanceRequestsCustomFieldsService(apiServiceSpy);
  });

  it('should be created', () => {
    expect(advanceRequestsCustomFieldsService).toBeTruthy();
  });

  it('getAll():should return all advance requests custom fields', (done) => {
    apiServiceSpy.get.and.returnValue(of(advanceRequestCustomFields));

    advanceRequestsCustomFieldsService.getAll().subscribe((res) => {
      expect(res).toEqual(advanceRequestCustomFields);
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/advance_request_custom_fields');
      done();
    });
  });
});
