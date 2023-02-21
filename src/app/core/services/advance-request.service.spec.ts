import { TestBed } from '@angular/core/testing';
import { AdvanceRequestService } from './advance-request.service';
import { ApiService } from './api.service';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TimezoneService } from './timezone.service';
import { AdvanceRequestPolicyService } from './advance-request-policy.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { FileService } from './file.service';

xdescribe('AdvanceRequestService', () => {
  let advanceRequestService: AdvanceRequestService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiv2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let advanceRequestPolicyService: jasmine.SpyObj<AdvanceRequestPolicyService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let dateService: jasmine.SpyObj<DateService>;
  let fileService: jasmine.SpyObj<FileService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let timezoneService: jasmine.SpyObj<TimezoneService>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    advanceRequestService = TestBed.inject(AdvanceRequestService);
  });

  it('should be created', () => {
    expect(advanceRequestService).toBeTruthy();
  });
});
