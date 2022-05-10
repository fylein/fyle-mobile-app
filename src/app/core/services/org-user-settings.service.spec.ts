import { TestBed } from '@angular/core/testing';

import { OrgUserSettingsService } from './org-user-settings.service';

xdescribe('OrgUserSettingsService', () => {
  let service: OrgUserSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgUserSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
