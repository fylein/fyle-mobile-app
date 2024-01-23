import { TestBed } from '@angular/core/testing';

import { AmexService } from './amex.service';

describe('AmexService', () => {
  let service: AmexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
