import { TestBed } from '@angular/core/testing';

import { AdvanceRequestsCustomFieldsService } from './advance-requests-custom-fields.service';

xdescribe('AdvanceRequestsCustomFieldsService', () => {
  let service: AdvanceRequestsCustomFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvanceRequestsCustomFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
