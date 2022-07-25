import { TestBed } from '@angular/core/testing';

import { MileageRatesService } from './mileage-rates.service';

xdescribe('MileageRatesService', () => {
  let service: MileageRatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MileageRatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
