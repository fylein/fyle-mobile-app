import { TestBed } from '@angular/core/testing';

import { TripRequestCustomFieldsService } from './trip-request-custom-fields.service';

xdescribe('TripRequestCustomFieldsService', () => {
  let service: TripRequestCustomFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripRequestCustomFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
