import { TestBed } from '@angular/core/testing';

import { OrgService } from './org.service';

xdescribe('OrgService', () => {
  let service: OrgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
