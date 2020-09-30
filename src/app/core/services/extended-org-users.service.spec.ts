import { TestBed } from '@angular/core/testing';

import { ExtendedOrgUsersService } from './extended-org-users.service';

describe('ExtendedOrgUsersService', () => {
  let service: ExtendedOrgUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtendedOrgUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
