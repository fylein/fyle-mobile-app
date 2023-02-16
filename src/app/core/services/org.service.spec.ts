import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { orgData1 } from '../mock-data/org.data';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { OrgService } from './org.service';

describe('OrgService', () => {
  let orgService: OrgService;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    apiService = jasmine.createSpyObj('ApiService', ['get', 'post']);
    authService = jasmine.createSpyObj('AuthService', ['newRefreshToken']);

    TestBed.configureTestingModule({
      providers: [
        OrgService,
        {
          provide: ApiService,
          useValue: apiService,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    });
    orgService = TestBed.inject(OrgService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(orgService).toBeTruthy();
  });

  it('getCurrentOrg(): should get current org', (done) => {
    apiService.get.and.returnValue(of(orgData1));

    orgService.getCurrentOrg().subscribe((res) => {
      expect(res).toEqual(orgData1[0]);
      expect(apiService.get).toHaveBeenCalledOnceWith('/orgs', {
        params: {
          is_current: true,
        },
      });
      done();
    });
  });

  it('getPrimaryOrg(): should get primary org', (done) => {
    apiService.get.and.returnValue(of(orgData1[0]));

    orgService.getPrimaryOrg().subscribe((res) => {
      expect(res).toEqual(orgData1[0]);
      expect(apiService.get).toHaveBeenCalledOnceWith('/orgs', {
        params: {
          is_primary: true,
        },
      });
      done();
    });
  });

  it('getPrimaryOrg(): should get orgs', (done) => {
    apiService.get.and.returnValue(of(orgData1));

    orgService.getOrgs().subscribe((res) => {
      expect(res).toEqual(orgData1);
      expect(apiService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('updateOrg(): should update org', (done) => {
    apiService.post.and.returnValue(of(orgData1[0]));
    spyOn(globalCacheBusterNotifier, 'next');

    orgService.updateOrg(orgData1[0]).subscribe((res) => {
      expect(res).toEqual(orgData1[0]);
      expect(globalCacheBusterNotifier.next).toHaveBeenCalledBefore(apiService.post);
      expect(apiService.post).toHaveBeenCalledOnceWith('/orgs', orgData1[0]);
      done();
    });
  });
});
