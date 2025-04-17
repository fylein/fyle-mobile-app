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
import { SpenderService } from './platform/v1/spender/spender.service';
import { cloneDeep } from 'lodash';

describe('OrgService', () => {
  let orgService: OrgService;
  let apiService: jasmine.SpyObj<ApiService>;
  let spenderService: jasmine.SpyObj<SpenderService>;
  let authService: jasmine.SpyObj<AuthService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(() => {
    apiService = jasmine.createSpyObj('ApiService', ['get', 'post']);
    spenderService = jasmine.createSpyObj('SpenderService', ['get', 'post']);
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
          provide: SpenderService,
          useValue: spenderService,
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
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(orgService).toBeTruthy();
  });

  it('getCurrentOrg(): should get current org', (done) => {
    spenderService.get.and.returnValue(of({ data: orgData1 }));

    orgService.getCurrentOrg().subscribe((res) => {
      expect(res).toEqual(orgData1[0]);
      expect(spenderService.get).toHaveBeenCalledOnceWith('/orgs', {
        params: {
          is_current: true,
        },
      });
      done();
    });
  });

  it('getPrimaryOrg(): should get primary org', (done) => {
    spenderService.get.and.returnValue(of({ data: [orgData1[0]] }));

    orgService.getPrimaryOrg().subscribe((res) => {
      expect(res).toEqual(orgData1[0]);
      expect(spenderService.get).toHaveBeenCalledOnceWith('/orgs', {
        params: {
          is_primary: true,
        },
      });
      done();
    });
  });

  it('getOrgs(): should get orgs', (done) => {
    spenderService.get.and.returnValue(of({ data: orgData1 }));

    orgService.getOrgs().subscribe((res) => {
      expect(res).toEqual(orgData1);
      expect(spenderService.get).toHaveBeenCalledTimes(1);
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
      const mockCurrencyIpData = cloneDeep(currencyIpData);
      apiService.get.and.returnValue(of(mockCurrencyIpData));

      orgService.suggestOrgCurrency().subscribe((res) => {
        expect(res).toEqual(mockCurrencyIpData.currency);
        expect(apiService.get).toHaveBeenCalledOnceWith('/currency/ip');
        done();
      });
    });

    it('should return `USD` if api does not return currency', (done) => {
      const mockCurrencyIpData = cloneDeep(currencyIpData2);
      apiService.get.and.returnValue(of(mockCurrencyIpData));

      orgService.suggestOrgCurrency().subscribe((res) => {
        expect(res).toEqual('USD');
        expect(apiService.get).toHaveBeenCalledOnceWith('/currency/ip');
        done();
      });
    });
  });

  it('setCurrencyBasedOnIp(): should set currency based on ip', (done) => {
    spyOn(orgService, 'suggestOrgCurrency').and.returnValue(of(currencyIpData.currency));
    const mockOrgData = cloneDeep(orgData1[0]);
    spyOn(orgService, 'getCurrentOrg').and.returnValue(of(mockOrgData));
    spyOn(orgService, 'updateOrg').and.returnValue(of(mockOrgData));

    orgService.setCurrencyBasedOnIp().subscribe((res) => {
      expect(res).toEqual(mockOrgData);
      expect(orgService.suggestOrgCurrency).toHaveBeenCalledTimes(1);
      expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
      expect(orgService.updateOrg).toHaveBeenCalledOnceWith(mockOrgData);
      done();
    });
  });
});
