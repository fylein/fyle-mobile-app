import { TestBed } from '@angular/core/testing';

import { RefinerService } from './refiner.service';

xdescribe('RefinerService', () => {
  let service: RefinerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RefinerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
