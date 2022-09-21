import { TestBed } from '@angular/core/testing';

import { DelegatedAccountsService } from './delegated-accounts.service';

xdescribe('DelegatedAccountsService', () => {
  let service: DelegatedAccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DelegatedAccountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
