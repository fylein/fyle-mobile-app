import { TestBed } from '@angular/core/testing';

import { OrgSettingsService } from './org-settings.service';

xdescribe('OrgSettingsService', () => {
  let service: OrgSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
