import { TestBed } from '@angular/core/testing';

import { TripRequestsService } from './trip-requests.service';

xdescribe('TripRequestsService', () => {
  let service: TripRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
