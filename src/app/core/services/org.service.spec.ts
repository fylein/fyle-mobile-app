import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { currencyIpData, currencyIpData2 } from '../mock-data/currency-ip.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { orgData1 } from '../mock-data/org.data';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { OrgService } from './org.service';
import { TrackingService } from './tracking.service';

describe('OrgService', () => {
  let orgService: OrgService;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(() => {
    apiService = jasmine.createSpyObj('ApiService', ['get', 'post']);
    authService = jasmine.createSpyObj('AuthService', ['newRefreshToken']);
    trackingService = jasmine.createSpyObj('TrackingService', ['activated']);

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
        {
          provide: TrackingService,
          useValue: trackingService,
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

  it('getOrgs(): should get orgs', (done) => {
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

  it('switchOrg(): should switch org', (done) => {
    const orgId = 'orNVthTo2Zyo';
    apiService.post.and.returnValue(of(apiEouRes));
    spyOn(globalCacheBusterNotifier, 'next');
    authService.newRefreshToken.and.returnValue(of(apiEouRes));

    orgService.switchOrg(orgId).subscribe((res) => {
      expect(res).toEqual(apiEouRes);
      expect(globalCacheBusterNotifier.next).toHaveBeenCalledBefore(apiService.post);
      expect(apiService.post).toHaveBeenCalledOnceWith(`/orgs/${orgId}/refresh_token`);
      done();
    });
  });

  describe('suggestOrgCurrency():', () => {
    it('should suggest org currency', (done) => {
      apiService.get.and.returnValue(of(currencyIpData));

      orgService.suggestOrgCurrency().subscribe((res) => {
        expect(res).toEqual(currencyIpData.currency);
        expect(apiService.get).toHaveBeenCalledOnceWith('/currency/ip');
        done();
      });
    });

    it('should return `USD` if api does not return currency', (done) => {
      apiService.get.and.returnValue(of(currencyIpData2));

      orgService.suggestOrgCurrency().subscribe((res) => {
        expect(res).toEqual('USD');
        expect(apiService.get).toHaveBeenCalledOnceWith('/currency/ip');
        done();
      });
    });
  });

  it('setCurrencyBasedOnIp(): should set currency based on ip', (done) => {
    spyOn(orgService, 'suggestOrgCurrency').and.returnValue(of(currencyIpData.currency));
    spyOn(orgService, 'getCurrentOrg').and.returnValue(of(orgData1[0]));
    spyOn(orgService, 'updateOrg').and.returnValue(of(orgData1[0]));

    orgService.setCurrencyBasedOnIp().subscribe((res) => {
      expect(res).toEqual(orgData1[0]);
      expect(orgService.suggestOrgCurrency).toHaveBeenCalledTimes(1);
      expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
      expect(orgService.updateOrg).toHaveBeenCalledOnceWith(orgData1[0]);
      done();
    });
  });
});
