import { TestBed } from '@angular/core/testing';

import { OrgUserService } from './org-user.service';

xdescribe('OrgUserService', () => {
  let service: OrgUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
