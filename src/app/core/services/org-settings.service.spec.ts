import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrgSettings, OrgSettingsResponse } from '../models/org-settings.model';
import { ApiService } from './api.service';
import { orgSettingsGetData, orgSettingsPostData } from '../models/test-data/org-settings-data';

import { OrgSettingsService } from './org-settings.service';

const getApiResponse: OrgSettings = orgSettingsGetData;
const postApiPayload: OrgSettingsResponse = orgSettingsPostData;

describe('OrgSettingsService', () => {
  let orgSettingsService: OrgSettingsService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        OrgSettingsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
      ],
    });
    orgSettingsService = TestBed.inject(OrgSettingsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(orgSettingsService).toBeTruthy();
  });

  it('should be able to get the org settings properly', (done) => {
    apiService.get.and.returnValue(of(getApiResponse));
    orgSettingsService.get().subscribe((res) => {
      expect(res).toBeTruthy(getApiResponse);
      done();
    });
  });

  it('should be able to update the org settings properly', (done) => {
    apiService.post.and.returnValue(of(postApiPayload));
    orgSettingsService.post(getApiResponse).subscribe((res) => {
      expect(res).toBeTruthy(postApiPayload);
      done();
    });
  });
});
