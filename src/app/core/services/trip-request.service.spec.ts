import { TestBed } from '@angular/core/testing';

import { TripRequestService } from './trip-request.service';

describe('TripRequestService', () => {
  let service: TripRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
