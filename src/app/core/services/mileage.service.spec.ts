import { TestBed } from '@angular/core/testing';

import { MileageService } from './mileage.service';

describe('MileageService', () => {
  let service: MileageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MileageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
