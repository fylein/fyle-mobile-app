import { TestBed } from '@angular/core/testing';

import { RecentCurrencyService } from './recent-currency.service';

describe('RecentCurrencyService', () => {
  let service: RecentCurrencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentCurrencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
