import { TestBed } from '@angular/core/testing';

import { HotelRequestService } from './hotel-request.service';

xdescribe('HotelRequestService', () => {
  let service: HotelRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotelRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
